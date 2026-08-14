import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isRecruitmentOpen } from "@/lib/recruitment";
import { sendApplicationConfirmationEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      rollNumber,
      course,
      branch,
      year,
      wing,
    } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database configuration error. Please check Supabase credentials." },
        { status: 500 }
      );
    }

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0].substring(0, 5);

    // Build the insert payload containing only active form fields matching live schema
    const payload: Record<string, any> = {
      full_name: fullName.trim(),
      email: universityEmail.trim().toLowerCase(),
      phone_number: normalizedPhone,
      roll_number: rollNumber.trim(),
      course: course.trim(),
      branch: branch?.trim() || "N/A",
      year: year.trim(),
      wing: wing.trim(),
      interest_areas: interestAreas,
      date: dateStr,
      time: timeStr,
    };

    // Resilient schema-adaptive insert
    let insertedRow: Record<string, any> | null = null;
    let lastError: any = null;
    const maxRetries = 6;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const { data, error: insertError } = await supabaseAdmin
        .from("sbg_applications")
        .insert(payload)
        .select()
        .maybeSingle();

      if (!insertError) {
        insertedRow = data || { id: `sbg_${Date.now()}`, date: dateStr, time: timeStr };
        lastError = null;
        break;
      }

      lastError = insertError;
      console.warn(`[Register] Insert attempt ${attempt + 1} failed:`, insertError.message || insertError);

      // Check if error is due to an unknown column in schema cache
      const missingColumnMatch = (insertError.message || "").match(
        /Could not find the '([^']+)' column of 'sbg_applications'/i
      );

      if (missingColumnMatch && missingColumnMatch[1]) {
        const missingCol = missingColumnMatch[1];
        console.warn(`[Register] Removing missing column '${missingCol}' from payload and retrying...`);
        delete payload[missingCol];

        // Handle common column alias fallbacks
        if (missingCol === "email" && !payload.university_email) {
          payload.university_email = universityEmail.trim().toLowerCase();
        } else if (missingCol === "university_email" && !payload.email) {
          payload.email = universityEmail.trim().toLowerCase();
        }
        continue;
      }

      // If column doesn't exist error (PG 42703)
      const colDoesNotExistMatch = (insertError.message || "").match(
        /column [^.]*\.?([a-zA-Z0-9_]+) does not exist/i
      );
      if (colDoesNotExistMatch && colDoesNotExistMatch[1]) {
        const missingCol = colDoesNotExistMatch[1];
        console.warn(`[Register] Removing PG missing column '${missingCol}' from payload and retrying...`);
        delete payload[missingCol];
        continue;
      }

      break;
    }

    if (lastError && !insertedRow) {
      console.error("[Register] Supabase insert failed permanently:", lastError);
      return NextResponse.json(
        { error: `Database Error: ${lastError.message || "Failed to record application. Please try again."}` },
        { status: 500 }
      );
    }

    // Trigger confirmation email asynchronously
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
      { 
        success: true, 
        id: insertedRow?.id || `sbg_${Date.now()}`, 
        submittedAt: insertedRow?.created_at || (insertedRow?.date ? `${insertedRow.date} ${insertedRow.time || ""}`.trim() : new Date().toISOString()) 
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("Unexpected error in /api/register:", e);
    return NextResponse.json(
      { error: e?.message || "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
