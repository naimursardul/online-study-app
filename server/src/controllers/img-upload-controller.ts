import { Request, Response } from "express";

import { UploadService } from "../services/img-upload-service";

const generateUploadUrl = async (req: Request, res: Response) => {
  try {
    const result = await UploadService.generateUploadUrl(req.body);

    res.status(200).json({
      success: true,
      message: "Upload URL generated successfully.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate upload URL.",
    });
  }
};

export const UploadController = {
  generateUploadUrl,
};
