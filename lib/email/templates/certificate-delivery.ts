export interface CertificateEmailData {
  to: string;
  recipientName: string;
  eventName: string;
  eventDate: string;
  certificateId: string;
  verificationUrl: string;
  awardTitle?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeVerificationHref(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Certificate verification URL must be an absolute URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Certificate verification URL must use HTTP or HTTPS.");
  }

  return escapeHtml(url.toString());
}

function generateCertificateMessageHtml(data: CertificateEmailData): string {
  const eventName = `<strong style="color:#1F1F2E;">${escapeHtml(data.eventName)}</strong>`;
  const groupName = '<strong style="color:#1F1F2E;">AWS Student Builder Group</strong>';

  if (data.awardTitle) {
    return `Congratulations on securing <strong style="color:#5B21B6;">${escapeHtml(data.awardTitle)}</strong> in ${eventName}, organized by the ${groupName} at Tulas University! 🏆`;
  }

  return `Thank you for participating in ${eventName}, organized by the ${groupName} at Tulas University!`;
}

function generateCertificateMessageText(data: CertificateEmailData): string {
  if (data.awardTitle) {
    return `Congratulations on securing ${data.awardTitle} in ${data.eventName}, organized by the AWS Student Builder Group at Tulas University! 🏆`;
  }

  return `Thank you for participating in ${data.eventName}, organized by the AWS Student Builder Group at Tulas University!`;
}

export function generateCertificateEmailHtml(
  data: CertificateEmailData,
  options: { bannerSrc?: string | null } = {}
): string {
  const safeRecipientName = escapeHtml(data.recipientName);
  const safeVerificationUrl = escapeVerificationHref(data.verificationUrl);
  const defaultBannerUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "https://awstulas.org").replace(/\/+$/, "")}/email/banner.png`;
  const bannerSrc =
    options.bannerSrc === undefined ? defaultBannerUrl : options.bannerSrc;
  const banner = bannerSrc
    ? `<tr><td style="padding:0;"><img src="${escapeHtml(bannerSrc)}" width="600" alt="AWS Student Builder Group" class="banner-img" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:10px 10px 0 0;"></td></tr>`
    : "";
  const eventParagraph = data.awardTitle
    ? "Your dedication, knowledge, and enthusiasm truly made you stand out. We are delighted to recognize your achievement and hope you continue learning, building, and pushing your limits."
    : "Your participation, curiosity, and enthusiasm truly made the event special. We appreciate your involvement and hope you continue learning, building, and growing with our community.";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${data.awardTitle ? "Congratulations on Your Achievement" : "Certificate of Participation"} | AWS SBG</title>
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .outer-wrap {
        padding: 12px 8px !important;
      }
      .email-card {
        width: 100% !important;
        border-radius: 12px !important;
      }
      .email-content {
        padding: 22px 18px 20px !important;
      }
      .btn-wrapper {
        width: 100% !important;
        max-width: 100% !important;
      }
      .btn-claim {
        display: block !important;
        width: 100% !important;
        padding: 16px 20px !important;
        font-size: 16px !important;
        text-align: center !important;
        box-sizing: border-box !important;
        border-radius: 10px !important;
      }
      .banner-img {
        border-radius: 12px 12px 0 0 !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F7F7FA;color:#1F1F2E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#F7F7FA;border-collapse:collapse;">
    <tr>
      <td align="center" class="outer-wrap" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="email-card" style="width:100%;max-width:600px;background-color:#FFFFFF;border:1px solid #EBE5F7;border-radius:12px;border-collapse:separate;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          ${banner}
          <tr>
            <td class="email-content" style="padding:28px 32px 24px;background-color:#FFFFFF;color:#1F1F2E;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#1F1F2E;">Dear <strong>${safeRecipientName}</strong>,</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#1F1F2E;">${generateCertificateMessageHtml(data)}</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#555566;">${eventParagraph}</p>
              
              <!-- Responsive CTA Button -->
              <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" class="btn-wrapper" style="width:100%;max-width:380px;margin:24px auto 28px;border-collapse:separate;">
                <tr>
                  <td align="center" bgcolor="#6D28D9" style="border-radius:10px;background-color:#6D28D9;">
                    <a href="${safeVerificationUrl}" class="btn-claim" style="display:block;padding:15px 32px;background-color:#6D28D9;border:1px solid #6D28D9;border-radius:10px;color:#FFFFFF !important;font-size:16px;font-weight:700;line-height:1.2;text-align:center;text-decoration:none;box-sizing:border-box;">Claim Your Certificate &rarr;</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#1F1F2E;">Thank you for being a part of our community. We look forward to seeing you achieve many more milestones in your journey!</p>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#1F1F2E;">Warm Regards,<br><strong style="color:#5B21B6;">Team AWS Student Builder Group</strong><br>Tulas University, Dehradun</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;background-color:#FFFFFF;text-align:center;">
              <div style="height:1px;background-color:#F3EEFF;font-size:0;line-height:0;">&nbsp;</div>
              <p style="margin:16px 0 0;font-size:11px;line-height:1.5;letter-spacing:1.5px;color:#9494A8;">Learn. Build. Innovate. Together.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateCertificateEmailText(data: CertificateEmailData): string {
  const message = generateCertificateMessageText(data);
  const eventParagraph = data.awardTitle
    ? "Your dedication, knowledge, and enthusiasm truly made you stand out. We are delighted to recognize your achievement and hope you continue learning, building, and pushing your limits."
    : "Your participation, curiosity, and enthusiasm truly made the event special. We appreciate your involvement and hope you continue learning, building, and growing with our community.";

  return [
    `Dear ${data.recipientName},`,
    "",
    message,
    "",
    eventParagraph,
    "",
    `Claim your certificate: ${data.verificationUrl}`,
    "",
    "Thank you for being a part of our community. We look forward to seeing you achieve many more milestones in your journey!",
    "",
    "Warm Regards,",
    "AWS Student Builder Group",
    "Tulas University, Dehradun",
    "",
    "Learn. Build. Innovate. Together.",
  ].join("\n");
}
