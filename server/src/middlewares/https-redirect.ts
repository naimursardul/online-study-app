import { NextFunction, Request, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

// Backstop in case the host doesn't already terminate and redirect TLS itself.
// req.secure is derived from X-Forwarded-Proto because app.ts sets
// `trust proxy`, so this works behind Render's proxy without parsing headers.
export function httpsRedirect(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!isProduction || req.secure) {
    next();
    return;
  }

  res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
}
