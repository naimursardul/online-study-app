import express from "express";
import { extractQuestionsHandler } from "../controllers/extract-question-controller";
import { adminOnly } from "../middlewares/require-role";

const router = express.Router();

// Uploads a file to the AI extractor, which costs tokens on every call — admin-only.
router.post("/extract-questions", ...adminOnly, extractQuestionsHandler);

export default router;
