import express from "express";
import { UploadController } from "../controllers/img-upload-controller";
import { requireAuth } from "../controllers/auth-controller";

const router = express.Router();

router.post(
  "/generate-upload-url",
  requireAuth,
  UploadController.generateUploadUrl,
);

export default router;
