import mongoose, { Schema } from "mongoose";
import { ITopic } from "../type/type";
import { BaseQuestion } from "./question-model";

const topicSchema = new Schema<ITopic>(
  {
    name: { type: String, required: true },
    levelId: { type: Schema.Types.ObjectId, ref: "Level", required: true },
    backgroundId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Background",
        required: true,
      },
    ],
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
  },
  { timestamps: true },
);

// Cascade delete: Delete all questions when topic is deleted
(topicSchema as any).post("deleteOne", async function (doc: any) {
  if (doc?._id) {
    await BaseQuestion.deleteMany({ topicId: doc._id });
  }
});

const Topic = mongoose.model<ITopic>("Topic", topicSchema);

export default Topic;
