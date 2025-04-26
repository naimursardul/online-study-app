import express, { Router } from "express";
import {
  createQuestion,
  deleteSingleQuestion,
  getAllQuestions,
  getSingleQuestion,
  updateSingleQuestion,
} from "../controllers/question-controller";

const router = Router();

// Create question
router.post("/create", createQuestion);

// Get all questions
router.post("/", getAllQuestions);

// Get single question by exam name
router.get("/:id", getSingleQuestion);

// // Update single question
router.put("/:id", updateSingleQuestion);

// // Delete single question
router.delete("/:id", deleteSingleQuestion);

export default router;
