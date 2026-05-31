import express from "express";
import { createAnswer } from "../controllers/exam-controller";
import { requireAuth } from "../controllers/auth-controller";

const router = express.Router();

router.post("/create-answer", requireAuth, createAnswer);

export default router;
