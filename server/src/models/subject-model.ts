import mongoose, { Schema } from "mongoose";
import { ISubject } from "../type/type";

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

// The cascade lives in services/taxonomy-integrity.service.ts, not in a hook: it
// has to run inside the caller's transaction and it deletes far more than
// questions. A schema hook here would be a second, transaction-less code path.

const Subject = mongoose.model<ISubject>("Subject", subjectSchema);
export default Subject;
