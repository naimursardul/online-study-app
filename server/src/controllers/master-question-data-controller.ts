import { Request, Response } from "express";
import Background from "../models/background-model";
import Chapter from "../models/chapter-model";
import Level from "../models/level-model";
import Record from "../models/record-model";
import Subject from "../models/subject-model";
import Topic from "../models/topic-model";

export const getMasterQuestionData = async (req: Request, res: Response) => {
  try {
    const [levels, backgrounds, subjects, chapters, topics, records] =
      await Promise.all([
        Level.find().select("name"),
        Background.find().select("name levelId"),
        Subject.find().select("name levelId backgroundId"),
        Chapter.find().select("name subjectId"),
        Topic.find().select("name chapterId"),
        Record.find().select("institution year recordType"),
      ]);

    res.status(200).json({
      success: true,
      message: "Master data fetched successfully.",
      data: {
        levels,
        backgrounds,
        subjects,
        chapters,
        topics,
        records,
      },
    });
    return;
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};
