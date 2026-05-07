import { Request, Response } from "express";
import { processSubmission } from "../services/analytics.service";
import { updateUserAnalytics } from "../services/analytics.service";
import Answer from "../models/answer-model";

export const createAnswer = async (req: Request, res: Response) => {
  try {
    const { u_id, examName, answers, timeTaken } = req.body;

    if (!u_id || !examName || !answers || timeTaken === undefined) {
      console.log("Missing field in request body:");
      res.status(200).json({
        success: false,
        message: "Missinig Field",
        data: null,
      });
      return;
    }

    // 🔹 Step 1: Process answers
    const result = await processSubmission(answers);

    // 🔹 Step 2: Save Answer document
    const savedAnswer = await Answer.create({
      u_id,
      examName,
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

    // 🔹 Step 3: Update analytics
    await updateUserAnalytics(u_id, result.topicStats);

    res.status(200).json({
      success: true,
      message: "Exam submitted successfully",
      data: savedAnswer,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: null,
    });
    return;
  }
};
