/*
 * Title: Exam Model
 * Description: Persisted custom exam session (MCQ) — config + sampled questions
 * Author: Naimur Rahman
 * Date: 2026-07-12
 */

import mongoose, { Schema } from "mongoose";
import { IExam } from "../type/type";

const ExamResultSchema = new Schema(
  {
    obtainedMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    wrongCount: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    timeTaken: { type: Number, required: true },
    examDate: { type: Date, required: true },
  },
  { _id: false },
);

const ExamSchema = new Schema<IExam>(
  {
    u_id: {
      type: String,
      required: true,
      index: true,
    },

    examCategory: {
      type: String,
      enum: ["personal", "record"],
    },

    examName: { type: String, required: true, trim: true },

    subjectId: { type: String, required: true },

    scope: {
      topicIds: { type: [String], default: [] },
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Mix"],
      required: function (this: IExam) {
        return this.examCategory === "personal";
      },
    },

    mode: {
      type: String,
      enum: ["random", "weak"],
      required: function (this: IExam) {
        return this.examCategory === "personal";
      },
    },

    size: {
      type: Number,
      required: function (this: IExam) {
        return this.examCategory === "personal";
      },
    },

    questionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "BaseQuestion",
        required: true,
      },
    ],

    totalMarks: { type: Number, required: true },
    totalTime: { type: Number, required: true },

    status: {
      type: String,
      enum: ["generated", "submitted"],
      default: "generated",
      index: true,
    },

    answerId: {
      type: Schema.Types.ObjectId,
      ref: "Answer",
    },

    result: {
      type: ExamResultSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// Exam name unique per user
ExamSchema.index(
  { u_id: 1, examName: 1 },
  {
    unique: true,
  },
);

const Exam = mongoose.model<IExam>("Exam", ExamSchema);
export default Exam;
