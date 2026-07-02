import { Request, Response } from "express";
import {
  getDashboardStats,
  getPerformanceGraph,
  getSubjectPerformance,
  getWeakTopics,
} from "../services/analytics.service";

// =========================================
// GET WEAK TOPICS
// =========================================

export const weakTopicsController = async (req: Request, res: Response) => {
  try {
    const user = req?.user;
    const limit = Number(req.query.limit) || 5;
    const subjectId = req.query.subjectId as string | undefined;

    const userId = req.user?._id;
    const data = await getWeakTopics(String(userId), limit, subjectId);

    res
      .status(200)
      .json({ success: true, data, message: "Data retrived successfully." });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
};

// =========================================
// DASHBOARD SUMMARY
// =========================================
export const getDashboardStatsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?._id;
    const { subjectId } = req.query;

    console.log(subjectId);

    if (!userId) {
      res.status(200).json({ success: false, message: "Unauthorized" });
      return;
    }
    const data = await getDashboardStats(
      userId,
      subjectId as string | undefined,
    );

    res.status(200).json({
      success: true,
      data,
    });
    return;
  } catch (error: any) {
    console.error("getDashboardStatsController Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
    return;
  }
};

// ==========================
// Subject Performance
// ==========================
export const getSubjectPerformanceController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(200).json({ success: false, message: "Unauthorized" });
      return;
    }

    const data = await getSubjectPerformance(userId);

    res.status(200).json({
      success: true,
      data,
    });
    return;
  } catch (error: any) {
    console.error("getSubjectPerformanceController Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
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
    const userId = req.user?._id;
    const limit = Number(req.query.limit) || 20;
    const subjectId = req.query.subjectId as string | undefined;

    const data = await getPerformanceGraph(String(userId), limit, subjectId);

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
