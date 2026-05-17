import express from "express";
import { UploadController } from "../controllers/img-upload-controller";

const router = express.Router();

router.post(
  "/generate-upload-url",

  UploadController.generateUploadUrl
);

export default router;
