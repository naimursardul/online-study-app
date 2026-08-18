import { Request, Response } from "express";
import Level from "../models/level-model";
import {
  deleteTaxonomy,
  impactTaxonomy,
  updateTaxonomy,
} from "./taxonomy-write-controller";

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
  const { search } = _req.query;
  const filter: any = {};
  // ✅ SEARCH IMPLEMENTATION
  if (search) {
    filter.name = { $regex: search, $options: "i" }; // case-insensitive
  }

  try {
    const levels = await Level.find(filter).sort({ createdAt: -1 });
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

// UPDATE level — a level has no parent, so there is nothing to derive and nothing
// below it goes stale: name and details only.
export const updateLevel = updateTaxonomy("level");

// DELETE level — takes its whole tree, and unsets the level on every profile that
// pointed at it.
export const deleteLevel = deleteTaxonomy("level");

// What that delete would take with it, for the confirm dialog.
export const getLevelImpact = impactTaxonomy("level");
