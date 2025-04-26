import { JSX } from "react";

export interface ScriptResType {
  correct: number;
  wrong: number;
  obtain: number;
  total: number;
}

// RES type
export interface IResponse {
  message: string;
  success: string;
  data: [];
}

// Option Data
export interface IOptionData {
  _id: string;
  name: string;
}

// FIELD INTERFACE
export interface IField {
  label?: string;
  inputType: string;
  name: string;
  optionData?: IOptionData[];
  req?: boolean;
}

// FORM ARRAY
export interface IFormInfo {
  method: string;
  route: string;
  initData: Record<string, string>;
  fields: IField[];
}

// SingleMcqAnswerType
export interface SingleMcqAnswerType {
  id: string;
  givenAns: string | undefined;
  mark: number;
  isCorrect: boolean;
}

export interface SidebarItemType {
  title: string;
  url: string;
  icon: JSX.Element;
  subItem: { title: string; url: string }[];
}

// Record
export interface IRecord {
  recordType: string;
  institution: string;
  year: string;
}

// Base Question
export interface IBaseQuestion {
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
  records: IRecord[];
  recordsId: string[];
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
  _id: string;
  name: string;
}

// Level
export interface ILevel {
  name: string;
  details: string;
}

// Background
export interface IBackground {
  name: string;
  level: string;
}

// Subject
export interface ISubject {
  name: string;
  level: string;
  background: string[];
}

// Chapter
export interface IChapter {
  name: string;
  level: string;
  background: string;
  subject: string;
}

// Topic

export interface ITopic {
  name: string;
  level: string;
  background: string[]; // Array of background IDs
  subject: string;
  chapter: string;
}
