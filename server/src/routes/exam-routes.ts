import express from "express";
import {
  createAnswer,
  createExam,
  listExams,
  getExam,
  removeExam,
} from "../controllers/exam-controller";
import { requireAuth } from "../controllers/auth-controller";
import { validate } from "../middlewares/validate";
import {
  examGenerateLimiter,
  examSubmitLimiter,
} from "../middlewares/rate-limit";
import {
  createAnswerSchema,
  createExamSchema,
  examIdParam,
} from "../validations/exam.validation";

const router = express.Router();

// Static routes first. The write limiters are user-keyed and fail closed:
// generate runs a random-sample aggregation, create-answer grades and writes
// three documents.
router.post(
  "/generate",
  requireAuth,
  examGenerateLimiter,
  validate(createExamSchema),
  createExam,
);
router.get("/list", requireAuth, listExams);
router.post(
  "/create-answer",
  requireAuth,
  examSubmitLimiter,
  validate(createAnswerSchema),
  createAnswer,
);

// Dynamic routes last
router.get("/:examId", requireAuth, validate(examIdParam), getExam);
router.delete("/:examId", requireAuth, validate(examIdParam), removeExam);

export default router;
