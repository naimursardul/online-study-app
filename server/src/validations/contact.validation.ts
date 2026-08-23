/*
 * Title: Contact Validation
 * Description: Request schema for the public POST /contact endpoint. Bounds
 *              mirror the client form so the two can't drift.
 * Author: Naimur Rahman
 * Date: 2026-08-22
 */

import { z } from "zod";

export const contactSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(100),
    email: z.email(),
    message: z.string().trim().min(1).max(5000),
  }),
});
