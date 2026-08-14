import { Resend } from "resend";
import nodemailer from "nodemailer";
import {
  ApplicationEmailData,
  generateApplicationEmailHtml,
  generateApplicationEmailText,
} from "./templates/application-confirmation";

export interface SendEmailResult {
  success: boolean;
  provider?: "resend" | "smtp" | "gmail" | "simulated";
  messageId?: string;
  error?: string;
}

/**
 * Sends an official application confirmation email to the applicant.
 * Automatically selects the active provider:
 * 1. Gmail SMTP (if GMAIL_USER & GMAIL_APP_PASSWORD are provided)
 * 2. Custom SMTP (if SMTP_HOST & SMTP_USER/PASS are provided)
 * 3. Resend API (if RESEND_API_KEY is provided and not using Gmail)
 * 4. Development / Simulation fallback
 */
export async function sendApplicationConfirmationEmail(
  data: ApplicationEmailData
): Promise<SendEmailResult> {
  const { to, fullName } = data;
  const subject = `Application Received - AWS Student Builders Group (Cohort 2026)`;
  const html = generateApplicationEmailHtml(data);
  const text = generateApplicationEmailText(data);

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ""); // strip spaces from app password

  // ── 1. Gmail SMTP Provider (Prioritized if credentials are set) ────────
  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const fromHeader = `AWS Student Builders Group <${gmailUser}>`;

      const info = await transporter.sendMail({
        from: fromHeader,
        to,
        subject,
        html,
        text,
      });

      console.log(`[Email/Gmail] Confirmation email sent successfully to ${to} (ID: ${info.messageId})`);
      return { success: true, provider: "gmail", messageId: info.messageId };
    } catch (err: any) {
      console.error("[Email/Gmail] Error sending email via Gmail SMTP:", err);
      return { success: false, provider: "gmail", error: err.message };
    }
  }

  // ── 2. Custom SMTP Provider ──────────────────────────────────────────
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const fromAddress =
        process.env.EMAIL_FROM ||
        `AWS Student Builders Group <${smtpUser}>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        text,
      });

      console.log(`[Email/SMTP] Confirmation email sent successfully to ${to} (ID: ${info.messageId})`);
      return { success: true, provider: "smtp", messageId: info.messageId };
    } catch (err: any) {
      console.error("[Email/SMTP] Error sending email via SMTP:", err);
      return { success: false, provider: "smtp", error: err.message };
    }
  }

  // ── 3. Resend Provider ────────────────────────────────────────────────
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromAddress =
        process.env.EMAIL_FROM ||
        process.env.RESEND_FROM ||
        "AWS Student Builders Group <onboarding@resend.dev>";

      const resend = new Resend(resendApiKey);
      const res = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html,
        text,
      });

      if (res.error) {
        console.error("[Email/Resend] Failed to send email:", res.error);
        return { success: false, provider: "resend", error: res.error.message };
      }

      console.log(`[Email/Resend] Confirmation email sent successfully to ${to} (ID: ${res.data?.id})`);
      return { success: true, provider: "resend", messageId: res.data?.id };
    } catch (err: any) {
      console.error("[Email/Resend] Unexpected error:", err);
      return { success: false, provider: "resend", error: err.message };
    }
  }

  // ── 4. Simulated Fallback (Development) ───────────────────────────────
  console.log("--------------------------------------------------");
  console.log("[Email/Simulated] No Gmail or Resend credentials found in .env.local.");
  console.log(`[Email/Simulated] Intended recipient: ${to} (${fullName})`);
  console.log(`[Email/Simulated] Subject: ${subject}`);
  console.log("--------------------------------------------------");

  return {
    success: true,
    provider: "simulated",
    messageId: `sim_${Date.now()}`,
  };
}
