import { z } from "zod";
import { env } from "../config/env";

// `folder` is interpolated into the R2 object key, so it must not contain a
// path separator or traversal sequence.
const folder = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_-]{1,50}$/, "Folder may only contain letters, numbers, - and _");

export const generateUploadUrlSchema = z.object({
  body: z
    .object({
      folder: folder.optional(),
      extension: z.enum(["webp", "png", "jpeg", "jpg"]).optional(),
    })
    .strict(),
});

// The server fetches this URL, so restrict it to our own CDN rather than
// letting a caller point the paid enhance job at any host.
const cdnOrigin = (() => {
  try {
    return new URL(env.CDN_BASE_URL).origin;
  } catch {
    return null;
  }
})();

export const enhanceImageSchema = z.object({
  body: z
    .object({
      imageUrl: z
        .url()
        .refine(
          (value) => cdnOrigin !== null && new URL(value).origin === cdnOrigin,
          "imageUrl must point to the configured CDN",
        ),
    })
    .strict(),
});
