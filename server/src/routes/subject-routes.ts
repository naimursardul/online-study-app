import express from "express";
import {
  createSubject,
  getAllSubjects,
  getSingleSubject,
  getSubjectImpact,
  updateSubject,
  deleteSubject,
} from "../controllers/subject-controller";
import { validate } from "../middlewares/validate";
import { adminOnly } from "../middlewares/require-role";
import { objectIdParam } from "../validations/common";
import {
  subjectListSchema,
  subjectUpdateSchema,
} from "../validations/crud.validation";

const router = express.Router();

// Reads stay public (the client's master-data cache is unauthenticated); writes
// are admin-only.

// Route to create a new subject
router.post("/create", ...adminOnly, createSubject);

// Route to get all subjects (with optional level or background filter)
router.get("/", validate(subjectListSchema), getAllSubjects);

// What deleting this subject would remove. Before /:id so the literal wins.
router.get(
  "/:id/impact",
  ...adminOnly,
  validate(objectIdParam),
  getSubjectImpact,
);

// Route to get a single subject by its ID
router.get("/:id", getSingleSubject);

// Route to update an existing subject and related BaseQuestions
router.put("/:id", ...adminOnly, validate(subjectUpdateSchema), updateSubject);

// Route to delete a subject, its chapters, topics and their questions
router.delete("/:id", ...adminOnly, validate(objectIdParam), deleteSubject);

export default router;
