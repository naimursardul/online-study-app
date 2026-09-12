/*
 * Title: Extraction Prompt Service
 * Description: The bridge between the hardcoded prompt defaults and the
 *              admin-editable copies in MongoDB.
 *                - ensureDefaultPrompts(): lazily seeds any missing row. Uses
 *                  $setOnInsert so a seeded default never overwrites an
 *                  admin's edit, no matter how often it runs.
 *                - getExtractionPrompt(): what the extraction controller calls.
 *                  Falls back to the hardcoded default when the row is missing
 *                  or blank, so extraction keeps working on a cold/empty DB.
 *              The defaults are imported (never re-typed), so the quotes,
 *              backticks and LaTeX backslashes in extractionPrompt.ts survive
 *              verbatim; once stored, a prompt is a plain string end-to-end
 *              and JSON handles all escaping.
 * Author: Naimur Rahman
 */

import ExtractionPrompt from "../models/extraction-prompt-model";
import { EXTRACTION_PROMPTS } from "../prompts/extractionPrompt";
import {
  QuestionTypeCode,
  QUESTION_TYPE_CODES,
} from "../utils/question-types";

// Seed any missing row from the hardcoded defaults. Idempotent and safe to run
// concurrently: the unique index on questionType means one insert wins and the
// loser's upsert becomes a no-op.
export async function ensureDefaultPrompts(): Promise<void> {
  await ExtractionPrompt.bulkWrite(
    QUESTION_TYPE_CODES.map((code) => ({
      updateOne: {
        filter: { questionType: code },
        update: {
          $setOnInsert: {
            questionType: code,
            prompt: EXTRACTION_PROMPTS[code],
          },
        },
        upsert: true,
      },
    }))
  );
}

// The prompt the AI extractor should use for a type: the admin's edited copy
// when one exists, the hardcoded default otherwise.
export async function getExtractionPrompt(
  code: QuestionTypeCode
): Promise<string> {
  const doc = await ExtractionPrompt.findOne({ questionType: code });

  if (doc?.prompt) {
    return doc.prompt;
  }

  return EXTRACTION_PROMPTS[code];
}
