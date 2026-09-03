import mongoose, { Schema } from "mongoose";
import { ISubject } from "../type/type";
import { QUESTION_TYPE_CODES } from "../utils/question-types";

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
    // Which question types this subject offers. An empty array means the admin
    // hasn't configured it yet, and readers fall back to offering every type.
    questionTypes: {
      type: [String],
      enum: QUESTION_TYPE_CODES,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// The cascade lives in services/taxonomy-integrity.service.ts, not in a hook: it
// has to run inside the caller's transaction and it deletes far more than
// questions. A schema hook here would be a second, transaction-less code path.

const Subject = mongoose.model<ISubject>("Subject", subjectSchema);
export default Subject;
