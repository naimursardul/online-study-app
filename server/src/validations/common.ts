import { z } from "zod";

// Every id in this app is a Mongo ObjectId hex string, including the fields the
// question schema stores as plain String.
export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid id");

export const objectIdParam = z.object({
  params: z.object({ id: objectId }),
});

// Search terms are interpolated into a $regex, so they must be a bounded string
// and never an object (which would smuggle in a Mongo operator).
export const safeSearch = z.string().trim().min(1).max(100);

// Matches the rule the client already enforces (client/src/pages/login/Login.tsx).
export const phone = z
  .string()
  .regex(/^01\d{9}$/, "Phone must start with 01 and be 11 digits");

// Accepts a single id or a list of ids, always returning a list.
export const objectIdList = z
  .union([objectId, z.array(objectId)])
  .transform((v) => (Array.isArray(v) ? v : [v]));

// Same idea as objectIdList, but for free-form strings that are not ids
// (institution/year on the Record model). Bounded like safeSearch because these
// end up inside a Mongo $in, and capped so one request can't send a huge list.
export const safeStringList = z
  .union([safeSearch, z.array(safeSearch).max(50)])
  .transform((v) => (Array.isArray(v) ? v : [v]));
