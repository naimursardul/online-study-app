import express from "express";
import {
  createAnswer,
  createExam,
  listExams,
  getExam,
  removeExam,
} from "../controllers/exam-controller";
import { requireAuth } from "../controllers/auth-controller";

const router = express.Router();

// Static routes first
router.post("/generate", requireAuth, createExam);
router.get("/list", requireAuth, listExams);
router.post("/create-answer", requireAuth, createAnswer);

// Dynamic routes last
router.get("/:examId", requireAuth, getExam);
router.delete("/:examId", requireAuth, removeExam);

export default router;
