import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import Background from "../models/background-model";
import Chapter from "../models/chapter-model";
import Level from "../models/level-model";
import Record from "../models/record-model";
import Subject from "../models/subject-model";
import Topic from "../models/topic-model";
import Collection from "../models/collection-model";

export const getMasterQuestionData = async (req: Request, res: Response) => {
  const token = req.cookies.token;

  const collectionFilter: { userId?: string } = {};
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      userId: string;
    };
    collectionFilter["userId"] = decoded.userId;
  }

  try {
    const [
      levels,
      backgrounds,
      subjects,
      chapters,
      topics,
      records,
      collections,
    ] = await Promise.all([
      Level.find().select("name"),
      Background.find().select("name levelId"),
      Subject.find().select("name levelId backgroundId"),
      Chapter.find().select("name subjectId"),
      Topic.find().select("name chapterId"),
      Record.find().select("institution year recordType"),
      Collection.find(collectionFilter),
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
