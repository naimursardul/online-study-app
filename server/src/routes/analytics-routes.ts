import express from "express";
import {
  dashboardController,
  performanceGraphController,
  weakTopicsController,
} from "../controllers/analytics-controller";

const router = express.Router();

router.get("/weak-topics/:u_id", weakTopicsController);
router.get("/dashboard/:u_id", dashboardController);
router.get("/performance-graph/:u_id", performanceGraphController);

export default router;
