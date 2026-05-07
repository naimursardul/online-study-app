import express from "express";
import { createAnswer } from "../controllers/exam-controller";

const router = express.Router();

router.post("/create-answer", createAnswer);

export default router;
