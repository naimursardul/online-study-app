/*
 * Title: Question Model
 * Description: Question model for both MCQ & CQ
 * Author: Naimur Rahman
 * Date: 2025-04-09
 */

import mongoose, { Schema } from "mongoose";
import { IBaseQuestion, ICQ, IImage, IMCQ } from "../type/type";

// -----------------------
// Schemas
// -----------------------

const imageSchema = new Schema<IImage>(
  {
    key: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      default: "image/webp",
    },
    size: {
      type: Number,
    },
  },
  { _id: false }
);

const baseQuestionSchema = new Schema<IBaseQuestion>(
  {
    questionType: {
      type: String,
      enum: ["MCQ", "CQ"],
      required: true,
    },
    background: [
      {
        type: String,
        required: true,
      },
    ],
    backgroundId: [
      {
        type: String,
        required: true,
      },
    ],
    level: {
      type: String,
      required: true,
    },
    levelId: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    subjectId: {
      type: String,
      required: true,
    },
    chapter: {
      type: String,
      required: true,
    },
    chapterId: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    topicId: {
      type: String,
      required: true,
    },
    recordId: [
      {
        type: String,
        required: true,
      },
    ],
    record: [
      {
        recordType: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        year: {
          type: String,
          required: true,
        },
      },
    ],
    marks: {
      type: Number,
      required: true,
    },
    timeRequired: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "questionType",
    collection: "questions",
  }
);

// -----------------------
// Models
// -----------------------

const BaseQuestion = mongoose.model<IBaseQuestion>(
  "BaseQuestion",
  baseQuestionSchema
);

// MCQ Schema
const mcqSchema = new Schema<IMCQ>({
  question: {
    type: String,
    required: true,
  },
  questionImg: imageSchema,
  options: {
    type: [{ text: String, optionImg: imageSchema }],
    validate: [
      {
        validator: (options: any[]) => {
          return options.length === 4;
        },
        message: "Options must have exactly 4 choices.",
      },
      {
        validator: (options: any[]) => {
          return options.every((option) => {
            return option.text?.trim() || option.optionImg;
          });
        },
        message: "Each option must contain text or image.",
      },
    ],
    required: true,
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    required: true,
  },
  explanationImg: imageSchema,
});

const MCQ = BaseQuestion.discriminator<IMCQ>("MCQ", mcqSchema);

// CQ Schema
const cqSchema = new Schema<ICQ>({
  statement: {
    type: String,
    required: true,
  },
  statementImg: imageSchema,
  subQuestions: {
    type: [
      {
        questionNo: {
          type: String,
          required: true,
        },
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        subQuestionAnswerImg: imageSchema,
        topic: {
          type: String,
          required: true,
        },
        topicId: {
          type: String,
          required: true,
        },
      },
    ],
    validate: [
      {
        validator: (val: string[]) => val.length === 4,
        message: "Sub Questions must be exactly 4.",
      },
    ],
  },
});

const CQ = BaseQuestion.discriminator<ICQ>("CQ", cqSchema);

// -----------------------

export { BaseQuestion, MCQ, CQ };
