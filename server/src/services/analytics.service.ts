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
    if (!answers?.length) {
      throw new Error("No answers submitted");
    }

    const questionIds = answers.map((a) => new Types.ObjectId(a.questionId));

    const questions = await MCQ.find({
      _id: { $in: questionIds },
    }).lean();

    if (!questions.length) {
      throw new Error("Questions not found");
    }

    const questionMap: Record<string, any> = {};
    questions.forEach((q) => {
      questionMap[q._id.toString()] = q;
    });

    const topicMap: Record<string, any> = {};
    const enrichedAnswers: any[] = [];

    let correctCount = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;

    answers.forEach((ans) => {
      const q = questionMap[ans.questionId];
      if (!q) return;

      const isCorrect = ans.givenAns === q.correctAnswer;

      totalMarks += q.marks;
      if (isCorrect) {
        correctCount++;
        obtainedMarks += q.marks;
      }

      enrichedAnswers.push({
        questionId: q._id,
        givenAns: ans.givenAns,
        isCorrect,
      });

      // -------------------------
      // Topic Analytics (IDs only)
      // -------------------------
      const topicId = q.topicId;

      if (!topicMap[topicId]) {
        topicMap[topicId] = {
          topicId: q.topicId,
          subjectId: q.subjectId,
          chapterId: q.chapterId,
          correct: 0,
          total: 0,
        };
      }

      topicMap[topicId].total += 1;
      if (isCorrect) {
        topicMap[topicId].correct += 1;
      }
    });

    const topicStats = Object.values(topicMap);
    const totalQuestions = answers.length;
    const wrongCount = totalQuestions - correctCount;
    const percentage =
      totalMarks === 0 ? 0 : ((obtainedMarks / totalMarks) * 100).toFixed(2);

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
    await UserAnalytics.updateOne(
      { u_id },
      { $setOnInsert: { u_id, topicStats: [] } },
      { upsert: true },
    );

    const analytics = await UserAnalytics.findOne(
      { u_id },
      { topicStats: 1 },
    ).lean();

    const existingTopicIds = new Set(
      analytics?.topicStats?.map((t: any) => t.topicId) || [],
    );

    const bulkOperations: any[] = [];

    topicStats.forEach((topic) => {
      if (existingTopicIds.has(topic.topicId)) {
        bulkOperations.push({
          updateOne: {
            filter: { u_id, "topicStats.topicId": topic.topicId },
            update: {
              $inc: {
                "topicStats.$.correct": topic.correct,
                "topicStats.$.total": topic.total,
              },
            },
          },
        });
      } else {
        bulkOperations.push({
          updateOne: {
            filter: { u_id },
            update: {
              $push: {
                topicStats: {
                  topicId: topic.topicId,
                  subjectId: topic.subjectId,
                  chapterId: topic.chapterId,
                  correct: topic.correct,
                  total: topic.total,
                },
              },
            },
          },
        });
      }
    });

    if (bulkOperations.length > 0) {
      await UserAnalytics.bulkWrite(bulkOperations);
    }

    return { success: true, message: "User analytics updated successfully" };
  } catch (error: any) {
    console.error("updateUserAnalytics Error:", error.message);
    throw new Error(error.message || "Failed to update analytics");
  }
};

// --------------------------------
// GET SCOPED TOPIC STATS
// Returns per-topic accuracy for the given topic ids that the user
// has actually attempted (present in analytics). Topics not returned
// are treated as "new"/unseen by the caller.
// --------------------------------
export const getScopedTopicStats = async (
  u_id: string,
  scopedTopicIds: string[],
) => {
  const analytics = await UserAnalytics.findOne(
    { u_id },
    { topicStats: 1 },
  ).lean();

  const scopeSet = new Set(scopedTopicIds.map(String));

  const stats: Record<
    string,
    { correct: number; total: number; accuracy: number }
  > = {};

  (analytics?.topicStats || []).forEach((t: any) => {
    const topicId = String(t.topicId);
    if (!scopeSet.has(topicId)) return;

    stats[topicId] = {
      correct: t.correct,
      total: t.total,
      accuracy: t.total === 0 ? 0 : Number(((t.correct / t.total) * 100).toFixed(2)),
    };
  });

  return stats;
};

// --------------------------------
// GET WEAK TOPICS
// --------------------------------
export const getWeakTopics = async (
  u_id: string,
  limit: number = 5,
  subjectId?: string,
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
        subjectId: topic.subjectId,
        chapterId: topic.chapterId,
        correct: topic.correct,
        total: topic.total,
        accuracy:
          topic.total === 0
            ? 0
            : Number(((topic.correct / topic.total) * 100).toFixed(2)),
      }))
      .filter((topic: any) => topic.total >= 3)
      .filter((topic: any) =>
        subjectId ? String(topic.subjectId) === subjectId : true,
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

    const subjectMap: Record<string, { correct: number; total: number }> = {};

    topicStats.forEach((topic: any) => {
      const key = String(topic.subjectId);

      if (!subjectMap[key]) {
        subjectMap[key] = { correct: 0, total: 0 };
      }

      subjectMap[key].correct += topic.correct;
      subjectMap[key].total += topic.total;
    });

    const subjects = Object.entries(subjectMap).map(([subjectId, stats]) => ({
      subjectId,
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
      subjectId: 1,
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
      subjectId: exam.subjectId ?? null, // 👈 id instead of name
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
    const latestHalfPercentage =
      percentages.slice(0, halfIndex).reduce((a, b) => a + b, 0) / halfIndex;

    const improvement = Number(
      (latestHalfPercentage - prevHalfPercentage).toFixed(2),
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
