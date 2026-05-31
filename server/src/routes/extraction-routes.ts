import express from "express";
import { extractQuestionsHandler } from "../controllers/extract-question-controller";

const router = express.Router();

router.post("/extract-questions", extractQuestionsHandler);

export default router;
