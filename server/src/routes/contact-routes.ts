/*
 * Title: Contact Routes
 * Description: Public contact-form endpoint. Rate-limited, validated, then
 *              handed to the controller — mirrors the auth-routes ordering.
 * Author: Naimur Rahman
 * Date: 2026-08-22
 */

import express from "express";
import { submitContact } from "../controllers/contact-controller";
import { contactLimiter } from "../middlewares/rate-limit";
import { validate } from "../middlewares/validate";
import { contactSchema } from "../validations/contact.validation";

const router = express.Router();

router.post("/", contactLimiter, validate(contactSchema), submitContact);

export default router;
