import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { MulterError } from "multer";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

/**
 * An error carrying the HTTP status its response should use.
 *
 * `AppError` messages are written by us for the client, so they are exposed
 * verbatim. Every other error type is mapped by `mapError` below — driver and
 * framework messages ("jwt expired", Mongoose schema paths, JSON parse
 * positions) never reach the browser.
 */
export class AppError extends Error {
  constructor(
    readonly status: number,
    message: string,
    // false = treat like an unknown error: logged server-side, generic 500.
    readonly expose = true,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const badRequest = (message: string) => new AppError(400, message);
export const unauthorized = (message = "Authentication required.") =>
  new AppError(401, message);
export const forbidden = (
  message = "You do not have permission to perform this action.",
) => new AppError(403, message);
export const notFound = (message: string) => new AppError(404, message);
export const conflict = (message: string) => new AppError(409, message);

// Mongoose ValidationError is surfaced the same way validate.ts surfaces zod
// issues, so a form can map either onto its inputs.
interface FieldIssue {
  path: string;
  message: string;
}

interface MappedError {
  status: number;
  message: string;
  errors?: FieldIssue[];
}

const mapError = (err: unknown): MappedError => {
  if (err instanceof AppError && err.expose) {
    return { status: err.status, message: err.message };
  }

  if (err instanceof MongooseError.ValidationError) {
    return {
      status: 400,
      message: "Validation failed",
      errors: Object.entries(err.errors).map(([path, e]) => ({
        path,
        message: e.message,
      })),
    };
  }

  if (err instanceof MongooseError.CastError) {
    return { status: 400, message: "Invalid id." };
  }

  const mongoErr = err as { code?: number; keyValue?: Record<string, unknown> };
  if (mongoErr?.code === 11000) {
    // Never the raw index name or the driver text.
    return { status: 409, message: "That already exists." };
  }

  if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
    return { status: 401, message: "Session expired. Please log in again." };
  }

  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return { status: 413, message: "File is too large." };
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return { status: 400, message: "Unexpected file field." };
    }
    return { status: 400, message: "File upload rejected." };
  }

  // express.json() body-parser failures: SyntaxError with a status of 400.
  if (err instanceof SyntaxError) {
    const status = (err as { status?: number }).status;
    if (status && status >= 400 && status < 500) {
      return { status, message: "Invalid JSON body." };
    }
  }

  return { status: 500, message: "Internal Server Error" };
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    // Don't send again if headers already sent
    return next(err);
  }

  // The real error always lands in the server log; the client only ever sees
  // the mapped message.
  console.error(err);

  const mapped = mapError(err);
  res.status(mapped.status).json({
    success: false,
    message: mapped.message,
    ...(mapped.errors ? { errors: mapped.errors } : {}),
  });
};
