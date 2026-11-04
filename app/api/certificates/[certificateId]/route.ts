// ============================================================
// GET /api/certificates/[certificateId] — Certificate PDF Download / View
// ============================================================
//
// Fetches certificate details from the database and generates/serves
// the official PDF with proper Content-Type and Content-Disposition.
//
// Supports:
//   - ?inline=true -> Content-Disposition: inline (for browser viewing)
//   - default      -> Content-Disposition: attachment (for download)
//
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { generateCertificatePdf } from "@/lib/certificates/pdf-generator";
import { getEventCertificateTheme, isMissingColumnError } from "@/lib/certificates/event-theme";
import { certificateDisplayDate } from "@/lib/certificates/issue-date";
import { isValidCertificateIdFormat } from "@/lib/certificates/id-generator";
import type { ApiResponse } from "@/types/certificate";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;
    const cleanId = certificateId?.trim();

    if (!cleanId || !isValidCertificateIdFormat(cleanId)) {
      return NextResponse.json(
        { success: false, error: "Invalid certificate ID format." } satisfies ApiResponse,
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

    // 1. Fetch certificate record from DB. event_date_display_snapshot is
    //    selected when available; fall back for a DB without the column yet.
    const columns = "id, certificate_id, event_id, recipient_name_snapshot, event_name_snapshot, event_date_snapshot, award_title, verification_url";
    // event_date_display_snapshot, certificate_kind and role_snapshot come from
    // separate migrations; request each optional column and drop only the ones
    // this database is missing, so a missing display column never hides the kind/role.
    let present = ["event_date_display_snapshot", "certificate_kind", "role_snapshot"];
    let cert: Record<string, string | null> | null = null;
    for (;;) {
      const select = present.length ? columns + ", " + present.join(", ") : columns;
      const res = await supabase.from("certificates").select(select).eq("certificate_id", cleanId).maybeSingle();
      if (!res.error) { cert = res.data as Record<string, string | null> | null; break; }
      const missing = present.find((c) => isMissingColumnError(res.error, c));
      if (!missing) { cert = null; break; }
      present = present.filter((c) => c !== missing);
    }

    if (!cert) {
      return NextResponse.json(
        { success: false, error: "Certificate not found." } satisfies ApiResponse,
        { status: 404 }
      );
    }

    // 2. Generate PDF using immutable snapshot fields. The colour follows the
    //    event's current theme (orange when none is set). The date is the stored
    //    display string (single day or range), or the start date for old certificates.
    const theme = await getEventCertificateTheme(supabase, cert.event_id as string);
    const pdfResult = await generateCertificatePdf({
      certificateId: cert.certificate_id as string,
      participantName: cert.recipient_name_snapshot as string,
      eventTitle: cert.event_name_snapshot as string,
      eventDate: certificateDisplayDate(cert),
      awardTitle: cert.award_title || undefined,
      verificationUrl: cert.verification_url || undefined,
      theme,
      kind: cert.certificate_kind === "organiser" ? "organiser" : undefined,
      role: cert.role_snapshot || undefined,
    });

    if (!pdfResult.success || !pdfResult.pdfBuffer) {
      console.error("[API/certificates] Failed to render PDF:", pdfResult.error);
      return NextResponse.json(
        { success: false, error: "Failed to generate certificate PDF." } satisfies ApiResponse,
        { status: 500 }
      );
    }

    // 3. Determine inline vs attachment disposition
    const isInline = request.nextUrl.searchParams.get("inline") === "true";
    const filename = `${cert.certificate_id ?? cleanId}.pdf`;
    const dispositionType = isInline ? "inline" : "attachment";

    return new NextResponse(new Uint8Array(pdfResult.pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${dispositionType}; filename="${filename}"`,
        "Content-Length": pdfResult.pdfBuffer.length.toString(),
        "Cache-Control": "no-store, max-age=0",
        "X-Certificate-Id": cert.certificate_id ?? cleanId,
      },
    });
  } catch (error: any) {
    console.error("[API/certificates] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
