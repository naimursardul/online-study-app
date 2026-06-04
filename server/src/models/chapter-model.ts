import mongoose, { Schema } from "mongoose";
import { IChapter } from "../type/type";
import { BaseQuestion } from "./question-model";

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

// Cascade delete: Delete all questions when chapter is deleted
(chapterSchema as any).post("deleteOne", async function (doc: any) {
  if (doc?._id) {
    await BaseQuestion.deleteMany({ chapterId: doc._id });
  }
});

const Chapter = mongoose.model<IChapter>("Chapter", chapterSchema);
export default Chapter;
