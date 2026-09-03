import { Request, Response } from "express";
import Subject from "../models/subject-model";
import {
  deleteTaxonomy,
  impactTaxonomy,
  updateTaxonomy,
} from "./taxonomy-write-controller";

// Create Subject
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, levelId, backgroundId, questionTypes } = req.body;

    if (!name || !levelId || !backgroundId) {
      res.status(200).json({
        success: false,
        message: "Name, levelId, and backgroundId are required.",
        data: null,
      });
      return;
    }

    const existing = await Subject.findOne({
      name,
      levelId,
      backgroundId,
    });

    if (existing) {
      res.status(200).json({
        success: false,
        message: "Subject already exists with this level and background.",
        data: null,
      });
      return;
    }

    const newSubject = new Subject({
      name,
      levelId,
      backgroundId,
      // Optional: an unconfigured subject offers every question type.
      questionTypes: Array.isArray(questionTypes) ? questionTypes : [],
    });

    await newSubject.save();

    res.status(200).json({
      success: true,
      message: "Subject created successfully.",
      data: newSubject,
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

// Get All Subjects
export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const { levelId, backgroundId, search } = req.query;

    const filter: any = {};

    if (levelId) filter.levelId = levelId;

    if (backgroundId) {
      filter.backgroundId = Array.isArray(backgroundId)
        ? backgroundId
        : [backgroundId];
    }
    // ✅ SEARCH IMPLEMENTATION
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive
    }
    const subjects = await Subject.find(filter)
      .populate("levelId", "name")
      .populate("backgroundId", "name");

    res.status(200).json({
      success: true,
      message: "Subjects fetched successfully.",
      data: subjects,
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

// Get Single Subject
export const getSingleSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id)
      .populate("levelId", "name")
      .populate("backgroundId", "name");

    if (!subject) {
      res.status(200).json({
        success: false,
        message: "Subject not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Subject fetched successfully.",
      data: subject,
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

// Update Subject — a new level or background list is pushed down onto every
// chapter, topic and question filed under this subject.
export const updateSubject = updateTaxonomy("subject");

// Delete Subject — the deepest cascade: chapters, topics, questions, saved
// questions and unfinished exams all go in one transaction.
export const deleteSubject = deleteTaxonomy("subject");

// What that delete would take with it, for the confirm dialog.
export const getSubjectImpact = impactTaxonomy("subject");
