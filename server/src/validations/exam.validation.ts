import { z } from "zod";
import { objectId } from "./common";

const examName = z.string().trim().min(1).max(200);

export const createExamSchema = z.object({
  body: z.discriminatedUnion("examCategory", [
    z.object({
      examCategory: z.literal("personal"),
      examName,
      subjectId: objectId,
      topicIds: z.array(objectId).default([]),
      difficulty: z.enum(["Easy", "Medium", "Hard", "Mix"]),
      mode: z.enum(["random", "weak"]),
      size: z.number().int().min(1).max(100),
    }),
    z.object({
      examCategory: z.literal("record"),
      examName,
      subjectId: objectId,
      topicIds: z.array(objectId).default([]),
      filter: z.object({
        levelId: objectId,
        recordId: z.union([objectId, z.array(objectId).min(1)]),
      }),
    }),
  ]),
});

export const createAnswerSchema = z.object({
  body: z.object({
    examId: objectId,
    answers: z
      .array(
        z.object({
          questionId: objectId,
          givenAns: z.string(),
        }),
      )
      .min(1),
    timeTaken: z.number().int().nonnegative(),
  }),
});
