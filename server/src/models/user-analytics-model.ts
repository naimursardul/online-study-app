import mongoose, { Schema, Document } from "mongoose";
import { IUserAnalytics } from "../type/type";

const UserAnalyticsSchema = new Schema<IUserAnalytics>(
  {
    u_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // --------------------------------
    // Topic-level analytics
    // --------------------------------
    topicStats: [
      {
        topicId: {
          type: String,
          required: true,
        },

        topicName: {
          type: String,
          required: true,
        },

        subjectId: {
          type: String,
          required: true,
        },

        subjectName: {
          type: String,
          required: true,
        },

        chapterId: {
          type: String,
          required: true,
        },

        chapterName: {
          type: String,
          required: true,
        },

        correct: {
          type: Number,
          default: 0,
        },

        total: {
          type: Number,
          default: 0,
        },
      },
    ],

    // --------------------------------
    // Question-level analytics
    // --------------------------------
    questionStats: [
      {
        questionId: {
          type: String,
          required: true,
        },

        attempts: {
          type: Number,
          default: 0,
        },

        correctAttempts: {
          type: Number,
          default: 0,
        },

        wrongAttempts: {
          type: Number,
          default: 0,
        },

        lastAttemptedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 🔥 Important indexes
UserAnalyticsSchema.index({
  u_id: 1,
  "topicStats.topicId": 1,
});

UserAnalyticsSchema.index({
  u_id: 1,
  "questionStats.questionId": 1,
});

const UserAnalytics = mongoose.model<IUserAnalytics>(
  "UserAnalytics",
  UserAnalyticsSchema
);
export default UserAnalytics;
