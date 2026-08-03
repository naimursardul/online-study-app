import { Router } from "express";
import { requireAuth } from "../controllers/auth-controller";
import { enhanceLimiter } from "../middlewares/rate-limit";
import {
  enhanceImage,
  generateUploadUrl,
} from "../controllers/imageUpload.controller";

const router = Router();

// Limiter first so floods are cut off before the auth DB lookup
router.post("/enhance", enhanceLimiter, requireAuth, enhanceImage);
router.post("/generate-upload-url", requireAuth, generateUploadUrl);
export default router;
