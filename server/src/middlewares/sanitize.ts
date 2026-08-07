import { NextFunction, Request, Response } from "express";
import mongoSanitize from "express-mongo-sanitize";

// Strips keys starting with `$` or containing `.` so user input can't smuggle
// Mongo operators (e.g. {"phone": {"$ne": null}}) into a query.
//
// This deliberately does NOT use the package's own middleware(): it does
// `req.query = sanitized`, but req.query is getter-only in Express 5, so every
// request throws "Cannot set property query of #<IncomingMessage>". Only the
// exported sanitize() helper is safe to use here.
export function sanitizeRequest(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);

  // Express 5's req.query getter re-parses the querystring on every access, so
  // mutating what it returns is a no-op. Redefine it with a sanitized snapshot.
  Object.defineProperty(req, "query", {
    value: mongoSanitize.sanitize({ ...req.query }),
    writable: true,
    configurable: true,
    enumerable: true,
  });

  next();
}
