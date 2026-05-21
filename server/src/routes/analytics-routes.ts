import express from "express";
import {
  getDashboardStatsController,
  getSubjectPerformanceController,
  performanceGraphController,
  weakTopicsController,
} from "../controllers/analytics-controller";
import { requireAuth } from "../controllers/auth-controller";

const router = express.Router();

router.get("/weak-topics", requireAuth, weakTopicsController);
router.get("/dashboard-stats", requireAuth, getDashboardStatsController);
router.get(
  "/subjects-performance",
  requireAuth,
  getSubjectPerformanceController,
);
router.get("/performance-graph", requireAuth, performanceGraphController);

export default router;
