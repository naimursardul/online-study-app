import { z } from "zod";
import { QUESTION_TYPE_CODES } from "../utils/question-types";

// There is exactly one prompt document per question type, so the type code is
// the natural key — no ObjectId params anywhere in this feature.
const questionTypeParam = z.object({
  params: z.object({ questionType: z.enum(QUESTION_TYPE_CODES) }),
});

export const promptTypeParamSchema = questionTypeParam;

// The prompt is treated as an opaque string: quotes, backticks and LaTeX
// backslashes are legitimate content, and JSON handles their escaping at
// transport. Only its size is bounded (defaults are ~10-15KB).
export const promptUpdateSchema = z.object({
  ...questionTypeParam.shape,
  body: z.object({
    prompt: z.string().min(1, "Prompt cannot be empty.").max(100_000),
  }),
});
