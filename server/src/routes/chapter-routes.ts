import express from "express";
import {
  createChapter,
  getAllChapters,
  getSingleChapter,
  updateChapter,
  deleteChapter,
} from "../controllers/chapter-controller";
import { validate } from "../middlewares/validate";
import {
  chapterListSchema,
  chapterUpdateSchema,
} from "../validations/crud.validation";

const router = express.Router();

// Create a new Chapter
router.post("/create", createChapter);

// Get all Chapters (with optional level, background, subject filters)
router.get("/", validate(chapterListSchema), getAllChapters);

// Get a single Chapter by ID
router.get("/:id", getSingleChapter);

// Update a Chapter by ID
router.put("/:id", validate(chapterUpdateSchema), updateChapter);

// Delete a Chapter by ID
router.delete("/:id", deleteChapter);

export default router;
