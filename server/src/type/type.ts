import mongoose, { Types } from "mongoose";

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
  lastLogin?: Date;
}

// Record
export interface IRecord {
  recordType: string;
  institution: string;
  year: string;
}

// IMAGE SCHEMA TYPE
export interface IImage {
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

// Base Question
export interface IBaseQuestion extends Document {
  questionType: "MCQ" | "CQ";
  level: string;
  levelId: string;
  background: string[];
  backgroundId: string[];
  subject: string;
  subjectId: string;
  chapter: string;
  chapterId: string;
  topic: string;
  topicId: string;
  record: IRecord[];
  recordId: string[];
  marks: number;
  timeRequired: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

// MCQ
export interface IMCQ extends IBaseQuestion {
  question: string;
  questionImg?: string;
  options: { text?: String; optionImg?: string }[];
  correctAnswer: number;
  explanation?: string;
  explanationImg?: String;
}

// Sub Question
export interface ISubQuestions {
  questionNo: string;
  question: string;
  answer: string;
  subQuestionAnswerImg?: string;
  topic: string;
  topicId: string;
}

// CQ
export interface ICQ extends IBaseQuestion {
  statement: string;
  statementImg?: string;
  subQuestions: ISubQuestions[];
}

// Populated Type
export interface IPopulatedData {
  _id: Types.ObjectId;
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
  levelId: mongoose.Schema.Types.ObjectId;
}

// Subject
export interface ISubject extends Document {
  name: string;
  levelId: mongoose.Types.ObjectId;
  backgroundId: mongoose.Types.ObjectId[];
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

// ANALYTICS
interface ITopicStat {
  topicId: string;
  topicName: string;

  subjectId: string;
  subjectName: string;

  chapterId: string;
  chapterName: string;

  correct: number;
  total: number;
}

interface IQuestionStat {
  questionId: string;

  attempts: number;
  correctAttempts: number;
  wrongAttempts: number;

  lastAttemptedAt: Date;
}

export interface IUserAnalytics extends Document {
  u_id: string;

  topicStats: ITopicStat[];

  questionStats: IQuestionStat[];
}
