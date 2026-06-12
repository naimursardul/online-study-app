import { Router } from "express";
import {
  bulkCreateQuestions,
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
router.get("/", getAllQuestions);

// Get single question by exam name
router.get("/:id", getSingleQuestion);

// // Update single question
router.put("/:id", updateSingleQuestion);

// // Delete single question
router.delete("/:id", deleteSingleQuestion);

router.post("/bulk-create", bulkCreateQuestions);

export default router;
