import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isRecruitmentOpen } from "@/lib/recruitment";
import { sendApplicationConfirmationEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+91 \d{10}$/;

function validatePayload(body: Record<string, string>) {
  const errors: Record<string, string> = {};

  if (!body.fullName?.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!body.universityEmail?.trim() || !EMAIL_RE.test(body.universityEmail.trim())) {
    errors.universityEmail = "A valid email address is required.";
  }

  // Normalize phone number (handle raw 10-digit or +91 formatted)
  let rawPhone = (body.phoneNumber || "").trim();
  const digits = rawPhone.replace(/\D/g, "");
  let normalizedPhone = "";
  if (digits.length === 10) {
    normalizedPhone = `+91 ${digits}`;
  } else if (digits.length === 12 && digits.startsWith("91")) {
    normalizedPhone = `+91 ${digits.slice(2)}`;
  } else {
    normalizedPhone = rawPhone;
  }

  if (!normalizedPhone || !PHONE_RE.test(normalizedPhone)) {
    errors.phoneNumber = "A valid 10-digit phone number (+91 XXXXXXXXXX) is required.";
  }

  if (!body.rollNumber?.trim()) {
    errors.rollNumber = "Roll number is required.";
  }

  if (!body.course?.trim()) {
    errors.course = "Course is required.";
  }

  if (!body.year?.trim()) {
    errors.year = "Year is required.";
  }

  if (!body.wing?.trim()) {
    errors.wing = "Please select at least one wing.";
  }

  let interestAreas: string[] = [];
  try {
    const parsed = JSON.parse(body.interestAreas || "[]");
    if (Array.isArray(parsed)) {
      interestAreas = parsed.map(item => String(item).trim()).filter(Boolean);
    }
  } catch {
    interestAreas = [];
  }

  return { errors, interestAreas, normalizedPhone };
}

export async function POST(request: Request) {
  try {
    if (!isRecruitmentOpen()) {
      return NextResponse.json(
        { message: "Registrations are currently closed." },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    // Extract string fields
    const body: Record<string, string> = {};
    for (const [key, value] of Array.from(formData.entries())) {
      if (typeof value === "string") {
        body[key] = value;
      }
    }

    const { errors, interestAreas, normalizedPhone } = validatePayload(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed.", fieldErrors: errors },
        { status: 400 }
      );
    }

    const {
      fullName,
      universityEmail,
      personalEmail,
      rollNumber,
      course,
      branch,
      year,
      wing,
      githubUrl,
      linkedinUrl,
      whyJoin,
      leadershipExperience,
    } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database configuration error. Please try again later." },
        { status: 500 }
      );
    }

    // Insert application row
    const { data, error: insertError } = await supabaseAdmin
      .from("sbg_applications")
      .insert({
        full_name: fullName.trim(),
        university_email: universityEmail.trim().toLowerCase(),
        personal_email: (personalEmail || universityEmail).trim().toLowerCase(),
        phone_number: normalizedPhone,
        roll_number: rollNumber.trim(),
        course: course.trim(),
        branch: branch?.trim() || null,
        year: year.trim(),
        wing: wing.trim(),
        interest_areas: interestAreas,
        github_url: githubUrl?.trim() || null,
        linkedin_url: linkedinUrl?.trim() || null,
        why_join: whyJoin?.trim() || "Applied via AWS SBG Builder Registration Portal",
        leadership_experience: leadershipExperience?.trim() || null,
        used_aws: false,
        aws_services: [],
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("Insert failed:", insertError);
      return NextResponse.json(
        { error: `DB Error: ${insertError.message || JSON.stringify(insertError)}` },
        { status: 500 }
      );
    }

    // Trigger confirmation email
    try {
      await sendApplicationConfirmationEmail({
        to: universityEmail.trim().toLowerCase(),
        fullName: fullName.trim(),
        year: year.trim(),
        course: course.trim(),
        branch: branch?.trim() || "N/A",
        wings: interestAreas.length > 0 ? interestAreas : [wing.trim()],
        rollNumber: rollNumber.trim(),
      });
    } catch (emailError) {
      console.error("[Register] Failed to send confirmation email:", emailError);
    }

    return NextResponse.json(
      { success: true, id: data.id, submittedAt: data.created_at },
      { status: 201 }
    );
  } catch (e) {
    console.error("Unexpected error in /api/register:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
