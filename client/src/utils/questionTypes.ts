/*
 * Title: Question Type Registry (client)
 * Description: Mirror of server/src/utils/question-types.ts. Single source of
 *              truth for which question types exist, what they are called, and
 *              which shape family they belong to:
 *                - mcq    -> question + 4 options + correctAnswer + explanation
 *                - cq     -> statement + N subQuestions (CQ = 4, Math-CQ = 3)
 *                - simple -> question + answer (SQ, EQ, WQ are identical shapes)
 *              Every selector, form and renderer reads this instead of
 *              hardcoding an MCQ/CQ pair, so adding a type is one entry here.
 * Author: Naimur Rahman
 */

export const QUESTION_TYPE_CODES = [
  "MCQ",
  "CQ",
  "Math-CQ",
  "SQ",
  "EQ",
  "WQ",
] as const;

export type QuestionTypeCode = (typeof QUESTION_TYPE_CODES)[number];

export type QuestionFamily = "mcq" | "cq" | "simple";

export interface IQuestionTypeConfig {
  code: QuestionTypeCode;
  label: string;
  family: QuestionFamily;
  // Only meaningful for the `cq` family.
  subQuestionCount?: number;
}

export const QUESTION_TYPES: Record<QuestionTypeCode, IQuestionTypeConfig> = {
  MCQ: { code: "MCQ", label: "MCQ", family: "mcq" },
  CQ: { code: "CQ", label: "CQ", family: "cq", subQuestionCount: 4 },
  "Math-CQ": {
    code: "Math-CQ",
    label: "Math CQ",
    family: "cq",
    subQuestionCount: 3,
  },
  SQ: { code: "SQ", label: "Short Question", family: "simple" },
  EQ: { code: "EQ", label: "English Question", family: "simple" },
  WQ: { code: "WQ", label: "Written Question", family: "simple" },
};

export const QUESTION_TYPE_LIST: IQuestionTypeConfig[] =
  QUESTION_TYPE_CODES.map((code) => QUESTION_TYPES[code]);

export function isQuestionTypeCode(value: unknown): value is QuestionTypeCode {
  return (
    typeof value === "string" &&
    (QUESTION_TYPE_CODES as readonly string[]).includes(value)
  );
}

export function familyOf(code: string): QuestionFamily | undefined {
  return isQuestionTypeCode(code) ? QUESTION_TYPES[code].family : undefined;
}

export function labelOf(code: string): string {
  return isQuestionTypeCode(code) ? QUESTION_TYPES[code].label : code;
}

export function subQuestionCountOf(code: string): number {
  return (
    (isQuestionTypeCode(code) ? QUESTION_TYPES[code].subQuestionCount : 0) ?? 0
  );
}

// The sub-question labels a cq-family type shows, trimmed to its own count.
const SUB_QUESTION_LABELS = ["A", "B", "C", "D"];

export function subQuestionLabelsOf(code: string): string[] {
  return SUB_QUESTION_LABELS.slice(0, subQuestionCountOf(code));
}

// The badge an MCQ option carries. A question is expected to hold four options,
// but nothing enforces it, so anything past D falls back to its 1-based number.
const OPTION_LETTERS = ["A", "B", "C", "D"];

export function optionLetterOf(index: number): string {
  return OPTION_LETTERS[index] ?? String(index + 1);
}

// A subject with no configured types is treated as offering every type, so
// subjects created before this feature keep working until an admin sets them.
export function typesForSubject(
  questionTypes: string[] | undefined,
): IQuestionTypeConfig[] {
  const configured = (questionTypes ?? []).filter(isQuestionTypeCode);
  return configured.length
    ? configured.map((code) => QUESTION_TYPES[code])
    : QUESTION_TYPE_LIST;
}

// Options for the taxonomy admin's multi-select, where `_id` must be the code
// itself (it is persisted verbatim onto the subject).
export const QUESTION_TYPE_OPTIONS = QUESTION_TYPE_LIST.map(
  ({ code, label }) => ({ _id: code, name: label }),
);

// -------------------------
// Empty-state seeds
// -------------------------
// Used by the manual create form and the extractor, so a type's blank shape is
// defined once instead of at every call site.

export interface ISeedSubQuestion {
  questionNo: string;
  question: string;
  answer: string;
  chapterId: string;
  topicId: string;
}

export function seedSubQuestions(code: string): ISeedSubQuestion[] {
  return subQuestionLabelsOf(code).map((label) => ({
    questionNo: label,
    question: "",
    answer: "",
    chapterId: "",
    topicId: "",
  }));
}

// The type-specific half of a question — the base metadata is the caller's.
export function emptyShapeFor(code: string): Record<string, unknown> {
  switch (familyOf(code)) {
    case "mcq":
      return { question: "", options: [], correctAnswer: "", explanation: "" };
    case "cq":
      return { statement: "", subQuestions: seedSubQuestions(code) };
    case "simple":
      return { question: "", answer: "" };
    default:
      return {};
  }
}

