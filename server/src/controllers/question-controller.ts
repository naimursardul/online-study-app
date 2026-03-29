/*
 * Title: Question controller
 * Description: Question controller
 * Author: Naimur Rahman
 * Date: 2025-04-08
 */

import { Request, Response } from "express";
import { MCQ, CQ, BaseQuestion } from "../models/question-model";

// CREATE QUESTION
async function createQuestion(req: Request, res: Response) {
  console.log("req:", req.body);
  try {
    const {
      questionType,
      background,
      backgroundId,
      level,
      levelId,
      subject,
      subjectId,
      chapter,
      chapterId,
      topic,
      topicId,
      record,
      recordId,
      timeRequired,
      marks,
      difficulty,
      question,
      options,
      correctAnswer,
      explanation,
      statement,
      subQuestions,
    } = req.body;

    // Define supported question types dynamically
    const supportedQuestionTypes = ["MCQ", "CQ"]; // Add more types here as needed in the future

    // Validate that the provided questionType is supported
    if (!supportedQuestionTypes.includes(questionType)) {
      res.status(400).json({
        success: false,
        message: `Invalid question type. Supported types are: ${supportedQuestionTypes.join(
          ", "
        )}.`,
        data: null,
      });
      return;
    }

    // Check for missing required fields for both MCQ and CQ
    if (
      !level ||
      !levelId ||
      !Array.isArray(background) ||
      background.length <= 0 ||
      !Array.isArray(backgroundId) ||
      backgroundId.length <= 0 ||
      !subject ||
      !subjectId ||
      !chapter ||
      !chapterId ||
      !topic ||
      !topicId ||
      !Array.isArray(record) ||
      record.length <= 0 ||
      !Array.isArray(recordId) ||
      recordId.length <= 0 ||
      !timeRequired ||
      !marks ||
      !difficulty
    ) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: level, background, subject, chapter, topic, record, timeRequired, and difficulty.",
        data: null,
      });
      return;
    }

    switch (questionType) {
      // MCQ
      case "MCQ":
        // Handle MCQ-specific validation
        if (
          !question ||
          !options ||
          options.length < 4 ||
          !correctAnswer ||
          !explanation
        ) {
          res.status(400).json({
            success: false,
            message:
              "Invalid MCQ question. Ensure 'question', 'options' (with at least 4 options), 'correctAnswer', and 'explanation' are provided.",
            data: null,
          });
          return;
        }

        // Check if the MCQ already exists
        const existingMCQ = await MCQ.findOne({ question });
        if (existingMCQ) {
          res.status(400).json({
            success: false,
            message: "This MCQ question already exists.",
            data: null,
          });
          return;
        }

        // Create a new MCQ
        const newMCQ = new MCQ(req.body);
        await newMCQ.save();
        break;

      // CQ
      case "CQ":
        // Handle CQ-specific validation
        if (!statement || !subQuestions || subQuestions.length !== 4) {
          res.status(400).json({
            success: false,
            message:
              "Invalid CQ question. Ensure 'statement' and 'subQuestions' (with at least 4 questions) are provided.",
            data: null,
          });
          return;
        }
        subQuestions.map((sq: any) => {
          if (
            !sq?.questionNo ||
            !sq?.question ||
            !sq.answer ||
            !sq?.topic ||
            !sq?.topicId
          ) {
            res.status(400).json({
              success: false,
              message:
                "Sub-Questions must have information of question, answer, topic.",
              data: null,
            });
            return;
          }
        });

        // Check if the CQ already exists
        const existingCQ = await CQ.findOne({ statement });
        if (existingCQ) {
          res.status(400).json({
            success: false,
            message: "This CQ question already exists.",
            data: null,
          });
          return;
        }

        // Create a new CQ
        const newCQ = new CQ(req.body);
        await newCQ.save();
        break;
    }

    res.status(201).json({
      success: true,
      message: "Question created successfully.",
      data: null,
    });
    return;
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Failed to create the question.",
      data: null,
    });
    return;
  }
}

// GET ALL QUESTIONS
const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const { questionType, level, background } = req.body;
    const {
      subject,
      chapter,
      topic,
      recordId,
      recordType,
      institution,
      year,
      search,
    } = req.query;

    if (typeof questionType !== "string" || typeof level !== "string") {
      res.status(200).json({
        success: false,
        message: "Question-type, level must be selected.",
        data: null,
      });
      return;
    }
    const query: any = { questionType, level };
    if (background)
      query.background = Array.isArray(background)
        ? [...background]
        : [background];
    if (typeof subject === "string") query.subject = subject;
    if (typeof chapter === "string") query.chapter = chapter;
    if (typeof topic === "string") query.topic = topic;
    if (typeof recordId === "string") query.recordId = recordId;
    // Initialize $elemMatch filter if needed
    const elemMatch: any = {};

    if (typeof recordType === "string") elemMatch.recordType = recordType;
    if (typeof institution === "string") elemMatch.institution = institution;
    if (typeof year === "string") elemMatch.year = parseInt(year);

    // Only assign $elemMatch if any of the conditions are added
    if (Object.keys(elemMatch).length > 0) {
      query.record = { $elemMatch: elemMatch };
    }

    let allQuestions;
    switch (questionType) {
      case "MCQ":
        if (typeof search === "string") {
          query.question = { $regex: search, $options: "i" };
        }
        allQuestions = await MCQ.find(query);
        break;
      case "CQ":
        if (questionType === "CQ" && typeof search === "string") {
          query.subQuestions.question = { $regex: search, $options: "i" };
        }
        allQuestions = await CQ.find(query);
        break;
    }

    res.status(200).json({
      success: true,
      message: "Questions retrieved successfully.",
      data: allQuestions,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "There is a problem on the server side.",
      data: null,
    });
    return;
  }
};

// GET SINGLE QUESTION
const getSingleQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const foundQuestion = await BaseQuestion.findById(id);
    if (!foundQuestion) {
      res
        .status(404)
        .json({ success: false, message: "Question not found.", data: null });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Question retrieved.",
      data: foundQuestion,
    });
    return;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", data: null });
    return;
  }
};

// UPDATE SINGLE QUESTION
const updateSingleQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { questionType, ...newData } = req.body;

  if (!questionType) {
    res.status(404).json({
      success: false,
      message: "Question type must be given.",
      data: null,
    });
    return;
  }

  const qExisted = await BaseQuestion.findById(id);
  if (!qExisted) {
    res
      .status(404)
      .json({ success: false, message: "Question not found.", data: null });
    return;
  }

  if (qExisted.questionType !== questionType) {
    res.status(404).json({
      success: false,
      message: "Question type doesn't match.",
      data: null,
    });
    return;
  }

  try {
    let updatedQ;
    switch (questionType) {
      case "MCQ":
        updatedQ = await MCQ.findByIdAndUpdate(id, newData, {
          new: true,
          runValidators: true,
        });
        break;
      case "CQ":
        updatedQ = await CQ.findByIdAndUpdate(id, newData, {
          new: true,
          runValidators: true,
        });
        break;
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      data: updatedQ,
    });
    return;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", data: null });
    return;
  }
};

// DELETE SINGLE QUESTION
const deleteSingleQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const qExisted = await BaseQuestion.findById(id);
    console.log(qExisted);
    if (!qExisted) {
      res
        .status(404)
        .json({ success: false, message: "Question not found.", data: null });
      return;
    }
    await BaseQuestion.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Question successfully deleted.",
      data: null,
    });
    return;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error.", data: null });
    return;
  }
};

export {
  createQuestion,
  getAllQuestions,
  getSingleQuestion,
  updateSingleQuestion,
  deleteSingleQuestion,
};
