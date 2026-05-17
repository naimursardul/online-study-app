import { PutObjectCommand } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import { r2 } from "../lib/r2";

type TGenerateUploadUrlPayload = {
  folder?: string;
  extension?: string;
};

const generateUploadUrl = async (payload: TGenerateUploadUrlPayload) => {
  const { folder = "questions", extension = "webp" } = payload;

  const fileName = `${uuidv4()}.${extension}`;

  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,

    Key: key,

    ContentType: `image/${extension}`,
  });

  const uploadUrl = await getSignedUrl(r2, command, {
    expiresIn: 60 * 5,
  });

  return {
    key,
    uploadUrl,
  };
};

export const UploadService = {
  generateUploadUrl,
};
