import { Request, Response } from "express";
import {
  getDashboardStats,
  getPerformanceGraph,
  getSubjectPerformance,
  getWeakTopics,
} from "../services/analytics.service";
import { IUser } from "../type/type";
import mongoose from "mongoose";

// =========================================
// GET WEAK TOPICS
// =========================================

export const weakTopicsController = async (req: Request, res: Response) => {
  try {
    const user = req?.user as IUser & { _id: mongoose.Types.ObjectId };
    const limit = Number(req.query.limit) || 5;
    const subjectId = req.query.subjectId as string | undefined;

    const data = await getWeakTopics(String(user?._id), limit, subjectId);

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
    const u_id = (req.user as IUser & { _id: string })?._id;
    const { subjectId } = req.query;

    console.log(subjectId);
    const data = await getDashboardStats(u_id, subjectId as string | undefined);

    res.status(200).json({
      success: true,
      data,
    });
    return;
  } catch (error: any) {
    console.error("getDashboardStatsController Error:", error.message);
    res.status(500).json({ message: error.message });
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
    const u_id = (req.user as IUser & { _id: string })?._id;

    if (!u_id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = await getSubjectPerformance(u_id);

    res.status(200).json({
      success: true,
      data,
    });
    return;
  } catch (error: any) {
    console.error("getSubjectPerformanceController Error:", error.message);
    res.status(500).json({ message: error.message });
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
    const user = req?.user as IUser & { _id: mongoose.Types.ObjectId };
    const limit = Number(req.query.limit) || 20;
    const subjectId = req.query.subjectId as string | undefined;

    const data = await getPerformanceGraph(String(user?._id), limit, subjectId);

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
