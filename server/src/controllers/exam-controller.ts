import { Request, Response } from "express";
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
export const createExam = async (req: Request, res: Response) => {
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
      res.status(200).json({
        success: false,
        message: "Missing required fields: examCategory.",
        data: null,
      });
      return;
    }

    let data;
    switch (examCategory) {
      case "personal": {
        if (!examName || !subjectId || !difficulty || !mode || !size) {
          res.status(200).json({
            success: false,
            message:
              "Missing required fields: examName, subjectId, difficulty, mode, size.",
            data: null,
          });
          return;
        }
        if (typeof size !== "number" || size < 1 || size > 100) {
          res.status(200).json({
            success: false,
            message: "Exam size must be between 1 and 100.",
            data: null,
          });
          return;
        }
        data = await generateExam({
          u_id,
          examCategory,
          examName: String(examName).trim(),
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
          res.status(200).json({
            success: false,
            message: "Missing required fields: filter.",
            data: null,
          });
          return;
        }
        const { levelId, recordId } = filter;
        if (!examName || !levelId || !subjectId || !recordId) {
          res.status(200).json({
            success: false,
            message:
              "Missing required fields: examname, subjectId, levelId, recordId.",
            data: null,
          });
          return;
        }
        const query: any = {};
        if (typeof levelId === "string") query.levelId = levelId;
        if (typeof subjectId === "string") query.subjectId = subjectId;
        const recordIdArray = recordId
          ? Array.isArray(recordId)
            ? recordId
            : [recordId]
          : [];

        if (recordIdArray.length > 0) query.recordId = { $in: recordIdArray };

        const recordQuestions = await MCQ.find({ ...query });
        if (
          !Array.isArray(recordQuestions) ||
          (Array.isArray(recordQuestions) && recordQuestions.length <= 0)
        ) {
          res.status(200).json({
            success: false,
            message: "No Questions found!",
            data: null,
          });
          return;
        }
        const exam = await Exam.create({
          u_id,
          examName,
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

    res.status(200).json({
      success: true,
      message: "Exam generated successfully.",
      data,
    });
    return;
  } catch (error: any) {
    console.error("createExam Error:", error.message);
    res.status(200).json({
      success: false,
      message: error.message || "Failed to generate exam.",
      data: null,
    });
    return;
  }
};

// =========================================
// LIST EXAMS
// =========================================
export const listExams = async (req: Request, res: Response) => {
  try {
    const u_id = String(req.user?._id);
    const data = await listUserExams(u_id);
    res.status(200).json({
      success: true,
      message: "Exams retrieved successfully.",
      data,
    });
    return;
  } catch (error: any) {
    console.error("listExams Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: error.message, data: null });
    return;
  }
};

// =========================================
// GET SINGLE EXAM (take or review)
// =========================================
export const getExam = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error("getExam Error:", error.message);
    res
      .status(200)
      .json({ success: false, message: error.message, data: null });
    return;
  }
};

// =========================================
// DELETE EXAM (un-submitted only)
// =========================================
export const removeExam = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error("removeExam Error:", error.message);
    res
      .status(200)
      .json({ success: false, message: error.message, data: null });
    return;
  }
};

// =========================================
// SUBMIT EXAM (grade + save answer + close exam)
// =========================================
export const createAnswer = async (req: Request, res: Response) => {
  try {
    const u_id = String(req.user?._id);
    const { examId, answers, timeTaken } = req.body;

    if (!examId || !answers || timeTaken === undefined) {
      res.status(200).json({
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

    res.status(200).json({
      success: true,
      message: "Exam submitted successfully",
      data: { examId, answer: savedAnswer },
    });
    return;
  } catch (error: any) {
    console.error("createAnswer Error:", error.message);
    res.status(200).json({
      success: false,
      message: error.message || "Something went wrong",
      data: null,
    });
    return;
  }
};
