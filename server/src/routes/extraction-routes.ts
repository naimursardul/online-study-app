import express from "express";
import { extractQuestionsHandler } from "../controllers/extract-question-controller";
import { adminOnly } from "../middlewares/require-role";
import { extractionLimiter } from "../middlewares/rate-limit";

const router = express.Router();

// Uploads a file to the AI extractor, which costs tokens on every call —
// admin-only, plus a user-keyed limiter: each call buffers up to 4×20MB in
// memory and makes a billable Gemini call, so generalLimiter's 300/15min
// ceiling is not a real control here. Fails closed like the other money
// endpoints.
router.post(
  "/extract-questions",
  ...adminOnly,
  extractionLimiter,
  extractQuestionsHandler,
);

export default router;
