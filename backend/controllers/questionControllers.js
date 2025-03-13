/*
 * Title: Queston Controller
 * Description: To controll every question-routes.
 * Author: Naimur Rahman
 * Date: 2024-10-28
 *
 */

import { Question } from "../models/questionModel.js";

// CREATE QUESTION
const createQuestion = async (req, res) => {
  const {
    level,
    background,
    subject,
    examName,
    examType,
    chapter,
    topic,
    totalMark,
    time,
    negativeMarking,
    questions,
  } = req.body;

  if (
    !(level && typeof level === "string") ||
    !(background && typeof background === "string") ||
    !(subject && typeof subject === "string") ||
    !(examName && typeof examName === "string") ||
    !(examType && typeof examType === "string") ||
    !(questions && Array.isArray(questions) && questions.length > 0) ||
    !(time && typeof time === "number")
  ) {
    return res.status(400).json({
      message:
        "May be, you have missed the level or background or subject or exam-name or exam-type or exam-time or questions",
    });
  }

  for (let i = 0; i < questions.length; i++) {
    const { question, type, mark, options } = questions[i];
    if (!question || !type || !mark) {
      return res.status(400).json({
        message:
          "May be, you have missed entering question or question-type or question-mark.",
      });
    }
    if (type === "MCQ") {
      if (options.length < 2) {
        return res
          .status(400)
          .json({ message: "Please, add at least two options." });
      }
    }
  }

  try {
    const existedQuestion = await Question.findOne({ examName });
    if (existedQuestion) {
      return res.status(400).json({
        message: "Question-name is already existed. Please, try another one.",
      });
    }
    const newQuestion = await Question.create({
      questionCreatorId: req?.user._id,
      level,
      background,
      subject,
      examName,
      examType,
      chapter,
      topic,
      totalMark,
      time,
      negativeMarking,
      questions,
    });

    await newQuestion.save();

    return res.status(200).json({ message: "Question created successfully." });
  } catch (error) {
    console.log("err:", error);
    return res
      .status(500)
      .json({ message: "There is problem is server side." });
  }
};

// GET ALL QUESTIONS
const getAllQuestions = async (req, res) => {
  try {
    const { level, examType, background, subject, chapter, topic, search } =
      req.query;

    const query = {};
    if (typeof level === "string") query.level = level;
    if (typeof examType === "string") query.examType = examType;
    if (typeof background === "string") query.background = background;
    if (typeof subject === "string") query.subject = subject;
    if (typeof chapter === "string") {
      query.chapter = { $in: chapter.split(",") };
    }
    if (typeof topic === "string") query.topic = { $in: topic.split(",") };
    if (typeof search === "string") {
      query.examName = { $regex: search, $options: "i" };
    }

    // FIND USING QUERY
    const allQuestions = await Question.find(query);

    return res.status(200).json(allQuestions);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "There is problem is server side." });
  }
};

// GET SINGLE QUESTION
const getSingleQuestion = async (req, res) => {
  const { examName } = req.params;
  try {
    const question = await Question.findOne({ examName });
    if (!question) {
      return res.status(400).json({ message: "Question not found." });
    }
    return res.status(200).json(question);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "There is a problem in server side." });
  }
};

// EDIT SINGLE QUESTION
const updateSingleQuestion = async (req, res) => {
  const {
    level,
    background,
    examType,
    // examName,
    subject,
    chapter,
    topic,
    totalMark,
    time,
    negativeMarking,
    questions,
  } = req.body;

  if (
    (level && !(typeof level === "string")) ||
    (background && !(typeof background === "string")) ||
    (examType && !(typeof examType === "string")) ||
    // (examName && !(typeof examName === "string")) ||
    (subject && !(typeof subject === "string")) ||
    (chapter && !(typeof chapter === "string")) ||
    (topic && !(typeof topic === "string")) ||
    (totalMark && !(typeof totalMark === "number")) ||
    (time && !(typeof time === "number")) ||
    (negativeMarking && !(typeof negativeMarking === "number")) ||
    (questions && !Array.isArray(questions) && !(questions.length > 0))
  ) {
    return res.status(400).json({
      message: "Please, fill the field correctly.",
    });
  }

  if (questions && Array.isArray(questions) && questions.length > 0) {
    for (let i = 0; i < questions.length; i++) {
      const { question, type, mark, options } = questions[i];
      if (!question || !type || !mark) {
        return res.status(400).json({
          message:
            "May be, you have missed entering question or question-type or question-mark.",
        });
      }
      if (type === "MCQ") {
        if (options.length < 2) {
          return res
            .status(400)
            .json({ message: "Please, add at least two options." });
        }
      }
    }
  }

  try {
    const existedQuestion = await Question.findOne({
      examName: req.params.examName,
    });
    if (!existedQuestion) {
      return res.status(400).json({
        message: "Question not found.",
      });
    }

    const updatedQuestion = await Question.findOneAndUpdate(
      { examName: req.params.examName },
      {
        level,
        background,
        subject,
        // examName,
        examType,
        chapter,
        topic,
        totalMark,
        time,
        negativeMarking,
        questions,
      }
    );

    await updatedQuestion.save();

    return res.status(200).json({ message: "Question updated successfully." });
  } catch (error) {
    console.log("err:", error);
    return res
      .status(500)
      .json({ message: "There is problem is server side." });
  }
};

// DELETE SINGLE QUESTION
const deleteSingleQuestion = async (req, res) => {
  const { examName } = req.params;
  try {
    const question = await Question.findOne({ examName });
    if (!question)
      return res.status(400).json({ message: "Question not found." });
    await Question.findOneAndDelete({ examName });
    return res.status(200).json({ message: "Question successfully deleted." });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "There is a problem in server side." });
  }
};

export {
  createQuestion,
  getAllQuestions,
  getSingleQuestion,
  updateSingleQuestion,
  deleteSingleQuestion,
};
