import express from "express";
import {
  dashboardController,
  performanceGraphController,
  weakTopicsController,
} from "../controllers/analytics-controller";
import { requireAuth } from "../controllers/auth-controller";

const router = express.Router();

router.get("/weak-topics", requireAuth, weakTopicsController);
router.get("/dashboard", requireAuth, dashboardController);
router.get("/performance-graph", requireAuth, performanceGraphController);

export default router;
