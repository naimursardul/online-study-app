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
import Answer from "../models/answer-model";

interface IUserAnswerInput {
  questionId: string;
  givenAns: string;
}

// --------------------------------
// PROCESS SUBMISSION
// --------------------------------

export const processSubmission = async (answers: IUserAnswerInput[]) => {
  try {
    // --------------------------------
    // 1. Validate input
    // --------------------------------
    if (!answers?.length) {
      throw new Error("No answers submitted");
    }

    // --------------------------------
    // 2. Convert IDs
    // --------------------------------
    const questionIds = answers.map((a) => new Types.ObjectId(a.questionId));

    // --------------------------------
    // 3. Fetch questions
    // --------------------------------
    const questions = await MCQ.find({
      _id: { $in: questionIds },
    }).lean();

    if (!questions.length) {
      throw new Error("Questions not found");
    }

    // --------------------------------
    // 4. Build lookup map
    // --------------------------------
    const questionMap: Record<string, any> = {};

    questions.forEach((q) => {
      questionMap[q._id.toString()] = q;
    });

    // --------------------------------
    // 5. Prepare outputs
    // --------------------------------
    const topicMap: Record<string, any> = {};
    const enrichedAnswers: any[] = [];

    let correctCount = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;

    // --------------------------------
    // 6. Process answers
    // --------------------------------
    answers.forEach((ans) => {
      const q = questionMap[ans.questionId];

      if (!q) return;

      const isCorrect = ans.givenAns === q.correctAnswer;

      // -------------------------
      // Marks
      // -------------------------
      totalMarks += q.marks;

      if (isCorrect) {
        correctCount++;
        obtainedMarks += q.marks;
      }

      // -------------------------
      // Answer Script
      // -------------------------
      enrichedAnswers.push({
        questionId: q._id,
        givenAns: ans.givenAns,
        isCorrect,
      });

      // =========================
      // Topic Analytics
      // =========================
      const topicId = q.topicId;

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

      topicMap[topicId].total += 1;

      if (isCorrect) {
        topicMap[topicId].correct += 1;
      }
    });

    // --------------------------------
    // 7. Final calculations
    // --------------------------------
    const topicStats = Object.values(topicMap);
    const totalQuestions = answers.length;
    const wrongCount = totalQuestions - correctCount;
    const percentage =
      totalMarks === 0 ? 0 : ((obtainedMarks / totalMarks) * 100).toFixed(2);

    // --------------------------------
    // 8. Return result
    // --------------------------------
    return {
      enrichedAnswers,
      topicStats,

      totalMarks,
      obtainedMarks,
      percentage: Number(percentage),

      totalQuestions,
      correctCount,
      wrongCount,
    };
  } catch (error: any) {
    console.error("processSubmission Error:", error.message);
    throw new Error(error.message || "Failed to process submission");
  }
};

// --------------------------------
// USER ANALYTICS UPDATE
// --------------------------------

export const updateUserAnalytics = async (u_id: string, topicStats: any[]) => {
  try {
    // --------------------------------
    // 1. Ensure analytics doc exists
    // --------------------------------
    await UserAnalytics.updateOne(
      { u_id },
      {
        $setOnInsert: {
          u_id,
          topicStats: [],
        },
      },
      { upsert: true },
    );

    // --------------------------------
    // 2. Get existing analytics
    // --------------------------------
    const analytics = await UserAnalytics.findOne(
      { u_id },
      { topicStats: 1 },
    ).lean();

    const existingTopicIds = new Set(
      analytics?.topicStats?.map((t: any) => t.topicId) || [],
    );

    const bulkOperations: any[] = [];

    // =================================
    // 3. Topic Analytics Update
    // =================================
    topicStats.forEach((topic) => {
      if (existingTopicIds.has(topic.topicId)) {
        // Update existing topic
        bulkOperations.push({
          updateOne: {
            filter: {
              u_id,
              "topicStats.topicId": topic.topicId,
            },
            update: {
              $inc: {
                "topicStats.$.correct": topic.correct,
                "topicStats.$.total": topic.total,
              },
            },
          },
        });
      } else {
        // Add new topic
        bulkOperations.push({
          updateOne: {
            filter: { u_id },
            update: {
              $push: {
                topicStats: topic,
              },
            },
          },
        });
      }
    });

    // --------------------------------
    // 4. Execute bulk update
    // --------------------------------
    if (bulkOperations.length > 0) {
      await UserAnalytics.bulkWrite(bulkOperations);
    }

    return {
      success: true,
      message: "User analytics updated successfully",
    };
  } catch (error: any) {
    console.error("updateUserAnalytics Error:", error.message);
    throw new Error(error.message || "Failed to update analytics");
  }
};

// --------------------------------
// GET WEAK TOPICS
// --------------------------------
export const getWeakTopics = async (
  u_id: string,
  limit: number = 5,
  subjectId?: string, // 👈 new
) => {
  try {
    const analytics = await UserAnalytics.findOne(
      { u_id },
      { topicStats: 1 },
    ).lean();

    if (!analytics) {
      throw new Error("Analytics not found");
    }

    const weakTopics = analytics.topicStats
      .map((topic: any) => ({
        topicId: topic.topicId,
        topicName: topic.topicName,
        subjectId: topic.subjectId,
        subjectName: topic.subjectName,
        chapterId: topic.chapterId,
        chapterName: topic.chapterName,
        correct: topic.correct,
        total: topic.total,
        accuracy:
          topic.total === 0
            ? 0
            : Number(((topic.correct / topic.total) * 100).toFixed(2)),
      }))
      .filter((topic: any) => topic.total >= 3)
      .filter(
        (topic: any) =>
          subjectId ? String(topic.subjectId) === subjectId : true, // 👈 new
      )
      .sort((a: any, b: any) => a.accuracy - b.accuracy)
      .slice(0, limit);

    return weakTopics;
  } catch (error: any) {
    console.error("getWeakTopics Error:", error.message);
    throw new Error(error.message || "Failed to get weak topics");
  }
};

// ==========================
// Overall Dashboard Stats
// ==========================
export const getDashboardStats = async (u_id: string, subjectId?: string) => {
  try {
    console.log(subjectId);
    const analytics = await UserAnalytics.findOne({ u_id }).lean();

    if (!analytics) {
      throw new Error("Analytics not found");
    }

    let topicStats = analytics.topicStats || [];

    if (subjectId) {
      topicStats = topicStats.filter(
        (topic: any) => String(topic.subjectId) === subjectId,
      );
    }

    let totalCorrect = 0;
    let totalQuestions = 0;

    topicStats.forEach((topic: any) => {
      totalCorrect += topic.correct;
      totalQuestions += topic.total;
    });

    const overallAccuracy =
      totalQuestions === 0
        ? 0
        : Number(((totalCorrect / totalQuestions) * 100).toFixed(2));

    return {
      overallAccuracy,

      totalAttempts: totalQuestions,
      correctAttempts: totalCorrect,
      wrongAttempts: totalQuestions - totalCorrect,
    };
  } catch (error: any) {
    console.error("getDashboardStats Error:", error.message);
    throw new Error(error.message || "Failed to get dashboard stats");
  }
};

// ==========================
//  Subject Performance
// ==========================
export const getSubjectPerformance = async (u_id: string) => {
  try {
    const analytics = await UserAnalytics.findOne({ u_id }).lean();

    if (!analytics) {
      throw new Error("Analytics not found");
    }

    const topicStats = analytics.topicStats || [];

    const subjectMap: Record<
      string,
      { subjectId: string; correct: number; total: number }
    > = {};

    topicStats.forEach((topic: any) => {
      if (!subjectMap[topic.subjectName]) {
        subjectMap[topic.subjectName] = {
          subjectId: topic.subjectId,
          correct: 0,
          total: 0,
        };
      }

      subjectMap[topic.subjectName].correct += topic.correct;
      subjectMap[topic.subjectName].total += topic.total;
    });

    const subjects = Object.entries(subjectMap).map(([name, stats]) => ({
      subjectId: stats.subjectId,
      name,
      accuracy:
        stats.total === 0
          ? 0
          : Number(((stats.correct / stats.total) * 100).toFixed(2)),
      correctAttempts: stats.correct,
      totalAttempts: stats.total,
    }));

    return { subjects };
  } catch (error: any) {
    console.error("getSubjectPerformance Error:", error.message);
    throw new Error(error.message || "Failed to get subject performance");
  }
};

// =========================================
// Get PERFORMANCE GRAPH
// =========================================

// service
export const getPerformanceGraph = async (
  u_id: string,
  limit: number = 20,
  subjectId?: string,
) => {
  try {
    const query: Record<string, any> = { u_id };

    if (subjectId) {
      query.subjectId = subjectId;
    }

    const answers = await Answer.find(query, {
      examName: 1,
      percentage: 1,
      obtainedMarks: 1,
      totalMarks: 1,
      examDate: 1,
      subject: 1,
    })
      .sort({ examDate: -1 })
      .limit(limit)
      .lean();

    if (!answers.length) {
      throw new Error("No exam history found");
    }

    const graphData = answers.map((exam: any) => ({
      date: exam.examDate?.toISOString().split("T")[0],
      examName: exam.examName,
      subject: exam.subject ?? null, // 👈 expose subject in each data point
      percentage: Number(exam.percentage.toFixed(2)),
      obtainedMarks: exam.obtainedMarks,
      totalMarks: exam.totalMarks,
    }));

    const percentages = graphData.map((g) => g.percentage);

    const averageScore = percentages.length
      ? Number(
          (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(
            2,
          ),
        )
      : 0;

    const bestScore = Math.max(...percentages);
    const worstScore = Math.min(...percentages);
    const latestScore = percentages[0] || 0;
    const halfIndex = Math.ceil(percentages.length / 2);
    const prevHalfPercentage =
      percentages.slice(-halfIndex).reduce((a, b) => a + b, 0) / halfIndex;
    const LatestHalfPercentage =
      percentages.slice(0, halfIndex).reduce((a, b) => a + b, 0) / halfIndex;

    const improvement = Number(
      (LatestHalfPercentage - prevHalfPercentage).toFixed(2),
    );

    return {
      graphData,
      summary: {
        totalExams: graphData.length,
        averageScore,
        bestScore,
        worstScore,
        latestScore,
        improvement,
      },
    };
  } catch (error: any) {
    console.error("getPerformanceGraph Error:", error.message);
    throw new Error(error.message || "Failed to fetch graph");
  }
};
