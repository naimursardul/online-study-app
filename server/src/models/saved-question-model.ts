import { Schema, model, Document, Types } from "mongoose";

export interface ISavedQuestion extends Document {
  userId: Types.ObjectId;
  collectionId: Types.ObjectId;
  questionId: Types.ObjectId;
  questionType: string; // "CQ", "MCQ", "SQ" - tells which model to fetch full details from
  subjectId: Types.ObjectId;
  chapterId: Types.ObjectId;
  topicId: Types.ObjectId;
  createdAt: Date;
}

const savedQuestionSchema = new Schema<ISavedQuestion>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    questionType: {
      type: String,
      required: true,
      enum: ["CQ", "MCQ"],
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true },
);

// Prevent saving same question twice in same collection
savedQuestionSchema.index(
  { userId: 1, collectionId: 1, questionId: 1 },
  { unique: true },
);

export const SavedQuestion = model<ISavedQuestion>(
  "SavedQuestion",
  savedQuestionSchema,
);
