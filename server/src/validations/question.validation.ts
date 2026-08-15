import { z } from "zod";
import { objectId, objectIdList, safeSearch, safeStringList } from "./common";

const baseQuestion = {
  levelId: objectId,
  subjectId: objectId,
  chapterId: objectId,
  topicId: objectId,
  backgroundId: z.array(objectId).min(1),
  recordId: z.array(objectId).min(1),
  marks: z.coerce.number().int().positive().max(100),
  timeRequired: z.coerce.number().int().positive().max(600),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
};

const mcq = z.object({
  ...baseQuestion,
  questionType: z.literal("MCQ"),
  question: z.string().trim().min(1),
  // The model enforces exactly 4 non-blank options (question-model.ts).
  options: z.array(z.string().trim().min(1)).length(4),
  correctAnswer: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
});

const cq = z.object({
  ...baseQuestion,
  questionType: z.literal("CQ"),
  statement: z.string().trim().min(1),
  subQuestions: z
    .array(
      z.object({
        questionNo: z.string().trim().min(1),
        question: z.string().trim().min(1),
        answer: z.string().trim().min(1),
        chapterId: objectId,
        topicId: objectId,
      }),
    )
    .length(4),
});

const question = z.discriminatedUnion("questionType", [mcq, cq]);

export const createQuestionSchema = z.object({
  // `record` is required by the controller but is not a schema field; allow it
  // through without persisting expectations.
  body: z.intersection(
    question,
    z.object({ record: z.array(z.unknown()).min(1).optional() }),
  ),
});

// Previously an unvalidated array went straight into insertMany with no cap.
export const bulkCreateQuestionSchema = z.object({
  body: z.object({
    questions: z.array(question).min(1).max(200),
  }),
});

export const updateQuestionSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      questionType: z.enum(["MCQ", "CQ"]),
      ...baseQuestion,
      question: z.string().trim().min(1),
      options: z.array(z.string().trim().min(1)).length(4),
      correctAnswer: z.string().trim().min(1),
      explanation: z.string().trim().min(1),
      statement: z.string().trim().min(1),
      subQuestions: z.array(
        z.object({
          questionNo: z.string().trim().min(1),
          question: z.string().trim().min(1),
          answer: z.string().trim().min(1),
          chapterId: objectId,
          topicId: objectId,
        }),
      ),
    })
    .partial()
    .strict()
    // The controller requires it to match the stored doc's type.
    .refine((b) => b.questionType !== undefined, {
      message: "questionType is required",
    }),
});

export const listQuestionSchema = z.object({
  query: z
    .object({
      questionType: z.enum(["MCQ", "CQ"]),
      levelId: objectId,
      backgroundId: objectIdList.optional(),
      subjectId: objectId.optional(),
      chapterId: objectIdList.optional(),
      topicId: objectIdList.optional(),
      recordId: objectIdList.optional(),
      // institution/year live on the Record model as free-form strings, so they
      // are resolved to recordIds in the controller.
      institution: safeStringList.optional(),
      year: safeStringList.optional(),
      difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
      search: safeSearch.optional(),
      // Pagination is opt-in: without `page` the whole result set is returned,
      // which existing callers (board papers, exam generation) depend on.
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(50).optional(),
    })
    .strict(),
});
