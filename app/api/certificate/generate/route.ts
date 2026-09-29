// ============================================================
// POST /api/certificate/generate
// ============================================================
//
// Generates a single certificate PDF and returns it for download.
//
// Issuance is limited to one certificate per email/event and, as a
// best-effort browser guard, one certificate per device cookie/event.
//
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCertificateEventById } from "@/config/certificate-events";
import { generateCertificatePdf } from "@/lib/certificates/pdf-generator";
import type {
  GenerateCertificateRequest,
  ApiResponse,
} from "@/types/certificate";

const CERTIFICATE_DEVICE_COOKIE = "aws_sbg_certificate_device";
const DEVICE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const EVENT_TIME_ZONE = "Asia/Kolkata";
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

interface ExistingCertificate {
  certificate_id: string;
}

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function validateIssuanceWindow(eventDate: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(eventDate);
  if (!match) {
    return "Invalid date format. Use ISO date (YYYY-MM-DD).";
  }

  const eventYear = Number(match[1]);
  const eventMonth = Number(match[2]);
  const eventDay = Number(match[3]);
  const eventTimestamp = Date.UTC(eventYear, eventMonth - 1, eventDay);
  const parsedEventDate = new Date(eventTimestamp);

  if (
    parsedEventDate.getUTCFullYear() !== eventYear ||
    parsedEventDate.getUTCMonth() !== eventMonth - 1 ||
    parsedEventDate.getUTCDate() !== eventDay
  ) {
    return "Invalid event date.";
  }

  const today = getDatePartsInTimeZone(new Date(), EVENT_TIME_ZONE);
  const todayTimestamp = Date.UTC(today.year, today.month - 1, today.day);
  const daysSinceEvent =
    (todayTimestamp - eventTimestamp) / MILLISECONDS_PER_DAY;

  if (daysSinceEvent < 0) {
    return "Certificates can only be generated on or after the event date.";
  }

  if (daysSinceEvent > 1) {
    return "Certificate generation closes one day after the event.";
  }

  return null;
}

function duplicateResponse(
  certificateId: string,
  reason: "email" | "device"
) {
  const subject = reason === "email" ? "email address" : "device";

  return NextResponse.json(
    {
      success: false,
      error: `A certificate for this event has already been issued to this ${subject}. Certificate ID: ${certificateId}`,
      data: { certificateId },
    } satisfies ApiResponse<{ certificateId: string }>,
    { status: 409 }
  );
}

/**
 * Validates the generation request body.
 */
function validateRequest(
  body: Partial<GenerateCertificateRequest>
): { valid: false; errors: Record<string, string> } | { valid: true } {
  const errors: Record<string, string> = {};

  if (!body.participantName?.trim()) {
    errors.participantName = "Participant name is required.";
  } else if (body.participantName.trim().length < 2) {
    errors.participantName =
      "Participant name must be at least 2 characters.";
  } else if (body.participantName.trim().length > 100) {
    errors.participantName =
      "Participant name must be at most 100 characters.";
  }

  const email = body.participantEmail?.trim();
  if (!email) {
    errors.participantEmail = "Participant email is required.";
  } else if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.participantEmail = "A valid participant email is required.";
  }

  if (!body.eventId?.trim()) {
    errors.eventId = "Please select an event.";
  } else {
    const event = getCertificateEventById(body.eventId.trim());
    if (!event) {
      errors.eventId = "The selected event is not eligible for certificates.";
    } else {
      const issuanceWindowError = validateIssuanceWindow(event.date);
      if (issuanceWindowError) {
        errors.eventId = issuanceWindowError;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: Partial<GenerateCertificateRequest>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body.",
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // Validate input
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed.",
          data: validation.errors,
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const email = body.participantEmail!.trim().toLowerCase();
    const studentName = body.participantName!.trim();
    const event = getCertificateEventById(body.eventId!.trim());

    // validateRequest guarantees this, while the explicit guard keeps the
    // trusted event boundary obvious if validation changes later.
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "The selected event is not eligible for certificates.",
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const eventTitle = event.title;
    const eventDate = event.date;
    const deviceCookie = request.cookies.get(CERTIFICATE_DEVICE_COOKIE)?.value;
    const existingDeviceId =
      deviceCookie &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        deviceCookie
      )
        ? deviceCookie
        : undefined;
    const deviceId = existingDeviceId || randomUUID();

    // Duplicate checks happen before the expensive PDF rendering work.
    const { getAdminClient } = await import("@/lib/supabase/admin");
    const supabase = getAdminClient();

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Database configuration is missing. Cannot securely issue certificate.",
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    const emailLookup = await supabase
      .from("certificates")
      .select("certificate_id")
      .eq("metadata->>studentEmail", email)
      .eq("event_title", eventTitle)
      .eq("event_date", eventDate)
      .limit(1)
      .maybeSingle<ExistingCertificate>();

    if (emailLookup.error) {
      console.error(
        "[API/generate] Duplicate email lookup failed:",
        emailLookup.error
      );
      return NextResponse.json(
        {
          success: false,
          error: "Could not verify certificate eligibility. Please try again.",
        } satisfies ApiResponse,
        { status: 503 }
      );
    }

    if (emailLookup.data) {
      return duplicateResponse(emailLookup.data.certificate_id, "email");
    }

    if (existingDeviceId) {
      const deviceLookup = await supabase
        .from("certificates")
        .select("certificate_id")
        .eq("metadata->>deviceId", existingDeviceId)
        .eq("event_title", eventTitle)
        .eq("event_date", eventDate)
        .limit(1)
        .maybeSingle<ExistingCertificate>();

      if (deviceLookup.error) {
        console.error(
          "[API/generate] Duplicate device lookup failed:",
          deviceLookup.error
        );
        return NextResponse.json(
          {
            success: false,
            error: "Could not verify certificate eligibility. Please try again.",
          } satisfies ApiResponse,
          { status: 503 }
        );
      }

      if (deviceLookup.data) {
        return duplicateResponse(deviceLookup.data.certificate_id, "device");
      }
    }

    // Generate certificate PDF
    const result = await generateCertificatePdf({
      participantName: studentName,
      eventTitle,
      eventDate,
      achievementText: body.achievementText?.trim() || undefined,
      signerName: body.signerName?.trim() || undefined,
      signerTitle: body.signerTitle?.trim() || undefined,
    });

    if (!result.success || !result.pdfBuffer) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Certificate generation failed.",
        } satisfies ApiResponse,
        { status: 500 }
      );
    }

    if (supabase && result.certificateId) {
      let participantId: string | null = null;
      let eventId: string | null = null;

      // 1. Link or create participant if email is provided
      try {
        const { data: existingParticipant } = await supabase
          .from("participants")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existingParticipant) {
          participantId = existingParticipant.id;
        } else {
          const { data: newParticipant } = await supabase
            .from("participants")
            .insert({
              full_name: studentName,
              email,
            })
            .select("id")
            .single();
          if (newParticipant) {
            participantId = newParticipant.id;
          }
        }
      } catch (pErr) {
        console.warn("[API/generate] Participant lookup/creation error:", pErr);
      }

      // 2. Link or create event record
      try {
        const eventSlug = event.id;

        const { data: existingEvent } = await supabase
          .from("events")
          .select("id")
          .eq("slug", eventSlug)
          .maybeSingle();

        if (existingEvent) {
          eventId = existingEvent.id;
        } else {
          const { data: newEvent } = await supabase
            .from("events")
            .insert({
              title: eventTitle,
              slug: eventSlug,
              event_date: eventDate,
              status: "PUBLISHED",
            })
            .select("id")
            .single();
          if (newEvent) {
            eventId = newEvent.id;
          }
        }
      } catch (eErr) {
        console.warn("[API/generate] Event lookup/creation error:", eErr);
      }

      // 3. Insert the official Certificate record
      const verificationUrl = `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/certificate/verify/${result.certificateId}`;

      const { error: insertError } = await supabase.from("certificates").insert({
        certificate_id: result.certificateId,
        participant_id: participantId,
        event_id: eventId,
        participant_name: studentName,
        event_title: eventTitle,
        event_date: eventDate,
        achievement_text:
          body.achievementText?.trim() ||
          "For outstanding achievement in the AWS Student Builder Group",
        signer_name: body.signerName?.trim() || "Piyush lingwal",
        signer_title:
          body.signerTitle?.trim() ||
          "Community Program Manager / AWS Student Builder Groups",
        status: "GENERATED",
        verification_url: verificationUrl,
        issue_date: new Date().toISOString().split("T")[0],
        metadata: {
          studentEmail: email,
          deviceId,
          generatedAt: new Date().toISOString(),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          engine: "svg-vector-ibm-plex",
        },
      });

      if (insertError) {
        console.error("[API/generate] Certificate DB insert error:", insertError);

        // A database unique index closes the race between the lookup above
        // and this insert. Resolve the winner so the client still receives 409.
        if (insertError.code === "23505") {
          const { data: concurrentCertificate } = await supabase
            .from("certificates")
            .select("certificate_id")
            .eq("metadata->>studentEmail", email)
            .eq("event_title", eventTitle)
            .eq("event_date", eventDate)
            .limit(1)
            .maybeSingle<ExistingCertificate>();

          if (concurrentCertificate) {
            return duplicateResponse(
              concurrentCertificate.certificate_id,
              "email"
            );
          }

          const { data: concurrentDeviceCertificate } = await supabase
            .from("certificates")
            .select("certificate_id")
            .eq("metadata->>deviceId", deviceId)
            .eq("event_title", eventTitle)
            .eq("event_date", eventDate)
            .limit(1)
            .maybeSingle<ExistingCertificate>();

          if (concurrentDeviceCertificate) {
            return duplicateResponse(
              concurrentDeviceCertificate.certificate_id,
              "device"
            );
          }
        }

        return NextResponse.json(
          {
            success: false,
            error: "Failed to store certificate in registry. Aborting issuance.",
          } satisfies ApiResponse,
          { status: 500 }
        );
      } else {
        console.log(`[API/generate] Stored certificate ${result.certificateId} in Supabase registry.`);
      }

      // 4. Create an immutable Audit Log entry
      try {
        await supabase.from("audit_logs").insert({
          action: "CERTIFICATE_GENERATED",
          resource_type: "CERTIFICATE",
          resource_id: result.certificateId,
          result: "SUCCESS",
          metadata: {
            participantName: studentName,
            participantEmail: email || null,
            eventTitle: eventTitle,
            eventDate: eventDate,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (aErr) {
        console.warn("[API/generate] Audit log error:", aErr);
      }

      // 5. Record attendance in the certificate_attendance table
      const enrollmentNo = body.enrollmentNo?.trim();
      const program = body.program?.trim();
      if (enrollmentNo && program) {
        try {
          const { error: attInsertErr } = await supabase.from("certificate_attendance").insert({
            full_name: studentName,
            college_email: email || "",
            enrollment_no: enrollmentNo,
            program: program,
            event_title: eventTitle,
            event_date: eventDate,
            certificate_id: result.certificateId,
          });
          if (attInsertErr) {
            console.error("[API/generate] Attendance insert error:", attInsertErr);
          } else {
            console.log(`[API/generate] Attendance recorded for ${studentName}`);
          }
        } catch (attErr) {
          console.warn("[API/generate] Attendance recording error:", attErr);
        }
      }
    }

    // Return PDF as downloadable file
    const filename = `${result.certificateId}.pdf`;

    const response = new NextResponse(new Uint8Array(result.pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": result.pdfBuffer.length.toString(),
        "X-Certificate-Id": result.certificateId!,
      },
    });

    response.cookies.set(CERTIFICATE_DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: DEVICE_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[API/generate] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during certificate generation.",
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
