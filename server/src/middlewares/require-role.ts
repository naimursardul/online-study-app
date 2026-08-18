/*
 * Title: Role Guard
 * Description: Second half of the auth gate. `requireAuth` proves who the caller
 *              is and attaches the user; this decides whether that user may write.
 *              Always mounted after requireAuth — on its own it would see no user
 *              and reject everything.
 * Author: Naimur Rahman
 * Date: 2026-08-17
 */

import { NextFunction, Request, RequestHandler, Response } from "express";
import { requireAuth } from "../controllers/auth-controller";
import { IUser } from "../type/type";

type Role = NonNullable<IUser["role"]>;

export function requireRole(...roles: Role[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    // No user means requireAuth did not run ahead of this, which is a wiring
    // mistake rather than a rejected caller — 401 says the same thing to a client.
    if (!role) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    if (!roles.includes(role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
      return;
    }

    next();
  };
}

// The gate every content write shares. Exported as a pair so a route file cannot
// mount the role check without the authentication that populates req.user.
export const adminOnly: RequestHandler[] = [
  requireAuth,
  requireRole("admin", "super-admin"),
];
