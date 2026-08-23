/*
 * Title: Mail Service
 * Description: Sends contact-form submissions through Resend. From/To are the
 *              verified poruya.com address; Reply-To is the visitor so a reply
 *              from Gmail reaches them directly.
 * Author: Naimur Rahman
 * Date: 2026-08-22
 */

import { Resend } from "resend";
import { env } from "../config/env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendContactEmail(input: {
  name: string;
  email: string;
  message: string;
}) {
  const { data, error } = await resend.emails.send({
    from: env.CONTACT_FROM_EMAIL,
    to: env.CONTACT_TO_EMAIL,
    replyTo: input.email,
    subject: `New contact message from ${input.name}`,
    text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
  });

  // Resend resolves (never rejects) with { data, error }; surface the error so
  // the controller returns a failure instead of a false success.
  if (error) throw new Error(error.message);
  return data;
}
