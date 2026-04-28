import { Request, Response } from "express";
import Subject from "../models/subject-model";
import { BaseQuestion } from "../models/question-model";
import { IPopulatedData } from "../type/type";

// Create Subject
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, levelId, backgroundId } = req.body;

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

// Update Subject + sync questions
export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const subject = await Subject.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    })
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

    const questions = await BaseQuestion.find({
      subjectId: id,
    });

    for (const question of questions) {
      question.subject = subject.name;
      question.subjectId = subject._id.toString();

      // level
      if (subject.levelId && typeof subject.levelId === "object") {
        const level = subject.levelId as unknown as IPopulatedData;
        question.level = level.name;
        question.levelId = level._id.toString();
      }

      // background
      if (Array.isArray(subject.backgroundId)) {
        const bgNames: string[] = [];
        const bgIds: string[] = [];

        for (const bg of subject.backgroundId) {
          if (typeof bg === "object") {
            const background = bg as unknown as IPopulatedData;
            bgNames.push(background.name);
            bgIds.push(background._id.toString());
          }
        }

        question.background = bgNames;
        question.backgroundId = bgIds;
      }

      await question.save();
    }

    res.status(200).json({
      success: true,
      message: "Subject updated successfully and questions synced.",
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

// Delete Subject
export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Subject.findByIdAndDelete(id);

    if (!deleted) {
      res.status(200).json({
        success: false,
        message: "Subject not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Subject deleted successfully.",
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
