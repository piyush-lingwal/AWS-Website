import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isRecruitmentOpen } from "@/lib/recruitment";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+91 \d{10}$/;

// Must match INTERESTS array in app/register/page.tsx exactly
const VALID_INTEREST_AREAS = [
  "AWS & Cloud",
  "Web / App Development",
  "AI & Machine Learning",
  "UI/UX Design",
  "Graphic Design",
  "Photography",
  "Video Editing",
  "Content & Copywriting",
  "Social Media",
  "Event Planning",
  "Public Relations",
  "Sponsorships & Outreach",
  "DevOps & Linux",
  "Cyber Security",
  "Teaching & Mentoring",
];

function validatePayload(body: Record<string, string>) {
  const errors: Record<string, string> = {};

  if (!body.fullName?.trim()) errors.fullName = "Full name is required.";
  if (!body.universityEmail?.trim() || !EMAIL_RE.test(body.universityEmail)) {
    errors.universityEmail = "A valid email is required.";
  }
  if (!body.phoneNumber?.trim() || !PHONE_RE.test(body.phoneNumber)) {
    errors.phoneNumber = "A valid phone number (+91 XXXXXXXXXX) is required.";
  }
  if (!body.rollNumber?.trim()) errors.rollNumber = "Roll number is required.";
  if (!body.course?.trim()) errors.course = "Course is required.";
  if (!body.year?.trim()) errors.year = "Year is required.";
  if (!body.wing?.trim()) errors.wing = "Please select at least one wing.";

  let interestAreas: string[] = [];
  try {
    interestAreas = JSON.parse(body.interestAreas || "[]");
  } catch {
    errors.interestAreas = "Interest areas were malformed.";
  }
  if (!Array.isArray(interestAreas) || interestAreas.length === 0) {
    errors.interestAreas = "Select at least one area of interest.";
  } else if (!interestAreas.every((a) => VALID_INTEREST_AREAS.includes(a))) {
    errors.interestAreas = "Interest areas contain an invalid value.";
  }

  if (!body.whyJoin?.trim() || body.whyJoin.trim().length < 20) {
    errors.whyJoin = "Please write at least a couple of sentences.";
  }

  return { errors, interestAreas };
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

    const { errors, interestAreas } = validatePayload(body);

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
      phoneNumber,
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

    // Insert application row
    const { data, error: insertError } = await supabaseAdmin
      .from("sbg_applications")
      .insert({
        full_name: fullName.trim(),
        university_email: universityEmail.trim().toLowerCase(),
        personal_email: (personalEmail ?? universityEmail).trim().toLowerCase(),
        phone_number: phoneNumber.trim(),
        roll_number: rollNumber.trim(),
        course: course.trim(),
        branch: course.trim() === "B.Tech" ? (branch?.trim() || null) : null,
        year: year.trim(),
        wing: wing.trim(),
        interest_areas: interestAreas,
        github_url: githubUrl?.trim() || null,
        linkedin_url: linkedinUrl?.trim() || null,
        why_join: whyJoin.trim(),
        leadership_experience: leadershipExperience?.trim() || null,
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
