export interface QuestionType {
  _id: string;
  class: string;
  subject: string;
  paper: number;
  chapter: number;
  topic: string;
  questionType: string;
  standard: string;
  record: string[][];
  tag: string[];
  toughness: number;

  statement?: string;
  detail: string[];
  options?: string[];
  answer: string;
  mark: number;
  explanation?: string;
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
