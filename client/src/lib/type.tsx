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

export interface AnswerScriptType {
  id: string;
  givenAns: string | undefined;
  mark: number;
  isCorrect: boolean;
}

// selectedOption
export interface SelectedOptionType {
  id: string | undefined;
  givenAns: string | undefined;
}
