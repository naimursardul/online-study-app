import type { JSX } from "react";
import type { QuestionTypeCode } from "@/utils/questionTypes";

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
  questionType: QuestionTypeCode;
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

// CQ — also the shape of Math-CQ, which differs only in sub-question count.
export interface ICQ extends IBaseQuestion {
  statement: string;
  subQuestions: ISubQuestions[];
}

// SQ / EQ / WQ — the `simple` family. Identical shapes, different names.
export interface IWritten extends IBaseQuestion {
  question: string;
  answer: string;
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
  // Which question types this subject offers. Empty means "not configured yet",
  // and every reader falls back to offering all types. Kept as plain strings
  // because it arrives unvalidated from the API; readers narrow it through
  // `typesForSubject`.
  questionTypes: string[];
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

// Collection
export interface ICollection {
  userId: string;
  name: string;
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

export type ExamStatusType = "ready" | "started" | "finished";
export type ViewModeType = "viewOnly" | "showAns" | "practice";

// =========================================
// EXAM SYSTEM
// =========================================
export type ExamDifficultyType = "Easy" | "Medium" | "Hard" | "Mix";
export type ExamModeType = "random" | "weak";
export type ExamSessionStatusType = "generated" | "submitted";

export interface ExamConfigType {
  examName: string;
  subjectId: string;
  topicIds: string[];
  difficulty: ExamDifficultyType;
  mode: ExamModeType;
  size: number;
}

export interface ExamResultType {
  obtainedMarks: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  timeTaken: number;
  examDate: string;
}

export interface ExamSessionType {
  _id: string;
  u_id: string;
  examName: string;
  subjectId: string;
  scope: { topicIds: string[] };
  difficulty: ExamDifficultyType;
  mode: ExamModeType;
  size: number;
  questionIds: string[];
  totalMarks: number;
  totalTime: number;
  status: ExamSessionStatusType;
  answerId?: string;
  result?: ExamResultType;
  createdAt?: string;
}

// Response of POST /exam/generate
export interface ExamGenResType {
  exam: ExamSessionType;
  questions: (IMCQ & { _id: string })[];
}

// Response of GET /exam/:examId
export interface ExamGetResType {
  exam: ExamSessionType;
  mode: "take" | "review";
  questions: (IMCQ & { _id: string })[] | ExamReviewItemType[];
  result?: ExamResultType;
}

// Row in GET /exam/list
export interface ExamListItemType {
  _id: string;
  examName: string;
  subjectId: string;
  status: ExamSessionStatusType;
  size: number;
  totalMarks: number;
  totalTime: number;
  difficulty: ExamDifficultyType;
  mode: ExamModeType;
  questionIds: string[];
  result?: ExamResultType;
  createdAt?: string;
}

// A review row for a question that still exists.
interface ExamReviewAnsweredItem {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: string; // option index "0" | "1" | "2" | "3"
  explanation: string;
  marks: number;
  givenAns: string | undefined;
  isCorrect: boolean;
  unavailable?: false;
}

// The question was deleted after the exam was taken. The stored result is history,
// so the row still carries what was answered — but not marks, which lived on the
// question and are no longer knowable.
interface ExamReviewUnavailableItem {
  questionId: string;
  unavailable: true;
  givenAns: string | undefined;
  isCorrect: boolean;
}

export type ExamReviewItemType =
  | ExamReviewAnsweredItem
  | ExamReviewUnavailableItem;

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
    // Codes only — the raw master-data payload is stored as-is.
    questionTypes: string[];
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
  collections: (ICollection & { _id: string; createdAt: string })[];
}

// Query form data
export interface IQueryFormData {
  levelId?: string;
  backgroundId?: string[];
  subjectId?: string;
  chapterId?: string;
  search?: string;
}

// Server-side pagination envelope (question list, collection questions)
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Question Explorer filter state. Level and background are not here — they are
// always taken from the signed-in user's profile.
export interface IExplorerFilters {
  questionType: "" | QuestionTypeCode;
  subjectId: string;
  institution: string[];
  year: string[];
  chapterId: string[];
  topicId: string[];
  difficulty: "" | "Easy" | "Medium" | "Hard";
  search: string;
}

// -------------------------
// Extracted (raw API response shapes)
// -------------------------

export interface IExtractedMcqQuestion {
  questionType: "MCQ";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// CQ and Math-CQ share this shape; only the sub-question count differs.
export interface IExtractedCQQuestion {
  questionType: "CQ" | "Math-CQ";
  statement: string;
  subQuestions: {
    questionNo: string;
    question: string;
    answer: string;
  }[];
}

// SQ / EQ / WQ
export interface IExtractedWrittenQuestion {
  questionType: "SQ" | "EQ" | "WQ";
  question: string;
  answer: string;
}

export interface IExtractionResponse {
  questionType: QuestionTypeCode;
  questions:
    | IExtractedMcqQuestion[]
    | IExtractedCQQuestion[]
    | IExtractedWrittenQuestion[];
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

export interface IqDetails {
  withId: Record<string, string | undefined>;
  withName: Record<string, string | undefined>;
}
