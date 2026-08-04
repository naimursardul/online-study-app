import { Router } from "express";
import { requireAuth } from "../controllers/auth-controller";
import { enhanceLimiter } from "../middlewares/rate-limit";
import {
  enhanceImage,
  generateUploadUrl,
} from "../controllers/imageUpload.controller";

const router = Router();

// Auth first: the limiter is keyed by user id, so it needs req.user.
// Unauthenticated floods are absorbed by the global limiter in app.ts.
router.post("/enhance", requireAuth, enhanceLimiter, enhanceImage);
router.post("/generate-upload-url", requireAuth, generateUploadUrl);
export default router;
