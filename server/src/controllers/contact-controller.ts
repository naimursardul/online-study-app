/*
 * Title: Contact Controller
 * Description: Handles public contact-form submissions by emailing them via the
 *              mail service. Fire-and-return: no persistence.
 * Author: Naimur Rahman
 * Date: 2026-08-22
 */

import { Request, Response } from "express";
import { sendContactEmail } from "../services/mail.service";

export const submitContact = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    await sendContactEmail({ name, email, message });
    res.status(200).json({
      success: true,
      message: "Message sent. We'll get back to you soon.",
    });
  } catch (error) {
    // Log server-side; return a generic message so Resend internals never leak.
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Could not send your message. Please try again later.",
    });
  }
};
