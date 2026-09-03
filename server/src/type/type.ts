import mongoose from "mongoose";
import { QuestionTypeCode } from "../utils/question-types";

//  USER
export interface IUser extends mongoose.Document {
  name: string;
  role: "user" | "admin" | "super-admin";
  userCategory: "regular" | "premium";
  isVerified: boolean;
  provider: "phone" | "google";
  img?: string;
  email?: string;
  phone?: string;
  password?: string;
  level?: string;
  background?: string;

  verificationToken?: string;
  verificationTokenExpireAt?: Date;
  resetToken?: string;
  resetTokenExpireAt?: Date;
  passwordChangedAt?: Date;
  lastLogin?: Date;
}

// Record
export interface IRecord {
  recordType: string;
  institution: string;
  year: string;
}

// Base Question
export interface IBaseQuestion extends Document {
  questionType: QuestionTypeCode;
  levelId: string;
  backgroundId: string[];
  subjectId: string;
  chapterId: string;
  topicId: string;
  recordId: string[];
  marks: number;
  timeRequired: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

// MCQ
export interface IMCQ extends IBaseQuestion {
  question: string;
  options: String;
  correctAnswer: string;
  explanation?: string;
}

// Sub Question
export interface ISubQuestions {
  questionNo: string;
  question: string;
  answer: string;
  chapterId: string;
  topicId: string;
}

// CQ — also used by Math-CQ (identical shape, 3 sub-questions instead of 4)
export interface ICQ extends IBaseQuestion {
  statement: string;
  subQuestions: ISubQuestions[];
}

// Written — the shared shape behind SQ, EQ and WQ
export interface IWritten extends IBaseQuestion {
  question: string;
  answer: string;
}

// Populated Type
export interface IPopulatedData {
  _id: mongoose.Types.ObjectId;
  name: string;
}

// Collection
export interface ICollection extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
}

// Level
export interface ILevel extends Document {
  name: string;
  details: string;
}

// Background
export interface IBackground extends Document {
  name: string;
  levelId: mongoose.Types.ObjectId;
}

// Subject
export interface ISubject extends Document {
  name: string;
  levelId: mongoose.Types.ObjectId;
  backgroundId: mongoose.Types.ObjectId[];
  // Which question types this subject offers. Empty means "not configured yet",
  // and consumers fall back to showing every type.
  questionTypes: QuestionTypeCode[];
}

// Chapter
export interface IChapter extends Document {
  name: string;
  levelId: mongoose.Types.ObjectId;
  backgroundId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
}

// Topic
export interface ITopic extends Document {
  name: string;
  levelId: mongoose.Types.ObjectId;
  backgroundId: mongoose.Types.ObjectId[]; // Array of background IDs
  subjectId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
}

// QUESTION ANSWER
export interface IQuestionAnswer {
  id: string;
  givenAns: string;
}

// ANSWER
export interface IAnswer extends Document {
  u_id: string;
  subjectId?: string;
  examName: string;

  answerScript: {
    questionId: string;
    givenAns: string;
    isCorrect: boolean;
  }[];

  totalMarks: number;
  obtainedMarks: number;
  percentage: number;

  totalQuestions: number;
  correctCount: number;
  wrongCount: number;

  timeTaken: number;
  examDate: Date;
}

// EXAM SESSION
export interface IExamResult {
  obtainedMarks: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  timeTaken: number;
  examDate: Date;
}

export interface IExam extends Document {
  u_id: string;
  examCategory: ExamCategoryType;
  examName: string;
  subjectId: string;

  scope: {
    topicIds: string[];
  };

  difficulty: "Easy" | "Medium" | "Hard" | "Mix";
  mode: "random" | "weak";

  size: number;
  questionIds: mongoose.Types.ObjectId[];

  totalMarks: number;
  totalTime: number;

  status: "generated" | "submitted";
  answerId?: mongoose.Types.ObjectId;

  result?: IExamResult;
}

// ANALYTICS
interface ITopicStat {
  topicId: string;

  subjectId: string;

  chapterId: string;

  correct: number;
  total: number;
}

export interface IUserAnalytics extends Document {
  u_id: string;

  topicStats: ITopicStat[];
}

export type ExamCategoryType = "record" | "personal";
