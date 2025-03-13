/*
 * Title: Question Routes
 * Description: All question routes.
 * Author: Naimur Rahman
 * Date: 2024-11-07
 *
 */

import express from "express";
import {
  createQuestion,
  deleteSingleQuestion,
  getAllQuestions,
  getSingleQuestion,
  updateSingleQuestion,
} from "../controllers/questionControllers.js";
import { checkAuth } from "../middleware.js";

const router = express.Router();

// create question
router.post("/create", checkAuth, createQuestion);

// get all questions
router.get("/", getAllQuestions);

// get single question
router.get("/:examName", getSingleQuestion);

// get single question
router.put("/:examName", updateSingleQuestion);

// delete single question
router.delete("/:examName", deleteSingleQuestion);

export default router;
