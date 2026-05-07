/*
 * Title: Answer Processor
 * Description: Get Analytical datas from Answers
 * Author: Naimur Rahman
 * Date: 2026-05-04
 *
 */

import { Types } from "mongoose";
import { MCQ } from "../models/question-model";
import UserAnalytics from "../models/user-analytics-model";

interface IUserAnswerInput {
  questionId: string;
  givenAns?: string;
}

export const processSubmission = async (answers: IUserAnswerInput[]) => {
  try {
    // 1. Convert IDs
    const questionIds = answers.map((a) => new Types.ObjectId(a.questionId));

    // 2. Fetch questions
    const questions = await MCQ.find({
      _id: { $in: questionIds },
    }).lean();

    // 3. Build lookup map
    const questionMap: Record<string, any> = {};
    questions.forEach((q) => {
      questionMap[q._id.toString()] = q;
    });

    // 4. Prepare outputs
    const topicMap: Record<string, any> = {};
    const enrichedAnswers: any[] = [];

    let correctCount = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;

    // 5. Process answers
    answers.forEach((ans) => {
      console.log("Processing answer for questionId:", ans.questionId);
      const q = questionMap[ans.questionId];
      if (!q) return;

      const isCorrect = ans?.givenAns === q.correctAnswer;

      // 🔥 Marks calculation
      totalMarks += q.marks;

      if (isCorrect) {
        correctCount++;
        obtainedMarks += q.marks;
      }

      // Save enriched answer
      enrichedAnswers.push({
        questionId: q._id,
        givenAns: ans.givenAns,
        isCorrect,
      });

      const topicId = q.topicId;

      // Initialize topic
      if (!topicMap[topicId]) {
        topicMap[topicId] = {
          topicId: q.topicId,
          topicName: q.topic,

          subjectId: q.subjectId,
          subjectName: q.subject,

          chapterId: q.chapterId,
          chapterName: q.chapter,

          correct: 0,
          total: 0,
        };
      }

      // Update topic stats
      topicMap[topicId].total += 1;
      if (isCorrect) {
        topicMap[topicId].correct += 1;
      }
    });

    // 6. Final calculations
    const topicStats = Object.values(topicMap);

    const totalQuestions = answers.length;
    const wrongCount = totalQuestions - correctCount;

    const percentage =
      totalMarks === 0 ? 0 : (obtainedMarks / totalMarks) * 100;

    return {
      enrichedAnswers,
      topicStats,

      correctCount,
      wrongCount,
      totalQuestions,

      totalMarks,
      obtainedMarks,
      percentage,
    };
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

export const updateUserAnalytics = async (u_id: string, topicStats: any[]) => {
  try {
    // 🔹 Step 0: Ensure document exists (from Step-2)
    await UserAnalytics.updateOne(
      { u_id },
      {
        $setOnInsert: {
          u_id,
          topicStats: [],
        },
      },
      { upsert: true }
    );

    // -----------------------------
    // 🔥 Phase 1: Update existing topics
    // -----------------------------
    const updateOps = topicStats.map((t) => ({
      updateOne: {
        filter: {
          u_id,
          "topicStats.topicId": t.topicId,
        },
        update: {
          $inc: {
            "topicStats.$.correct": t.correct,
            "topicStats.$.total": t.total,
          },
        },
      },
    }));

    const updateResult = await UserAnalytics.bulkWrite(updateOps);

    // -----------------------------
    // 🔥 Phase 2: Insert missing topics
    // -----------------------------
    // We re-run inserts safely (duplicates avoided by filter)
    const insertOps = topicStats.map((t) => ({
      updateOne: {
        filter: {
          u_id,
          "topicStats.topicId": { $ne: t.topicId },
        },
        update: {
          $push: {
            topicStats: {
              topicId: t.topicId,
              topicName: t.topicName,

              subjectId: t.subjectId,
              subjectName: t.subjectName,

              chapterId: t.chapterId,
              chapterName: t.chapterName,

              correct: t.correct,
              total: t.total,
            },
          },
        },
      },
    }));

    await UserAnalytics.bulkWrite(insertOps);
  } catch (error) {
    throw new Error("Failed to update user analytics: " + error);
  }
};
