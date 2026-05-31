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
// Gemini
// ====================================================

// ====================================================
// Limits
// ====================================================

const LIMITS = {
  image: {
    maxSizeBytes: 5 * 1024 * 1024,
    maxSizeLabel: "5MB",
  },
  pdf: {
    maxSizeBytes: 20 * 1024 * 1024,
    maxSizeLabel: "20MB",
    maxPages: 50,
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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: LIMITS.pdf.maxSizeBytes,
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
  upload.single("file"),

  async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file provided.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
      });
      const mimeType = req.file.mimetype as SupportedMime;

      const isPDF = mimeType === "application/pdf";

      // Image size validation

      if (!isPDF && req.file.size > LIMITS.image.maxSizeBytes) {
        return res.status(400).json({
          success: false,
          message: `Image too large. Maximum allowed size is ${LIMITS.image.maxSizeLabel}.`,
        });
      }

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
        : `Extract the ${questionType} question from this image.`;

      // ====================================================
      // Choose Model
      // ====================================================

      //   const model = extractAll ? "gemini-2.5-pro" : "gemini-2.5-flash";
      const model = "gemini-2.5-flash";

      let response;
      let uploadedFile: any = null;

      try {
        // ====================================================
        // PDF
        // ====================================================

        if (isPDF) {
          uploadedFile = await uploadPdfToGemini(ai, req.file.buffer);

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
        // Image
        // ====================================================
        else {
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

                  buildImagePart(req.file.buffer, mimeType),
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

      const extracted = JSON.parse(rawText);
      console.log(extracted);

      const questions = Array.isArray(extracted.questions)
        ? extracted.questions
        : [extracted];

      return res.json({
        success: true,
        questions,
        fileType: mimeType,
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
