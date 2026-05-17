import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  R2_ACCOUNT_ID: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET_NAME: z.string(),
  R2_ENDPOINT: z.string(),
  CDN_BASE_URL: z.string(),
});

export const env = envSchema.parse(process.env);
