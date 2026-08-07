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
  createAnswerSchema,
  createExamSchema,
} from "../validations/exam.validation";

const router = express.Router();

// Static routes first
router.post("/generate", requireAuth, validate(createExamSchema), createExam);
router.get("/list", requireAuth, listExams);
router.post(
  "/create-answer",
  requireAuth,
  validate(createAnswerSchema),
  createAnswer,
);

// Dynamic routes last
router.get("/:examId", requireAuth, getExam);
router.delete("/:examId", requireAuth, removeExam);

export default router;
