import { Router } from "express";
import { requireAuth } from "../controllers/auth-controller";
import {
  enhanceImage,
  generateUploadUrl,
} from "../controllers/imageUpload.controller";

const router = Router();

router.post("/enhance", enhanceImage);
router.post("/generate-upload-url", requireAuth, generateUploadUrl);
export default router;
