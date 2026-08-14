export interface ApplicationEmailData {
  to: string;
  fullName: string;
  year: string;
  course: string;
  branch: string;
  wings: string[];
  rollNumber: string;
  resumeUrl?: string;
}

export function generateApplicationEmailHtml(data: ApplicationEmailData): string {
  const { fullName, year, course, branch, wings, rollNumber, resumeUrl } = data;
  const wingsString = wings.join(" & ");
  const academicProfile = [year, course, branch && branch !== "N/A" ? `(${branch})` : ""].filter(Boolean).join(" · ");

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received - AWS Student Builders Group</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F1F5F9;
      color: #1E293B;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
    }
    td {
      padding: 0;
    }
    img {
      border: 0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F1F5F9;
      padding-top: 32px;
      padding-bottom: 48px;
    }
    .main {
      background-color: #FFFFFF;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-spacing: 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    }
    .btn-meetup {
      background-color: #E11D48;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      display: inline-block;
      letter-spacing: 0.3px;
    }
    .btn-builder {
      background-color: #0284C7;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      display: inline-block;
      letter-spacing: 0.3px;
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F1F5F9;color:#1E293B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <center class="wrapper" style="width:100%;table-layout:fixed;background-color:#F1F5F9;padding-top:32px;padding-bottom:48px;">
    <table class="main" width="100%" style="background-color:#FFFFFF;margin:0 auto;width:100%;max-width:600px;border-radius:12px;overflow:hidden;border:1px solid #E2E8F0;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
      
      <!-- Top Solid Brand Accent Bar -->
      <tr>
        <td style="background-color: #7C3AED; height: 4px;"></td>
      </tr>

      <!-- Header Logo / Community Name -->
      <tr>
        <td style="padding: 28px 32px 20px 32px; text-align: left; background-color: #FFFFFF; border-bottom: 1px solid #F1F5F9;">
          <table width="100%">
            <tr>
              <td>
                <span style="font-size: 12px; font-weight: 800; color: #7C3AED; letter-spacing: 1px; text-transform: uppercase; font-family: monospace; display: block; margin-bottom: 2px;">
                  AWS STUDENT BUILDERS GROUP
                </span>
                <span style="font-size: 13px; color: #64748B; font-family: -apple-system, sans-serif;">
                  Tula&apos;s University · Dehradun Chapter
                </span>
              </td>
              <td style="text-align: right;">
                <span style="background-color: #ECFDF5; border: 1px solid #A7F3D0; color: #059669; font-size: 11px; font-family: monospace; font-weight: 700; padding: 4px 10px; border-radius: 9999px;">
                  ● CONFIRMED
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Main Body -->
      <tr>
        <td style="padding: 32px;">

          <!-- Salutation & Celebration Title -->
          <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.4px;">
            Application Received! 🚀
          </h1>
          <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #334155;">
            Hi <strong style="color: #0F172A;">${fullName}</strong>, thank you for applying to join the <strong style="color: #7C3AED;">AWS Student Builders Group</strong> for <strong style="color: #0F172A;">Cohort 2026</strong>. Your builder credentials have been securely logged in our database.
          </p>

          <!-- Official Builder Record Box -->
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
            <div style="font-size: 11px; font-family: monospace; color: #7C3AED; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; font-weight: 800;">
              OFFICIAL BUILDER RECORD
            </div>

            <table width="100%" style="font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748B; width: 38%;">Candidate Name</td>
                <td style="padding: 6px 0; color: #0F172A; font-weight: 600;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748B;">Academic Profile</td>
                <td style="padding: 6px 0; color: #334155;">${academicProfile}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748B;">Student Roll No</td>
                <td style="padding: 6px 0; color: #334155; font-family: monospace; font-weight: 600;">${rollNumber}</td>
              </tr>
              ${resumeUrl ? `
              <tr>
                <td style="padding: 6px 0; color: #64748B;">Resume (PDF)</td>
                <td style="padding: 6px 0; color: #7C3AED; font-family: monospace; font-size: 12px;">
                  <a href="${resumeUrl}" target="_blank" style="color: #7C3AED; font-weight: 600; text-decoration: underline;">View Candidate Resume (PDF) &rarr;</a>
                </td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 6px 0; color: #64748B;">Applied Wing(s)</td>
                <td style="padding: 6px 0; color: #7C3AED; font-weight: 700;">${wingsString}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748B;">Application Status</td>
                <td style="padding: 6px 0; color: #059669; font-weight: 700;">Queued for Shortlist Review</td>
              </tr>
            </table>
          </div>

          <!-- Mandatory Action Steps Box -->
          <div style="background-color: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 12px; padding: 22px; margin-bottom: 26px;">
            <div style="font-size: 11px; font-family: monospace; color: #B45309; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; font-weight: 800;">
              ⚡ CRITICAL NEXT STEPS
            </div>
            <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #1E1B4B;">
              Complete Your Community Onboarding
            </h2>
            <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: #4B5563;">
              All interview notifications, offline cloud workshop seats, hackathon challenges, and free AWS credits are coordinated exclusively through our official platforms:
            </p>

            <!-- Action 1: Meetup -->
            <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 3px;">
                1. Join Official Meetup Group <span style="font-size: 10px; color: #E11D48; background-color: #FFE4E6; padding: 2px 6px; border-radius: 4px; font-family: monospace; margin-left: 4px;">REQUIRED</span>
              </div>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748B;">
                Receive interview invites, RSVP for offline hands-on workshops, and connect with fellow builders.
              </p>
              <a href="https://www.meetup.com/tulas-university-dehradun/" target="_blank" class="btn-meetup" style="background-color: #E11D48; color: #FFFFFF !important; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 12px; display: inline-block;">
                Join Meetup Group &rarr;
              </a>
            </div>

            <!-- Action 2: AWS Builder Center -->
            <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 3px;">
                2. AWS Builder Center Community <span style="font-size: 10px; color: #0284C7; background-color: #E0F2FE; padding: 2px 6px; border-radius: 4px; font-family: monospace; margin-left: 4px;">RECOMMENDED</span>
              </div>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748B;">
                Claim your official AWS Student Builder digital badge, skill badges & access free AWS Cloud credits.
              </p>
              <a href="https://builder.aws.com/content/3C075iQJeEx03mnzHwmXO9zdgEG/aws-student-builder-groups" target="_blank" class="btn-builder" style="background-color: #0284C7; color: #FFFFFF !important; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 12px; display: inline-block;">
                Join AWS Builder Space &rarr;
              </a>
            </div>
          </div>

          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #64748B;">
            Have questions? Feel free to reply directly to this email or reach out to us at our next meetup session.
          </p>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding: 20px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748B; font-family: monospace; font-weight: 600;">
            AWS STUDENT BUILDERS GROUP · TULA&apos;S UNIVERSITY DEHRADUN
          </p>
          <p style="margin: 0; font-size: 11px; color: #94A3B8;">
            This is an automated confirmation for your application to AWS SBG Cohort 2026.
          </p>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>
  `.trim();
}

export function generateApplicationEmailText(data: ApplicationEmailData): string {
  const { fullName, year, course, branch, wings, rollNumber, resumeUrl } = data;
  const wingsString = wings.join(" & ");
  const academicProfile = [year, course, branch && branch !== "N/A" ? `(${branch})` : ""].filter(Boolean).join(" · ");

  return `
AWS STUDENT BUILDERS GROUP - TULA'S UNIVERSITY
Application Received & Logged

Hi ${fullName},

Thank you for applying to join the AWS Student Builders Group (Cohort 2026)!
Your builder credentials have been securely logged in our database.

--- YOUR APPLICATION DETAILS ---
Candidate: ${fullName}
Academic Profile: ${academicProfile}
Roll Number: ${rollNumber}
${resumeUrl ? `Resume (PDF): ${resumeUrl}\n` : ""}Applied Wing(s): ${wingsString}
Status: Queued for Shortlist Review

--- MANDATORY NEXT STEPS ---
To guarantee your active candidate status, please join our official community channels:

1. Join Official Meetup Group (REQUIRED FOR INTERVIEWS & WORKSHOPS):
https://www.meetup.com/tulas-university-dehradun/

2. Join AWS Builder Center Community (RECOMMENDED):
https://builder.aws.com/content/3C075iQJeEx03mnzHwmXO9zdgEG/aws-student-builder-groups

Best regards,
AWS Student Builders Group Team
Tula's University, Dehradun
  `.trim();
}


