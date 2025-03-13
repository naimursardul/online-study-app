/*
 * Title: Question Schema
 * Description: schema from mongoose.
 * Author: Naimur Rahman
 * Date: 2024-11-07
 *
 */

import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionCreatorId: { type: String, required: true },
    level: { type: String, required: true },
    background: { type: String, required: true },
    subject: { type: String, required: true },
    examName: { type: String, unique: true, required: true },
    examType: { type: String, required: true },
    chapter: { type: String },
    topic: { type: String },
    totalMark: { type: Number, required: true },
    time: { type: Number, required: true },
    negativeMarking: { type: Number, default: 0 },
    questions: [
      {
        question: { type: String, required: true },
        type: { type: String, required: true },
        answer: { type: String },
        mark: { type: Number, required: true },
        options: [String],
        explanation: String,
      },
    ],
  },
  { timestamps: true }
);

export const Question =
  mongoose.models?.Question || mongoose.model("Question", questionSchema);
