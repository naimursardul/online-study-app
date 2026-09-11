import { z } from "zod";
import { objectId, safeSearch } from "./common";
import { QUESTION_TYPE_CODES } from "../utils/question-types";

// Collections are user-scoped: every route resolves the owner from the
// session, so params only ever need to be well-formed ids.

export const createCollectionSchema = z.object({
  body: z.object({
    name: safeSearch,
  }),
});

export const collectionIdParam = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const collectionQuestionsParam = z.object({
  params: z.object({
    collectionId: objectId,
  }),
});

export const savedStatusParam = z.object({
  params: z.object({
    questionId: objectId,
  }),
});

// A5.1: the toggle writes a SavedQuestion row into `collectionId`, so the
// schema pins every id it touches. The ownership check itself lives in the
// controller (schema can't know about req.user).
export const toggleSavedQuestionSchema = z.object({
  body: z.object({
    collectionId: objectId,
    questionId: objectId,
    questionType: z.enum(QUESTION_TYPE_CODES),
    subjectId: objectId.optional(),
    chapterId: objectId.optional(),
    topicId: objectId.optional(),
  }),
});
