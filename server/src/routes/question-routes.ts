import { Router } from "express";
import {
  bulkCreateQuestions,
  createQuestion,
  deleteSingleQuestion,
  getAllQuestions,
  getSingleQuestion,
  updateSingleQuestion,
} from "../controllers/question-controller";
import { validate } from "../middlewares/validate";
import {
  bulkCreateQuestionSchema,
  createQuestionSchema,
  listQuestionSchema,
  updateQuestionSchema,
} from "../validations/question.validation";

const router = Router();

// Create question
router.post("/create", validate(createQuestionSchema), createQuestion);

// Get all questions
router.get("/", validate(listQuestionSchema), getAllQuestions);

// Get single question by exam name
router.get("/:id", getSingleQuestion);

// // Update single question
router.put("/:id", validate(updateQuestionSchema), updateSingleQuestion);

// // Delete single question
router.delete("/:id", deleteSingleQuestion);

router.post(
  "/bulk-create",
  validate(bulkCreateQuestionSchema),
  bulkCreateQuestions,
);

export default router;
