import express from "express";
import {
  createSubject,
  getAllSubjects,
  getSingleSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subject-controller";

const router = express.Router();

// Route to create a new subject
router.post("/create", createSubject);

// Route to get all subjects (with optional level or background filter)
router.get("/", getAllSubjects);

// Route to get a single subject by its ID
router.get("/:id", getSingleSubject);

// Route to update an existing subject and related BaseQuestions
router.put("/:id", updateSubject);

// Route to delete a subject by its ID
router.delete("/:id", deleteSubject);

export default router;
