/*
 * Title: Extraction Prompt Controller
 * Description: Admin CRUD over the per-question-type AI extraction prompts.
 *              Reads lazily seed any missing row from the hardcoded defaults,
 *              so the admin panel always shows six editable prompts. Responses
 *              follow the standard { success, message, data } envelope.
 * Author: Naimur Rahman
 */

import { Request, Response } from "express";
import ExtractionPrompt from "../models/extraction-prompt-model";
import { ensureDefaultPrompts } from "../services/extraction-prompt.service";
import { EXTRACTION_PROMPTS } from "../prompts/extractionPrompt";
import {
  isQuestionTypeCode,
  QUESTION_TYPE_CODES,
} from "../utils/question-types";

// Get All Prompts — seeded on first read, returned in registry order (not
// .find() order) so the admin page shows MCQ, CQ, Math-CQ, SQ, EQ, WQ.
export const getAllPrompts = async (_req: Request, res: Response) => {
  try {
    await ensureDefaultPrompts();

    const docs = await ExtractionPrompt.find();
    const byType = new Map(docs.map((doc) => [doc.questionType, doc]));

    const prompts = QUESTION_TYPE_CODES.map(
      (code) => byType.get(code) ?? { questionType: code, prompt: "" }
    );

    res.status(200).json({
      success: true,
      message: "Extraction prompts fetched successfully.",
      data: prompts,
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

// Get Single Prompt by question type
export const getSinglePrompt = async (req: Request, res: Response) => {
  try {
    const { questionType } = req.params;

    if (!isQuestionTypeCode(questionType)) {
      res.status(404).json({
        success: false,
        message: "Extraction prompt not found for this question type.",
        data: null,
      });
      return;
    }

    const prompt = await ExtractionPrompt.findOne({ questionType });

    if (!prompt) {
      res.status(404).json({
        success: false,
        message: "Extraction prompt not found for this question type.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Extraction prompt fetched successfully.",
      data: prompt,
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

// Update Prompt by question type
export const updatePrompt = async (req: Request, res: Response) => {
  try {
    const { questionType } = req.params;
    const { prompt } = req.body;

    if (!isQuestionTypeCode(questionType)) {
      res.status(404).json({
        success: false,
        message: "Extraction prompt not found for this question type.",
        data: null,
      });
      return;
    }

    if (!prompt) {
      res.status(400).json({
        success: false,
        message: "Prompt is required.",
        data: null,
      });
      return;
    }

    const updated = await ExtractionPrompt.findOneAndUpdate(
      { questionType },
      { prompt },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        message: "Extraction prompt not found for this question type.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Extraction prompt updated successfully.",
      data: updated,
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

// Reset Prompt to the hardcoded default — the admin's undo button.
export const resetPrompt = async (req: Request, res: Response) => {
  try {
    const { questionType } = req.params;

    if (!isQuestionTypeCode(questionType)) {
      res.status(404).json({
        success: false,
        message: "Extraction prompt not found for this question type.",
        data: null,
      });
      return;
    }

    const reset = await ExtractionPrompt.findOneAndUpdate(
      { questionType },
      { prompt: EXTRACTION_PROMPTS[questionType] },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Extraction prompt reset to default.",
      data: reset,
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
