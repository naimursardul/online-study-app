import express from "express";
import {
  getAllPrompts,
  getSinglePrompt,
  updatePrompt,
  resetPrompt,
} from "../controllers/prompt-controller";
import { validate } from "../middlewares/validate";
import { adminOnly } from "../middlewares/require-role";
import {
  promptTypeParamSchema,
  promptUpdateSchema,
} from "../validations/prompt.validation";

const router = express.Router();

// The prompts encode the extraction contract, so reads are admin-only too —
// not just the writes.

// Get All Prompts (lazily seeds missing defaults)
router.get("/", ...adminOnly, getAllPrompts);

// Get Single Prompt by question type
router.get(
  "/:questionType",
  ...adminOnly,
  validate(promptTypeParamSchema),
  getSinglePrompt
);

// Update Prompt by question type
router.put(
  "/:questionType",
  ...adminOnly,
  validate(promptUpdateSchema),
  updatePrompt
);

// Reset Prompt to the hardcoded default
router.post(
  "/:questionType/reset",
  ...adminOnly,
  validate(promptTypeParamSchema),
  resetPrompt
);

export default router;
