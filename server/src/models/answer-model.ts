import mongoose, { Schema, Document } from "mongoose";
import { IAnswer } from "../type/type";

const AnswerSchema = new Schema(
  {
    u_id: { type: String, required: true },
    record: { type: String, required: true },
    q_ids: [
      {
        id: { type: String, required: true },
        givenAns: { type: String, required: true },
      },
    ],
    toalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    timeTaken: { type: Number, required: true },
    examDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAnswer>("Answer", AnswerSchema);
