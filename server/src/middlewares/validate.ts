import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodType } from "zod";

type ValidatedRequest = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
};

// Validates req against a schema shaped like z.object({ body?, query?, params? }).
// Parsed values are written back so downstream controllers see coerced, stripped
// data rather than the raw input.
export function validate(schema: ZodType<ValidatedRequest>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          // drop the leading "body"/"query"/"params" segment so the client sees
          // the field name it actually sent
          path: issue.path.slice(1).join(".") || issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    if (result.data.body !== undefined) req.body = result.data.body;
    if (result.data.params !== undefined) {
      req.params = result.data.params as Request["params"];
    }
    // req.query is getter-only in Express 5 — see sanitize.ts for the full story.
    if (result.data.query !== undefined) {
      Object.defineProperty(req, "query", {
        value: result.data.query,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    next();
  };
}
