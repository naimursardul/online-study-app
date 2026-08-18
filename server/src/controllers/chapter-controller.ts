import { Request, Response } from "express";
import Chapter from "../models/chapter-model";
import {
  deleteTaxonomy,
  impactTaxonomy,
  updateTaxonomy,
} from "./taxonomy-write-controller";

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

// Update Chapter + sync questions — moving a chapter to another subject rewrites
// its own level/background from that subject and pushes them onto its topics and
// every question below it.
export const updateChapter = updateTaxonomy("chapter");

// Delete Chapter — cascades to topics, questions, saved questions, unfinished exams.
export const deleteChapter = deleteTaxonomy("chapter");

// What that delete would take with it, for the confirm dialog.
export const getChapterImpact = impactTaxonomy("chapter");
