import mongoose, { Schema, model } from "mongoose";
import { IInstitution } from "../type/type";
import { QUESTION_TYPE_CODES } from "../utils/question-types";

const institutionSchema = new Schema<IInstitution>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    levelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
    // Subjects this institution covers. An empty array means the admin hasn't
    // configured it yet, and readers fall back to offering it for every subject.
    subjectId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    // Which question types this institution offers. An empty array means the
    // admin hasn't configured it yet, and readers fall back to offering every type.
    questionTypes: {
      type: [String],
      enum: QUESTION_TYPE_CODES,
      default: [],
    },
  },
  { timestamps: true }
);

const Institution = model<IInstitution>("Institution", institutionSchema);
export default Institution;
