import { Router } from "express";
import { requireAuth } from "../controllers/auth-controller";
import { enhanceLimiter } from "../middlewares/rate-limit";
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

// Auth first: the limiter is keyed by user id, so it needs req.user.
// Unauthenticated floods are absorbed by the global limiter in app.ts.
router.post(
  "/enhance",
  requireAuth,
  enhanceLimiter,
  validate(enhanceImageSchema),
  enhanceImage,
);
router.post(
  "/generate-upload-url",
  requireAuth,
  validate(generateUploadUrlSchema),
  generateUploadUrl,
);
export default router;
