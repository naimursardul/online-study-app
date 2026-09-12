/*
 * Title: Extraction Prompt Model
 * Description: One admin-editable AI extraction prompt per question type. The
 *              rows are lazily seeded from the hardcoded defaults in
 *              prompts/extractionPrompt.ts (see services/extraction-prompt.service.ts);
 *              after that, only the admin panel writes to them.
 * Author: Naimur Rahman
 */

import mongoose, { Schema } from "mongoose";
import { IExtractionPrompt } from "../type/type";
import { QUESTION_TYPE_CODES } from "../utils/question-types";

const extractionPromptSchema = new Schema<IExtractionPrompt>(
  {
    questionType: {
      type: String,
      required: true,
      unique: true, // one document per type — also the lazy-seed duplicate guard
      enum: QUESTION_TYPE_CODES,
    },
    prompt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ExtractionPrompt = mongoose.model<IExtractionPrompt>(
  "ExtractionPrompt",
  extractionPromptSchema
);

export default ExtractionPrompt;
