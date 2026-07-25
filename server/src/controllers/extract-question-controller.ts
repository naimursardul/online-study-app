import multer from "multer";

import { generateContent } from "../services/kie";
import { buildParts } from "../utils/buildParts";

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

      const questionType: QuestionType = req.body.questionType || "MCQ";

      // ====================================================
      // Prompt Selection
      // ====================================================

      const systemPrompt =
        questionType === "CQ"
          ? BULK_CQ_EXTRACTION_PROMPT
          : BULK_MCQ_EXTRACTION_PROMPT;

      const userText = isPDF
        ? `Extract all ${questionType} questions from this PDF.`
        : `Extract all ${questionType} questions from these ${imageFiles.length} image(s). Treat them as consecutive pages in the given order.`;

      const parts = buildParts({
        systemPrompt,
        userText,

        pdfFile: isPDF ? pdfFiles[0] : undefined,

        imageFiles: isPDF ? [] : imageFiles,
      });

      const response = await generateContent({
        parts,
      });

      console.log(response.raw);

      const rawText = response.text.trim() || "{}";

      console.log(rawText);

      const extracted = JSON.parse(rawText);

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
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error?.response?.data?.error?.message ||
          error?.message ||
          "Extraction failed.",
      });
    }
  },
];
