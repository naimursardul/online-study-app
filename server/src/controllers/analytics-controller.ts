import { Request, Response } from "express";
import {
  getDashboardSummary,
  getPerformanceGraph,
  getWeakTopics,
} from "../services/analytics.service";

// =========================================
// GET WEAK TOPICS
// =========================================

export const weakTopicsController = async (req: Request, res: Response) => {
  try {
    const { u_id } = req.params;

    const limit = Number(req.query.limit) || 5;

    const data = await getWeakTopics(String(u_id), limit);

    res.status(200).json({
      message: "Weak topics retrieved successfully",
      success: true,
      data,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
    });
    return;
  }
};

// =========================================
// DASHBOARD SUMMARY
// =========================================

export const dashboardController = async (req: Request, res: Response) => {
  try {
    const { u_id } = req.params;

    const data = await getDashboardSummary(String(u_id));

    res.status(200).json({
      message: "Dashboard data retrived.",
      success: true,
      data,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      data: [],
      success: false,
      message: error.message,
    });
    return;
  }
};

// =========================================
// PERFORMANCE GRAPH
// =========================================

// controller
export const performanceGraphController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { u_id } = req.params;
    const limit = Number(req.query.limit) || 20;
    const subjectId = req.query.subjectId as string | undefined;

    console.log("Subject filter:", subjectId);
    const data = await getPerformanceGraph(String(u_id), limit, subjectId);

    res.status(200).json({
      message: "Graph data retrieved successfully.",
      success: true,
      data,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
    });
    return;
  }
};
