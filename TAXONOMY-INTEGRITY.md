# Taxonomy Integrity Guide

What this change does, in one sentence: **when you move or delete a level, background,
subject, chapter or topic, every other place in the database that copied its id is now
fixed or cleaned up in the same step — and only an admin is allowed to do it.**

This file explains every piece of code that was written, in simple words, plus why it was
needed and what each unfamiliar word means. Read it once from top to bottom, then keep it
as a reference.

---

## Table of contents

1. [What was broken](#1-what-was-broken)
2. [Words you need to know](#2-words-you-need-to-know)
3. [The big picture](#3-the-big-picture)
4. [Step 1 — derive ancestors from the parent](#4-step-1--derive-ancestors-from-the-parent)
5. [Step 2 — push the change down (resyncSubtree)](#5-step-2--push-the-change-down-resyncsubtree)
6. [Step 3 — find everything that must die (collectDoomed)](#6-step-3--find-everything-that-must-die-collectdoomed)
7. [Step 4 — count it (collectImpact)](#7-step-4--count-it-collectimpact)
8. [Step 5 — delete it (cascadeDelete)](#8-step-5--delete-it-cascadedelete)
9. [The shared controller (one code, five kinds)](#9-the-shared-controller-one-code-five-kinds)
10. [The five controllers and the deleted model hooks](#10-the-five-controllers-and-the-deleted-model-hooks)
11. [Admin-only writes](#11-admin-only-writes)
12. [Routes](#12-routes)
13. ["This question is unavailable"](#13-this-question-is-unavailable)
14. [The delete dialog with impact preview](#14-the-delete-dialog-with-impact-preview)
15. [What you must do before using this](#15-what-you-must-do-before-using-this)
16. [How to test everything](#16-how-to-test-everything)
17. [Known gaps (on purpose)](#17-known-gaps-on-purpose)

---

## 1. What was broken

Your taxonomy is a tree:

```
level → background → subject → chapter → topic
```

A question does **not** join to that tree at read time. Instead every question keeps its
own copy of all the ids:

```js
// one question document
{
  levelId: "68f1...",        // copy
  backgroundId: ["68f2..."], // copy
  subjectId: "68f3...",      // copy
  chapterId: "68f4...",      // copy
  topicId: "68f5...",        // copy
  subQuestions: [            // only CQ has this
    { chapterId: "68f4...", topicId: "68f5..." },  // copy again!
  ],
}
```

Keeping copies like this is called **denormalization**. It makes reading fast (no joins),
but it has one cost: **when the original changes, every copy must be updated by hand.**
Nobody was doing that. Three bugs came out of it.

**Bug 1 — moving a topic did nothing.** `updateTopic` was one line:

```ts
// before
const topic = await Topic.findByIdAndUpdate(id, req.body, { new: true });
```

Move a topic to a different chapter and the topic document changes, but every question
still holds the **old** `chapterId`. The question then disappears from the chapter filter
in Question Explorer and from exam generation for that chapter. The data is not deleted —
it is invisible, which is worse, because nothing tells you.

**Bug 2 — deleting a parent orphaned its children.** `deleteTopic` was also one line
(`findByIdAndDelete`). Delete a chapter and its topics stay behind, pointing at a chapter
id that no longer exists. Those topics can never be reached from any filter again.

**Bug 3 — the cascade existed but never ran.** `subject-model.ts`, `chapter-model.ts` and
`topic-model.ts` each had this:

```ts
// before — never executed, not even once
subjectSchema.post("deleteOne", async function () {
  await BaseQuestion.deleteMany({ subjectId: this._id });
});
```

A **hook** is a function Mongoose runs automatically around a database operation. The
problem: this hook listens for `deleteOne`, but the controller called
`findByIdAndDelete`, and Mongoose fires a *different* hook name for that
(`findOneAndDelete`). So the hook sat there looking correct and doing nothing. That is
also why all five controllers imported `BaseQuestion` and never used it.

**Bug 4, found on the way.** Every write route was open to the public:

```ts
// before — no login needed at all
router.delete("/:id", deleteTopic);
```

Anyone on the internet could delete your whole taxonomy with `curl`. Adding a cascade
without adding a login check would have turned one anonymous request into a full content
wipe, so the lock ships in the same change.

---

## 2. Words you need to know

Read this table once. Every one of these words appears in the code below.

| Word | Easy meaning |
|---|---|
| **denormalized** | The same value is copied into many documents instead of being looked up. Fast to read, must be kept in sync by hand. |
| **taxonomy** | Your category tree: level → background → subject → chapter → topic. |
| **ancestors** | The parents above a document. A topic's ancestors are its chapter, subject, backgrounds and level. |
| **descendants** | Everything below a document. A subject's descendants are its chapters, topics and questions. |
| **re-parent** | Move a document under a different parent (topic moved to another chapter). |
| **cascade delete** | Deleting one thing also deletes everything that depended on it. |
| **orphan** | A document whose parent id points at something that no longer exists. |
| **transaction** | A group of database writes that either **all** succeed or **all** are undone. No half-finished delete. |
| **session** (`ClientSession`) | The object that represents one transaction. Every write must be told to join it: `{ session }`. |
| **atomic** | All-or-nothing. A transaction makes a group of writes atomic. |
| **ObjectId** | MongoDB's id type. `"68f1..."` as a *string* is not equal to the same id as an *ObjectId*, so we convert on purpose. |
| **lean()** | "Give me a plain JavaScript object, not a full Mongoose document." Faster, read-only. |
| **projection** | The second argument of `find` — the list of fields you want, e.g. `"_id backgroundId"`. Less data over the wire. |
| **discriminator** | Mongoose feature where `MCQ` and `CQ` live in the **same** `questions` collection and share `BaseQuestion`. Writing through `BaseQuestion` touches both. |
| **middleware** | A function that runs before your controller and can stop the request. |
| **factory function** | A function that *returns* a function. `deleteTaxonomy("topic")` returns the actual route handler. |
| **hook** | Code Mongoose runs automatically around a save/delete. We removed ours. |

MongoDB operators used below:

| Operator | Easy meaning |
|---|---|
| `$set` | Overwrite these fields. |
| `$pull` | Remove one value from an array field. |
| `$unset` | Delete the field completely from the document. |
| `$in` | "value is inside this list" — `{ topicId: { $in: [a, b] } }`. |
| `$or` | Match if **any** of these conditions is true. |
| `$all` + `$size` | `{ backgroundId: { $all: [id], $size: 1 } }` = "the array contains this id **and** has exactly one item", i.e. this id is the only one. |
| `arrayFilters` | Lets you update **only the matching items** inside an array, using a named placeholder like `$[el]`. |
| `modifiedCount` | How many documents an `updateMany` actually changed. We report it back to the admin. |

HTTP status codes used:

| Code | Meaning here |
|---|---|
| `200` | Fine. |
| `400` | Your data is wrong (e.g. a background that belongs to another level). |
| `401` | Not logged in. |
| `403` | Logged in, but not an admin. |
| `404` | The thing (or its new parent) does not exist. |
| `409` | Conflict — the request makes sense but the current data does not allow it (moving a background that is in use). |

---

## 3. The big picture

Two new server files hold all the new thinking. The controllers stay thin.

```
server/src/services/taxonomy-integrity.service.ts   ← all the logic (the brain)
server/src/controllers/taxonomy-write-controller.ts ← update / delete / impact handlers
server/src/middlewares/require-role.ts              ← "are you an admin?"
```

**Update flow** — `PUT /topic/:id`

```
request body { chapterId: "new" }
        ↓
isReparent()      is a parent field in the body? no → plain update, stop here
        ↓ yes
start transaction
        ↓
deriveAncestors() read the NEW chapter, take its subject/level/backgrounds from it
        ↓
findByIdAndUpdate the topic with { ...body, ...derivedAncestors }
        ↓
resyncSubtree()   copy those ids onto every question that names this topic
        ↓
commit transaction  → respond with `synced` counts
```

**Delete flow** — `DELETE /topic/:id`

```
start transaction
        ↓
collectImpact()   → collectDoomed() walks down and lists every dependent id
        ↓
cascadeDelete()   deletes exactly that list, in the right order
        ↓
commit transaction  → respond "Topic deleted. Also removed 42 questions, 18 saved questions."
```

**Preview flow** — `GET /topic/:id/impact` runs `collectImpact()` **only** (no writes) and
returns the counts, so the dialog can show them before you press Delete.

The important design rule: `collectImpact` and `cascadeDelete` share the same walk
(`collectDoomed`). The preview physically cannot promise a number that the delete does not
perform, because they are the same list.

---

## 4. Step 1 — derive ancestors from the parent

**File:** `server/src/services/taxonomy-integrity.service.ts`

First, a few small helpers. All five taxonomy models are put in one object so the code can
work with any kind:

```ts
export type TaxonomyKind = "level" | "background" | "subject" | "chapter" | "topic";

const MODELS = {
  level: Level, background: Background, subject: Subject,
  chapter: Chapter, topic: Topic,
} as const;

// Typed loosely on purpose: the five model types differ enough that a union of
// them has no callable `findById`.
export const taxonomyModel = (kind: TaxonomyKind) =>
  MODELS[kind] as unknown as mongoose.Model<any>;
```

Why the ugly `as unknown as`: TypeScript sees five *different* model types. When you join
them with `|` (a **union**), TypeScript only allows what all five agree on, and their
`findById` signatures do not match exactly, so it refuses to call it. Casting to
`Model<any>` says "trust me, treat it as a generic model". Every read still goes through
one shared shape (`TaxonomyDoc`), so nothing is really unchecked.

Next, our own error type, so the service can choose the HTTP status without importing
Express:

```ts
export class IntegrityError extends Error {
  status: number;
  details?: Record<string, number>;
  constructor(status: number, message: string, details?: Record<string, number>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
```

`extends Error` means it behaves like a normal error (you can `throw` it), plus it carries
`status` (404 / 409 / 400) and optional `details` (e.g. how many subjects blocked a move).
The controller reads `status` and answers with it.

Now the key question: **is this update a rename or a move?**

```ts
const PARENT_KEYS: Record<TaxonomyKind, string[]> = {
  level: [],
  background: ["levelId"],
  subject: ["levelId", "backgroundId"],
  chapter: ["levelId", "backgroundId", "subjectId"],
  topic: ["levelId", "backgroundId", "subjectId", "chapterId"],
};

export const isReparent = (kind: TaxonomyKind, body: Record<string, unknown>) =>
  PARENT_KEYS[kind].some((key) => body[key] !== undefined);
```

If the body contains **no** parent field, it is a rename: nothing below cares, so we skip
the whole walk and the transaction. This keeps the common case (fixing a spelling) as fast
as it was before.

### The one rule that removes every broken state

**Never trust the body for ancestor fields. Read them from the new parent.**

If the admin sends `{ chapterId: "X", subjectId: "wrong-subject" }`, we ignore
`subjectId` and take the real subject from chapter `X`. That way a topic can never sit
under a chapter that belongs to another subject — that state simply cannot be written.

```ts
export const deriveAncestors = async (
  kind: TaxonomyKind,
  body: Record<string, unknown>,
  current: TaxonomyDoc,
): Promise<Ancestors> => {
  const field = PARENT_FIELD[kind];
  if (!field) return {};              // a level has no parent — nothing to derive
  ...
```

**Topic** (the deepest case) is the clearest example:

```ts
  const chapterId = (body.chapterId as string) ?? String(current.chapterId);
  const chapter = await Chapter.findById(chapterId).lean<TaxonomyDoc | null>();
  if (!chapter) throw new IntegrityError(404, "Chapter not found.");
  return {
    levelId: chapter.levelId,
    backgroundId: chapter.backgroundId ?? [],
    subjectId: chapter.subjectId,
    chapterId: chapter._id,
  };
```

`??` is the **nullish coalescing** operator: "use the left side unless it is `null` or
`undefined`". So: use the chapter the body asked for; if the body did not mention one, keep
the current chapter. Then all four ancestor ids come from that chapter document, not from
the body.

**Chapter** does the same from its subject. **Subject** checks something extra — a subject
lists several backgrounds, and each one must belong to the chosen level:

```ts
  const wanted = (body.backgroundId as string[]) ?? current.backgroundId ?? [];
  const backgrounds = await Background.find({
    _id: { $in: wanted },
    levelId: level._id,
  }).lean<TaxonomyDoc[]>();

  if (backgrounds.length !== wanted.length) {
    throw new IntegrityError(400, "Every background must exist and belong to the chosen level.");
  }
```

If you asked for 3 backgrounds and only 2 come back matching that level, the third either
does not exist or belongs elsewhere → `400`, nothing is written.

**Background** is the special case that is *refused*:

```ts
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
```

Why refuse instead of fix: a background has no subject of its own. If you move it to
another level, every subject/chapter/topic that lists it would now belong to two levels at
once, and there is no correct automatic answer for which one wins. So the server says
`409` and tells you exactly how many documents are blocking it. Renaming a background is
always allowed; only a level change is blocked, and only while something still uses it.

`Promise.all` runs those three counts at the same time instead of one after another. It is
safe **here** because this happens before any transaction writes. (Inside a transaction it
is forbidden — see the warning in the next section.)

---

## 5. Step 2 — push the change down (resyncSubtree)

The document itself is now correct. Its children and its questions still hold the old ids.
`resyncSubtree` copies the new values downwards.

```ts
export type SyncReport = {
  chapters: number; topics: number; questions: number; subQuestions: number;
};

// Questions store every id as a plain String, so everything written down there
// has to be stringified first.
const str = (value: unknown) => String(value);
const strList = (values?: mongoose.Types.ObjectId[]) => (values ?? []).map(str);
```

**Why `String(...)` everywhere:** taxonomy documents store ids as real `ObjectId`s, but
questions store them as plain **strings**. In MongoDB `ObjectId("68f1...")` and
`"68f1..."` are two different values and do **not** match each other. Forgetting this is
the classic silent bug: the query runs, finds nothing, and reports success.

> **Warning that shaped this code:** inside a transaction you must `await` each write one
> at a time. A `ClientSession` cannot carry two operations at once, so `Promise.all` there
> throws at runtime. Every write below is sequential on purpose.

Subject moved → its chapters, topics and questions inherit the new level/backgrounds:

```ts
  if (kind === "subject") {
    const inherited = { levelId: doc.levelId, backgroundId: doc.backgroundId };
    const chapters = await Chapter.updateMany({ subjectId: doc._id }, { $set: inherited }, { session });
    const topics   = await Topic.updateMany({ subjectId: doc._id }, { $set: inherited }, { session });
    const questions = await BaseQuestion.updateMany(
      { subjectId: self },                            // `self` is the string form
      { $set: { levelId, backgroundId } },             // string forms
      { session },
    );
    return { chapters: chapters.modifiedCount, topics: topics.modifiedCount,
             questions: questions.modifiedCount, subQuestions: 0 };
  }
```

Note the two styles in one function: taxonomy collections are queried with `doc._id`
(ObjectId) and questions with `self` (string). That is not a mistake — it is the
denormalization cost.

Topic moved → the only case that also has to fix data **inside an array**:

```ts
  const chapterId = str(doc.chapterId);
  const questions = await BaseQuestion.updateMany(
    { topicId: self },
    { $set: { levelId, backgroundId, subjectId: str(doc.subjectId), chapterId } },
    { session },
  );
  // A CQ repeats chapterId next to each sub-question's topicId.
  const subQuestions = await BaseQuestion.updateMany(
    { "subQuestions.topicId": self },
    { $set: { "subQuestions.$[el].chapterId": chapterId } },
    { session, arrayFilters: [{ "el.topicId": self }] },
  );
```

**`arrayFilters` explained.** A CQ has four sub-questions. If the topic moved, only the
sub-questions that point at *this* topic should get the new `chapterId` — the others must
stay untouched. `$[el]` is a placeholder meaning "array items that match the filter named
`el`", and `arrayFilters: [{ "el.topicId": self }]` defines that filter. Without it you
would have to rewrite the whole array in Node and risk overwriting good data.

Why this second query is needed at all: a CQ can be **filed** under topic A while one of
its sub-questions points at topic B. Moving topic B does not match `{ topicId: self }`, so
without this query that sub-question would keep a wrong `chapterId` forever.

`modifiedCount` values are returned to the controller and sent back to the admin as
`synced`, so you can see the propagation really happened:

```json
{ "success": true, "message": "Topic updated successfully.",
  "synced": { "chapters": 0, "topics": 0, "questions": 42, "subQuestions": 3 } }
```

A `level` or `background` update returns `NO_SYNC` (all zeros) — a level has nothing above
it to copy down, and a background move is either a rename or already refused with `409`.

---

## 6. Step 3 — find everything that must die (collectDoomed)

This function does not delete anything. It only builds a list — the "doomed set".

```ts
export type DoomedSet = {
  backgrounds: string[];
  subjects: string[];
  chapters: string[];
  topics: string[];
  questions: string[];
  cqViaSubQuestions: number;   // CQs caught only through a sub-question
  detached: {                  // only a background delete produces these
    subjects: string[]; chapters: string[]; topics: string[]; questions: string[];
  };
};
```

**Walking down, top first.** Deleting a level takes its backgrounds, subjects, chapters and
topics:

```ts
  if (kind === "level") {
    backgrounds = ids(await Background.find({ levelId: id }, "_id", opts).lean<LeanId[]>());
    subjects    = ids(await Subject.find({ levelId: id }, "_id", opts).lean<LeanId[]>());
    chapters    = ids(await Chapter.find({ levelId: id }, "_id", opts).lean<LeanId[]>());
    topics      = ids(await Topic.find({ levelId: id }, "_id", opts).lean<LeanId[]>());
  }
```

`"_id"` is the projection — fetch only the id, nothing else. `opts` is `{ session }` when
we are inside a transaction and `{}` when this is just a preview; passing the session makes
the count and the delete read the exact same snapshot of the data.

**Background is different, because it lives in an array.** A subject can list several
backgrounds. If it lists the dying one *and others*, it survives — we only pull one value
out of its array. If the dying background is its **only** one, it can never be reached
again, so it dies too.

```ts
const splitByBackground = (docs: TaxonomyDoc[]) => {
  const dead: IdList = [];
  const alive: IdList = [];
  docs.forEach((doc) =>
    ((doc.backgroundId ?? []).length <= 1 ? dead : alive).push(str(doc._id)),
  );
  return { dead, alive };
};
```

`dead` goes into the doomed set; `alive` goes into `detached` and is shown in the dialog as
"kept, but changed", so you are never surprised.

**Then down one more step.** Whichever branch produced subjects/chapters, their children
must join the list:

```ts
  if (subjects.length) {
    chapters = union(chapters, ids(await Chapter.find({ subjectId: { $in: subjects } }, "_id", opts).lean()));
    topics   = union(topics,   ids(await Topic.find({ subjectId: { $in: subjects } }, "_id", opts).lean()));
  }
  if (chapters.length) {
    topics = union(topics, ids(await Topic.find({ chapterId: { $in: chapters } }, "_id", opts).lean()));
  }
```

`union` merges two lists and drops duplicates using `new Set(...)`. A topic can be found
twice (once by subject, once by chapter) and must appear only once.

Detached documents are deliberately **not** walked: they survive, so their children survive
too.

**Finally the questions.** One query with `$or`, built from whatever the walk found:

```ts
  const or: Record<string, unknown>[] = [];
  if (kind === "level") or.push({ levelId: id });
  if (kind === "background") or.push({ backgroundId: { $all: [id], $size: 1 } });
  if (subjects.length) or.push({ subjectId: { $in: subjects } });
  if (chapters.length)
    or.push({ chapterId: { $in: chapters } }, { "subQuestions.chapterId": { $in: chapters } });
  if (topics.length)
    or.push({ topicId: { $in: topics } }, { "subQuestions.topicId": { $in: topics } });

  const matched = or.length
    ? await BaseQuestion.find({ $or: or }, projection, opts).lean<LeanQuestion[]>()
    : [];
```

Three things to notice:

1. `"subQuestions.topicId"` — dot notation reaches **inside** array items. MongoDB matches
   the document if *any* item matches. This is what makes a CQ die when one of its four
   sub-questions belonged to the deleted topic (your decision: a CQ is deleted whole,
   because a CQ with a hole in it is not a valid question).
2. `{ $all: [id], $size: 1 }` for a background — the question dies only if that background
   was its only one.
3. `BaseQuestion` is the discriminator parent, so this one query covers both MCQ and CQ.

Then we separate the two ways a question was caught:

```ts
  const isDirect = (q: LeanQuestion) =>
    (kind === "level" && q.levelId === id) ||
    (kind === "background" && (q.backgroundId ?? []).length <= 1) ||
    (!!q.subjectId && subjectSet.has(q.subjectId)) ||
    (!!q.chapterId && chapterSet.has(q.chapterId)) ||
    (!!q.topicId && topicSet.has(q.topicId));

  const questions = ids(matched);
  const cqViaSubQuestions = matched.filter((q) => q.questionType === "CQ" && !isDirect(q)).length;
```

A `Set` is used instead of `array.includes()` because checking membership in a Set is
instant, while `includes` scans the whole array every time. With hundreds of topics and
thousands of questions that difference is real.

`cqViaSubQuestions` is reported separately in the dialog, because from the admin's point of
view those CQs are filed under a *different* topic — seeing them disappear without an
explanation would look like a bug.

---

## 7. Step 4 — count it (collectImpact)

`collectImpact` takes the doomed set and turns it into numbers for the dialog. It also
counts what is **kept**, which is just as important.

```ts
export const collectImpact = async (kind, id, session?) => {
  const doc = await taxonomyModel(kind).findById(id, "name", opts).lean<TaxonomyDoc | null>();
  if (!doc) throw new IntegrityError(404, `${LABELS[kind]} not found.`);

  const doomed = await collectDoomed(kind, id, session);
  const questionOids = toObjectIds(doomed.questions);
```

`toObjectIds` converts the string ids back into real `ObjectId`s, because `SavedQuestion`
and `Exam` store `questionId` as an ObjectId reference while questions store taxonomy ids as
strings. Same ids, two different types, two different collections — this is where the
denormalization tax is paid.

Exams are split into two groups:

```ts
    const generated = await Exam.find({ status: "generated", ...filter }, "_id questionIds", opts).lean();
    generated.forEach((exam) => {
      const survives = (exam.questionIds ?? []).some((qid) => !doomedQuestions.has(str(qid)));
      if (survives) pruned += 1;   // will lose some questions
      else deleted += 1;           // has nothing left to answer
    });
    submittedExams = await Exam.countDocuments({ status: "submitted", ...filter }, opts);
```

- `status: "generated"` = an exam the student created but never submitted. It is not a
  result, so it is safe to shrink or remove.
- `status: "submitted"` = a finished exam with a score. **Never touched.** We only count it,
  to tell you in the dialog that it survives.

The `preserved` block is counted the same way — submitted exams, answer scripts and
analytics rows — and the dialog shows it as a muted line. This is your decision #1 written
in code: *purge content, keep results.*

```ts
  // IAnswer types answerScript[].questionId as a string while the schema stores an
  // ObjectId ref, so the string list goes in and Mongoose casts it off the path.
  const answerScripts = doomed.questions.length
    ? await Answer.countDocuments({ "answerScript.questionId": { $in: doomed.questions } }, opts)
    : 0;
```

That comment marks a pre-existing type bug in `IAnswer` (the interface says `string`, the
schema says ObjectId). Instead of changing a shared interface in the middle of this task, we
pass strings and let Mongoose convert them using the schema. It works, and the comment tells
the next reader why it looks inconsistent.

One small but important detail in the report:

```ts
    descendants: {
      // The doc itself is in its own doomed list; the dialog only wants what else goes.
      subjects: doomed.subjects.filter((v) => v !== id).length,
      ...
```

When you delete a topic, `doomed.topics` contains that topic. The dialog should say "also
deletes 4 topics", not 5, so the document itself is filtered out of its own count.

---

## 8. Step 5 — delete it (cascadeDelete)

Same list, now as writes, inside the caller's transaction, in **dependency order**.

```ts
export const cascadeDelete = async (kind, id, session: ClientSession): Promise<ImpactReport> => {
  const { report, doomed } = await collectImpact(kind, id, session);
  const questionOids = toObjectIds(doomed.questions);
```

Note it calls `collectImpact` itself. This is the anti-drift design: what was counted is
exactly what is written, and the same numbers are returned for the success message.

**1. Bookmarks first** — nothing else reads them:

```ts
  await SavedQuestion.deleteMany({ questionId: { $in: questionOids } }, { session });
```

**2. Unfinished exams** — shrink or remove, and re-total:

```ts
    for (const exam of generated) {
      const survivors = (exam.questionIds ?? []).filter((qid) => !doomedQuestions.has(str(qid)));
      if (!survivors.length) {
        await Exam.deleteOne({ _id: exam._id }, { session });
        continue;
      }
      const kept = await BaseQuestion.find({ _id: { $in: survivors } }, "marks timeRequired", { session }).lean();
      await Exam.updateOne(
        { _id: exam._id },
        { $set: {
            questionIds: survivors,
            "scope.topicIds": (exam.scope?.topicIds ?? []).filter((t) => !doomedTopics.has(t)),
            totalMarks: kept.reduce((sum, q) => sum + (q.marks ?? 0), 0),
            totalTime: kept.reduce((sum, q) => sum + (q.timeRequired ?? 0), 0),
        } },
        { session },
      );
    }
```

Why recompute `totalMarks` and `totalTime`: if an exam had 20 questions worth 20 marks and
5 questions are deleted, leaving the total at 20 would score the student out of 20 when only
15 questions exist. `reduce` walks the surviving questions and adds their marks up.

A normal `for ... of` loop is used (not `forEach` with async) because each write must finish
before the next one starts inside a transaction.

**3. The questions, then the array case:**

```ts
  await BaseQuestion.deleteMany({ _id: { $in: questionOids } }, { session });

  if (kind === "background") {
    await BaseQuestion.updateMany({ backgroundId: id }, { $pull: { backgroundId: id } }, { session });
  }
```

`$pull` removes just that one id from the array and leaves the question alive. This is the
same pattern your existing `deleteRecord` used — it was the one handler that already did the
right thing, and it is generalised here.

**4. Descendant taxonomy, deepest first** (topics → chapters → subjects → backgrounds), so
no document is ever left pointing at a parent that was already removed mid-transaction.

**5. Detached documents lose one array entry:**

```ts
  if (kind === "background") {
    const pull = { $pull: { backgroundId: id } };
    await Subject.updateMany({ backgroundId: id }, pull, { session });
    await Chapter.updateMany({ backgroundId: id }, pull, { session });
    await Topic.updateMany({ backgroundId: id }, pull, { session });
  }
```

The dead ones are already gone by now, so these updates can only reach the survivors.

**6. User profiles:**

```ts
  await User.updateMany({ level: id }, { $unset: { level: "" } }, { session });
```

`$unset` removes the field entirely. The `""` is a dummy value MongoDB ignores — only the
key matters. The field is unset rather than set to some default, because your client already
shows the "choose your profile" prompt when `level` is missing. So the user is guided instead
of stuck on a broken page.

**7. The document itself:**

```ts
  await taxonomyModel(kind).deleteOne({ _id: id }, { session });
```

For a topic/chapter/subject/background this is already done by step 4, and deleting nothing
is not an error, so the line is harmless and makes the intent obvious.

---

## 9. The shared controller (one code, five kinds)

**File:** `server/src/controllers/taxonomy-write-controller.ts`

The update and delete logic is identical for all five kinds, so it is written **once** as a
**factory function** — a function that returns the real route handler:

```ts
export const updateTaxonomy =
  (kind: TaxonomyKind) => async (req: Request, res: Response) => { ... };
```

`updateTaxonomy("topic")` gives back an `(req, res)` handler that knows it is working on
topics. This is why `topic-controller.ts` is now just:

```ts
export const updateTopic = updateTaxonomy("topic");
export const deleteTopic = deleteTaxonomy("topic");
export const getTopicImpact = impactTaxonomy("topic");
```

The route files did not have to change their imports at all.

The update handler, with the two paths clearly separated:

```ts
    // rename → old fast path, no transaction, no walk
    if (!isReparent(kind, body)) {
      const updated = await taxonomyModel(kind).findByIdAndUpdate(id, body, {
        new: true, runValidators: true,
      });
      if (!updated) return notFound(res, kind);
      res.status(200).json({ success: true, message: `${LABEL[kind]} updated successfully.`,
        data: await populated(kind, id) });
      return;
    }

    // re-parent → transaction
    const session = await mongoose.startSession();
    let synced: SyncReport | undefined;
    try {
      await session.withTransaction(async () => {
        const current = await taxonomyModel(kind).findById(id).session(session).lean();
        if (!current) throw new IntegrityError(404, `${LABEL[kind]} not found.`);

        // The body's own values for ancestor fields are deliberately overwritten.
        const ancestors = await deriveAncestors(kind, body, current);
        await taxonomyModel(kind).findByIdAndUpdate(id, { ...body, ...ancestors },
          { runValidators: true, session });
        synced = await resyncSubtree(kind, id, session);
      });
    } finally {
      await session.endSession();
    }
```

Key points:

- `{ ...body, ...ancestors }` — spread order matters. `ancestors` comes **last**, so its
  values overwrite anything the body sent for those same fields. One line, and the "topic
  under the wrong subject" state becomes impossible.
- `session.withTransaction(...)` runs the callback and commits at the end. If the callback
  throws **anything**, MongoDB rolls every write back automatically — you cannot end up with
  half a cascade. It also retries automatically on temporary cluster errors.
- `finally { await session.endSession(); }` — `finally` runs whether it succeeded or failed,
  so the session is always released. Leaking sessions eventually exhausts the connection.
- `runValidators: true` — by default Mongoose skips schema validation on updates. This turns
  it back on.

Errors are translated in one place:

```ts
const fail = (res: Response, error: unknown) => {
  if (error instanceof IntegrityError) {
    res.status(error.status).json({ success: false, message: error.message,
      details: error.details, data: null });
    return;
  }
  console.error(error);
  res.status(500).json({ success: false, message: "Server error.", data: null });
};
```

An `IntegrityError` is an expected outcome (404/409/400) and its message is safe to show the
admin. Anything else is a real bug: it is logged on the server and the client only gets a
generic `500`, so internal details never leak.

The delete handler builds a human message from the report:

```ts
const deleteMessage = (kind: TaxonomyKind, report: ImpactReport) => { ... };
// → "Topic deleted. Also removed 42 questions, 18 saved questions. 2 unfinished exams adjusted."
```

And the preview handler is the same walk with no writes:

```ts
export const impactTaxonomy = (kind: TaxonomyKind) => async (req, res) => {
  const { id } = req.params as { id: string };
  try {
    const { report } = await collectImpact(kind, id);
    res.status(200).json({ success: true, message: "Impact calculated.", data: report });
  } catch (error) { fail(res, error); }
};
```

### Why `req.params` is cast to `{ id: string }`

All three handlers pull the id out the same way — `const { id } = req.params as { id: string }`
— and that cast is **not** decoration. It is what lets the file build on Render.

`req.params` is typed by `@types/express-serve-static-core`, and Express 5 changed what a
param can be: a repeated segment (`/:id+`) can now match **several** parts of the URL, so the
newer type says every param is `string | string[]`, not just `string`. Our service functions
(`collectImpact`, `cascadeDelete`, `resyncSubtree`, `populated`) all take `id: string`, so
handing them a `string | string[]` is a compile error — *"Type 'string[]' is not assignable to
type 'string'."*

The trap is that it only shows up **sometimes**. That types package is pulled in through a
`^` (caret) range, and `server/` has no lockfile of its own, so:

- **Locally** an older copy is already installed, where a param is still plain `string`. The
  cast looks pointless and `npx tsc --noEmit` passes.
- **On Render** a clean install resolves the newer copy, the param becomes `string | string[]`,
  and without the cast the build fails on five lines at once.

The `/:id` routes here never use `+` or `*`, so a request always carries exactly one id string.
Casting to `{ id: string }` states that fact once, and it compiles under **both** versions of the
type. **Do not "simplify" it away** — it will pass on your machine and break the deploy.

> Sturdier fix if this keeps biting: commit a lockfile for `server/` (or pin the exact
> `@types/express` version) so local and Render install the identical types instead of drifting
> apart across a caret range.

### The update body must strip unknown keys, not reject them

`validate(topicUpdateSchema)` runs in front of this handler (see §12) and fixes what
`req.body` contains before `isReparent` ever reads it. Those schemas come from one helper in
`server/src/validations/crud.validation.ts`:

```ts
const updateBody = <T extends z.ZodRawShape>(shape: T) =>
  z.object({
    params: z.object({ id: objectId }),
    body: z.object(shape).partial().strip(),   // strip, NOT strict
  });
```

- `.partial()` makes every field optional, so a rename can send just `{ name }`.
- `.strip()` — Zod's default — **drops** any key the shape does not list. It must **not** be
  `.strict()`, which instead **rejects** the whole request with a `400`.

That one word caused a real, confusing bug. The admin edit form
(`client/src/components/admin/data-field.tsx`) runs a **dependent-reset cascade**: changing a
parent dropdown clears every field below it. So editing a topic and choosing a new chapter
also writes `topicId: ""` into the form; changing a chapter's subject writes `chapterId: ""`
and `topicId: ""`; and so on. The form then submits the whole object, stray keys included.

But `topicUpdateSchema` has no `topicId` (a topic's own id is in the URL, not the body). Under
`.strict()`, that injected `topicId` made `safeParse` fail with *"Unrecognized key(s):
'topicId'"* — a `400` returned before this handler ever ran. The symptom was exact:

> **renaming a taxonomy document worked, but re-parenting one always failed.**

A rename touches no dropdown, so nothing is injected and the body is clean. A re-parent always
fires the cascade, so it always carried a key the strict schema refused. `.strip()` removes
those extras, the body validates, and the re-parent flow above finally runs. And because the
derived-ancestors rule (§4) already ignores whatever the body claims about ancestor fields,
dropping the extra keys is not just safe — it is exactly the whitelist behaviour we want.

---

## 10. The five controllers and the deleted model hooks

`topic-controller.ts`, `chapter-controller.ts`, `subject-controller.ts`,
`background-controller.ts`, `level-controller.ts`:

- `create*`, `getAll*`, `getSingle*` — **unchanged**.
- `update*` / `delete*` — the hand-written bodies are gone, replaced by the factory calls
  above, plus a new `get*Impact` export.
- The unused `BaseQuestion` and `IPopulatedData` imports (left over from the abandoned hook
  attempt) are deleted, because an import that suggests a cascade that does not exist is
  worse than no import.

`topic-model.ts`, `chapter-model.ts`, `subject-model.ts` — the three dead hooks were
**removed** and replaced by a comment:

```ts
// The cascade lives in services/taxonomy-integrity.service.ts, not in a hook: it
// has to run inside the caller's transaction and it deletes far more than
// questions. A schema hook here would be a second, transaction-less code path.
```

Why remove instead of fix: a hook cannot see the caller's transaction, so a "fixed" hook
would delete questions **outside** the transaction. If the transaction later rolled back, the
questions would still be gone. One cascade path is safer than two.

---

## 11. Admin-only writes

**New file:** `server/src/middlewares/require-role.ts`

```ts
type Role = NonNullable<IUser["role"]>;

export function requireRole(...roles: Role[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    // No user means requireAuth did not run ahead of this, which is a wiring
    // mistake rather than a rejected caller — 401 says the same thing to a client.
    if (!role) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    if (!roles.includes(role)) {
      res.status(403).json({ success: false,
        message: "You do not have permission to perform this action." });
      return;
    }
    next();
  };
}

// The gate every content write shares. Exported as a pair so a route file cannot
// mount the role check without the authentication that populates req.user.
export const adminOnly: RequestHandler[] = [
  requireAuth,
  requireRole("admin", "super-admin"),
];
```

Explanations:

- `...roles` is a **rest parameter**: `requireRole("admin", "super-admin")` collects both
  into an array. This is another factory — it returns the middleware.
- `next()` means "this request is fine, continue to the next middleware or the controller".
  Not calling `next()` (and sending a response instead) stops the request right there.
- `NonNullable<IUser["role"]>` reads the `role` type straight out of your `IUser` interface
  and removes `undefined`. If you ever add a new role, this stays correct automatically.
- `adminOnly` exists so no route can accidentally check the role **without** first running
  `requireAuth` — which is what fills in `req.user`. Without auth, `req.user` is undefined and
  the role check would reject everyone with a confusing 401.

---

## 12. Routes

Every write route in `level`, `background`, `subject`, `chapter`, `topic`, `record`,
`question` and `extraction` now spreads `adminOnly`. `topic-routes.ts` is the template:

```ts
import { adminOnly } from "../middlewares/require-role";
import { objectIdParam } from "../validations/common";

// Reads stay public (the client's master-data cache is unauthenticated); writes
// are admin-only.

router.post("/create", ...adminOnly, createTopic);
router.get("/", validate(topicListSchema), getAllTopics);

// What deleting this topic would remove. Before /:id so the literal wins.
router.get("/:id/impact", ...adminOnly, validate(objectIdParam), getTopicImpact);

router.get("/:id", getSingleTopic);
router.put("/:id", ...adminOnly, validate(topicUpdateSchema), updateTopic);
router.delete("/:id", ...adminOnly, validate(objectIdParam), deleteTopic);
```

Two details that matter:

- `...adminOnly` is the **spread** operator. `adminOnly` is an array of two middlewares, and
  Express wants them as separate arguments, so `...` unpacks them.
- `/:id/impact` **must** be registered before `/:id`. Express matches routes in order, and
  `/:id` would happily treat the whole `"abc/impact"` as an id... actually it would match
  `/:id` only for one segment, but the safe habit is: **literal segments before dynamic
  ones.** Keeping that order means the impact route can never be shadowed later.
- `objectIdParam` is your existing zod validator, reused so a malformed id is rejected with
  `400` before it ever reaches the database.

`GET` routes stay public on purpose: the client loads master data (levels, subjects, …) and
the public question bank without logging in. Locking those would break the guest experience.

`extraction-routes.ts` also got the gate, and the order was chosen carefully:

```ts
// Uploads a file to the AI extractor, which costs tokens on every call — admin-only.
router.post("/extract-questions", ...adminOnly, extractQuestionsHandler);
```

Auth now runs **before** multer parses the upload, so an anonymous request cannot make you
pay for file parsing or AI tokens.

---

## 13. "This question is unavailable"

Your requirement: *if a question is missing for any reason, show "unavailable" instead of an
error or a silent gap.* Three read paths could hand the client a dead question id.

### 13.1 Exam review — `server/src/services/exam.service.ts`

Before, when the question was gone, every field became `undefined` and the review card
rendered empty while still showing "Correct". Now:

```ts
  const review = (answer?.answerScript || []).map((a: any) => {
    const q = qMap[String(a.questionId)];
    // The question may have been deleted after this exam was taken. The score is
    // history, so the row still reports what was answered.
    if (!q) {
      return {
        questionId: String(a.questionId),
        unavailable: true,
        marks: a.marks ?? 0,
        givenAns: a.givenAns,
        isCorrect: a.isCorrect,
      };
    }
    return { questionId: String(a.questionId), question: q.question, options: q.options,
      correctAnswer: q.correctAnswer, explanation: q.explanation, marks: q.marks,
      givenAns: a.givenAns, isCorrect: a.isCorrect };
  });
```

Notice the second branch dropped all the `q?.` question marks. Once the `if (!q)` check
returns early, `q` definitely exists, so the optional chaining was hiding the real problem
rather than solving it.

Exam **take** mode keeps its `.filter(Boolean)` (silently skipping missing questions),
because the cascade prunes unfinished exams anyway, and showing an unanswerable question in
the middle of a live test would be worse than showing one question less.

### 13.2 Saved questions — `server/src/controllers/saved-question-controller.ts`

The old code hid the problem:

```ts
// before
const result = savedQuestions
  .map((sq) => questionsById[sq.questionId.toString()] || null)
  .filter((q) => q !== null);      // row silently disappears
```

`total` was counted separately from `SavedQuestion`, so the page promised "20 saved
questions" and then rendered 18 with no explanation. Now:

```ts
    // A bookmark can outlive its question (taxonomy cascade, or a question deleted
    // from the admin panel). Dropping the row here would make the page show fewer
    // rows than `total` promises, so it goes out as a placeholder instead.
    const result = savedQuestions.map((sq) => {
      const q = questionsById[sq.questionId.toString()];
      if (q) return q;
      return { _id: sq.questionId, questionType: sq.questionType, unavailable: true };
    });
```

### 13.3 The client types — `client/src/types/types.ts`

`ExamReviewItemType` became a **discriminated union**: two shapes, told apart by one field.

```ts
// A review row for a question that still exists.
interface ExamReviewAnsweredItem {
  questionId: string; question: string; options: string[];
  correctAnswer: string; explanation: string; marks: number;
  givenAns: string | undefined; isCorrect: boolean;
  unavailable?: false;
}

// The question was deleted after the exam was taken.
interface ExamReviewUnavailableItem {
  questionId: string; unavailable: true; marks: number;
  givenAns: string | undefined; isCorrect: boolean;
}

export type ExamReviewItemType = ExamReviewAnsweredItem | ExamReviewUnavailableItem;
```

Why a union instead of just adding `unavailable?: boolean`: with a union, TypeScript
**narrows** the type for you. After `if (item.unavailable) return ...`, TypeScript knows the
rest of the function is dealing with the full shape, so `item.question` is a guaranteed
`string`. If you later forget the check, the compiler stops you — the type system enforces
the placeholder, not your memory.

### 13.4 `client/src/components/exam/ExamReview.tsx`

The Correct/Wrong badge was lifted into a variable so both branches share it:

```tsx
  const statusBadge = item.isCorrect ? (
    <Badge className="bg-green-400 gap-1"><Check className="size-3" /> Correct</Badge>
  ) : (
    <Badge variant="destructive" className="gap-1">
      <X className="size-3" />{givenIdx === null ? "Not answered" : "Wrong"}
    </Badge>
  );

  // The question is gone but the score it contributed is not, so the badge and the
  // marks stay and only the body is replaced.
  if (item.unavailable) {
    return (
      <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-dashed border-sidebar-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <p className="bg-input size-6 flex justify-center items-center text-xs rounded">{index}</p>
            {statusBadge}
          </div>
          <p className="text-muted-foreground text-sm max-sm:text-xs">
            This question is no longer available — it was removed after you took
            this exam. Your answer still counts towards the result above.
          </p>
        </div>
      </div>
    );
  }

  const correctIdx = Number(item.correctAnswer);   // safe: only reached when the question exists
```

The dashed border (`border-dashed`) and muted text say "this is a placeholder, not real
content" without needing a warning icon. The percentage at the top still matches, because the
score was never recalculated from the questions — it was stored when the exam was submitted.

### 13.5 `client/src/pages/collection/slug-1/SingleCollectionPage.tsx`

Same idea for a saved question. First the types (declared at module level, above the
component):

```ts
type UnavailableQuestion = {
  _id: string;
  questionType: IBaseQuestion["questionType"];
  unavailable: true;
};

type CollectionQuestion =
  | ((ICQ | IMCQ) & { _id: string; unavailable?: false })
  | UnavailableQuestion;
```

`unavailable?: false` on the normal shape is what lets `q.unavailable` be read at all — in a
union you may only touch fields that exist on **every** member.

Then the row, and a small "remove" action so a dead bookmark can be cleared:

```tsx
  // The toggle endpoint deletes the SavedQuestion row when one exists, so it works
  // as an unsave even though the question itself is gone.
  async function removeSavedQuestion(q: UnavailableQuestion) {
    setRemovingId(q._id);
    try {
      const res = await client.post("/collection/saved-question/toggle", {
        collectionId, questionId: q._id, questionType: q.questionType,
      });
      if (res.data.success) setReloadToken((t) => t + 1);
      else toast.error(res.data.message || "Failed to remove question");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove question");
    } finally {
      setRemovingId(null);
    }
  }
```

No new endpoint was needed: your existing `toggle` route deletes the row when it already
exists, which is exactly an unsave.

`reloadToken` is a counter kept in state and listed in the fetch effect's dependency array:

```ts
  }, [collectionId, page, selectedSubject, selectedChapter, reloadToken]);
```

Changing it re-runs the effect, so the list and the `total` are re-fetched from the server.
This is the standard React trick for "run that effect again on demand" without moving the
fetch function outside the effect.

The render branches on `unavailable` **before** the CQ/MCQ test:

```tsx
          {questions.map((q, i) =>
            q.unavailable ? (
              <div key={q._id} className="flex items-start justify-between gap-3 rounded-xl border border-dashed border-sidebar-border p-5 max-sm:p-4">
                ...
                <Button variant="ghost" size="icon" disabled={removingId === q._id}
                        onClick={() => removeSavedQuestion(q)} aria-label="Remove from collection">
                  {removingId === q._id ? <Loader2 className="size-4 animate-spin" />
                                        : <BookmarkX className="size-4 text-destructive" />}
                </Button>
              </div>
            ) : q.questionType === "CQ" ? ( ... ) : ( ... ),
          )}
```

`aria-label` gives the icon-only button a name for screen readers. `disabled` while removing
prevents a double request.

---

## 14. The delete dialog with impact preview

**File:** `client/src/components/admin/all-data.tsx`

The old delete dialog was **uncontrolled** — React did not know whether it was open, so there
was no moment at which to fire a fetch. The new `DeleteRowDialog` owns its own state.

It is declared at **module level** (outside `AllData`), which matters:

```tsx
// Declared at module level on purpose: nested inside AllData it would be a new
// component type on every render, remounting the dialog and losing its state.
function DeleteRowDialog({ heading, route, id, name, onConfirm }: { ... }) {
  const [open, setOpen] = useState(false);
  const [impact, setImpact] = useState<ImpactReport | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [deleting, setDeleting] = useState(false);
```

If a component is defined *inside* another component, React sees a brand-new function on
every render and throws away the old DOM and state. Your dialog would close by itself while
loading. Module level fixes that.

Which routes have a preview:

```tsx
// Routes whose DELETE cascades, and therefore expose GET /:id/impact. Records carry
// no taxonomy ids, so deleting one only unlinks it from questions and there is
// nothing to preview.
const IMPACT_ROUTES = ["/level", "/background", "/subject", "/chapter", "/topic"];
```

The fetch, with a cancel guard:

```tsx
  useEffect(() => {
    if (!open || !hasImpactEndpoint) return;

    let cancelled = false;
    setLoadingImpact(true);
    setImpact(null);

    client.get(`${route}/${id}/impact`)
      .then((res) => {
        if (cancelled) return;
        if (res.data.success) setImpact(res.data.data);
        else toast.error(res.data.message || "Failed to load delete impact.");
      })
      .catch((error) => { if (cancelled) return; console.error(error); toast.error("Failed to load delete impact."); })
      .finally(() => { if (!cancelled) setLoadingImpact(false); });

    return () => { cancelled = true; };
  }, [open, hasImpactEndpoint, route, id]);
```

The returned function is the effect's **cleanup**; React runs it when the dialog closes or
the row changes. Setting `cancelled = true` stops a late response from writing into a
component the user already closed — that would otherwise show stale counts for the wrong row.

Fetching on open (not for every row up front) matters too: six rows on screen would mean six
full subtree walks for a page you may not delete from at all.

Confirm is disabled while the counts load, so you can never delete blind:

```tsx
  <Button size="sm" variant="destructive" disabled={loadingImpact || deleting} onClick={handleDelete}>
    {deleting ? "Deleting…" : "Delete"}
  </Button>
```

And the dialog stays open when the delete fails:

```tsx
  async function handleDelete() {
    setDeleting(true);
    try {
      // Stays open on failure so the error toast has something to point at.
      if (await onConfirm(id)) setOpen(false);
    } finally {
      setDeleting(false);
    }
  }
```

For this, `deleteData` in `AllData` now returns a boolean instead of nothing:

```tsx
  async function deleteData(id: string) {
    try {
      const res = await client.delete(`${route}/${id}`);
      const { data } = res;
      if (data.success) {
        setAllData((prev) => prev.filter((d) => d._id !== id));
        toast.success(data.message);
        return true;
      }
      toast.error(data.message);
      return false;
    } catch {
      toast.error("Server Error!");
      return false;
    }
  }
```

It also **lost** two lines that were there before:

```tsx
// removed
closeRef.current?.click();
closeRef.current = null;
```

That old trick closed the dialog by programmatically clicking a hidden button. After the
refactor `closeRef` only points at the **Edit** buttons, so keeping it would have *opened an
edit dialog* after a delete. The new dialog closes itself with `setOpen(false)`, which is
what controlled state is for.

The dialog body turns the report into three plain lists:

```tsx
  const removed: string[] = [];
  if (impact) {
    const d = impact.descendants;
    if (d.backgrounds) removed.push(`${d.backgrounds} background(s)`);
    if (d.subjects) removed.push(`${d.subjects} subject(s)`);
    if (d.chapters) removed.push(`${d.chapters} chapter(s)`);
    if (d.topics) removed.push(`${d.topics} topic(s)`);
    if (impact.questions)
      removed.push(
        impact.cqViaSubQuestions
          ? `${impact.questions} question(s), incl. ${impact.cqViaSubQuestions} CQ(s) matched through a sub-question`
          : `${impact.questions} question(s)`,
      );
    if (impact.savedQuestions) removed.push(`${impact.savedQuestions} saved question(s)`);
    if (impact.generatedExams.deleted) removed.push(`${impact.generatedExams.deleted} unfinished exam(s)`);
    if (impact.affectedUsers) removed.push(`cleared from ${impact.affectedUsers} user profile(s)`);
  }
```

Only non-zero lines are pushed, so the dialog never says "0 chapters". What you see:

```
Delete Topic
Are you sure you want to delete "Newton's Laws"? This action cannot be undone.

┌ This will also delete ─────────────────────────────┐
│ • 42 question(s), incl. 3 CQ(s) matched through a  │
│   sub-question                                     │
│ • 18 saved question(s)                             │
│ • 1 unfinished exam(s)                             │
└────────────────────────────────────────────────────┘
┌ Kept, but changed ─────────────────────────────────┐
│ • 2 unfinished exam(s) shrunk to their surviving …  │
└────────────────────────────────────────────────────┘
Results are kept: 5 submitted exam(s), 5 answer script(s)
and 3 analytics row(s) stay as they are.

                                       [ Delete ]
```

Empty impact gets a plain sentence instead of empty boxes:

```tsx
  <p className="text-muted-foreground">
    Nothing else references this {heading.toLowerCase()}.
  </p>
```

Finally, `client/src/App.tsx` now matches the server:

```tsx
  // Matches the server-side gate on every taxonomy/question write.
  <ProtectedRoute roles={["admin", "super-admin"]} element={<AdminLayout />} />
```

Before this it was `roles={["user"]}`, which would let a normal user open the admin panel and
then receive `403` on every single button — the worst of both worlds.

---

## 15. What you must do before using this

**1. Promote your own account.** The admin panel and every write route now require
`admin` or `super-admin`. Your account is almost certainly still `role: "user"`. In MongoDB
Atlas (or `mongosh`):

```js
db.users.updateOne({ phone: "<your number>" }, { $set: { role: "admin" } })
```

**2. Log out and log back in.** The server re-reads your user on every request, but the
client keeps the role from login in `Auth-context`. Without a fresh login the client still
thinks you are a `user` and will not even render `/admin`.

**3. Test on throwaway data.** The cascade is a real delete with no undo.

---

## 16. How to test everything

**Builds** (these already pass):

```bash
cd server && npx tsc --noEmit
cd client && npx tsc -b && npm run build
```

Scope eslint to the files you changed — the repo has pre-existing errors elsewhere:

```bash
cd client && npx eslint src/components/admin/all-data.tsx src/components/exam/ExamReview.tsx \
  src/pages/collection/slug-1/SingleCollectionPage.tsx src/types/types.ts src/App.tsx
```

**Manual checks**, in order, against a copy of your data:

1. **Move a topic.** Note a question's `chapterId`, then `PUT /topic/:id` with a different
   `chapterId`. Check that the question's `chapterId`, `subjectId` and `levelId` all changed,
   that the topic's own ancestors came from the new chapter (not from your body), and that a
   CQ whose sub-question used that topic got its `subQuestions[].chapterId` rewritten. Then
   filter Question Explorer by the new chapter — the question must be there, and gone from the
   old chapter.
2. **Move a chapter to another subject.** Its topics and all their questions follow.
3. **Rename only** (`{ name: "x" }`) — the response should have **no** `synced` block and no
   question should be written.
4. **Blocked move**: `PUT /background/:id` with a new `levelId` while a subject still lists it
   → `409` with `details: { subjects, chapters, topics }`.
5. **Preview accuracy.** Open the delete dialog for a topic that has questions, saved
   questions and a generated exam. Check each number by hand in the database, then press
   Cancel and confirm nothing changed.
6. **Cascade a topic.** Set up: save one of its questions to a collection, generate an exam
   over it and **submit** it, then generate a second exam and leave it untaken. Delete the
   topic and verify:
   - questions gone, including the CQ caught only through a sub-question;
   - the `SavedQuestion` row gone;
   - the untaken exam pruned (or deleted), with `totalMarks` recomputed;
   - the **submitted exam, its `Answer` and the `UserAnalytics` row untouched**.
7. **Placeholders.** Open that submitted exam's review — the deleted question shows "no longer
   available" with its original Correct/Wrong badge, the percentage still matches, no console
   error. Then delete a single question from the admin question page and open a collection
   that had it saved — the placeholder row appears and the row count matches `total`.
8. **Cascade a subject** (the deepest case). Then, once, `throw` on purpose inside the
   transaction (or kill the server mid-request) and confirm **nothing** was partially deleted.
   That is the whole point of the transaction.
9. **Delete a level** that a user's profile points at → that user's `level` is unset and they
   get the profile prompt instead of a broken page.
10. **Auth**, with `curl`:

```bash
curl -X DELETE localhost:<port>/topic/<id>              # no cookie      → 401
curl -X DELETE localhost:<port>/topic/<id> -b user.txt  # role "user"    → 403
curl -X DELETE localhost:<port>/topic/<id> -b admin.txt # role "admin"   → 200
curl localhost:<port>/topic                             # still public   → 200
```

---

## 17. Known gaps (on purpose)

- **`DELETE /question/:id` still leaves `SavedQuestion` rows and `Exam.questionIds`
  dangling.** Section 13 makes that render correctly instead of breaking, but the rows are not
  cleaned up. Wiring that one handler into the same service is a small follow-up.
- **No index** backs the new lookups on `SavedQuestion.questionId` or `Exam.questionIds`. Fine
  at your current data size; add an index if cascade deletes start feeling slow.
- **Hard delete, no undo.** If you later want an "archive" that hides a topic without
  destroying its questions, that is a different feature (a `status` field on each taxonomy
  document, respected by every read) — not a variation on this one.

---

## File list

**New**

| File | Purpose |
|---|---|
| `server/src/services/taxonomy-integrity.service.ts` | All propagation and cascade logic |
| `server/src/controllers/taxonomy-write-controller.ts` | `update` / `delete` / `impact` handlers, one implementation for five kinds |
| `server/src/middlewares/require-role.ts` | `requireRole()` and the `adminOnly` pair |

**Changed — server**

| File | Change |
|---|---|
| `controllers/{level,background,subject,chapter,topic}-controller.ts` | update/delete replaced by factory calls, `get*Impact` added, dead imports dropped |
| `routes/{level,background,subject,chapter,topic,record,question,extraction}-routes.ts` | writes gated with `...adminOnly`, `GET /:id/impact` added |
| `models/{subject,chapter,topic}-model.ts` | dead `post("deleteOne")` hooks removed |
| `services/exam.service.ts` | review rows report `unavailable` |
| `controllers/saved-question-controller.ts` | dead bookmarks become placeholders instead of vanishing |
| `validations/crud.validation.ts` | `updateBody` uses `.strip()` (not `.strict()`) so the admin form's reset-injected keys don't `400` a re-parent — see §9 |

**Changed — client**

| File | Change |
|---|---|
| `components/admin/all-data.tsx` | `DeleteRowDialog` with impact preview; `deleteData` returns a boolean |
| `components/exam/ExamReview.tsx` | placeholder card for a deleted question |
| `pages/collection/slug-1/SingleCollectionPage.tsx` | placeholder row + remove button |
| `types/types.ts` | `ExamReviewItemType` is now a discriminated union |
| `App.tsx` | `/admin` requires `admin` / `super-admin` |
