/*
 * Title: Question controller
 * Description: Question controller
 * Author: Naimur Rahman
 * Date: 2025-04-08
 */

import { Request, Response, NextFunction } from "express";
import { BaseQuestion, questionModels } from "../models/question-model";
import LevelModel from "../models/level-model";
import SubjectModel from "../models/subject-model";
import { redisClient } from "../config/redis";
// Aliased so it doesn't shadow TypeScript's built-in `Record<K, V>` utility type.
import RecordModel from "../models/record-model";
import {
  QUESTION_TYPE_CODES,
  QuestionTypeCode,
  familyOf,
  isQuestionTypeCode,
  primaryTextFieldOf,
  searchTextFieldOf,
  subQuestionCountOf,
} from "../utils/question-types";

// CREATE QUESTION
async function createQuestion(req: Request, res: Response) {
  try {
    const {
      questionType,
      backgroundId,
      levelId,
      subjectId,
      chapterId,
      topicId,
      record,
      recordId,
      timeRequired,
      marks,
      difficulty,
      question,
      options,
      correctAnswer,
      explanation,
      answer,
      statement,
      subQuestions,
    } = req.body;

    // Supported types come from the registry, so a new type needs no change here.
    if (!isQuestionTypeCode(questionType)) {
      res.status(400).json({
        success: false,
        message: `Invalid question type. Supported types are: ${QUESTION_TYPE_CODES.join(
          ", ",
        )}.`,
        data: null,
      });
      return;
    }

    // Check for the fields every question type shares
    if (
      !levelId ||
      !Array.isArray(backgroundId) ||
      backgroundId.length <= 0 ||
      !subjectId ||
      !chapterId ||
      !topicId ||
      !Array.isArray(record) ||
      record.length <= 0 ||
      !Array.isArray(recordId) ||
      recordId.length <= 0 ||
      !timeRequired ||
      !marks ||
      !difficulty
    ) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: levelId, backgroundId, subjectId, chapterId, topicId, record, recordId, timeRequired, marks, and difficulty.",
        data: null,
      });
      return;
    }

    // Shape validation per family (mcq / cq / simple — see utils/question-types.ts)
    const family = familyOf(questionType);

    if (family === "mcq") {
      if (
        !question ||
        !options ||
        options.length < 4 ||
        !correctAnswer ||
        !explanation
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid MCQ question. Ensure 'question', 'options' (with at least 4 options), 'correctAnswer', and 'explanation' are provided.",
          data: null,
        });
        return;
      }
    }

    if (family === "cq") {
      const expectedSubQuestions = subQuestionCountOf(questionType);
      if (
        !statement ||
        !Array.isArray(subQuestions) ||
        subQuestions.length !== expectedSubQuestions
      ) {
        res.status(400).json({
          success: false,
          message: `Invalid ${questionType} question. Ensure 'statement' and exactly ${expectedSubQuestions} 'subQuestions' are provided.`,
          data: null,
        });
        return;
      }

      const invalidSubQuestion = subQuestions.some(
        (sq: any) =>
          !sq?.questionNo ||
          !sq?.question ||
          !sq?.answer ||
          !sq?.chapterId ||
          !sq?.topicId,
      );
      if (invalidSubQuestion) {
        res.status(400).json({
          success: false,
          message:
            "Sub-Questions must have questionNo, question, answer, chapterId, and topicId.",
          data: null,
        });
        return;
      }
    }

    if (family === "simple") {
      if (!question || !answer) {
        res.status(400).json({
          success: false,
          message: `Invalid ${questionType} question. Ensure 'question' and 'answer' are provided.`,
          data: null,
        });
        return;
      }
    }

    // Reject duplicates on the family's identifying text field
    const Model = questionModels[questionType];
    const dedupeField = primaryTextFieldOf(questionType);
    const existingQuestion = await Model.findOne({
      [dedupeField]: req.body[dedupeField],
    });
    if (existingQuestion) {
      res.status(409).json({
        success: false,
        message: `This ${questionType} question already exists.`,
        data: null,
      });
      return;
    }

    const newQuestion = await new Model(req.body).save();

    // 201 + the new _id: bulk create and the extraction flow both need to know
    // what was actually created.
    res.status(201).json({
      success: true,
      message: "Question created successfully.",
      data: newQuestion,
    });
    return;
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Failed to create the question.",
      data: null,
    });
    return;
  }
}

// GET QUESTION FACETS
// Which (level, subject, type, institution, year) combinations actually have
// questions — the sitemap generator's data source. Public, cached ~1h in
// Redis: the collection-wide $group is not served by any index, and the cache
// is what keeps it cheap. Computed directly when Redis is down (fail-open,
// matching the generalLimiter policy).
const FACETS_CACHE_KEY = "question-facets:v1";
const FACETS_CACHE_TTL_S = 3600;

interface FacetRow {
  level: string;
  subject: string;
  questionType: string;
  institution: string;
  year: string;
  recordType: string;
  count: number;
  lastmod: string;
}

async function computeFacets(): Promise<FacetRow[]> {
  // levelId/subjectId are plain strings and recordId is [String] on the
  // documents — no refs — so this is string grouping, then name resolution
  // via lean lookups into Maps.
  const grouped = await BaseQuestion.aggregate<{
    _id: {
      levelId: string;
      subjectId: string;
      questionType: string;
      recordId: string;
    };
    count: number;
    lastmod: Date;
  }>([
    { $unwind: "$recordId" },
    {
      $group: {
        _id: {
          levelId: "$levelId",
          subjectId: "$subjectId",
          questionType: "$questionType",
          recordId: "$recordId",
        },
        count: { $sum: 1 },
        lastmod: { $max: "$updatedAt" },
      },
    },
  ]);

  // lean() returns plain objects; only these fields are read below.
  const [levels, subjects, records]: readonly unknown[][] = await Promise.all([
    LevelModel.find().lean(),
    SubjectModel.find().lean(),
    RecordModel.find().lean(),
  ]);
  const levelNames = new Map(
    (levels as { _id: unknown; name: string }[]).map((l) => [
      String(l._id),
      l.name,
    ]),
  );
  const subjectNames = new Map(
    (subjects as { _id: unknown; name: string }[]).map((s) => [
      String(s._id),
      s.name,
    ]),
  );
  const recordById = new Map(
    (
      records as {
        _id: unknown;
        institution: string;
        year: string;
        recordType: string;
      }[]
    ).map((r) => [
      String(r._id),
      { institution: r.institution, year: r.year, recordType: r.recordType },
    ]),
  );

  const rows: FacetRow[] = [];
  for (const g of grouped) {
    const level = levelNames.get(g._id.levelId);
    const subject = subjectNames.get(g._id.subjectId);
    const record = recordById.get(g._id.recordId);
    if (!level || !subject || !record) continue; // unresolvable names — skip

    // The slug grammar is positional on "_", so a name containing "_" or "/"
    // would corrupt every URL built from it. Drop those rows rather than
    // emit broken URLs.
    if (
      [level, subject, record.institution, record.year].some(
        (v) => v.includes("_") || v.includes("/"),
      )
    ) {
      continue;
    }

    rows.push({
      level,
      subject,
      questionType: g._id.questionType,
      institution: record.institution,
      year: record.year,
      recordType: record.recordType,
      count: g.count,
      lastmod: g.lastmod.toISOString(),
    });
  }
  return rows;
}

const getQuestionFacets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Fail-open on Redis errors: a cache miss must not fail the endpoint.
    try {
      const cached = await redisClient.get(FACETS_CACHE_KEY);
      if (cached) {
        res.status(200).json({ success: true, data: JSON.parse(cached) });
        return;
      }
    } catch {
      // fall through to a direct computation
    }

    const rows = await computeFacets();

    try {
      await redisClient.set(FACETS_CACHE_KEY, JSON.stringify(rows), {
        EX: FACETS_CACHE_TTL_S,
      });
    } catch {
      // Cache write failures are not the client's problem.
    }

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// GET ALL QUESTIONS
// Values arriving here have already been through `listQuestionSchema`, so the
// list-shaped params (backgroundId, chapterId, topicId, recordId, institution,
// year) are normalised arrays.
const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A5.5: answer fields are projected out at the query, so they never leave
// Mongo for anonymous callers. All three families are covered — mcq
// (correctAnswer, explanation), simple (answer), cq (subQuestions.answer) —
// and the projection is pure exclusion, so it is safe on every discriminator.
const ANON_ANSWER_PROJECTION = {
  correctAnswer: 0,
  explanation: 0,
  answer: 0,
  "subQuestions.answer": 0,
};

const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const {
      questionType,
      levelId,
      backgroundId,
      subjectId,
      chapterId,
      topicId,
      recordId,
      institution,
      year,
      difficulty,
      search,
      page,
      limit,
    } = req.query as Record<string, any>;
    if (typeof questionType !== "string" || typeof levelId !== "string") {
      res.status(400).json({
        success: false,
        message: "Question-type, levelId must be selected.",
        data: null,
      });
      return;
    }
    if (!isQuestionTypeCode(questionType)) {
      res.status(400).json({
        success: false,
        message: `Invalid question type. Supported types are: ${QUESTION_TYPE_CODES.join(
          ", ",
        )}.`,
        data: null,
      });
      return;
    }

    const toArray = (value: unknown): string[] =>
      value === undefined || value === null
        ? []
        : Array.isArray(value)
          ? value.map(String)
          : [String(value)];

    const backgroundIds = toArray(backgroundId);
    const chapterIds = toArray(chapterId);
    const topicIds = toArray(topicId);
    const recordIdArray = toArray(recordId);
    const institutions = toArray(institution);
    const years = toArray(year);

    const query: Record<string, any> = { questionType, levelId };
    // backgroundId/recordId are arrays on the document; $in matches a document
    // whose array contains any of the listed values.
    if (backgroundIds.length > 0) query.backgroundId = { $in: backgroundIds };
    if (typeof subjectId === "string") query.subjectId = subjectId;
    if (chapterIds.length > 0) query.chapterId = { $in: chapterIds };
    if (topicIds.length > 0) query.topicId = { $in: topicIds };
    if (typeof difficulty === "string") query.difficulty = difficulty;

    // institution/year are stored on Record, not on the question, so resolve
    // them to recordIds first. An empty resolution correctly yields no results.
    if (institutions.length > 0 || years.length > 0) {
      const recordFilter: Record<string, any> = {};
      if (institutions.length > 0)
        recordFilter.institution = { $in: institutions };
      if (years.length > 0) recordFilter.year = { $in: years };

      const matchedRecords = await RecordModel.find(recordFilter)
        .select("_id")
        .lean();
      let resolvedIds = matchedRecords.map((record) => String(record._id));
      // An explicit recordId narrows the resolution rather than widening it.
      if (recordIdArray.length > 0)
        resolvedIds = resolvedIds.filter((id) => recordIdArray.includes(id));

      query.recordId = { $in: resolvedIds };
    } else if (recordIdArray.length > 0) {
      query.recordId = { $in: recordIdArray };
    }

    if (typeof search === "string") {
      const searchRegex = { $regex: escapeRegex(search), $options: "i" };
      // The CQ family keeps its text on sub-questions; everything else on `question`.
      query[searchTextFieldOf(questionType)] = searchRegex;
    }

    // Every discriminator lives in the same collection; typed as the base model
    // so the union of discriminator types doesn't break `find()`.
    const Model = questionModels[
      questionType
    ] as unknown as typeof BaseQuestion;
    const MAX_LIMIT = questionType === "MCQ" ? 100 : 20; // MCQs are smaller, so allow more per page
    const requestedPageSize = Number(limit) || 20;
    const pageSize = Math.min(requestedPageSize, MAX_LIMIT);
    const pageNumber = Number(page) || 0; // 0 => not paginated

    let allQuestions;
    let pagination;
    // optionalAuth is mounted on this route: req.user is set only with a
    // valid session. Anonymous callers get the question without the answers.
    const projection = req.user ? undefined : ANON_ANSWER_PROJECTION;
    if (pageNumber > 0) {
      const total = await Model.countDocuments(query);
      allQuestions = await Model.find(query, projection)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);
      pagination = {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      };
    } else {
      allQuestions = await Model.find(query, projection);
    }

    res.status(200).json({
      success: true,
      message: "Questions retrieved successfully.",
      data: allQuestions,
      ...(pagination && { pagination }),
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "There is a problem on the server side.",
      data: null,
    });
    return;
  }
};

// GET SINGLE QUESTION
const getSingleQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Same optionalAuth projection as the list read — the single read is the
    // other half of the same bypass (looking an answer up by questionId).
    const foundQuestion = await BaseQuestion.findById(
      id,
      req.user ? undefined : ANON_ANSWER_PROJECTION,
    );
    if (!foundQuestion) {
      res
        .status(404)
        .json({ success: false, message: "Question not found.", data: null });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Question retrieved.",
      data: foundQuestion,
    });
    return;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", data: null });
    return;
  }
};

// UPDATE SINGLE QUESTION
const updateSingleQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { questionType, ...newData } = req.body;

  if (!questionType) {
    res.status(400).json({
      success: false,
      message: "Question type must be given.",
      data: null,
    });
    return;
  }

  const qExisted = await BaseQuestion.findById(id);
  if (!qExisted) {
    res
      .status(404)
      .json({ success: false, message: "Question not found.", data: null });
    return;
  }

  if (qExisted.questionType !== questionType) {
    res.status(409).json({
      success: false,
      message: "Question type doesn't match.",
      data: null,
    });
    return;
  }

  if (!isQuestionTypeCode(questionType)) {
    res.status(400).json({
      success: false,
      message: `Invalid question type. Supported types are: ${QUESTION_TYPE_CODES.join(
        ", ",
      )}.`,
      data: null,
    });
    return;
  }

  try {
    const updatedQ = await questionModels[questionType].findByIdAndUpdate(
      id,
      newData,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      data: updatedQ,
    });
    return;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", data: null });
    return;
  }
};

// DELETE SINGLE QUESTION
const deleteSingleQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const qExisted = await BaseQuestion.findById(id);
    if (!qExisted) {
      res
        .status(404)
        .json({ success: false, message: "Question not found.", data: null });
      return;
    }
    await BaseQuestion.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Question successfully deleted.",
      data: null,
    });
    return;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", data: null });
    return;
  }
};

// =========================================
// CREATE BULK QUESTION
// =========================================
async function bulkCreateQuestions(req: Request, res: Response) {
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    res.status(400).json({
      success: false,
      message: "No questions provided.",
    });
    return;
  }

  // Group by type so each discriminator gets its own insertMany. Original
  // request indexes are carried along so error reporting points at the right
  // question rather than at a position within the per-type batch.
  const grouped = new Map<QuestionTypeCode, { doc: any; index: number }[]>();

  let inserted = 0;
  let failed = 0;
  const errors: { index: number; message: string }[] = [];

  questions.forEach((doc: any, index: number) => {
    const questionType = doc?.questionType;
    if (!isQuestionTypeCode(questionType)) {
      failed += 1;
      errors.push({
        index,
        message: `Unsupported question type: ${questionType}.`,
      });
      return;
    }
    const group = grouped.get(questionType) ?? [];
    group.push({ doc, index });
    grouped.set(questionType, group);
  });

  // -------------------------
  // Insert per type
  // -------------------------
  for (const [questionType, group] of grouped) {
    try {
      const result = await questionModels[questionType].insertMany(
        group.map((entry) => entry.doc),
        { ordered: false },
      );
      inserted += result.length;
    } catch (err: any) {
      // ordered: false means valid docs still insert even if some fail
      if (err.insertedDocs) {
        inserted += err.insertedDocs.length;
      }

      const writeErrors = err.writeErrors || [];
      failed += writeErrors.length;

      writeErrors.forEach((e: any) => {
        errors.push({
          index: group[e.index]?.index ?? e.index,
          // Never the raw driver string (index names, collection names):
          // map the failure to what the caller can act on.
          message:
            e.err?.code === 11000 || /duplicate key/i.test(e.errmsg ?? "")
              ? "Duplicate question (this question already exists)."
              : /validation/i.test(e.errmsg ?? "")
                ? "Question failed validation. Check the required fields."
                : `${questionType} insert failed.`,
        });
      });
    }
  }

  // -------------------------
  // Response
  // -------------------------

  const allFailed = inserted === 0 && failed > 0;

  if (allFailed) {
    // Every failure was caller data, not a server fault: 400, not 500.
    res.status(400).json({
      success: false,
      message: "All questions failed to upload.",
      data: { inserted, failed, errors },
    });
    return;
  }

  // Partial success (some inserted, some failed) — 207 is the multi-status
  // the situation actually describes.
  res.status(failed > 0 ? 207 : 200).json({
    success: true,
    message: `${inserted} uploaded, ${failed} failed.`,
    data: { inserted, failed, errors },
  });
  return;
}

export {
  createQuestion,
  getAllQuestions,
  getQuestionFacets,
  getSingleQuestion,
  updateSingleQuestion,
  deleteSingleQuestion,
  bulkCreateQuestions,
};
