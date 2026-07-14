/*
 * Title: Exam Service
 * Description: Generate / fetch / list / delete custom MCQ exam sessions
 * Author: Naimur Rahman
 * Date: 2026-07-12
 */

import { Types } from "mongoose";
import { MCQ } from "../models/question-model";
import Topic from "../models/topic-model";
import Answer from "../models/answer-model";
import Exam from "../models/exam-model";
import { getScopedTopicStats } from "./analytics.service";
import { ExamCategoryType, IExamResult } from "../type/type";

const MAX_PENDING = 2;
const MASTERY_THRESHOLD = 80; // accuracy % at/above which a topic is "mastered"
const NEW_TOPIC_MIN_TOTAL = 3; // below this the topic is treated as "new"/priority

interface GenerateExamInput {
  u_id: string;
  examCategory: ExamCategoryType;
  examName: string;
  subjectId: string;
  topicIds?: string[];
  difficulty: "Easy" | "Medium" | "Hard" | "Mix";
  mode: "random" | "weak";
  size: number;
}

// --------------------------------
// Helpers
// --------------------------------

// Strip the answer + explanation before sending questions to the client
export function sanitizeQuestion(q: any) {
  const { correctAnswer, explanation, ...rest } = q;
  return rest;
}

// Random-sample MCQs matching `match`, excluding already-picked ids
async function sampleMcqs(
  match: Record<string, any>,
  size: number,
  excludeIds: Types.ObjectId[] = [],
) {
  if (size <= 0) return [];
  const finalMatch: Record<string, any> = { ...match };
  if (excludeIds.length) finalMatch._id = { $nin: excludeIds };
  return MCQ.aggregate([{ $match: finalMatch }, { $sample: { size } }]);
}

// --------------------------------
// GENERATE EXAM
// --------------------------------
export const generateExam = async (input: GenerateExamInput) => {
  const {
    u_id,
    examCategory,
    examName,
    subjectId,
    topicIds = [],
    difficulty,
    mode,
    size,
  } = input;

  // 1. Pending cap
  const pending = await Exam.countDocuments({ u_id, status: "generated" });
  if (pending >= MAX_PENDING) {
    throw new Error(
      "You already have 2 pending exams. Finish or delete one first.",
    );
  }

  // 2. Unique name per user
  const dup = await Exam.findOne({ u_id, examName });
  if (dup) {
    throw new Error("An exam with this name already exists.");
  }

  // 3. Base filter
  const baseMatch: Record<string, any> = { questionType: "MCQ", subjectId };
  if (topicIds.length) baseMatch.topicId = { $in: topicIds };
  if (difficulty !== "Mix") baseMatch.difficulty = difficulty;

  let selected: any[] = [];

  if (mode === "random") {
    selected = await sampleMcqs(baseMatch, size);
  } else {
    // ---- Weak mode: accuracy-band blend ----
    // Resolve scope topic universe
    let scopeTopicIds = topicIds;
    if (!scopeTopicIds.length) {
      const topics = await Topic.find({ subjectId }, { _id: 1 }).lean();
      scopeTopicIds = topics.map((t: any) => String(t._id));
    }

    const stats = await getScopedTopicStats(u_id, scopeTopicIds);

    const priorityTopics: string[] = [];
    const masteredTopics: string[] = [];

    scopeTopicIds.forEach((tid) => {
      const s = stats[tid];
      if (
        !s ||
        s.total < NEW_TOPIC_MIN_TOTAL ||
        s.accuracy < MASTERY_THRESHOLD
      ) {
        priorityTopics.push(tid);
      } else {
        masteredTopics.push(tid);
      }
    });

    const masteredQuota = Math.round(size * 0.15);
    const priorityQuota = size - masteredQuota;

    const pickedIds: Types.ObjectId[] = [];

    // Priority bucket (weak + new topics) — ~85%
    if (priorityTopics.length) {
      const picked = await sampleMcqs(
        { ...baseMatch, topicId: { $in: priorityTopics } },
        priorityQuota,
        pickedIds,
      );
      selected.push(...picked);
      pickedIds.push(...picked.map((q) => q._id));
    }

    // Mastered bucket — remainder (fills ~15% + any priority shortfall)
    if (masteredTopics.length && selected.length < size) {
      const picked = await sampleMcqs(
        { ...baseMatch, topicId: { $in: masteredTopics } },
        size - selected.length,
        pickedIds,
      );
      selected.push(...picked);
      pickedIds.push(...picked.map((q) => q._id));
    }

    // Spill: scope-wide random for any remaining slots
    if (selected.length < size) {
      const picked = await sampleMcqs(
        baseMatch,
        size - selected.length,
        pickedIds,
      );
      selected.push(...picked);
      pickedIds.push(...picked.map((q) => q._id));
    }
  }

  if (!selected.length) {
    throw new Error("No questions found for the selected criteria.");
  }

  const totalMarks = selected.reduce((a, q) => a + (q.marks || 0), 0);
  const totalTime = selected.reduce((a, q) => a + (q.timeRequired || 0), 0);

  const exam = await Exam.create({
    u_id,
    examCategory,
    examName,
    subjectId,
    scope: { topicIds },
    difficulty,
    mode,
    size,
    questionIds: selected.map((q) => q._id),
    totalMarks,
    totalTime,
    status: "generated",
  });

  return {
    exam,
    questions: selected.map(sanitizeQuestion),
  };
};

// --------------------------------
// GET EXAM BY ID (take payload or review payload by status)
// --------------------------------
export const getExamById = async (u_id: string, examId: string) => {
  const exam = await Exam.findById(examId).lean();
  if (!exam) throw new Error("Exam not found.");
  if (String(exam.u_id) !== String(u_id)) throw new Error("Not authorized.");

  const questions = await MCQ.find({ _id: { $in: exam.questionIds } }).lean();
  const qMap: Record<string, any> = {};
  questions.forEach((q) => (qMap[String(q._id)] = q));

  // Generated → questions to take (sanitized, original order)
  if (exam.status === "generated") {
    const ordered = exam.questionIds
      .map((id: any) => qMap[String(id)])
      .filter(Boolean)
      .map(sanitizeQuestion);
    return { exam, mode: "take", questions: ordered };
  }

  // Submitted → review (full questions joined with the answer script)
  const answer = await Answer.findById(exam.answerId).lean();
  const review = (answer?.answerScript || []).map((a: any) => {
    const q = qMap[String(a.questionId)];
    return {
      questionId: String(a.questionId),
      question: q?.question,
      options: q?.options,
      correctAnswer: q?.correctAnswer,
      explanation: q?.explanation,
      marks: q?.marks,
      givenAns: a.givenAns,
      isCorrect: a.isCorrect,
    };
  });

  return { exam, mode: "review", questions: review, result: exam.result };
};

// --------------------------------
// LIST USER EXAMS
// --------------------------------
export const listUserExams = async (u_id: string) => {
  return Exam.find(
    { u_id },
    {
      examName: 1,
      subjectId: 1,
      status: 1,
      size: 1,
      totalMarks: 1,
      totalTime: 1,
      result: 1,
      questionIds: 1,
      difficulty: 1,
      mode: 1,
      createdAt: 1,
    },
  )
    .sort({ createdAt: -1 })
    .lean();
};

// --------------------------------
// DELETE EXAM (only un-submitted)
// --------------------------------
export const deleteExam = async (u_id: string, examId: string) => {
  const exam = await Exam.findById(examId);
  if (!exam) throw new Error("Exam not found.");
  if (String(exam.u_id) !== String(u_id)) throw new Error("Not authorized.");
  if (exam.status !== "generated") {
    throw new Error("Submitted exams cannot be deleted.");
  }
  await exam.deleteOne();
  return { deleted: true };
};

// --------------------------------
// SUBMIT HELPERS (used by createAnswer controller)
// --------------------------------
export const getPendingExamOrThrow = async (u_id: string, examId: string) => {
  const exam = await Exam.findById(examId);
  if (!exam) throw new Error("Exam not found.");
  if (String(exam.u_id) !== String(u_id)) throw new Error("Not authorized.");
  if (exam.status !== "generated") throw new Error("Exam already submitted.");
  return exam;
};

export const markExamSubmitted = async (
  examId: string,
  answerId: Types.ObjectId,
  result: IExamResult,
) => {
  await Exam.findByIdAndUpdate(examId, {
    status: "submitted",
    answerId,
    result,
  });
};
