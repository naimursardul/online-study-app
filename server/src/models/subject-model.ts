import mongoose, { Schema } from "mongoose";
import { ISubject } from "../type/type";
import { BaseQuestion } from "./question-model";

const subjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    levelId: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
    backgroundId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Background",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Cascade delete: Delete all questions when subject is deleted
(subjectSchema as any).post("deleteOne", async function (doc: any) {
  if (doc?._id) {
    await BaseQuestion.deleteMany({ subjectId: doc._id });
  }
});

const Subject = mongoose.model<ISubject>("Subject", subjectSchema);
export default Subject;
