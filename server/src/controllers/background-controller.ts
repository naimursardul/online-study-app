import { Request, Response } from "express";
import Background from "../models/background-model";
import { BaseQuestion } from "../models/question-model";
import { IPopulatedData } from "../type/type";

// Create Background
export const createBackground = async (req: Request, res: Response) => {
  try {
    const { name, level } = req.body;

    if (!name || !level) {
      res.status(400).json({
        success: false,
        message: "Name and level are required.",
        data: null,
      });
      return;
    }

    const existing = await Background.findOne({ name, level });
    if (existing) {
      res.status(400).json({
        success: false,
        message: "Background already exists for this level.",
        data: null,
      });
      return;
    }

    const newBackground = new Background({ name, level });
    await newBackground.save();

    res.status(201).json({
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

// Get All Backgrounds (with optional level filter)
export const getAllBackgrounds = async (req: Request, res: Response) => {
  try {
    const { level } = req.query;
    const filter = level ? { level } : {};

    const backgrounds = await Background.find(filter).populate("level", "name");

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
    const background = await Background.findById(id).populate("level", "name");

    if (!background) {
      res.status(404).json({
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

// Update Background and related BaseQuestions
export const updateBackground = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const background = await Background.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).populate("level", "name");

    if (!background) {
      res.status(404).json({
        success: false,
        message: "Background not found.",
        data: null,
      });
      return;
    }

    const questions = await BaseQuestion.find({ backgroundId: id });
    for (const question of questions) {
      //  Background update in Question
      const index = question.backgroundId.findIndex(
        (bgId) => bgId.toString() === id
      );
      if (index !== -1) {
        question.background[index] = background.name;
      }

      //  Level update in Question
      if (
        typeof background.level === "object" &&
        "name" in background.level &&
        "_id" in background.level
      ) {
        const level = background.level as IPopulatedData;

        question.level = level.name;
        question.levelId = level._id.toString();
      }
      await question.save();
    }

    res.status(200).json({
      success: true,
      message: "Background updated successfully and questions synced.",
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
      res.status(404).json({
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
