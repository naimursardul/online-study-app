import mongoose, { Schema } from "mongoose";
import { IChapter } from "../type/type";

const chapterSchema = new Schema<IChapter>(
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
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Chapter = mongoose.model<IChapter>("Chapter", chapterSchema);
export default Chapter;
