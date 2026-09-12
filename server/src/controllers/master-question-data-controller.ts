import { Request, Response } from "express";
import Background from "../models/background-model";
import Chapter from "../models/chapter-model";
import Level from "../models/level-model";
import Institution from "../models/institution-model";
import Year from "../models/year-model";
import Subject from "../models/subject-model";
import Topic from "../models/topic-model";
import Collection from "../models/collection-model";

export const getMasterQuestionData = async (req: Request, res: Response) => {
  // Mounted behind optionalAuth, so req.user is set only for a valid session.
  // Anonymous callers must not query Collection at all: the filter used to
  // default to {}, which returned every user's collections (userId included).
  const userId = req.user?._id;

  try {
    const [
      levels,
      backgrounds,
      subjects,
      chapters,
      topics,
      institutions,
      years,
      collections,
    ] = await Promise.all([
      Level.find().select("name"),
      Background.find().select("name levelId"),
      Subject.find().select("name levelId backgroundId questionTypes"),
      Chapter.find().select("name subjectId levelId backgroundId"),
      Topic.find().select("name chapterId subjectId"),
      Institution.find().select("name levelId"),
      Year.find().select("name levelId"),
      userId ? Collection.find({ userId }) : Promise.resolve([]),
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
        institutions,
        years,
        collections,
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
