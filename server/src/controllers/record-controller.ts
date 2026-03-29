import { Request, Response } from "express";
import Record from "../models/record-model";
import { BaseQuestion } from "../models/question-model";

// Create Record
export const createRecord = async (req: Request, res: Response) => {
  try {
    const { recordType, institution, year } = req.body;

    if (!recordType || !institution || !year) {
      res.status(400).json({
        success: false,
        message: "RecordType, institution, and year are required.",
        data: null,
      });
      return;
    }

    const newRecord = new Record({ recordType, institution, year });
    await newRecord.save();

    res.status(201).json({
      success: true,
      message: "Record created successfully.",
      data: newRecord,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// Get All record
export const getAllRecord = async (req: Request, res: Response) => {
  try {
    const { recordType, institution, year } = req.query;
    const filter: any = {};
    if (recordType) filter.recordType = recordType;
    if (institution) filter.institution = institution;
    if (year) filter.year = year;

    const record = await Record.find(filter);

    res.status(200).json({
      success: true,
      message: "record fetched successfully.",
      data: record,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// Get Single Record
export const getSingleRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await Record.findById(id);

    if (!record) {
      res.status(404).json({
        success: false,
        message: "Record not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Record fetched successfully.",
      data: record,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// Update Record and related BaseQuestions
export const updateRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const record = await Record.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      res.status(404).json({
        success: false,
        message: "Record not found.",
        data: null,
      });
      return;
    }

    // Update related BaseQuestions
    const questions = await BaseQuestion.find({ recordId: id });
    for (const question of questions) {
      // Find the index of the recordId in question.recordId
      const recordIndex = question.recordId.findIndex(
        (recId) => recId.toString() === id
      );

      if (recordIndex !== -1) {
        // Replace record information in question.record at the corresponding index
        question.record[recordIndex] = {
          recordType: record.recordType,
          institution: record.institution,
          year: record.year,
        };
      }

      await question.save();
    }

    res.status(200).json({
      success: true,
      message: "Record updated successfully and questions synced.",
      data: record,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};

// Delete Record
export const deleteRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Record.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Record not found.",
        data: null,
      });
      return;
    }

    // Also delete the record reference from questions
    await BaseQuestion.updateMany(
      { recordId: id },
      {
        $pull: {
          recordId: id,
          record: {
            recordType: deleted.recordType,
            institution: deleted.institution,
            year: deleted.year,
          },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Record deleted successfully.",
      data: deleted,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
    return;
  }
};
