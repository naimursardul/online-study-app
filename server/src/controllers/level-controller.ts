import { Request, Response } from "express";
import Level from "../models/level-model";
import { BaseQuestion } from "../models/question-model";

// CREATE a new level
export const createLevel = async (req: Request, res: Response) => {
  try {
    const { name, details } = req.body;

    if (!name || !details) {
      res.status(400).json({
        success: false,
        message: "Both name and details are required.",
        data: null,
      });
      return;
    }

    const exists = await Level.findOne({ name });
    if (exists) {
      res.status(409).json({
        success: false,
        message: "Level with this name already exists.",
        data: null,
      });
      return;
    }

    const newLevel = new Level({ name, details });
    await newLevel.save();

    res.status(201).json({
      success: true,
      message: "Level created successfully.",
      data: newLevel,
    });
    return;
  } catch (error) {
    console.error("Create Level Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// READ all levels
export const getAllLevels = async (_req: Request, res: Response) => {
  try {
    const levels = await Level.find();
    res.status(200).json({
      success: true,
      message: "Levels fetched successfully.",
      data: levels,
    });
    return;
  } catch (error) {
    console.error("Get Levels Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// READ single level by name
export const getSingleLevel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const level = await Level.findById(id);

    if (!level) {
      res.status(404).json({
        success: false,
        message: "Level not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Level found.",
      data: level,
    });
    return;
  } catch (error) {
    console.error("Get Level Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// UPDATE level by name
export const updateLevel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Level.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      res.status(404).json({
        success: false,
        message: "Level not found.",
        data: null,
      });
      return;
    }

    const questions = await BaseQuestion.find({ levelId: id });
    for (const question of questions) {
      //  Level update in Question
      question.level = updated.name;
      await question.save();
    }

    res.status(200).json({
      success: true,
      message: "Level updated successfully.",
      data: updated,
    });
    return;
  } catch (error) {
    console.error("Update Level Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// DELETE level by name
export const deleteLevel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Level.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Level not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Level deleted successfully.",
      data: null,
    });
    return;
  } catch (error) {
    console.error("Delete Level Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};
