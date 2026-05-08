import express from "express";
import { createAnswer } from "../controllers/exam-controller";
import { checkAuth, requireAuth } from "../controllers/auth-controller";

const router = express.Router();

router.post("/create-answer", requireAuth, checkAuth, createAnswer);

export default router;
