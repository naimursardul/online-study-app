import { Router } from "express";
import {
  bulkCreateQuestions,
  createQuestion,
  deleteSingleQuestion,
  getAllQuestions,
  getQuestionFacets,
  getSingleQuestion,
  updateSingleQuestion,
} from "../controllers/question-controller";
import { validate } from "../middlewares/validate";
import { adminOnly } from "../middlewares/require-role";
import { optionalAuth } from "../middlewares/session";
import { objectIdParam } from "../validations/common";
import {
  bulkCreateQuestionSchema,
  createQuestionSchema,
  listQuestionSchema,
  updateQuestionSchema,
} from "../validations/question.validation";

const router = Router();

// Reads stay public — the question bank is browsable without an account — but
// optionalAuth tells the controller whether a session exists, so answer fields
// can be projected out for anonymous callers. Writing questions is admin-only.

// Create question
router.post("/create", ...adminOnly, validate(createQuestionSchema), createQuestion);

// Get all questions
router.get(
  "/",
  optionalAuth,
  validate(listQuestionSchema),
  getAllQuestions,
);

// Which slug combinations actually have questions — the sitemap's data
// source. MUST sit above /:id or "facets" is captured as an id. Public, no
// params to validate, served under the existing generalLimiter and cached in
// Redis by the controller.
router.get("/facets", getQuestionFacets);

// Get single question by exam name
router.get("/:id", optionalAuth, validate(objectIdParam), getSingleQuestion);

// // Update single question
router.put(
  "/:id",
  ...adminOnly,
  validate(updateQuestionSchema),
  updateSingleQuestion,
);

// // Delete single question
router.delete(
  "/:id",
  ...adminOnly,
  validate(objectIdParam),
  deleteSingleQuestion,
);

router.post(
  "/bulk-create",
  ...adminOnly,
  validate(bulkCreateQuestionSchema),
  bulkCreateQuestions,
);

export default router;
