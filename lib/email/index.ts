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
 * Creates a serverless-optimized Nodemailer transporter for Gmail
 */
function createGmailTransporter(user: string, pass: string, port = 465, secure = true) {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Sends an official application confirmation email to the applicant.
 * Multi-layer fallback strategy optimized for serverless environments:
 * 1. Gmail SMTP (port 465 -> fallback port 587)
 * 2. Resend REST API (over HTTPS port 443 - zero serverless blocking)
 * 3. Custom SMTP
 * 4. Development simulation
 */
export async function sendApplicationConfirmationEmail(
  data: ApplicationEmailData
): Promise<SendEmailResult> {
  const { to, fullName } = data;
  const subject = `Application Received - AWS Student Builder Group (Cohort 2026)`;
  const html = generateApplicationEmailHtml(data);
  const text = generateApplicationEmailText(data);

  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ""); // strip spaces from Google app password
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  // ── 1. Gmail SMTP (Serverless Optimized with Port 465 / 587 Failover) ─
  if (gmailUser && gmailPass) {
    const fromHeader = `AWS Student Builder Group <${gmailUser}>`;

    // Attempt 1: Port 465 (SSL)
    try {
      const transporter465 = createGmailTransporter(gmailUser, gmailPass, 465, true);
      const info = await transporter465.sendMail({
        from: fromHeader,
        to,
        subject,
        html,
        text,
      });

      console.log(`[Email/Gmail-465] Confirmation email sent successfully to ${to} (ID: ${info.messageId})`);
      return { success: true, provider: "gmail", messageId: info.messageId };
    } catch (err465: any) {
      console.warn("[Email/Gmail-465] Port 465 attempt failed, trying port 587 (STARTTLS):", err465.message);

      // Attempt 2: Port 587 (STARTTLS)
      try {
        const transporter587 = createGmailTransporter(gmailUser, gmailPass, 587, false);
        const info = await transporter587.sendMail({
          from: fromHeader,
          to,
          subject,
          html,
          text,
        });

        console.log(`[Email/Gmail-587] Confirmation email sent successfully to ${to} (ID: ${info.messageId})`);
        return { success: true, provider: "gmail", messageId: info.messageId };
      } catch (err587: any) {
        console.error("[Email/Gmail-587] Gmail SMTP failed completely:", err587.message);

        // If Resend API is configured as fallback, try Resend HTTPS API
        if (resendApiKey) {
          console.log("[Email/Gmail] Falling back to Resend API over HTTPS...");
          return await sendViaResend(resendApiKey, to, subject, html, text);
        }

        return { success: false, provider: "gmail", error: `Gmail SMTP failed: ${err587.message}` };
      }
    }
  }

  // ── 2. Resend API Provider (Over HTTPS - 100% Reliable on Vercel) ─────
  if (resendApiKey) {
    return await sendViaResend(resendApiKey, to, subject, html, text);
  }

  // ── 3. Custom SMTP Provider ──────────────────────────────────────────
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      const fromAddress = process.env.EMAIL_FROM || `AWS Student Builder Group <${smtpUser}>`;

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

  // ── 4. Missing Credentials Notice ─────────────────────────────────────
  console.warn("==================================================================");
  console.warn("[Email/Warning] No email credentials found in environment variables!");
  console.warn("Add GMAIL_USER & GMAIL_APP_PASSWORD (or RESEND_API_KEY) in your");
  console.warn("deployment platform's Environment Variables settings.");
  console.warn(`Attempted recipient: ${to} (${fullName})`);
  console.warn("==================================================================");

  return {
    success: true,
    provider: "simulated",
    messageId: `sim_${Date.now()}`,
  };
}

async function sendViaResend(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<SendEmailResult> {
  try {
    const fromAddress =
      process.env.EMAIL_FROM ||
      process.env.RESEND_FROM ||
      "AWS Student Builder Group <onboarding@resend.dev>";

    const resend = new Resend(apiKey);
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
