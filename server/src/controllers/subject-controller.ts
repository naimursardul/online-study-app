import { Request, Response } from "express";
import Subject from "../models/subject-model";
import { BaseQuestion } from "../models/question-model";
import { IPopulatedData } from "../type/type";

// Create Subject
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, level, background } = req.body;

    if (!name || !level || !background) {
      res.status(400).json({
        success: false,
        message: "Name, level, and background are required.",
        data: null,
      });
      return;
    }

    const existing = await Subject.findOne({ name, level, background });
    if (existing) {
      res.status(400).json({
        success: false,
        message: "Subject already exists with this level and background.",
        data: null,
      });
      return;
    }

    const newSubject = new Subject({ name, level, background });
    await newSubject.save();

    res.status(201).json({
      success: true,
      message: "Subject created successfully.",
      data: newSubject,
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

// Get All Subjects (with optional level or background filter)
export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const { level, background } = req.query;
    const filter: any = {};
    if (level) filter.level = level;
    if (background)
      filter.background = Array.isArray(background)
        ? [...background]
        : [background];

    const subjects = await Subject.find(filter)
      .populate("level", "name")
      .populate("background", "name");

    res.status(200).json({
      success: true,
      message: "Subjects fetched successfully.",
      data: subjects,
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

// Get Single Subject
export const getSingleSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id)
      .populate("level", "name")
      .populate("background", "name");

    if (!subject) {
      res.status(404).json({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
  }
};

// Update Subject and related BaseQuestions
export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const subject = await Subject.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    })
      .populate("level", "name")
      .populate("background", "name");

    if (!subject) {
      res.status(404).json({
        success: false,
        message: "Subject not found.",
        data: null,
      });
      return;
    }

    // Update related BaseQuestions
    const questions = await BaseQuestion.find({ subjectId: id });
    for (const question of questions) {
      question.subject = subject.name;

      if (
        subject.level &&
        typeof subject.level === "object" &&
        "name" in subject.level &&
        "_id" in subject.level
      ) {
        const level = subject.level as IPopulatedData;
        question.level = level.name;
        question.levelId = level._id.toString();
      }

      if (Array.isArray(subject.background)) {
        const bgNames: string[] = [];
        const bgIds: string[] = [];

        for (const bg of subject.background) {
          if (typeof bg === "object" && "name" in bg && "_id" in bg) {
            const background = bg as IPopulatedData;
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
  }
};

// Delete Subject
export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Subject.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
  }
};
