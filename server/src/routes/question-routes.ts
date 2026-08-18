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
import { adminOnly } from "../middlewares/require-role";
import {
  bulkCreateQuestionSchema,
  createQuestionSchema,
  listQuestionSchema,
  updateQuestionSchema,
} from "../validations/question.validation";

const router = Router();

// Reads stay public — the question bank is browsable without an account. Writing
// questions is admin-only.

// Create question
router.post("/create", ...adminOnly, validate(createQuestionSchema), createQuestion);

// Get all questions
router.get("/", validate(listQuestionSchema), getAllQuestions);

// Get single question by exam name
router.get("/:id", getSingleQuestion);

// // Update single question
router.put(
  "/:id",
  ...adminOnly,
  validate(updateQuestionSchema),
  updateSingleQuestion,
);

// // Delete single question
router.delete("/:id", ...adminOnly, deleteSingleQuestion);

router.post(
  "/bulk-create",
  ...adminOnly,
  validate(bulkCreateQuestionSchema),
  bulkCreateQuestions,
);

export default router;
