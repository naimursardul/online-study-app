import mongoose, { Types } from "mongoose";

// Record
export interface IRecord {
  recordType: string;
  institution: string;
  year: string;
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
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Sub Question
export interface ISubQuestions {
  questionNo: string;
  question: string;
  answer: string;
  topic: string;
  topicId: string;
}

// CQ
export interface ICQ extends IBaseQuestion {
  statement: string;
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
  level: mongoose.Schema.Types.ObjectId;
}

// Subject
export interface ISubject extends Document {
  name: string;
  level: mongoose.Types.ObjectId;
  background: mongoose.Types.ObjectId[];
}

// Chapter
export interface IChapter extends Document {
  name: string;
  level: mongoose.Types.ObjectId;
  background: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
}

// Topic
export interface ITopic extends Document {
  name: string;
  level: mongoose.Types.ObjectId;
  background: mongoose.Types.ObjectId[]; // Array of background IDs
  subject: mongoose.Types.ObjectId;
  chapter: mongoose.Types.ObjectId;
}
