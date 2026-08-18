/*
 * Title: Taxonomy Integrity Service
 * Description: The taxonomy (level → background → subject → chapter → topic) is
 *              denormalized onto every question as plain strings, and user data
 *              (saved questions, exams) points at those questions by id. This
 *              service is the single place that keeps all of those copies in
 *              step: it pushes a re-parent down the subtree, and it walks the
 *              same subtree to delete a doc and everything that depended on it.
 *
 *              Content is purged; results are not. Submitted exams, their answer
 *              scripts and UserAnalytics are never touched here — a student's
 *              history survives the removal of the question it was about, and
 *              the read paths render those questions as "unavailable".
 * Author: Naimur Rahman
 * Date: 2026-08-16
 */

import mongoose, { ClientSession } from "mongoose";
import Level from "../models/level-model";
import Background from "../models/background-model";
import Subject from "../models/subject-model";
import Chapter from "../models/chapter-model";
import Topic from "../models/topic-model";
import { BaseQuestion } from "../models/question-model";
import { SavedQuestion } from "../models/saved-question-model";
import Exam from "../models/exam-model";
import Answer from "../models/answer-model";
import UserAnalytics from "../models/user-analytics-model";
import User from "../models/user-model";

export type TaxonomyKind =
  | "level"
  | "background"
  | "subject"
  | "chapter"
  | "topic";

// Read shape shared by all five taxonomy collections. Deliberately not ITopic /
// IChapter: those are Documents, and IChapter types backgroundId as a single id
// while the schema stores an array.
type TaxonomyDoc = {
  _id: mongoose.Types.ObjectId;
  name: string;
  levelId?: mongoose.Types.ObjectId;
  backgroundId?: mongoose.Types.ObjectId[];
  subjectId?: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
};

const MODELS = {
  level: Level,
  background: Background,
  subject: Subject,
  chapter: Chapter,
  topic: Topic,
} as const;

// Typed loosely on purpose: the five model types differ enough that a union of
// them has no callable `findById`, and every use here goes through the shared
// TaxonomyDoc read shape anyway.
export const taxonomyModel = (kind: TaxonomyKind) =>
  MODELS[kind] as unknown as mongoose.Model<any>;

// --------------------------------
// ANCESTOR DERIVATION (update side)
// --------------------------------

// What a doc of this kind must carry, read off its parent rather than off the
// request body. A PUT that moves a topic to another chapter therefore also
// rewrites the topic's subject, level and backgrounds to the chapter's own — the
// body cannot express a topic sitting under a chapter of a different subject.
export type Ancestors = {
  levelId?: mongoose.Types.ObjectId;
  backgroundId?: mongoose.Types.ObjectId[];
  subjectId?: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
};

export class IntegrityError extends Error {
  status: number;
  details?: Record<string, number>;

  constructor(
    status: number,
    message: string,
    details?: Record<string, number>,
  ) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// The parent field each kind hangs from; `level` has none.
const PARENT_FIELD: Record<TaxonomyKind, keyof Ancestors | null> = {
  level: null,
  background: "levelId",
  subject: "levelId",
  chapter: "subjectId",
  topic: "chapterId",
};

// Fields that, when present in a PUT body, mean the doc is being re-parented and
// the subtree has to follow. A rename alone skips the whole walk.
const PARENT_KEYS: Record<TaxonomyKind, string[]> = {
  level: [],
  background: ["levelId"],
  subject: ["levelId", "backgroundId"],
  chapter: ["levelId", "backgroundId", "subjectId"],
  topic: ["levelId", "backgroundId", "subjectId", "chapterId"],
};

export const isReparent = (kind: TaxonomyKind, body: Record<string, unknown>) =>
  PARENT_KEYS[kind].some((key) => body[key] !== undefined);

// Resolves the ancestor set a doc of `kind` must have, given the parent id the
// body asked for (or its current parent when the body left it alone). Throws
// IntegrityError(404) when that parent does not exist.
export const deriveAncestors = async (
  kind: TaxonomyKind,
  body: Record<string, unknown>,
  current: TaxonomyDoc,
): Promise<Ancestors> => {
  const field = PARENT_FIELD[kind];
  if (!field) return {};

  if (kind === "background" || kind === "subject") {
    const levelId = (body.levelId as string) ?? String(current.levelId);
    const level = await Level.findById(levelId).lean<TaxonomyDoc | null>();
    if (!level) throw new IntegrityError(404, "Level not found.");

    if (kind === "background") {
      // A background carries no subject of its own, so moving it to another
      // level cannot be made coherent: every subject, chapter and topic that
      // lists it would straddle two levels. Renaming is always fine.
      if (String(level._id) !== String(current.levelId)) {
        const [subjects, chapters, topics] = await Promise.all([
          Subject.countDocuments({ backgroundId: current._id }),
          Chapter.countDocuments({ backgroundId: current._id }),
          Topic.countDocuments({ backgroundId: current._id }),
        ]);
        if (subjects || chapters || topics) {
          throw new IntegrityError(
            409,
            "This background is in use, so it cannot be moved to another level. Move or delete what references it first.",
            { subjects, chapters, topics },
          );
        }
      }
      return { levelId: level._id };
    }

    // A subject names its own backgrounds; every one of them must sit under the
    // level the subject is being filed under.
    const wanted =
      (body.backgroundId as string[]) ?? current.backgroundId ?? [];
    const backgrounds = await Background.find({
      _id: { $in: wanted },
      levelId: level._id,
    }).lean<TaxonomyDoc[]>();

    if (backgrounds.length !== wanted.length) {
      throw new IntegrityError(
        400,
        "Every background must exist and belong to the chosen level.",
      );
    }
    return { levelId: level._id, backgroundId: backgrounds.map((b) => b._id) };
  }

  if (kind === "chapter") {
    const subjectId = (body.subjectId as string) ?? String(current.subjectId);
    const subject = await Subject.findById(
      subjectId,
    ).lean<TaxonomyDoc | null>();
    if (!subject) throw new IntegrityError(404, "Subject not found.");
    return {
      levelId: subject.levelId,
      backgroundId: subject.backgroundId ?? [],
      subjectId: subject._id,
    };
  }

  const chapterId = (body.chapterId as string) ?? String(current.chapterId);
  const chapter = await Chapter.findById(chapterId).lean<TaxonomyDoc | null>();
  if (!chapter) throw new IntegrityError(404, "Chapter not found.");
  return {
    levelId: chapter.levelId,
    backgroundId: chapter.backgroundId ?? [],
    subjectId: chapter.subjectId,
    chapterId: chapter._id,
  };
};

// --------------------------------
// SUBTREE RE-SYNC (update side)
// --------------------------------

export type SyncReport = {
  chapters: number;
  topics: number;
  questions: number;
  subQuestions: number;
};

const NO_SYNC: SyncReport = {
  chapters: 0,
  topics: 0,
  questions: 0,
  subQuestions: 0,
};

// Questions store every id as a plain String, so everything written down there
// has to be stringified first.
const str = (value: unknown) => String(value);
const strList = (values?: mongoose.Types.ObjectId[]) => (values ?? []).map(str);

// Pushes a doc's (already updated) ancestors down onto every descendant taxonomy
// doc and every question below it. Runs inside the caller's transaction, so the
// writes are awaited one at a time — a ClientSession cannot carry concurrent
// operations.
export const resyncSubtree = async (
  kind: TaxonomyKind,
  id: string,
  session: ClientSession,
): Promise<SyncReport> => {
  if (kind === "level" || kind === "background") return NO_SYNC;

  const doc = await taxonomyModel(kind)
    .findById(id)
    .session(session)
    .lean<TaxonomyDoc | null>();
  if (!doc) return NO_SYNC;

  const levelId = str(doc.levelId);
  const backgroundId = strList(doc.backgroundId);
  const self = str(doc._id);

  if (kind === "subject") {
    const inherited = { levelId: doc.levelId, backgroundId: doc.backgroundId };
    const chapters = await Chapter.updateMany(
      { subjectId: doc._id },
      { $set: inherited },
      { session },
    );
    const topics = await Topic.updateMany(
      { subjectId: doc._id },
      { $set: inherited },
      { session },
    );
    const questions = await BaseQuestion.updateMany(
      { subjectId: self },
      { $set: { levelId, backgroundId } },
      { session },
    );
    return {
      chapters: chapters.modifiedCount,
      topics: topics.modifiedCount,
      questions: questions.modifiedCount,
      subQuestions: 0,
    };
  }
  if (kind === "chapter") {
    const inherited = {
      levelId: doc.levelId,
      backgroundId: doc.backgroundId,
      subjectId: doc.subjectId,
    };
    const topics = await Topic.updateMany(
      { chapterId: doc._id },
      { $set: inherited },
      { session },
    );
    // Sub-questions carry only chapterId and topicId, and a chapter keeps its own
    // id when it moves, so nothing inside subQuestions[] goes stale here.
    const questions = await BaseQuestion.updateMany(
      { chapterId: self },
      { $set: { levelId, backgroundId, subjectId: str(doc.subjectId) } },
      { session },
    );
    return {
      chapters: 0,
      topics: topics.modifiedCount,
      questions: questions.modifiedCount,
      subQuestions: 0,
    };
  }

  // topic — the only kind whose move rewrites an id that questions actually store
  // twice: once at the top level and once beside every sub-question.
  const chapterId = str(doc.chapterId);
  const questions = await BaseQuestion.updateMany(
    { topicId: self },
    {
      $set: { levelId, backgroundId, subjectId: str(doc.subjectId), chapterId },
    },
    { session },
  );
  // A CQ repeats chapterId next to each sub-question's topicId. Those copies are
  // wrong the moment the topic hangs off a different chapter — including on a CQ
  // filed under some other topic, which the update above does not match.
  const subQuestions = await BaseQuestion.updateMany(
    { "subQuestions.topicId": self },
    { $set: { "subQuestions.$[el].chapterId": chapterId } },
    { session, arrayFilters: [{ "el.topicId": self }] },
  );
  return {
    chapters: 0,
    topics: 0,
    questions: questions.modifiedCount,
    subQuestions: subQuestions.modifiedCount,
  };
};

// --------------------------------
// DOOMED-SET WALK (delete side)
// --------------------------------

type IdList = string[];
type LeanId = { _id: mongoose.Types.ObjectId };
type LeanQuestion = LeanId & {
  questionType?: string;
  levelId?: string;
  backgroundId?: string[];
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
};

// Everything a delete would take with it. `collectImpact` counts this set and
// `cascadeDelete` writes it, so the preview can never promise something the
// delete does not do.
export type DoomedSet = {
  backgrounds: IdList;
  subjects: IdList;
  chapters: IdList;
  topics: IdList;
  questions: IdList;
  // CQs pulled in only because one of their four sub-questions sat on doomed
  // taxonomy. Reported separately: from the admin's point of view the question
  // itself was filed elsewhere.
  cqViaSubQuestions: number;
  // Only a background delete produces these: docs listing the dying background
  // alongside others, which survive with it pulled out of the array.
  detached: {
    subjects: IdList;
    chapters: IdList;
    topics: IdList;
    questions: IdList;
  };
};

const ids = (docs: LeanId[]) => docs.map((doc) => str(doc._id));
const union = (a: IdList, b: IdList) => [...new Set([...a, ...b])];
// A doc that lists the dying background and nothing else belongs to no background
// at all once it goes, and nothing can reach it again — so it dies with it.
const splitByBackground = (docs: TaxonomyDoc[]) => {
  const dead: IdList = [];
  const alive: IdList = [];
  docs.forEach((doc) =>
    ((doc.backgroundId ?? []).length <= 1 ? dead : alive).push(str(doc._id)),
  );
  return { dead, alive };
};

// Walks down from `id` and returns every dependent id, per collection. Read-only;
// takes the caller's session when it runs inside a transaction so it sees the
// same snapshot as the writes that follow.
export const collectDoomed = async (
  kind: TaxonomyKind,
  id: string,
  session?: ClientSession,
): Promise<DoomedSet> => {
  const opts = session ? { session } : {};

  let backgrounds: IdList = [];
  let subjects: IdList = [];
  let chapters: IdList = [];
  let topics: IdList = [];
  const detached: DoomedSet["detached"] = {
    subjects: [],
    chapters: [],
    topics: [],
    questions: [],
  };

  if (kind === "level") {
    backgrounds = ids(
      await Background.find({ levelId: id }, "_id", opts).lean<LeanId[]>(),
    );
    subjects = ids(
      await Subject.find({ levelId: id }, "_id", opts).lean<LeanId[]>(),
    );
    chapters = ids(
      await Chapter.find({ levelId: id }, "_id", opts).lean<LeanId[]>(),
    );
    topics = ids(
      await Topic.find({ levelId: id }, "_id", opts).lean<LeanId[]>(),
    );
  } else if (kind === "background") {
    backgrounds = [id];
    const projection = "_id backgroundId";
    const subs = splitByBackground(
      await Subject.find({ backgroundId: id }, projection, opts).lean<
        TaxonomyDoc[]
      >(),
    );
    const chs = splitByBackground(
      await Chapter.find({ backgroundId: id }, projection, opts).lean<
        TaxonomyDoc[]
      >(),
    );
    const tps = splitByBackground(
      await Topic.find({ backgroundId: id }, projection, opts).lean<
        TaxonomyDoc[]
      >(),
    );
    subjects = subs.dead;
    chapters = chs.dead;
    topics = tps.dead;
    detached.subjects = subs.alive;
    detached.chapters = chs.alive;
    detached.topics = tps.alive;
  } else if (kind === "subject") {
    subjects = [id];
  } else if (kind === "chapter") {
    chapters = [id];
  } else {
    topics = [id];
  }
  // A dead subject drags its chapters and topics, a dead chapter drags its topics,
  // whichever branch above produced them. Detached docs are deliberately not walked:
  // they survive, so nothing under them is doomed.
  if (subjects.length) {
    chapters = union(
      chapters,
      ids(
        await Chapter.find({ subjectId: { $in: subjects } }, "_id", opts).lean<
          LeanId[]
        >(),
      ),
    );
    topics = union(
      topics,
      ids(
        await Topic.find({ subjectId: { $in: subjects } }, "_id", opts).lean<
          LeanId[]
        >(),
      ),
    );
  }
  if (chapters.length) {
    topics = union(
      topics,
      ids(
        await Topic.find({ chapterId: { $in: chapters } }, "_id", opts).lean<
          LeanId[]
        >(),
      ),
    );
  }

  // Questions: a direct hit on any denormalized id, or a CQ whose sub-questions
  // point into the doomed set — the CQ then goes whole.
  const or: Record<string, unknown>[] = [];
  if (kind === "level") or.push({ levelId: id });
  if (kind === "background")
    or.push({ backgroundId: { $all: [id], $size: 1 } });
  if (subjects.length) or.push({ subjectId: { $in: subjects } });
  if (chapters.length)
    or.push(
      { chapterId: { $in: chapters } },
      { "subQuestions.chapterId": { $in: chapters } },
    );
  if (topics.length)
    or.push(
      { topicId: { $in: topics } },
      { "subQuestions.topicId": { $in: topics } },
    );
  const projection =
    "_id questionType levelId backgroundId subjectId chapterId topicId";
  const matched = or.length
    ? await BaseQuestion.find({ $or: or }, projection, opts).lean<
        LeanQuestion[]
      >()
    : [];

  const subjectSet = new Set(subjects);
  const chapterSet = new Set(chapters);
  const topicSet = new Set(topics);

  // Matched at the top level, i.e. not only through subQuestions[].
  const isDirect = (q: LeanQuestion) =>
    (kind === "level" && q.levelId === id) ||
    (kind === "background" && (q.backgroundId ?? []).length <= 1) ||
    (!!q.subjectId && subjectSet.has(q.subjectId)) ||
    (!!q.chapterId && chapterSet.has(q.chapterId)) ||
    (!!q.topicId && topicSet.has(q.topicId));

  const questions = ids(matched);
  const cqViaSubQuestions = matched.filter(
    (q) => q.questionType === "CQ" && !isDirect(q),
  ).length;

  if (kind === "background") {
    const doomedQuestions = new Set(questions);
    const referencing = await BaseQuestion.find(
      { backgroundId: id },
      "_id backgroundId",
      opts,
    ).lean<LeanQuestion[]>();
    detached.questions = referencing
      .filter(
        (q) =>
          (q.backgroundId ?? []).length > 1 && !doomedQuestions.has(str(q._id)),
      )
      .map((q) => str(q._id));
  }

  return {
    backgrounds,
    subjects,
    chapters,
    topics,
    questions,
    cqViaSubQuestions,
    detached,
  };
};
// --------------------------------
// IMPACT (read-only preview)
// --------------------------------

export type ImpactReport = {
  kind: TaxonomyKind;
  name: string;
  descendants: {
    backgrounds: number;
    subjects: number;
    chapters: number;
    topics: number;
  };
  questions: number;
  cqViaSubQuestions: number;
  savedQuestions: number;
  generatedExams: { pruned: number; deleted: number };
  affectedUsers: number;
  detached: {
    subjects: number;
    chapters: number;
    topics: number;
    questions: number;
  };
  // Stated plainly in the dialog so nobody thinks a delete rewrites history.
  preserved: {
    submittedExams: number;
    answerScripts: number;
    analyticsRows: number;
  };
};

type LeanExam = LeanId & {
  questionIds?: mongoose.Types.ObjectId[];
  scope?: { topicIds?: string[] };
};

const LABELS: Record<TaxonomyKind, string> = {
  level: "Level",
  background: "Background",
  subject: "Subject",
  chapter: "Chapter",
  topic: "Topic",
};

const toObjectIds = (list: IdList) =>
  list.map((value) => new mongoose.Types.ObjectId(value));

// Every exam that so much as mentions the doomed set. Used twice: to prune the
// never-taken sessions, and to count the submitted ones left deliberately alone.
const examFilter = (
  doomed: DoomedSet,
  questionOids: mongoose.Types.ObjectId[],
) => {
  const or: Record<string, unknown>[] = [];
  if (questionOids.length) or.push({ questionIds: { $in: questionOids } });
  if (doomed.topics.length)
    or.push({ "scope.topicIds": { $in: doomed.topics } });
  if (doomed.subjects.length) or.push({ subjectId: { $in: doomed.subjects } });
  return or.length ? { $or: or } : null;
};
// Counts what a delete would take. Returns the walk alongside the report so
// `cascadeDelete` can write exactly the set that was counted.
export const collectImpact = async (
  kind: TaxonomyKind,
  id: string,
  session?: ClientSession,
): Promise<{ report: ImpactReport; doomed: DoomedSet }> => {
  const opts = session ? { session } : {};

  const doc = await taxonomyModel(kind)
    .findById(id, "name", opts)
    .lean<TaxonomyDoc | null>();
  if (!doc) throw new IntegrityError(404, `${LABELS[kind]} not found.`);

  const doomed = await collectDoomed(kind, id, session);
  const questionOids = toObjectIds(doomed.questions);

  const savedQuestions = questionOids.length
    ? await SavedQuestion.countDocuments(
        { questionId: { $in: questionOids } },
        opts,
      )
    : 0;

  let pruned = 0;
  let deleted = 0;
  let submittedExams = 0;
  const filter = examFilter(doomed, questionOids);
  if (filter) {
    const generated = await Exam.find(
      { status: "generated", ...filter },
      "_id questionIds",
      opts,
    ).lean<LeanExam[]>();
    const doomedQuestions = new Set(doomed.questions);
    generated.forEach((exam) => {
      const survives = (exam.questionIds ?? []).some(
        (qid) => !doomedQuestions.has(str(qid)),
      );
      if (survives) pruned += 1;
      else deleted += 1;
    });
    submittedExams = await Exam.countDocuments(
      { status: "submitted", ...filter },
      opts,
    );
  }
  // IAnswer types answerScript[].questionId as a string while the schema stores an
  // ObjectId ref, so the string list goes in and Mongoose casts it off the path.
  const answerScripts = doomed.questions.length
    ? await Answer.countDocuments(
        { "answerScript.questionId": { $in: doomed.questions } },
        opts,
      )
    : 0;

  const analyticsOr: Record<string, unknown>[] = [];
  if (doomed.topics.length)
    analyticsOr.push({ "topicStats.topicId": { $in: doomed.topics } });
  if (doomed.chapters.length)
    analyticsOr.push({ "topicStats.chapterId": { $in: doomed.chapters } });
  if (doomed.subjects.length)
    analyticsOr.push({ "topicStats.subjectId": { $in: doomed.subjects } });
  const analyticsRows = analyticsOr.length
    ? await UserAnalytics.countDocuments({ $or: analyticsOr }, opts)
    : 0;

  // Only a level or a background is named on a profile.
  let affectedUsers = 0;
  if (kind === "level")
    affectedUsers = await User.countDocuments({ level: id }, opts);
  if (kind === "background")
    affectedUsers = await User.countDocuments({ background: id }, opts);

  const report: ImpactReport = {
    kind,
    name: doc.name,
    descendants: {
      // The doc itself is in its own doomed list; the dialog only wants what else goes.
      backgrounds: doomed.backgrounds.filter((v) => v !== id).length,
      subjects: doomed.subjects.filter((v) => v !== id).length,
      chapters: doomed.chapters.filter((v) => v !== id).length,
      topics: doomed.topics.filter((v) => v !== id).length,
    },
    questions: doomed.questions.length,
    cqViaSubQuestions: doomed.cqViaSubQuestions,
    savedQuestions,
    generatedExams: { pruned, deleted },
    affectedUsers,
    detached: {
      subjects: doomed.detached.subjects.length,
      chapters: doomed.detached.chapters.length,
      topics: doomed.detached.topics.length,
      questions: doomed.detached.questions.length,
    },
    preserved: { submittedExams, answerScripts, analyticsRows },
  };

  return { report, doomed };
};
// --------------------------------
// CASCADE DELETE (write side)
// --------------------------------

// Deletes `id` and exactly what `collectImpact` counted, in dependency order.
// Runs inside the caller's transaction; the writes are awaited one at a time
// because a ClientSession cannot carry concurrent operations.
export const cascadeDelete = async (
  kind: TaxonomyKind,
  id: string,
  session: ClientSession,
): Promise<ImpactReport> => {
  const { report, doomed } = await collectImpact(kind, id, session);
  const questionOids = toObjectIds(doomed.questions);

  // 1. Bookmarks. Nothing else reads them, so they go first.
  if (questionOids.length) {
    await SavedQuestion.deleteMany(
      { questionId: { $in: questionOids } },
      { session },
    );
  }

  // 2. Never-taken exams: drop the dead ids and re-total from the survivors, or
  //    remove the session when nothing is left to sit. Submitted exams are
  //    results and are never touched.
  const filter = examFilter(doomed, questionOids);
  if (filter) {
    const generated = await Exam.find(
      { status: "generated", ...filter },
      "_id questionIds scope",
      { session },
    ).lean<LeanExam[]>();
    const doomedQuestions = new Set(doomed.questions);
    const doomedTopics = new Set(doomed.topics);

    for (const exam of generated) {
      const survivors = (exam.questionIds ?? []).filter(
        (qid) => !doomedQuestions.has(str(qid)),
      );
      if (!survivors.length) {
        await Exam.deleteOne({ _id: exam._id }, { session });
        continue;
      }
      const kept = await BaseQuestion.find(
        { _id: { $in: survivors } },
        "marks timeRequired",
        { session },
      ).lean<{ marks?: number; timeRequired?: number }[]>();
      await Exam.updateOne(
        { _id: exam._id },
        {
          $set: {
            questionIds: survivors,
            "scope.topicIds": (exam.scope?.topicIds ?? []).filter(
              (topicId) => !doomedTopics.has(topicId),
            ),
            totalMarks: kept.reduce((sum, q) => sum + (q.marks ?? 0), 0),
            totalTime: kept.reduce((sum, q) => sum + (q.timeRequired ?? 0), 0),
          },
        },
        { session },
      );
    }
  }
  // 3. The questions themselves, then the array case: a question that merely
  //    listed the dying background survives with it pulled out.
  if (questionOids.length) {
    await BaseQuestion.deleteMany({ _id: { $in: questionOids } }, { session });
  }
  if (kind === "background") {
    await BaseQuestion.updateMany(
      { backgroundId: id },
      { $pull: { backgroundId: id } },
      { session },
    );
  }

  // 4. Descendant taxonomy, deepest first. These lists already contain the doc
  //    itself for every kind but `level`, which step 6 finishes off.
  if (doomed.topics.length) {
    await Topic.deleteMany({ _id: { $in: doomed.topics } }, { session });
  }
  if (doomed.chapters.length) {
    await Chapter.deleteMany({ _id: { $in: doomed.chapters } }, { session });
  }
  if (doomed.subjects.length) {
    await Subject.deleteMany({ _id: { $in: doomed.subjects } }, { session });
  }
  if (doomed.backgrounds.length) {
    await Background.deleteMany(
      { _id: { $in: doomed.backgrounds } },
      { session },
    );
  }

  // 5. Whatever survived a background delete loses one entry from its array. The
  //    dead docs are already gone, so these updates only reach the detached ones.
  if (kind === "background") {
    const pull = { $pull: { backgroundId: id } };
    await Subject.updateMany({ backgroundId: id }, pull, { session });
    await Chapter.updateMany({ backgroundId: id }, pull, { session });
    await Topic.updateMany({ backgroundId: id }, pull, { session });
  }

  // 6. Profiles pointing at a level or background that no longer exists. The
  //    field is unset rather than defaulted — the client already prompts for a
  //    profile when one is missing.
  if (kind === "level") {
    await User.updateMany(
      { level: id },
      { $unset: { level: "" } },
      { session },
    );
  }
  if (kind === "background") {
    await User.updateMany(
      { background: id },
      { $unset: { background: "" } },
      { session },
    );
  }

  // 7. Finally the doc itself. A no-op when step 4 already swept it up.
  await taxonomyModel(kind).deleteOne({ _id: id }, { session });

  return report;
};
