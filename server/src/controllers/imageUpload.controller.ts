import { Request, Response } from "express";

import { UploadService } from "../services/img-upload-service";

import nanoBananaService from "../services/nanoBanana.service";

export const generateUploadUrl = async (req: Request, res: Response) => {
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

export const enhanceImage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        message: "imageUrl is required",
      });
      return;
    }

    const imageBuffer = await nanoBananaService.enhance(imageUrl);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");

    res.send(imageBuffer);
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message || "Image enhancement failed.",
    });
  }
};
