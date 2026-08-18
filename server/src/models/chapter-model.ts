import mongoose, { Schema } from "mongoose";
import { IChapter } from "../type/type";

const chapterSchema = new Schema<IChapter>(
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
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// The cascade lives in services/taxonomy-integrity.service.ts, not in a hook: it
// has to run inside the caller's transaction and it deletes far more than
// questions. A schema hook here would be a second, transaction-less code path.

const Chapter = mongoose.model<IChapter>("Chapter", chapterSchema);
export default Chapter;
