import type { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";
const cookieDomain = process.env.COOKIE_DOMAIN;

// Set and cleared cookies must match on domain/path/sameSite/secure,
// or the browser treats them as different cookies and logout silently fails.
export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: isProduction ? "lax" : "none",
  path: "/",
  ...(isProduction && cookieDomain ? { domain: cookieDomain } : {}),
};
