import { Request, Response } from "express";
import Institution from "../models/institution-model";
import { BaseQuestion } from "../models/question-model";

// Create Institution
export const createInstitution = async (req: Request, res: Response) => {
  try {
    const { name, levelId, subjectId, questionTypes } = req.body;

    if (!name || !levelId) {
      res.status(400).json({
        success: false,
        message: "Name and levelId are required.",
        data: null,
      });
      return;
    }

    const existing = await Institution.findOne({ name, levelId });
    if (existing) {
      res.status(409).json({
        success: false,
        message: "Institution already exists for this level.",
        data: null,
      });
      return;
    }

    const newInstitution = new Institution({
      name,
      levelId,
      subjectId: subjectId ?? [],
      questionTypes: questionTypes ?? [],
    });
    await newInstitution.save();

    res.status(201).json({
      success: true,
      message: "Institution created successfully.",
      data: newInstitution,
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

// Get All Institutions
export const getAllInstitutions = async (req: Request, res: Response) => {
  try {
    const { levelId, subjectId, search } = req.query;

    const filter: any = {};
    if (levelId) filter.levelId = levelId;
    // objectIdList always yields an array; any institution covering at least
    // one of the selected subjects matches.
    if (Array.isArray(subjectId) && subjectId.length > 0)
      filter.subjectId = { $in: subjectId };
    if (search) filter.name = { $regex: search, $options: "i" };

    const institutions = await Institution.find(filter)
      .populate("levelId", "name")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Institutions fetched successfully.",
      data: institutions,
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

// Get Single Institution
export const getSingleInstitution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const institution = await Institution.findById(id)
      .populate("levelId", "name")
      .populate("subjectId", "name");

    if (!institution) {
      res.status(404).json({
        success: false,
        message: "Institution not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Institution fetched successfully.",
      data: institution,
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

// Update Institution
export const updateInstitution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const institution = await Institution.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!institution) {
      res.status(404).json({
        success: false,
        message: "Institution not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Institution updated successfully.",
      data: institution,
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

// Delete Institution — every question keeps its other pairs, minus this one
export const deleteInstitution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Institution.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Institution not found.",
        data: null,
      });
      return;
    }

    // Pull this institution's pairs off every question that cited it
    await BaseQuestion.updateMany(
      { "recordId.institutionId": id },
      { $pull: { recordId: { institutionId: id } } },
    );

    res.status(200).json({
      success: true,
      message: "Institution deleted successfully.",
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
