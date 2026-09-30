import { Resend } from "resend";
import nodemailer from "nodemailer";
import {
  ApplicationEmailData,
  generateApplicationEmailHtml,
  generateApplicationEmailText,
} from "./templates/application-confirmation";
import {
  CertificateEmailData,
  generateCertificateEmailHtml,
  generateCertificateEmailText,
} from "./templates/certificate-delivery";

export interface SendEmailResult {
  success: boolean;
  provider?: "resend" | "smtp" | "gmail" | "simulated";
  messageId?: string;
  error?: string;
  details?: string;
}

export interface SendCertificateEmailParams extends CertificateEmailData {
  pdfBuffer: Buffer;
  overrideRecipientEmail?: string;
}

/**
 * Creates a Nodemailer transporter configured for Gmail.
 * Prefers the native 'gmail' service definition with failover to explicit SMTP ports.
 */
function createGmailTransporter(user: string, pass: string, port = 465, secure = true) {
  if (port === 465) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
    });
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Diagnostic helper to verify email credentials connectivity.
 */
export async function verifyEmailConfig(): Promise<{
  gmail: { configured: boolean; working: boolean; error?: string };
  resend: { configured: boolean; working: boolean; error?: string; isTestMode?: boolean; ownerEmail?: string };
  recommendedProvider: "gmail" | "resend" | "smtp" | "simulated";
}> {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  const result = {
    gmail: { configured: !!(gmailUser && gmailPass), working: false, error: undefined as string | undefined },
    resend: { configured: !!resendApiKey, working: false, error: undefined as string | undefined, isTestMode: true, ownerEmail: gmailUser },
    recommendedProvider: "simulated" as "gmail" | "resend" | "smtp" | "simulated",
  };

  if (gmailUser && gmailPass) {
    try {
      const transporter = createGmailTransporter(gmailUser, gmailPass, 465, true);
      await transporter.verify();
      result.gmail.working = true;
      result.recommendedProvider = "gmail";
    } catch (err: any) {
      result.gmail.error = err.message || "Authentication failed";
    }
  }

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const apiKeys = await resend.apiKeys.list();
      if (!apiKeys.error || apiKeys.error.message.includes("restricted to only send emails")) {
        result.resend.working = true;
        if (!result.gmail.working) {
          result.recommendedProvider = "resend";
        }
      } else {
        result.resend.error = apiKeys.error.message;
      }
    } catch (err: any) {
      if (err.message?.includes("restricted to only send emails")) {
        result.resend.working = true;
        if (!result.gmail.working) {
          result.recommendedProvider = "resend";
        }
      } else {
        result.resend.error = err.message || "Failed to connect to Resend API";
      }
    }
  }

  return result;
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
 * Sends an official certificate delivery email with attached PDF.
 */
export async function sendCertificateEmail(
  data: SendCertificateEmailParams
): Promise<SendEmailResult> {
  const { to, certificateId, pdfBuffer, overrideRecipientEmail } = data;
  const targetEmail = overrideRecipientEmail?.trim() || to.trim();
  const subject = `Your Certificate of Participation — AWS Student Builder Group (${data.eventName})`;
  const html = generateCertificateEmailHtml(data);
  const text = generateCertificateEmailText(data);

  const attachments = [
    {
      filename: `${certificateId}.pdf`,
      content: pdfBuffer,
    },
  ];

  return sendGenericEmail({ to: targetEmail, subject, html, text, attachments });
}

/**
 * Core multi-provider email dispatcher:
 * 1. Gmail SMTP (Optimized with service: "gmail" and fallback port 587)
 * 2. Resend REST API (HTTPS port 443, detects test-mode restrictions)
 * 3. Custom SMTP
 * 4. Simulated Provider (if configured or development fallback)
 */
async function sendGenericEmail({
  to,
  subject,
  html,
  text,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}): Promise<SendEmailResult> {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const allowSimulation = process.env.EMAIL_SIMULATE === "true" || process.env.NODE_ENV === "development";

  let gmailLastError: string | null = null;

  // ── 1. Gmail SMTP ──────────────────────────────────────────────────
  if (gmailUser && gmailPass) {
    const fromHeader = `AWS Student Builder Group <${gmailUser}>`;

    // Attempt 1: Service "gmail" (Port 465 SSL)
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

      console.log(`[Email/Gmail] Email sent successfully to ${to} (Message ID: ${info.messageId})`);
      return { success: true, provider: "gmail", messageId: info.messageId };
    } catch (err465: any) {
      gmailLastError = err465.message || "Port 465 authentication failed";
      console.warn(`[Email/Gmail-465] Port 465 failed: ${gmailLastError}`);

      // If bad credentials, trying another port won't fix invalid password
      const isBadCredentials =
        Boolean(
          gmailLastError &&
            (gmailLastError.includes("535") ||
              gmailLastError.includes("BadCredentials") ||
              gmailLastError.includes("Username and Password not accepted"))
        );

      if (!isBadCredentials) {
        // Attempt 2: Port 587 (STARTTLS) for network-specific port blocks
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

          console.log(`[Email/Gmail-587] Email sent successfully to ${to} (Message ID: ${info.messageId})`);
          return { success: true, provider: "gmail", messageId: info.messageId };
        } catch (err587: any) {
          gmailLastError = err587.message || "Port 587 failed";
          console.warn(`[Email/Gmail-587] Port 587 failed: ${gmailLastError}`);
        }
      }
    }
  }

  // ── 2. Resend API Provider ──────────────────────────────────────────
  if (resendApiKey) {
    console.log(`[Email/Resend] Attempting delivery via Resend API to ${to}...`);
    const resendResult = await sendViaResend(resendApiKey, to, subject, html, text, attachments);

    if (resendResult.success) {
      return resendResult;
    }

    // Check for free tier test-mode domain restriction
    const isDomainRestriction =
      resendResult.error?.includes("only send testing emails to your own email address") ||
      resendResult.error?.includes("resend.com/domains");

    if (isDomainRestriction) {
      const guidance = gmailLastError
        ? `Gmail failed (${gmailLastError}). Resend is in sandbox mode (only allows sending to account owner ${gmailUser || "your email"}). To send to students, provide a valid 16-character Google App Password or verify a custom domain on Resend.`
        : `Resend is in sandbox mode and only allows sending to the account owner (${gmailUser || "your email"}). To send to other recipients, verify a domain at resend.com/domains or configure Gmail SMTP in .env.local.`;

      console.error(`[Email/Resend-Restriction] ${guidance}`);

      if (allowSimulation) {
        console.warn(`[Email/DevFallback] Simulating successful delivery to ${to} for development.`);
        return {
          success: true,
          provider: "simulated",
          messageId: `sim_${Date.now()}`,
          details: guidance,
        };
      }

      return {
        success: false,
        provider: "resend",
        error: guidance,
      };
    }

    // Other Resend error
    if (!allowSimulation) {
      return {
        success: false,
        provider: "resend",
        error: `Resend API Error: ${resendResult.error}`,
      };
    }
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
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 12000,
      });

      const fromAddress = process.env.EMAIL_FROM || `AWS Student Builder Group <${smtpUser}>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        text,
        attachments,
      });

      console.log(`[Email/SMTP] Email sent successfully to ${to} (Message ID: ${info.messageId})`);
      return { success: true, provider: "smtp", messageId: info.messageId };
    } catch (err: any) {
      console.error("[Email/SMTP] Error sending email via SMTP:", err);
      if (!allowSimulation) {
        return { success: false, provider: "smtp", error: err.message };
      }
    }
  }

  // ── 4. Simulated Provider ───────────────────────────────────────────
  console.warn("==================================================================");
  console.warn("[Email/Simulation] No production delivery provider succeeded.");
  console.warn(`Simulating email delivery to: ${to}`);
  console.warn(`Subject: ${subject}`);
  if (gmailLastError) console.warn(`Gmail error was: ${gmailLastError}`);
  console.warn("==================================================================");

  return {
    success: true,
    provider: "simulated",
    messageId: `sim_${Date.now()}`,
    details: gmailLastError ? `Simulated (Gmail auth error: ${gmailLastError})` : "Simulated delivery",
  };
}

async function sendViaResend(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
  text: string,
  attachments?: Array<{ filename: string; content: Buffer }>
): Promise<SendEmailResult> {
  try {
    const fromAddress =
      process.env.RESEND_FROM ||
      (process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes("@gmail.com")
        ? process.env.EMAIL_FROM
        : "AWS Student Builder Group <onboarding@resend.dev>");

    const resend = new Resend(apiKey);
    const res = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html,
      text,
      attachments: attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
      })),
    });

    if (res.error) {
      console.error("[Email/Resend] Failed to send email:", res.error);
      return { success: false, provider: "resend", error: res.error.message };
    }

    console.log(`[Email/Resend] Email sent successfully to ${to} (ID: ${res.data?.id})`);
    return { success: true, provider: "resend", messageId: res.data?.id };
  } catch (err: any) {
    console.error("[Email/Resend] Unexpected error:", err);
    return { success: false, provider: "resend", error: err.message };
  }
}
