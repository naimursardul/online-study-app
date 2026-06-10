import type { JSX } from "react";

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
  req?: boolean;
  manualOptionData?: boolean;
  optionData?: IMasterData[keyof IMasterData];
  description?: string;
}

// DATA FIELD PROPS TYPE
export interface IQuestionDataFieldProps {
  formData: IBaseQuestion;
  setFormData: React.Dispatch<React.SetStateAction<IBaseQuestion>>;
  field: IField;
  forAllDataPage?: boolean;
}
export interface DataFieldProps<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  field: IField;
  forAllDataPage?: boolean;
}

// FORM ARRAY
export interface IFormInfo<T> {
  method: string;
  route: string;
  initData: T;
  fields: IField[];
}

// SingleMcqAnswerType
export interface SingleMcqAnswerType {
  questionId: string;
  givenAns: string | undefined;
}

export interface SidebarItemType {
  title: string;
  url: string;
  icon: JSX.Element;
  subItem?: { title: string; url: string }[];
  role?: ("user" | "admin" | "super-admin")[];
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
  levelId: string;
  backgroundId: string[];
  subjectId: string;
  chapterId: string;
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
  chapterId: string;
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
  levelId: string | IPopulatedData;
}

// Subject
export interface ISubject {
  name: string;
  levelId: string | IPopulatedData;
  backgroundId: string[] | IPopulatedData[];
}

// Chapter
export interface IChapter {
  name: string;
  levelId: string | IPopulatedData;
  backgroundId: string[] | IPopulatedData[];
  subjectId: string | IPopulatedData;
}

// Topic
export interface ITopic {
  name: string;
  levelId: string | IPopulatedData;
  backgroundId: string[] | IPopulatedData[]; // Array of background IDs
  subjectId: string | IPopulatedData;
  chapterId: string | IPopulatedData;
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

export interface IResponse {
  success: boolean;
  message: string;
}

export interface IBoardQusetonDetails {
  level?: string;
  subject?: string;
  questionType?: string;
  institution?: string;
  year?: string;
}

export type ExamStatusType = "ready" | "started" | "finished";
export type ViewModeType = "viewOnly" | "showAns" | "practice";

export interface IMasterData {
  levels: { _id: string; name: string }[];
  backgrounds: {
    _id: string;
    levelId: string;
  }[];
  subjects: {
    _id: string;
    name: string;
    backgroundId: string[];
    levelId: string;
  }[];
  chapters: {
    _id: string;
    name: string;
    subjectId: string;
    backgroundId: string[];
    levelId: string;
  }[];
  topics: {
    _id: string;
    name: string;
    chapterId: string;
    subjectId: string;
    backgroundId: string[];
    levelId: string;
  }[];
  records: (IRecord & { _id: string })[];
}

// Query form data
export interface IQueryFormData {
  levelId?: string;
  backgroundId?: string[];
  subjectId?: string;
  chapterId?: string;
  search?: string;
}

export interface IExtractedMcqQuestion {
  questionType: "MCQ";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface IExtractedCQQuestion {
  questionType: "CQ";
  statement: string;
  subQuestions: {
    questionNo: string;
    question: string;
    answer: string;
  }[];
}
// -------------------------
// Extracted (raw API response shapes)
// -------------------------

export interface IExtractedMcqQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface IExtractedCQQuestion {
  statement: string;
  subQuestions: ISubQuestionWithMeta[];
}

export interface IExtractionResponse {
  questionType: "MCQ" | "CQ";
  questions: IExtractedMcqQuestion[] | IExtractedCQQuestion[];
}

// -------------------------
// With Meta (state shape in QuestionExtractor)
// -------------------------

export interface ISubQuestionWithMeta {
  questionNo: string;
  question: string;
  answer: string;
  chapterId: string;
  topicId: string;
}

export interface IMCQWithMeta extends IBaseQuestion {
  questionType: "MCQ";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ICQWithMeta extends IBaseQuestion {
  questionType: "CQ";
  statement: string;
  subQuestions: ISubQuestionWithMeta[];
}

export type IQuestionWithMeta = IMCQWithMeta | ICQWithMeta;
