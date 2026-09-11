import { Router } from "express";
import { getMasterQuestionData } from "../controllers/master-question-data-controller";
import { optionalAuth } from "../middlewares/session";

const router = Router();

// optionalAuth, not requireAuth: this is the app's public bootstrap request, but
// it also returns the caller's own collections when there is a valid session.
router.get("/", optionalAuth, getMasterQuestionData);

export default router;
