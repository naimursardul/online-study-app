import express from "express";
import {
  createChapter,
  getAllChapters,
  getChapterImpact,
  getSingleChapter,
  updateChapter,
  deleteChapter,
} from "../controllers/chapter-controller";
import { validate } from "../middlewares/validate";
import { adminOnly } from "../middlewares/require-role";
import { objectIdParam } from "../validations/common";
import {
  chapterListSchema,
  chapterUpdateSchema,
} from "../validations/crud.validation";

const router = express.Router();

// Reads stay public (the client's master-data cache is unauthenticated); writes
// are admin-only.

// Create a new Chapter
router.post("/create", ...adminOnly, createChapter);

// Get all Chapters (with optional level, background, subject filters)
router.get("/", validate(chapterListSchema), getAllChapters);

// What deleting this chapter would remove. Before /:id so the literal wins.
router.get(
  "/:id/impact",
  ...adminOnly,
  validate(objectIdParam),
  getChapterImpact,
);

// Get a single Chapter by ID
router.get("/:id", getSingleChapter);

// Update a Chapter by ID
router.put("/:id", ...adminOnly, validate(chapterUpdateSchema), updateChapter);

// Delete a Chapter, its topics and their questions
router.delete("/:id", ...adminOnly, validate(objectIdParam), deleteChapter);

export default router;
