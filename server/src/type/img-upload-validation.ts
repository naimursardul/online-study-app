import { z } from "zod";

const generateUploadUrlSchema = z.object({
  body: z.object({
    folder: z.string().optional(),

    extension: z.enum(["webp", "png", "jpeg", "jpg"]).optional(),
  }),
});

export const UploadValidation = {
  generateUploadUrlSchema,
};
