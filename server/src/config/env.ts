import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.string().optional(),
    R2_ACCOUNT_ID: z.string(),
    R2_ACCESS_KEY_ID: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    R2_BUCKET_NAME: z.string(),
    R2_ENDPOINT: z.string(),
    CDN_BASE_URL: z.string(),
    RESEND_API_KEY: z.string(),
    CONTACT_TO_EMAIL: z.email().default("contact@poruya.com"),
    CONTACT_FROM_EMAIL: z.email().default("contact@poruya.com"),
    REDIS_URL: z.string().optional(),
    DEV_REDIS_URL: z.string().optional(),
  })
  // Only the URL for the active NODE_ENV is required, so prod doesn't need a
  // dev URL and vice versa.
  .refine(
    (e) =>
      e.NODE_ENV === "development"
        ? Boolean(e.DEV_REDIS_URL)
        : Boolean(e.REDIS_URL),
    { message: "Redis URL is required for the current NODE_ENV" },
  );

export const env = envSchema.parse(process.env);

export const redisUrl =
  env.NODE_ENV === "development" ? env.DEV_REDIS_URL! : env.REDIS_URL!;
