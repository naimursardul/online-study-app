import { Router } from "express";
import { getMasterQuestionData } from "../controllers/master-question-data-controller";

const router = Router();

router.get("/", getMasterQuestionData);

export default router;
