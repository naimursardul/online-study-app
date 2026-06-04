import { Request, Response } from "express";
import Chapter from "../models/chapter-model";
import { BaseQuestion } from "../models/question-model";
import { IPopulatedData } from "../type/type";

// Create Chapter
export const createChapter = async (req: Request, res: Response) => {
  try {
    const { name, levelId, backgroundId, subjectId } = req.body;

    if (!name || !levelId || !backgroundId || !subjectId) {
      res.status(400).json({
        success: false,
        message: "Name, levelId, backgroundId, and subjectId are required.",
        data: null,
      });
      return;
    }

    const existing = await Chapter.findOne({
      name,
      levelId,
      backgroundId,
      subjectId,
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message:
          "Chapter already exists with this level, background, and subject.",
        data: null,
      });
      return;
    }

    const newChapter = new Chapter({
      name,
      levelId,
      backgroundId,
      subjectId,
    });

    await newChapter.save();

    res.status(201).json({
      success: true,
      message: "Chapter created successfully.",
      data: newChapter,
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

// Get All Chapters
export const getAllChapters = async (req: Request, res: Response) => {
  try {
    const { levelId, backgroundId, subjectId, search } = req.query;

    const filter: any = {};

    if (levelId) filter.levelId = levelId;

    if (backgroundId) {
      filter.backgroundId = Array.isArray(backgroundId)
        ? backgroundId
        : [backgroundId];
    }

    if (subjectId) filter.subjectId = subjectId;
    // ✅ SEARCH IMPLEMENTATION
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive
    }

    const chapters = await Chapter.find(filter)
      .populate("levelId", "name")
      .populate("backgroundId", "name")
      .populate("subjectId", "name");

    res.status(200).json({
      success: true,
      message: "Chapters fetched successfully.",
      data: chapters,
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

// Get Single Chapter
export const getSingleChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id)
      .populate("levelId", "name")
      .populate("backgroundId", "name")
      .populate("subjectId", "name");

    if (!chapter) {
      res.status(404).json({
        success: false,
        message: "Chapter not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Chapter fetched successfully.",
      data: chapter,
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

// Update Chapter + sync questions
export const updateChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const chapter = await Chapter.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    })
      .populate("levelId", "name")
      .populate("backgroundId", "name")
      .populate("subjectId", "name");

    if (!chapter) {
      res.status(404).json({
        success: false,
        message: "Chapter not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Chapter updated successfully.",
      data: chapter,
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

// Delete Chapter
export const deleteChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Chapter.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Chapter not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Chapter deleted successfully.",
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
