import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import os from "os";

import {
  MCQ_EXTRACTION_PROMPT,
  CQ_EXTRACTION_PROMPT,
  BULK_MCQ_EXTRACTION_PROMPT,
  BULK_CQ_EXTRACTION_PROMPT,
} from "../prompts/extractionPrompt";

// ====================================================
// Limits
// ====================================================

const LIMITS = {
  image: {
    maxSizeBytes: 5 * 1024 * 1024,
    maxSizeLabel: "5MB",
    maxCount: 4,
  },
  pdf: {
    maxSizeBytes: 20 * 1024 * 1024,
    maxSizeLabel: "20MB",
    maxPages: 50,
    maxCount: 1,
  },
};

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// ====================================================
// Multer
// ====================================================
// Accept up to 4 files in the "files" field. We enforce the
// "1 PDF OR up to 4 images, never mixed" rule manually below,
// since multer can't express that kind of conditional logic.

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: LIMITS.pdf.maxSizeBytes, // largest single file allowed (PDF cap)
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Allowed: JPEG, PNG, WEBP, PDF"));
    }
  },
});

// ====================================================
// Types
// ====================================================

type SupportedMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "application/pdf";

type QuestionType = "MCQ" | "CQ";

// ====================================================
// Image Helper
// ====================================================

function buildImagePart(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      mimeType,
      data: buffer.toString("base64"),
    },
  };
}

// ====================================================
// PDF Upload Helper
// ====================================================

async function uploadPdfToGemini(ai: any, buffer: Buffer) {
  const tempPath = path.join(os.tmpdir(), `pdf-${Date.now()}.pdf`);

  await fs.writeFile(tempPath, buffer);

  try {
    const uploadedFile = await ai.files.upload({
      file: tempPath,
      config: {
        mimeType: "application/pdf",
      },
    });

    return uploadedFile;
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

// ====================================================
// Route Handler
// ====================================================

export const extractQuestionsHandler = [
  // "files" must match the field name used on the frontend FormData
  upload.array("files", 4),

  async (req: any, res: any) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No file provided.",
        });
      }

      const pdfFiles = files.filter((f) => f.mimetype === "application/pdf");
      const imageFiles = files.filter((f) => f.mimetype !== "application/pdf");

      // Rule 1: never mix PDF and images
      if (pdfFiles.length > 0 && imageFiles.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Please upload either one PDF or up to 4 images, not both.",
        });
      }

      // Rule 2: only 1 PDF allowed
      if (pdfFiles.length > LIMITS.pdf.maxCount) {
        return res.status(400).json({
          success: false,
          message: "Only one PDF is allowed.",
        });
      }

      // Rule 3: max 4 images allowed
      if (imageFiles.length > LIMITS.image.maxCount) {
        return res.status(400).json({
          success: false,
          message: `You can upload up to ${LIMITS.image.maxCount} images only.`,
        });
      }

      const isPDF = pdfFiles.length === 1;

      // Image size validation (per image)
      if (!isPDF) {
        const oversized = imageFiles.find(
          (f) => f.size > LIMITS.image.maxSizeBytes,
        );
        if (oversized) {
          return res.status(400).json({
            success: false,
            message: `Image too large: "${oversized.originalname}". Maximum allowed size is ${LIMITS.image.maxSizeLabel}.`,
          });
        }
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
      });

      const questionType: QuestionType = req.body.questionType || "MCQ";
      const extractAll = req.body.extractAll === "true";

      // ====================================================
      // Prompt Selection
      // ====================================================

      const systemPrompt =
        questionType === "CQ"
          ? extractAll
            ? BULK_CQ_EXTRACTION_PROMPT
            : CQ_EXTRACTION_PROMPT
          : extractAll
            ? BULK_MCQ_EXTRACTION_PROMPT
            : MCQ_EXTRACTION_PROMPT;

      const userText = isPDF
        ? extractAll
          ? `Extract ALL ${questionType} questions from this PDF. It contains at most ${LIMITS.pdf.maxPages} pages.`
          : `Extract the ${questionType} question from page ${
              req.body.page || 1
            } of this PDF.`
        : imageFiles.length > 1
          ? `Extract the ${questionType} question(s) from these ${imageFiles.length} images. Treat them as parts of the same question set, in the order given.`
          : `Extract the ${questionType} question from this image.`;

      // ====================================================
      // Choose Model
      // ====================================================

      //   const model = extractAll ? "gemini-2.5-pro" : "gemini-2.5-flash";
      const model = "gemini-3.5-flash";

      let response;
      let uploadedFile: any = null;

      try {
        // ====================================================
        // PDF (single file)
        // ====================================================

        if (isPDF) {
          uploadedFile = await uploadPdfToGemini(ai, pdfFiles[0].buffer);

          response = await ai.models.generateContent({
            model,

            config: {
              responseMimeType: "application/json",
              temperature: 0,
            },

            contents: [
              {
                role: "user",

                parts: [
                  {
                    text: `${systemPrompt}

${userText}`,
                  },

                  {
                    fileData: {
                      mimeType: "application/pdf",

                      fileUri: uploadedFile.uri,
                    },
                  },
                ],
              },
            ],
          });
        }

        // ====================================================
        // Images (1 to 4 files, sent together in one request)
        // ====================================================
        else {
          const imageParts = imageFiles.map((f) =>
            buildImagePart(f.buffer, f.mimetype),
          );

          response = await ai.models.generateContent({
            model,

            config: {
              responseMimeType: "application/json",
              temperature: 0,
            },

            contents: [
              {
                role: "user",

                parts: [
                  {
                    text: `${systemPrompt}

${userText}`,
                  },

                  ...imageParts,
                ],
              },
            ],
          });
        }
      } finally {
        // ====================================================
        // Cleanup Uploaded PDF
        // ====================================================

        if (uploadedFile?.name) {
          try {
            await ai.files.delete({
              name: uploadedFile.name,
            });
          } catch (err) {
            console.error("Failed to delete Gemini file", err);
          }
        }
      }

      const rawText = response?.text?.trim() || "{}";

      // console.log(rawText);
      const extracted = JSON.parse(rawText);
      console.log(extracted);

      const questions = Array.isArray(extracted.questions)
        ? extracted.questions
        : [extracted];

      return res.json({
        success: true,
        questions,
        fileType: isPDF ? "application/pdf" : "image",
        fileCount: isPDF ? 1 : imageFiles.length,
        message: "Questions extracted successfully.",
      });
    } catch (err: any) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: err?.message || "Extraction failed.",
      });
    }
  },
];
