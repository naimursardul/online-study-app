import { Router } from "express";
import { adminOnly } from "../middlewares/require-role";
import {
  enhanceLimiter,
  uploadUrlLimiter,
} from "../middlewares/rate-limit";
import {
  enhanceImage,
  generateUploadUrl,
} from "../controllers/imageUpload.controller";
import { validate } from "../middlewares/validate";
import {
  enhanceImageSchema,
  generateUploadUrlSchema,
} from "../validations/imageUpload.validation";

const router = Router();

// Admin-only: both endpoints spend money or mint write access — enhance is a
// paid nano-banana call, generate-upload-url mints presigned R2 PUT URLs into
// the questions bucket. Previously requireAuth only, so any logged-in user
// could mint unlimited upload URLs. Auth gates before the limiters: they are
// keyed by user id, so they need req.user.
router.post(
  "/enhance",
  ...adminOnly,
  enhanceLimiter,
  validate(enhanceImageSchema),
  enhanceImage,
);
router.post(
  "/generate-upload-url",
  ...adminOnly,
  uploadUrlLimiter,
  validate(generateUploadUrlSchema),
  generateUploadUrl,
);
export default router;
