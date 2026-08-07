import { z } from "zod";
import { objectId, phone } from "./common";

// Minimum mirrors the client's own rule so the two can't disagree.
const password = z.string().min(6, "Password must be at least 6 characters");

export const sendOtpSchema = z.object({
  body: z.object({
    phone,
    // Previously unchecked, so bcryptjs.hash(undefined) threw a generic 400.
    password,
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone,
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    phone,
    name: z.string().trim().min(1).max(100),
    email: z.email(),
    img: z.string().trim().min(1).max(500),
    level: objectId,
    background: objectId,
  }),
});

export const loginWithPhoneSchema = z.object({
  body: z.object({
    phone,
    password,
  }),
});
