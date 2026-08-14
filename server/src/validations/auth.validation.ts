import { z } from "zod";
import { objectId, phone } from "./common";

// Minimum mirrors the client's own rule so the two can't disagree.
const password = z.string().min(6, "Password must be at least 6 characters");
// Shared so the signup and password-reset flows can't drift on OTP format.
const otp = z.string().regex(/^\d{6}$/, "OTP must be 6 digits");

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
    otp,
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

// Password reset flow: request an OTP, verify it, then set a new password.
export const forgotPasswordSchema = z.object({
  body: z.object({
    phone,
  }),
});

export const verifyResetOtpSchema = z.object({
  body: z.object({
    phone,
    otp,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    phone,
    otp,
    password,
  }),
});
