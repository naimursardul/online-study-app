import type { ICQ, IMCQ, IWritten } from "@/types/types";
import { familyOf, subQuestionCountOf, subQuestionLabelsOf } from "./questionTypes";

// Any authored/extracted question, whatever its shape family.
export type IAnyQuestion = IMCQ | ICQ | IWritten;

export interface IValidationError {
  field: string;
  message: string;
}

export interface IQuestionValidationResult {
  valid: boolean;
  errors: IValidationError[];
}

function validateBase(q: IAnyQuestion): IValidationError[] {
  const errors: IValidationError[] = [];

  if (!q.levelId)
    errors.push({ field: "levelId", message: "Level is required." });
  if (!q.backgroundId?.length)
    errors.push({
      field: "backgroundId",
      message: "At least one background is required.",
    });
  if (!q.subjectId)
    errors.push({ field: "subjectId", message: "Subject is required." });
  if (!q.chapterId)
    errors.push({ field: "chapterId", message: "Chapter is required." });
  if (!q.topicId)
    errors.push({ field: "topicId", message: "Topic is required." });
  if (!q.difficulty)
    errors.push({ field: "difficulty", message: "Difficulty is required." });
  if (!q.marks || q.marks <= 0)
    errors.push({ field: "marks", message: "Marks must be greater than 0." });
  if (!q.timeRequired || q.timeRequired <= 0)
    errors.push({
      field: "timeRequired",
      message: "Time required must be greater than 0.",
    });

  return errors;
}

function validateMCQ(q: IMCQ): IValidationError[] {
  const errors: IValidationError[] = [];

  if (!q.question?.trim())
    errors.push({ field: "question", message: "Question text is required." });
  if (!q.options || q.options.length !== 4)
    errors.push({
      field: "options",
      message: "Exactly 4 options are required.",
    });
  else if ((q.options || []).some((o) => typeof o !== "string" || !o?.trim()))
    errors.push({ field: "options", message: "All options must have text." });
  if (q.correctAnswer === "" || q.correctAnswer === undefined)
    errors.push({
      field: "correctAnswer",
      message: "Correct answer is required.",
    });
  if (!q.explanation?.trim())
    errors.push({ field: "explanation", message: "Explanation is required." });

  return errors;
}

// CQ needs 4 sub-questions, Math-CQ needs 3 — the count comes from the registry.
function validateCQ(q: ICQ): IValidationError[] {
  const errors: IValidationError[] = [];
  const expected = subQuestionCountOf(q.questionType);
  const labels = subQuestionLabelsOf(q.questionType);

  if (!q.statement?.trim())
    errors.push({ field: "statement", message: "Statement is required." });

  if (!q.subQuestions || q.subQuestions.length !== expected) {
    errors.push({
      field: "subQuestions",
      message: `Exactly ${expected} sub-questions are required.`,
    });
  } else {
    q.subQuestions.forEach((sq, i) => {
      const label = labels[i] ?? String(i + 1);
      if (!sq.question?.trim())
        errors.push({
          field: `subQuestion${label}`,
          message: `Sub-question ${label}: question is required.`,
        });
      if (!sq.answer?.trim())
        errors.push({
          field: `subQuestion${label}`,
          message: `Sub-question ${label}: answer is required.`,
        });
      if (!sq.chapterId)
        errors.push({
          field: `subQuestion${label}`,
          message: `Sub-question ${label}: chapter is required.`,
        });
      if (!sq.topicId)
        errors.push({
          field: `subQuestion${label}`,
          message: `Sub-question ${label}: topic is required.`,
        });
    });
  }

  return errors;
}

// SQ / EQ / WQ
function validateWritten(q: IWritten): IValidationError[] {
  const errors: IValidationError[] = [];

  if (!q.question?.trim())
    errors.push({ field: "question", message: "Question text is required." });
  if (!q.answer?.trim())
    errors.push({ field: "answer", message: "Answer is required." });

  return errors;
}

export function validateQuestion(q: IAnyQuestion): IQuestionValidationResult {
  const baseErrors = validateBase(q);

  const family = familyOf(q.questionType);
  const typeErrors =
    family === "mcq"
      ? validateMCQ(q as IMCQ)
      : family === "cq"
        ? validateCQ(q as ICQ)
        : family === "simple"
          ? validateWritten(q as IWritten)
          : [
              {
                field: "questionType",
                message: `Unknown question type "${q.questionType}".`,
              },
            ];

  const errors = [...baseErrors, ...typeErrors];
  return { valid: errors.length === 0, errors };
}

export function validateAll(
  questions: IAnyQuestion[],
): IQuestionValidationResult[] {
  return questions.map(validateQuestion);
}
