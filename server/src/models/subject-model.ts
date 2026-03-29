// ===== models/subject-model.ts =====
import mongoose, { Schema, Document } from "mongoose";
import { ISubject } from "../type/type";

const subjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
    background: [
      {
        type: Schema.Types.ObjectId,
        ref: "Background",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.model<ISubject>("Subject", subjectSchema);
export default Subject;
