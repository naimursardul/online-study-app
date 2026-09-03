/*
 * Title: Question Type Registry
 * Description: Single source of truth for the supported question types.
 *              Types collapse into three shape families:
 *                - mcq    -> question + 4 options + correctAnswer + explanation
 *                - cq     -> statement + N subQuestions (CQ = 4, Math-CQ = 3)
 *                - simple -> question + answer (SQ, EQ, WQ are identical shapes)
 *              Adding a type means adding one entry here plus a discriminator in
 *              question-model.ts and a member of the zod union in
 *              validations/question.validation.ts.
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

interface IQuestionTypeConfig {
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

export function isQuestionTypeCode(value: unknown): value is QuestionTypeCode {
  return (
    typeof value === "string" &&
    (QUESTION_TYPE_CODES as readonly string[]).includes(value)
  );
}

export function familyOf(code: string): QuestionFamily | undefined {
  return isQuestionTypeCode(code) ? QUESTION_TYPES[code].family : undefined;
}

export function subQuestionCountOf(code: string): number | undefined {
  return isQuestionTypeCode(code)
    ? QUESTION_TYPES[code].subQuestionCount
    : undefined;
}

// The field a question of this type is deduplicated by.
export function primaryTextFieldOf(code: string): "question" | "statement" {
  return familyOf(code) === "cq" ? "statement" : "question";
}

// The field a text search runs against for this type.
export function searchTextFieldOf(code: string): string {
  return familyOf(code) === "cq" ? "subQuestions.question" : "question";
}
