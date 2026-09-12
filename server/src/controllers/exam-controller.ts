import { NextFunction, Request, Response } from "express";
import { processSubmission } from "../services/analytics.service";
import { updateUserAnalytics } from "../services/analytics.service";
import Answer from "../models/answer-model";
import {
  generateExam,
  getExamById,
  listUserExams,
  deleteExam,
  getPendingExamOrThrow,
  markExamSubmitted,
  sanitizeQuestion,
} from "../services/exam.service";
import { ExamCategoryType } from "../type/type";
import { MCQ } from "../models/question-model";
import Exam from "../models/exam-model";

// =========================================
// GENERATE EXAM
// =========================================
export const createExam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const u_id = String(req.user?._id);
    const {
      examName,
      subjectId,
      topicIds = [],
      difficulty,
      mode,
      size,
      filter,
    } = req.body;
    const examCategory: ExamCategoryType = req.body.examCategory;

    if (!examCategory) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: examCategory.",
        data: null,
      });
      return;
    }

    const allExams = await Exam.find({ u_id: u_id }).lean();
    const examNo =
      ((!allExams && !Array.isArray(allExams)) || allExams.length) <= 0
        ? 1
        : allExams.length + 1;

    let data;
    switch (examCategory) {
      case "personal": {
        if (!examName || !subjectId || !difficulty || !mode || !size) {
          res.status(400).json({
            success: false,
            message:
              "Missing required fields: examName, subjectId, difficulty, mode, size.",
            data: null,
          });
          return;
        }
        if (typeof size !== "number" || size < 1 || size > 100) {
          res.status(400).json({
            success: false,
            message: "Exam size must be between 1 and 100.",
            data: null,
          });
          return;
        }
        data = await generateExam({
          u_id,
          examCategory,
          examName: String(examName).trim() + `(${examNo})`,
          subjectId,
          topicIds: Array.isArray(topicIds) ? topicIds : [],
          difficulty,
          mode,
          size,
        });
        break;
      }
      case "record": {
        if (typeof filter !== "object") {
          res.status(400).json({
            success: false,
            message: "Missing required fields: filter.",
            data: null,
          });
          return;
        }
        const { levelId, institutionId, yearId } = filter;
        if (
          !examName ||
          !levelId ||
          !subjectId ||
          !institutionId ||
          !yearId
        ) {
          res.status(400).json({
            success: false,
            message:
              "Missing required fields: examname, subjectId, levelId, institutionId, yearId.",
            data: null,
          });
          return;
        }

       
        const pending = await Exam.countDocuments({
          u_id,
          status: "generated",
        });
        if (pending >= 2) {
          res.status(409).json({
            success: false,
            message:
              "You already have 2 pending exams. Finish or delete one first.",
            data: null,
          });
          return;
        }
        const examLabel = String(examName).trim() + `(${examNo})`;
        const dup = await Exam.findOne({ u_id, examName: examLabel });
        if (dup) {
          res.status(409).json({
            success: false,
            message: "An exam with this name already exists.",
            data: null,
          });
          return;
        }

        const query: any = {};
        if (typeof levelId === "string") query.levelId = levelId;
        if (typeof subjectId === "string") query.subjectId = subjectId;

        // One paper = one institution-year pair; $elemMatch finds questions
        // carrying that pair in their recordId array.
        query.recordId = {
          $elemMatch: { institutionId, yearId },
        };

        // Bound the result set — matches the personal branch's 100-question
        // ceiling instead of storing every matching id in one document.
        const recordQuestions = await MCQ.find({ ...query }).limit(100);
        if (
          !Array.isArray(recordQuestions) ||
          (Array.isArray(recordQuestions) && recordQuestions.length <= 0)
        ) {
          res.status(404).json({
            success: false,
            message: "No Questions found!",
            data: null,
          });
          return;
        }
        const exam = await Exam.create({
          u_id,
          examName: String(examName).trim() + `(${examNo})`,
          subjectId,
          questionIds: recordQuestions.map((q) => q._id),
          totalMarks: recordQuestions.reduce((acc, cur) => {
            return acc + Number(cur?.marks);
          }, 0),
          totalTime: recordQuestions.reduce((acc, cur) => {
            return acc + Number(cur?.timeRequired);
          }, 0),
          status: "generated",
        });

        data = { exam, questions: recordQuestions?.map(sanitizeQuestion) };

        break;
      }
    }

    res.status(201).json({
      success: true,
      message: "Exam generated successfully.",
      data,
    });
    return;
  } catch (error) {
    // Sentinels from the service (pending cap, duplicate name, no questions)
    // arrive as AppError with their status; the central handler maps them.
    next(error);
  }
};

// =========================================
// LIST EXAMS
// =========================================
export const listExams = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const u_id = String(req.user?._id);
    const data = await listUserExams(u_id);
    res.status(200).json({
      success: true,
      message: "Exams retrieved successfully.",
      data,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// =========================================
// GET SINGLE EXAM (take or review)
// =========================================
export const getExam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const u_id = String(req.user?._id);
    const { examId } = req.params;
    const data = await getExamById(u_id, String(examId));
    res.status(200).json({
      success: true,
      message: "Exam retrieved successfully.",
      data,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// =========================================
// DELETE EXAM (un-submitted only)
// =========================================
export const removeExam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const u_id = String(req.user?._id);
    const { examId } = req.params;
    await deleteExam(u_id, String(examId));
    res.status(200).json({
      success: true,
      message: "Exam deleted successfully.",
      data: null,
    });
    return;
  } catch (error) {
    // "Exam not found." (404), "Not authorized." (403), "Submitted exams
    // cannot be deleted." (409) — sentinels from the service.
    next(error);
  }
};

// =========================================
// SUBMIT EXAM (grade + save answer + close exam)
// =========================================
export const createAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const u_id = String(req.user?._id);
    const { examId, answers, timeTaken } = req.body;

    if (!examId || !answers || timeTaken === undefined) {
      res.status(400).json({
        success: false,
        message: "Missing field: examId, answers, timeTaken.",
        data: null,
      });
      return;
    }

    // 🔹 Step 0: Validate exam ownership + pending status
    const exam = await getPendingExamOrThrow(u_id, examId);

    // 🔹 Step 1: Process answers
    const result = await processSubmission(answers);

    // 🔹 Step 2: Save Answer document
    const savedAnswer = await Answer.create({
      u_id,
      subjectId: exam.subjectId,
      examName: exam.examName,
      answerScript: result.enrichedAnswers,

      totalMarks: result.totalMarks,
      obtainedMarks: result.obtainedMarks,
      percentage: result.percentage,

      totalQuestions: result.totalQuestions,
      correctCount: result.correctCount,
      wrongCount: result.wrongCount,

      timeTaken,
      examDate: new Date(),
    });

    // 🔹 Step 3: Close exam (status + compact result)
    await markExamSubmitted(examId, savedAnswer._id, {
      obtainedMarks: result.obtainedMarks,
      percentage: result.percentage,
      correctCount: result.correctCount,
      wrongCount: result.wrongCount,
      totalQuestions: result.totalQuestions,
      timeTaken,
      examDate: savedAnswer.examDate,
    });

    // 🔹 Step 4: Update analytics
    await updateUserAnalytics(u_id, result.topicStats);

    res.status(201).json({
      success: true,
      message: "Exam submitted successfully",
      data: { examId, answer: savedAnswer },
    });
    return;
  } catch (error) {
    // The one that matters most: a failed grade-and-save used to answer 200
    // as if the submission had succeeded. AppErrors from the service keep
    // their status; anything else becomes a 500 with a generic message.
    next(error);
  }
};
