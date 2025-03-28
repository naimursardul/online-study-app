import { JSX } from "react";

export interface QuestionType {
  _id?: string;
  questionType: string;
  studentClass: string;
  subject: string;
  chapter: string;
  topic: string;
  appearedInExam: boolean;
  record: string[];
  difficulty: "Easy" | "Medium" | "Hard";

  statement?: string;
  question: string[];
  options: string[];
  answer: string;
  explanation?: string;
  mark: number;
  time: number;
}

export interface ScriptResType {
  correct: number;
  wrong: number;
  obtain: number;
  total: number;
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

export interface TopicType {
  _id?: string;
  studentClass: string;
  subject: string;
  chapter: string;
  title: string;
}
export interface ChapterType {
  _id?: string;
  studentClass: string;
  subject: string;
  title: string;
}
export interface SubjectType {
  _id?: string;
  studentClass: string;
  title: string;
}
export interface ClassType {
  _id?: string;
  title: string;
  details: string;
}

export interface RecordType {
  _id?: string;
  recordType: string;
  institution: string;
  year: string;
}
