import { Request, Response } from "express";
import Background from "../models/background-model";
import { BaseQuestion } from "../models/question-model";
import { IPopulatedData } from "../type/type";

// Create Background
export const createBackground = async (req: Request, res: Response) => {
  try {
    const { name, levelId } = req.body;

    if (!name || !levelId) {
      res.status(200).json({
        success: false,
        message: "Name and levelId are required.",
        data: null,
      });
      return;
    }

    const existing = await Background.findOne({
      name,
      levelId,
    });

    if (existing) {
      res.status(200).json({
        success: false,
        message: "Background already exists for this level.",
        data: null,
      });
      return;
    }

    const newBackground = new Background({
      name,
      levelId,
    });

    await newBackground.save();

    res.status(200).json({
      success: true,
      message: "Background created successfully.",
      data: newBackground,
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

// Get All Backgrounds
export const getAllBackgrounds = async (req: Request, res: Response) => {
  try {
    const { levelId, search } = req.query;

    const filter: any = {};

    if (levelId) filter.levelId = levelId;
    // ✅ SEARCH IMPLEMENTATION
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive
    }

    const backgrounds = await Background.find(filter).populate(
      "levelId",
      "name",
    );

    res.status(200).json({
      success: true,
      message: "Backgrounds fetched successfully.",
      data: backgrounds,
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

// Get Single Background
export const getSingleBackground = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const background = await Background.findById(id).populate(
      "levelId",
      "name",
    );

    if (!background) {
      res.status(200).json({
        success: false,
        message: "Background not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Background fetched successfully.",
      data: background,
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

// Update Background
export const updateBackground = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const background = await Background.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).populate("levelId", "name");

    if (!background) {
      res.status(200).json({
        success: false,
        message: "Background not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Background updated successfully.",
      data: background,
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

// Delete Background
export const deleteBackground = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Background.findByIdAndDelete(id);

    if (!deleted) {
      res.status(200).json({
        success: false,
        message: "Background not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Background deleted successfully.",
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
