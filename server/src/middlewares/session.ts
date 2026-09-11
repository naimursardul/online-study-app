import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type mongoose from "mongoose";
import User from "../models/user-model";
import { env } from "../config/env";
import type { IUser } from "../type/type";

export type SessionUser = IUser & { _id: string };

export type SessionResult =
  | { ok: true; user: SessionUser }
  | {
      ok: false;
      reason: "no-token" | "invalid-token" | "no-user" | "password-changed";
    };

/**
 * The single place a `token` cookie is turned into a user.
 *
 * Shared by requireAuth (which 401s on any failure) and optionalAuth (which
 * continues anonymously), so a public session-aware route gets exactly the same
 * checks as a protected one: signature, user existence, and the
 * passwordChangedAt session kill. Before this existed, getMasterQuestionData
 * verified the JWT inline and trusted decoded.userId without loading the user,
 * bypassing both of the latter two.
 */
export async function resolveSessionUser(
  token: unknown,
): Promise<SessionResult> {
  if (typeof token !== "string" || token.length === 0) {
    return { ok: false, reason: "no-token" };
  }

  let decoded: JwtPayload & { userId: string };
  try {
    // Pin the algorithm. Without it jsonwebtoken honours whatever `alg` the
    // token header claims, which is the classic alg-confusion opening.
    decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    }) as JwtPayload & { userId: string };
  } catch {
    return { ok: false, reason: "invalid-token" };
  }

  const data:
    | (IUser & {
        _id: mongoose.Types.ObjectId;
      })
    | null = await User.findById(String(decoded.userId))
    .lean()
    .populate("level", "name")
    .populate("background", "name");

  if (!data) return { ok: false, reason: "no-user" };

  // Kill sessions issued before the last password reset. JWT iat is in
  // seconds; passwordChangedAt in ms. A freshly-issued login token (iat set
  // after the reset) passes, so the user who reset can log back in normally.
  if (
    data.passwordChangedAt &&
    decoded.iat &&
    decoded.iat * 1000 < new Date(data.passwordChangedAt).getTime()
  ) {
    return { ok: false, reason: "password-changed" };
  }

  const user = { ...data, _id: String(data._id) } as SessionUser;
  delete user.password;
  return { ok: true, user };
}

/**
 * Attaches req.user when the cookie is good; continues anonymously when it is
 * absent, expired or tampered with. Never rejects.
 *
 * Mount this on public routes that behave differently for a signed-in caller.
 * The "never rejects" part is the point: an expired cookie previously threw out
 * of getMasterQuestionData and surfaced as a 500 carrying "jwt expired", so
 * every user holding a stale cookie got a 500 on the app's bootstrap request.
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const result = await resolveSessionUser(req.cookies?.token);
  if (result.ok) req.user = result.user;
  next();
};
