import { Request, Response } from "express";
import Year from "../models/year-model";
import { BaseQuestion } from "../models/question-model";

// Create Year
export const createYear = async (req: Request, res: Response) => {
  try {
    const { name, levelId } = req.body;

    if (!name || !levelId) {
      res.status(400).json({
        success: false,
        message: "Name and levelId are required.",
        data: null,
      });
      return;
    }

    const existing = await Year.findOne({ name, levelId });
    if (existing) {
      res.status(409).json({
        success: false,
        message: "Year already exists for this level.",
        data: null,
      });
      return;
    }

    const newYear = new Year({ name, levelId });
    await newYear.save();

    res.status(201).json({
      success: true,
      message: "Year created successfully.",
      data: newYear,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// Get All Years
export const getAllYears = async (req: Request, res: Response) => {
  try {
    const { levelId, search } = req.query;

    const filter: any = {};
    if (levelId) filter.levelId = levelId;
    if (search) filter.name = { $regex: search, $options: "i" };

    const years = await Year.find(filter)
      .populate("levelId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Years fetched successfully.",
      data: years,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// Get Single Year
export const getSingleYear = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const year = await Year.findById(id).populate("levelId", "name");

    if (!year) {
      res.status(404).json({
        success: false,
        message: "Year not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Year fetched successfully.",
      data: year,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// Update Year
export const updateYear = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const year = await Year.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!year) {
      res.status(404).json({
        success: false,
        message: "Year not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Year updated successfully.",
      data: year,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// Delete Year — every question keeps its other pairs, minus this one
export const deleteYear = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Year.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Year not found.",
        data: null,
      });
      return;
    }

    // Pull this year's pairs off every question that cited it
    await BaseQuestion.updateMany(
      { "recordId.yearId": id },
      { $pull: { recordId: { yearId: id } } },
    );

    res.status(200).json({
      success: true,
      message: "Year deleted successfully.",
      data: deleted,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};
