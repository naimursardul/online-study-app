import React, { JSX } from "react";

export interface ScriptResType {
  correct: number;
  wrong: number;
  obtain: number;
  total: number;
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
  placeholder?: string;
  type?: string;
  manualOptionData?: boolean;
  optionData?: IOptionData[];
  req?: boolean;
  dependencies?: string[];
  description?: string;
}

// DATA FIELD PROPS TYPE
export interface DataFieldProps<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  field?: IField;
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
  questionType: string;
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

// MCQ
export interface IMCQ extends IBaseQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
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

// IRegistrationFormField
export interface IRegistrationFormField {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  description?: string;
}

export interface IUser {
  name: string;
  role: "User" | "Admin" | "SuperAdmin";
  userCategory: "Regular" | "Premium";
  isVerified: boolean;
  provider: "Phone" | "Google";
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

export interface IResponse {
  success: boolean;
  message: string;
}
