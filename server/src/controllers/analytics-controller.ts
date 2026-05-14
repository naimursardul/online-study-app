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

    const data = await getWeakTopics(u_id, limit);

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

    const data = await getDashboardSummary(u_id);

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

export const performanceGraphController = async (
  req: Request,
  res: Response
) => {
  try {
    const { u_id } = req.params;

    const limit = Number(req.query.limit) || 20;

    const data = await getPerformanceGraph(u_id, limit);

    res.status(200).json({
      message: "Graph data retrived successfully.",
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
