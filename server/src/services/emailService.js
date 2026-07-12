import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let transporter = null;

function getTransporter() {
  if (!env.email.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.secure,
      auth: env.email.user ? { user: env.email.user, pass: env.email.pass } : undefined,
    });
  }
  return transporter;
}

/**
 * Sends an email if SMTP is configured; otherwise logs the payload (dev mode /
 * "email verification ready" without a provider). Never throws.
 */
export async function sendEmail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    logger.info({ to, subject, text }, "SMTP not configured — email logged instead of sent");
    return { delivered: false };
  }
  try {
    await t.sendMail({ from: env.email.from, to, subject, text, html });
    return { delivered: true };
  } catch (err) {
    logger.error({ err, to, subject }, "failed to send email");
    return { delivered: false };
  }
}

export function sendPasswordResetEmail(to, resetUrl) {
  return sendEmail({
    to,
    subject: "Reset your Venora password",
    text: `Reset your password using this link (valid for 30 minutes): ${resetUrl}`,
    html: `<p>Reset your password using this link (valid for 30 minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}

export function sendVerificationEmail(to, verifyUrl) {
  return sendEmail({
    to,
    subject: "Verify your Venora email",
    text: `Verify your email using this link: ${verifyUrl}`,
    html: `<p>Verify your email using this link:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
}
