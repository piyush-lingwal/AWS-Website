// ============================================================
// POST /api/admin/certificates/send — Email Certificate Delivery
// ============================================================
//
// Sends certificate PDF via email to the recipient's email address
// stored in the database.
//
// Supports:
//   1. Single Send: { certificateId: "AWS-SBG-2026-XXXXXX" }
//   2. Bulk Send:   { eventId: "uuid" }
//
// Note: As per schema specifications, sent_at is NOT stored in DB.
//
// ============================================================

import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { generateCertificatePdf } from "@/lib/certificates/pdf-generator";
import { getEventCertificateTheme } from "@/lib/certificates/event-theme";
import { CERTIFICATE_OPTIONAL_COLUMNS, selectWithOptionalColumns } from "@/lib/certificates/optional-columns";
import { certificateDisplayDate } from "@/lib/certificates/issue-date";
import { sendCertificateEmail } from "@/lib/email";

const SINGLE_CERT_COLUMNS =
  "id, certificate_id, event_id, recipient_name_snapshot, event_name_snapshot, event_date_snapshot, award_title, verification_url, participant:participants(email, full_name)";
const BULK_CERT_COLUMNS =
  "id, certificate_id, recipient_name_snapshot, event_name_snapshot, event_date_snapshot, award_title, verification_url, participant:participants(email, full_name)";

interface CertRow {
  id: string;
  certificate_id: string;
  event_id?: string;
  recipient_name_snapshot: string;
  event_name_snapshot: string;
  event_date_snapshot: string | null;
  event_date_display_snapshot?: string | null;
  certificate_kind?: string | null;
  role_snapshot?: string | null;
  wing_snapshot?: string | null;
  award_title: string | null;
  verification_url: string | null;
  participant: { email: string | null; full_name: string | null } | { email: string | null; full_name: string | null }[] | null;
}
import type { ApiResponse } from "@/types/certificate";

export const dynamic = "force-dynamic";

interface SendCertificateBody {
  certificateId?: string;
  eventId?: string;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    let body: SendCertificateBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { certificateId, eventId } = body;
    if (!certificateId && !eventId) {
      return NextResponse.json(
        {
          success: false,
          error: "Either certificateId or eventId must be provided.",
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database client unavailable." } satisfies ApiResponse,
        { status: 500 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // CASE A: Single Certificate Send
    // ─────────────────────────────────────────────────────────────
    if (certificateId) {
      const cleanId = certificateId.trim();

      // The display date, kind, role and wing columns are optional: a database
      // missing any of them still returns the rest.
      const found = await selectWithOptionalColumns<CertRow>(
        SINGLE_CERT_COLUMNS,
        CERTIFICATE_OPTIONAL_COLUMNS,
        (select) => supabase.from("certificates").select(select).eq("certificate_id", cleanId).maybeSingle()
      );
      const cert = found.data;

      if (found.error || !cert) {
        return NextResponse.json(
          { success: false, error: "Certificate record not found." } satisfies ApiResponse,
          { status: 404 }
        );
      }

      const participant = Array.isArray(cert.participant)
        ? cert.participant[0]
        : cert.participant;

      const recipientEmail = participant?.email;
      if (!recipientEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "No email address found for this certificate recipient.",
          } satisfies ApiResponse,
          { status: 400 }
        );
      }

      // Generate the PDF in the event's colour theme
      const theme = await getEventCertificateTheme(supabase, cert.event_id ?? "");
      const pdfResult = await generateCertificatePdf({
        certificateId: cert.certificate_id,
        participantName: cert.recipient_name_snapshot,
        eventTitle: cert.event_name_snapshot,
        eventDate: certificateDisplayDate(cert),
        awardTitle: cert.award_title || undefined,
        verificationUrl: cert.verification_url || undefined,
        theme,
        kind: cert.certificate_kind === "organiser" ? "organiser" : undefined,
        role: cert.role_snapshot || undefined,
        wing: cert.wing_snapshot || undefined,
      });

      if (!pdfResult.success || !pdfResult.pdfBuffer) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to generate certificate PDF for email delivery.",
          } satisfies ApiResponse,
          { status: 500 }
        );
      }

      // Dispatch Email
      const emailResult = await sendCertificateEmail({
        to: recipientEmail,
        recipientName: cert.recipient_name_snapshot,
        eventName: cert.event_name_snapshot,
        eventDate: certificateDisplayDate(cert),
        certificateId: cert.certificate_id,
        verificationUrl: cert.verification_url ?? "",
        awardTitle: cert.award_title || undefined,
        pdfBuffer: pdfResult.pdfBuffer,
      });

      if (!emailResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: emailResult.error || "Email delivery failed.",
          } satisfies ApiResponse,
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: `Certificate ${cert.certificate_id} sent to ${recipientEmail} via ${emailResult.provider}.`,
          data: {
            certificateId: cert.certificate_id,
            email: recipientEmail,
            provider: emailResult.provider,
            messageId: emailResult.messageId,
          },
        } satisfies ApiResponse,
        { status: 200 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // CASE B: Bulk Send for an Entire Event
    // ─────────────────────────────────────────────────────────────
    if (eventId) {
      const fetched = await selectWithOptionalColumns<CertRow[]>(
        BULK_CERT_COLUMNS,
        CERTIFICATE_OPTIONAL_COLUMNS,
        (select) => supabase.from("certificates").select(select).eq("event_id", eventId).is("award_title", null)
      );
      const fetchErr = fetched.error;
      // Bulk send is for attendees. Organising-team certificates use their own
      // template and wording, and have no award_title, so they must be filtered
      // out here (in JS: a SQL "<> 'organiser'" would also drop rows where the
      // kind is NULL, i.e. every older certificate).
      const certs = (fetched.data ?? []).filter((c) => c.certificate_kind !== "organiser");

      if (fetchErr) {
        return NextResponse.json(
          { success: false, error: "Failed to fetch event certificates." } satisfies ApiResponse,
          { status: 500 }
        );
      }

      if (certs.length === 0) {
        return NextResponse.json(
          {
            success: true,
            message: "No certificates found for this event to send.",
            data: { sentCount: 0, failedCount: 0 },
          } satisfies ApiResponse,
          { status: 200 }
        );
      }

      let sentCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // One event, one theme: look it up once for the whole batch.
      const theme = await getEventCertificateTheme(supabase, eventId);

      // Process with concurrency limit (2 at a time)
      for (const cert of certs) {
        const participant = Array.isArray(cert.participant)
          ? cert.participant[0]
          : cert.participant;

        const recipientEmail = participant?.email;
        if (!recipientEmail) {
          failedCount++;
          continue;
        }

        try {
          const pdfResult = await generateCertificatePdf({
            certificateId: cert.certificate_id,
            participantName: cert.recipient_name_snapshot,
            eventTitle: cert.event_name_snapshot,
            eventDate: certificateDisplayDate(cert),
            awardTitle: cert.award_title || undefined,
            verificationUrl: cert.verification_url || undefined,
            theme,
          });

          if (!pdfResult.success || !pdfResult.pdfBuffer) {
            failedCount++;
            errors.push(`PDF error for ${cert.certificate_id}`);
            continue;
          }

          const res = await sendCertificateEmail({
            to: recipientEmail,
            recipientName: cert.recipient_name_snapshot,
            eventName: cert.event_name_snapshot,
            eventDate: certificateDisplayDate(cert),
            certificateId: cert.certificate_id,
            verificationUrl: cert.verification_url ?? "",
            awardTitle: cert.award_title || undefined,
            pdfBuffer: pdfResult.pdfBuffer,
          });

          if (res.success) {
            sentCount++;
          } else {
            failedCount++;
            errors.push(`Send failed for ${recipientEmail}: ${res.error}`);
          }
        } catch (e: any) {
          failedCount++;
          errors.push(`Exception for ${cert.certificate_id}: ${e.message}`);
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: `Bulk delivery complete. Sent: ${sentCount}, Failed: ${failedCount}`,
          data: {
            total: certs.length,
            sentCount,
            failedCount,
            errors: errors.slice(0, 10),
          },
        } satisfies ApiResponse,
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Bad Request" } satisfies ApiResponse,
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[API/admin/certificates/send] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
