import type { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";
const cookieDomain = process.env.COOKIE_DOMAIN;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Set and cleared cookies must match on domain/path/sameSite/secure,
// or the browser treats them as different cookies and logout silently fails.
export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: isProduction ? "lax" : "none",
  path: "/",
  // Matches utils/jwt-token.ts's expiresIn: "7d". Without it this was a session
  // cookie, so closing the browser logged the user out while the JWT it carried
  // was still valid for a week — an early logout with no security benefit.
  maxAge: SEVEN_DAYS_MS,
  ...(isProduction && cookieDomain ? { domain: cookieDomain } : {}),
};

// Proof that verify-otp succeeded *in this session*, consumed by create-user.
// Deliberately short-lived and scoped nowhere else: it is a one-step grant, not
// a session. Same domain/path/sameSite/secure rules as above so clearing works.
export const SIGNUP_GRANT_COOKIE = "signup_grant";
export const SIGNUP_GRANT_TTL_MS = 15 * 60 * 1000;

export const signupGrantCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: isProduction ? "lax" : "none",
  path: "/",
  maxAge: SIGNUP_GRANT_TTL_MS,
  ...(isProduction && cookieDomain ? { domain: cookieDomain } : {}),
};
