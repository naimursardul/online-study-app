/*
 * Title: Question controller
 * Description: Question controller
 * Author: Naimur Rahman
 * Date: 2025-04-08
 */

import { Request, Response } from "express";
import { MCQ, CQ, BaseQuestion } from "../models/question-model";
// Aliased so it doesn't shadow TypeScript's built-in `Record<K, V>` utility type.
import RecordModel from "../models/record-model";
import { ICQ, IMCQ } from "../type/type";

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
      statement,
      subQuestions,
    } = req.body;

    // Define supported question types dynamically
    const supportedQuestionTypes = ["MCQ", "CQ"]; // Add more types here as needed in the future

    // Validate that the provided questionType is supported
    if (!supportedQuestionTypes.includes(questionType)) {
      res.status(200).json({
        success: false,
        message: `Invalid question type. Supported types are: ${supportedQuestionTypes.join(
          ", ",
        )}.`,
        data: null,
      });
      return;
    }

    // Check for missing required fields for both MCQ and CQ
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
      res.status(200).json({
        success: false,
        message:
          "Missing required fields: levelId, backgroundId, subjectId, chapterId, topicId, record, recordId, timeRequired, marks, and difficulty.",
        data: null,
      });
      return;
    }

    switch (questionType) {
      // MCQ
      case "MCQ":
        // Handle MCQ-specific validation
        if (
          !question ||
          !options ||
          options.length < 4 ||
          !correctAnswer ||
          !explanation
        ) {
          res.status(200).json({
            success: false,
            message:
              "Invalid MCQ question. Ensure 'question', 'options' (with at least 4 options), 'correctAnswer', and 'explanation' are provided.",
            data: null,
          });
          return;
        }

        // Check if the MCQ already exists
        const existingMCQ = await MCQ.findOne({ question });
        if (existingMCQ) {
          res.status(200).json({
            success: false,
            message: "This MCQ question already exists.",
            data: null,
          });
          return;
        }

        // Create a new MCQ
        const newMCQ = new MCQ(req.body);
        await newMCQ.save();
        break;

      // CQ
      case "CQ":
        // Handle CQ-specific validation
        if (!statement || !subQuestions || subQuestions.length !== 4) {
          res.status(200).json({
            success: false,
            message:
              "Invalid CQ question. Ensure 'statement' and 'subQuestions' (with at least 4 questions) are provided.",
            data: null,
          });
          return;
        }
        subQuestions.map((sq: any) => {
          if (
            !sq?.questionNo ||
            !sq?.question ||
            !sq.answer ||
            !sq?.chapterId ||
            !sq?.topicId
          ) {
            res.status(200).json({
              success: false,
              message:
                "Sub-Questions must have questionNo, question, answer, chapterId, subjectId, and topicId.",
              data: null,
            });
            return;
          }
        });

        // Check if the CQ already exists
        const existingCQ = await CQ.findOne({ statement });
        if (existingCQ) {
          res.status(200).json({
            success: false,
            message: "This CQ question already exists.",
            data: null,
          });
          return;
        }

        // Create a new CQ
        const newCQ = new CQ(req.body);
        await newCQ.save();
        break;
    }

    res.status(200).json({
      success: true,
      message: "Question created successfully.",
      data: null,
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

// GET ALL QUESTIONS
// Values arriving here have already been through `listQuestionSchema`, so the
// list-shaped params (backgroundId, chapterId, topicId, recordId, institution,
// year) are normalised arrays.
const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
      res.status(200).json({
        success: false,
        message: "Question-type, levelId must be selected.",
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
      if (questionType === "MCQ") query.question = searchRegex;
      else query["subQuestions.question"] = searchRegex;
    }

    // Both discriminators live in the same collection; typed as the base model
    // so the union of the two discriminator types doesn't break `find()`.
    const Model = (
      questionType === "MCQ" ? MCQ : CQ
    ) as unknown as typeof BaseQuestion;
    const pageSize = Number(limit) || 20;
    const pageNumber = Number(page) || 0; // 0 => not paginated

    let allQuestions;
    let pagination;
    if (pageNumber > 0) {
      const total = await Model.countDocuments(query);
      allQuestions = await Model.find(query)
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
      allQuestions = await Model.find(query);
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
    const foundQuestion = await BaseQuestion.findById(id);
    if (!foundQuestion) {
      res
        .status(200)
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
    res.status(200).json({
      success: false,
      message: "Question type must be given.",
      data: null,
    });
    return;
  }

  const qExisted = await BaseQuestion.findById(id);
  if (!qExisted) {
    res
      .status(200)
      .json({ success: false, message: "Question not found.", data: null });
    return;
  }

  if (qExisted.questionType !== questionType) {
    res.status(200).json({
      success: false,
      message: "Question type doesn't match.",
      data: null,
    });
    return;
  }

  try {
    let updatedQ;
    switch (questionType) {
      case "MCQ":
        updatedQ = await MCQ.findByIdAndUpdate(id, newData, {
          new: true,
          runValidators: true,
        });
        break;
      case "CQ":
        updatedQ = await CQ.findByIdAndUpdate(id, newData, {
          new: true,
          runValidators: true,
        });
        break;
    }

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
    console.log(qExisted);
    if (!qExisted) {
      res
        .status(200)
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

  // Split by type
  const mcqs = questions.filter((q) => q.questionType === "MCQ") as IMCQ[];
  const cqs = questions.filter((q) => q.questionType === "CQ") as ICQ[];

  let inserted = 0;
  let failed = 0;
  const errors: { index: number; message: string }[] = [];

  // -------------------------
  // Insert MCQs
  // -------------------------
  if (mcqs.length > 0) {
    try {
      const result = await MCQ.insertMany(mcqs, { ordered: false });
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
          index: e.index,
          message: e.errmsg || "MCQ insert failed.",
        });
      });
    }
  }

  // -------------------------
  // Insert CQs
  // -------------------------
  if (cqs.length > 0) {
    try {
      const result = await CQ.insertMany(cqs, { ordered: false });
      inserted += result.length;
    } catch (err: any) {
      if (err.insertedDocs) {
        inserted += err.insertedDocs.length;
      }

      const writeErrors = err.writeErrors || [];
      failed += writeErrors.length;

      writeErrors.forEach((e: any) => {
        errors.push({
          index: e.index,
          message: e.errmsg || "CQ insert failed.",
        });
      });
    }
  }

  // -------------------------
  // Response
  // -------------------------
  const allFailed = inserted === 0 && failed > 0;

  if (allFailed) {
    res.status(500).json({
      success: false,
      message: "All questions failed to upload.",
      inserted,
      failed,
      errors,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: `${inserted} uploaded, ${failed} failed.`,
    inserted,
    failed,
    errors,
  });
  return;
}

export {
  createQuestion,
  getAllQuestions,
  getSingleQuestion,
  updateSingleQuestion,
  deleteSingleQuestion,
  bulkCreateQuestions,
};
