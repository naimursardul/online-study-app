import { Request, Response } from "express";
import Chapter from "../models/chapter-model";
import { BaseQuestion } from "../models/question-model";
import { IPopulatedData } from "../type/type";

// Create Chapter
export const createChapter = async (req: Request, res: Response) => {
  try {
    const { name, level, background, subject } = req.body;

    if (!name || !level || !background || !subject) {
      res.status(400).json({
        success: false,
        message: "Name, level, background, and subject are required.",
        data: null,
      });
      return;
    }

    const existing = await Chapter.findOne({
      name,
      level,
      background,
      subject,
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

    const newChapter = new Chapter({ name, level, background, subject });
    await newChapter.save();

    res.status(201).json({
      success: true,
      message: "Chapter created successfully.",
      data: newChapter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
  }
};

// Get All Chapters (with optional filters)
export const getAllChapters = async (req: Request, res: Response) => {
  try {
    const { level, background, subject } = req.query;
    const filter: any = {};
    if (level) filter.level = level;
    if (background)
      filter.background = Array.isArray(background)
        ? [...background]
        : [background];
    if (subject) filter.subject = subject;

    const chapters = await Chapter.find(filter)
      .populate("level", "name")
      .populate("background", "name")
      .populate("subject", "name");

    res.status(200).json({
      success: true,
      message: "Chapters fetched successfully.",
      data: chapters,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
  }
};

// Get Single Chapter
export const getSingleChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id)
      .populate("level", "name")
      .populate("background", "name")
      .populate("subject", "name");

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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
  }
};

// Update Chapter and related BaseQuestions
export const updateChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const chapter = await Chapter.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    })
      .populate("level", "name")
      .populate("background", "name")
      .populate("subject", "name");

    if (!chapter) {
      res.status(404).json({
        success: false,
        message: "Chapter not found.",
        data: null,
      });
      return;
    }

    const questions = await BaseQuestion.find({ chapterId: id });
    for (const question of questions) {
      question.chapter = chapter.name;

      if (
        chapter.level &&
        typeof chapter.level === "object" &&
        "name" in chapter.level &&
        "_id" in chapter.level
      ) {
        const level = chapter.level as IPopulatedData;
        question.level = level.name;
        question.levelId = level._id.toString();
      }

      if (Array.isArray(chapter.background)) {
        const bgNames: string[] = [];
        const bgIds: string[] = [];

        for (const bg of chapter.background) {
          if (typeof bg === "object" && "name" in bg && "_id" in bg) {
            const background = bg as IPopulatedData;
            bgNames.push(background.name);
            bgIds.push(background._id.toString());
          }
        }

        question.background = bgNames;
        question.backgroundId = bgIds;
      }

      if (
        chapter.subject &&
        typeof chapter.subject === "object" &&
        "name" in chapter.subject &&
        "_id" in chapter.subject
      ) {
        const subject = chapter.subject as IPopulatedData;
        question.subject = subject.name;
        question.subjectId = subject._id.toString();
      }

      await question.save();
    }

    res.status(200).json({
      success: true,
      message: "Chapter updated successfully and questions synced.",
      data: chapter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
  }
};
