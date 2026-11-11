import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import {
  ApplicationEmailData,
  generateApplicationEmailHtml,
  generateApplicationEmailText,
} from "./templates/application-confirmation";
import {
  CertificateSocialPlatform,
  CertificateEmailData,
  generateCertificateEmailHtml,
  generateCertificateEmailText,
} from "./templates/certificate-delivery";
import { getAwardTitle } from "../certificates/award-title";

export interface SendEmailResult {
  success: boolean;
  provider?: "smtp" | "gmail" | "simulated";
  messageId?: string;
  error?: string;
}

export interface SendCertificateEmailParams extends CertificateEmailData {
  pdfBuffer: Buffer;
}

type EmailAttachment = {
  filename: string;
  content: Buffer;
  cid?: string;
};

function withDisplayName(address: string, displayName?: string): string {
  if (!displayName) {
    return address;
  }

  const email = address.match(/<([^<>]+)>/)?.[1] ?? address;
  return `${displayName} <${email}>`;
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
 */
export async function sendApplicationConfirmationEmail(
  data: ApplicationEmailData
): Promise<SendEmailResult> {
  const { to } = data;
  const subject = `Application Received - AWS Student Builder Group (Cohort 2026)`;
  const html = generateApplicationEmailHtml(data);
  const text = generateApplicationEmailText(data);

  return sendGenericEmail({ to, subject, html, text });
}

/**
 * Sends an official certificate delivery email.
 * Meets Phase 8 requirement:
 * - Student name
 * - Event name
 * - Thank-you message
 * - Verification information
 * - AWS SBG branding
 */
export async function sendCertificateEmail(
  data: SendCertificateEmailParams
): Promise<SendEmailResult> {
  const { to } = data;
  const subject = getAwardTitle(data.awardTitle)
    ? `Congratulations on Your Achievement | ${data.eventName}`
    : `Your Certificate of Participation — ${data.eventName}`;
  const iconDefinitions: { platform: CertificateSocialPlatform; filename: string }[] = [
    { platform: "whatsapp", filename: "whatsapp.png" },
    { platform: "instagram", filename: "instagram.png" },
    { platform: "meetup", filename: "meetup.png" },
    { platform: "linkedin", filename: "linkedin.png" },
  ];
  const attachments: EmailAttachment[] = [];
  const iconSources: Partial<Record<CertificateSocialPlatform, string | null>> = {};
  for (const { platform, filename } of iconDefinitions) {
    const iconPath = path.join(process.cwd(), "public", "email", "icons", filename);
    const cid = `certificate-icon-${platform}`;
    if (existsSync(iconPath)) {
      attachments.push({ filename, content: readFileSync(iconPath), cid });
      iconSources[platform] = `cid:${cid}`;
    } else {
      iconSources[platform] = null;
    }
  }

  const html = generateCertificateEmailHtml(data, { iconSources });
  const text = generateCertificateEmailText(data);

  return sendGenericEmail({
    to,
    subject,
    html,
    text,
    ...(attachments.length > 0 ? { attachments } : {}),
    fromName: "AWS Student Builder Group",
  });
}

/**
 * Core multi-provider email dispatcher:
 * 1. Gmail SMTP (port 465 -> fallback port 587)
 * 2. Custom SMTP
 * 3. Development simulation
 */
async function sendGenericEmail({
  to,
  subject,
  html,
  text,
  attachments,
  fromName,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
  fromName?: string;
}): Promise<SendEmailResult> {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

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
        attachments,
      });

      console.log(`[Email/Gmail-465] Email sent successfully to ${to} (ID: ${info.messageId})`);
      return { success: true, provider: "gmail", messageId: info.messageId };
    } catch (err465: any) {
      console.warn("[Email/Gmail-465] Port 465 attempt failed, trying port 587:", err465.message);

      // Attempt 2: Port 587 (STARTTLS)
      try {
        const transporter587 = createGmailTransporter(gmailUser, gmailPass, 587, false);
        const info = await transporter587.sendMail({
          from: fromHeader,
          to,
          subject,
          html,
          text,
          attachments,
        });

        console.log(`[Email/Gmail-587] Email sent successfully to ${to} (ID: ${info.messageId})`);
        return { success: true, provider: "gmail", messageId: info.messageId };
      } catch (err587: any) {
        console.error("[Email/Gmail-587] Gmail SMTP failed completely:", err587.message);

        return { success: false, provider: "gmail", error: `Gmail SMTP failed: ${err587.message}` };
      }
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
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      const fromAddress = withDisplayName(
        process.env.EMAIL_FROM || `AWS Student Builder Group <${smtpUser}>`,
        fromName
      );

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        text,
        attachments,
      });

      console.log(`[Email/SMTP] Email sent successfully to ${to} (ID: ${info.messageId})`);
      return { success: true, provider: "smtp", messageId: info.messageId };
    } catch (err: any) {
      console.error("[Email/SMTP] Error sending email via SMTP:", err);
      return { success: false, provider: "smtp", error: err.message };
    }
  }

  // ── 3. Simulated Provider (No credentials configured) ────────────────
  console.warn("==================================================================");
  console.warn("[Email/Simulation] No email credentials configured (GMAIL_USER / SMTP_HOST).");
  console.warn(`Simulating email delivery to: ${to}`);
  console.warn(`Subject: ${subject}`);
  console.warn("==================================================================");

  return {
    success: true,
    provider: "simulated",
    messageId: `sim_${Date.now()}`,
  };
}
