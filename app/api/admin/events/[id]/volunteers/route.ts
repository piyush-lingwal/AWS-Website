// ============================================================
// GET    /api/admin/events/[id]/volunteers — list issued volunteer certificates
// POST   /api/admin/events/[id]/volunteers — issue Certificates of Volunteering
// DELETE /api/admin/events/[id]/volunteers?certificateId=... — revoke one
// ============================================================
//
// Body for POST: { rows: [{ rowNumber?, fullName, collegeId, email, course }] } (max 100 per request)
//
// Volunteers are specific to the event in the URL: for each person this finds or
// creates the participant, then issues one Certificate of Volunteering for that
// event (certificate_kind = 'volunteer', unique per event + participant). The College ID and
// course are saved on the participant (roll_no, course), like the attendee import.
//
// The PDF is rendered on demand by /api/certificates/[id], so this route only
// stores the snapshots.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminClient } from "@/lib/supabase/admin";
import { generateCertificateId } from "@/lib/certificates/id-generator";
import { getVerificationUrl } from "@/lib/certificates/qr-generator";
import { getEventIssueDate, insertCertificateWithDisplayDate } from "@/lib/certificates/issue-date";
import { isMissingColumnError } from "@/lib/certificates/event-theme";
import { findOrCreateParticipant } from "@/lib/certificates/participants";
import { mapLimit } from "@/lib/media/concurrency";
import { isUuid } from "@/lib/auth/roles";
import { VOLUNTEER_MIGRATION_HINT, validateVolunteer } from "@/lib/certificates/volunteer";
import type { ApiResponse } from "@/types/certificate";

export const dynamic = "force-dynamic";

const MAX_ROWS = 100;
const ROW_CONCURRENCY = 5;

type RowStatus = "issued" | "already_issued" | "error";
interface RowResult {
  rowNumber: number;
  status: RowStatus;
  message: string;
  fullName: string;
  email: string;
  certificateId?: string;
}

type Db = NonNullable<ReturnType<typeof getAdminClient>>;

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error } satisfies ApiResponse, { status });
}

interface EventInfo {
  id: string;
  name: string;
  startDate: string | null;
  displayDate: string;
}

/** True when the database refused the 'volunteer' kind (migrations not applied yet). */
function isKindNotEnabled(error: { code?: string | null; message?: string | null } | null | undefined): boolean {
  if (!error) return false;
  if (isMissingColumnError(error, "certificate_kind")) return true;
  return error.code === "23514" && (error.message ?? "").includes("certificates_kind_check");
}

async function issueOne(db: Db, event: EventInfo, rowNumber: number, raw: unknown): Promise<RowResult> {
  const parsed = validateVolunteer(raw);
  if (!parsed.ok) {
    const r = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
    return {
      rowNumber,
      status: "error",
      message: parsed.error,
      fullName: typeof r.fullName === "string" ? r.fullName : "",
      email: typeof r.email === "string" ? r.email : "",
    };
  }
  const { fullName, email, collegeId, course } = parsed.value;

  try {
    const participantId = await findOrCreateParticipant(db, fullName, email, { course, rollNo: collegeId });

    const prior = await db
      .from("certificates")
      .select("certificate_id")
      .eq("event_id", event.id)
      .eq("participant_id", participantId)
      .eq("certificate_kind", "volunteer")
      .maybeSingle();
    if (isKindNotEnabled(prior.error)) return { rowNumber, status: "error", message: VOLUNTEER_MIGRATION_HINT, fullName, email };
    if (prior.error) throw new Error(`existing lookup: ${prior.error.message}`);
    if (prior.data) {
      return { rowNumber, status: "already_issued", message: "Already has a volunteer certificate for this event.", fullName, email, certificateId: prior.data.certificate_id as string };
    }

    const certificateId = await generateCertificateId(async (id) => {
      const { data, error } = await db.from("certificates").select("id").eq("certificate_id", id).maybeSingle();
      if (error) throw new Error(`id check: ${error.message}`);
      return !!data;
    });

    // insertCertificateWithDisplayDate retries without event_date_display_snapshot
    // if that column is not present yet (migrations applied out of order).
    const insert = await insertCertificateWithDisplayDate(db, {
      certificate_id: certificateId,
      event_id: event.id,
      participant_id: participantId,
      attendance_id: null,
      recipient_name_snapshot: fullName,
      event_name_snapshot: event.name,
      event_date_snapshot: event.startDate,
      event_date_display_snapshot: event.displayDate,
      certificate_kind: "volunteer",
      pdf_url: `/api/certificates/${certificateId}`,
      verification_url: getVerificationUrl(certificateId),
      issue_date: new Date().toISOString().split("T")[0],
    });
    if (insert.error?.code === "23505") {
      return { rowNumber, status: "already_issued", message: "Already issued (just now by someone else).", fullName, email };
    }
    if (isKindNotEnabled(insert.error)) return { rowNumber, status: "error", message: VOLUNTEER_MIGRATION_HINT, fullName, email };
    if (insert.error) throw new Error(`certificate insert: ${insert.error.message}`);

    return { rowNumber, status: "issued", message: "Certificate of Volunteering issued.", fullName, email, certificateId };
  } catch (err) {
    console.error(`[API/admin/volunteers] row ${rowNumber} failed:`, err instanceof Error ? err.message : err);
    return { rowNumber, status: "error", message: "Could not issue this certificate. Try again.", fullName, email };
  }
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isUuid(id)) return fail("Invalid event id.", 400);

  const db = getAdminClient();
  if (!db) return fail("Database not configured.", 500);

  // Volunteer certificates for this event, newest first, with the recipient's email.
  const res = await db
    .from("certificates")
    .select("certificate_id, recipient_name_snapshot, issue_date, participant:participants(email, course, roll_no)")
    .eq("event_id", id.toLowerCase())
    .eq("certificate_kind", "volunteer")
    .order("issue_date", { ascending: false });

  if (res.error) {
    // Before the organiser migration there is no certificate_kind column: no volunteers yet.
    if (isMissingColumnError(res.error, "certificate_kind")) {
      return NextResponse.json({ success: true, data: { volunteers: [] } } satisfies ApiResponse, {
        headers: { "Cache-Control": "no-store" },
      });
    }
    console.error("[API/admin/volunteers] List error:", res.error.message);
    return fail("Failed to load volunteer certificates.", 500);
  }

  const volunteers = (res.data ?? []).map((row) => {
    const p = (Array.isArray(row.participant) ? row.participant[0] : row.participant) as
      | { email?: string; course?: string; roll_no?: string }
      | null
      | undefined;
    return {
      certificateId: row.certificate_id as string,
      fullName: row.recipient_name_snapshot as string,
      collegeId: p?.roll_no ?? "",
      email: p?.email ?? "",
      course: p?.course ?? "",
      issueDate: row.issue_date as string,
    };
  });

  return NextResponse.json({ success: true, data: { volunteers } } satisfies ApiResponse, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isUuid(id)) return fail("Invalid event id.", 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body.", 400);
  }
  const rows = (body as { rows?: unknown } | null)?.rows;
  if (!Array.isArray(rows) || rows.length === 0) return fail("Provide the volunteers to issue.", 400);
  if (rows.length > MAX_ROWS) return fail(`Send at most ${MAX_ROWS} rows per request.`, 400);

  const db = getAdminClient();
  if (!db) return fail("Database not configured.", 500);

  const ev = await db.from("events").select("id, name, event_date").eq("id", id.toLowerCase()).maybeSingle();
  if (ev.error) {
    console.error("[API/admin/volunteers] Event lookup error:", ev.error.message);
    return fail("Failed to load the event.", 500);
  }
  if (!ev.data) return fail("Event not found.", 404);
  if (!ev.data.event_date) {
    return fail("Set this event's date before issuing certificates. They show the event date.", 400);
  }
  const issueDate = await getEventIssueDate(db, ev.data.id as string);
  const event: EventInfo = {
    id: ev.data.id as string,
    name: ev.data.name as string,
    startDate: issueDate.start,
    displayDate: issueDate.display,
  };

  // Reject an email repeated inside this batch.
  const seen = new Set<string>();
  const jobs = rows.map((raw, index) => {
    const r = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
    const rowNumber = Number.isSafeInteger(r.rowNumber) && Number(r.rowNumber) > 0 ? Number(r.rowNumber) : index + 2;
    const email = typeof r.email === "string" ? r.email.trim().toLowerCase() : "";
    const duplicate = email !== "" && seen.has(email);
    if (email) seen.add(email);
    return { raw, rowNumber, duplicate };
  });

  const results = await mapLimit(jobs, ROW_CONCURRENCY, (job) =>
    job.duplicate
      ? Promise.resolve<RowResult>({ rowNumber: job.rowNumber, status: "error", message: "This email appears twice in the list.", fullName: "", email: "" })
      : issueOne(db, event, job.rowNumber, job.raw)
  );

  const summary = {
    issued: results.filter((r) => r.status === "issued").length,
    alreadyIssued: results.filter((r) => r.status === "already_issued").length,
    errors: results.filter((r) => r.status === "error").length,
  };

  return NextResponse.json({ success: true, data: { results, summary } } satisfies ApiResponse, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isUuid(id)) return fail("Invalid event id.", 400);

  const certificateId = new URL(request.url).searchParams.get("certificateId")?.trim();
  if (!certificateId) return fail("A certificate id is required.", 400);

  const db = getAdminClient();
  if (!db) return fail("Database not configured.", 500);

  // Scope the delete to this event and to volunteer certificates only, so this
  // endpoint can never remove any other kind of certificate.
  const del = await db
    .from("certificates")
    .delete()
    .eq("certificate_id", certificateId)
    .eq("event_id", id.toLowerCase())
    .eq("certificate_kind", "volunteer")
    .select("certificate_id");

  if (del.error) {
    console.error("[API/admin/volunteers] Delete error:", del.error.message);
    return fail("Failed to remove the certificate.", 500);
  }
  if (!del.data || del.data.length === 0) {
    return fail("No matching volunteer certificate found for this event.", 404);
  }

  return NextResponse.json({ success: true } satisfies ApiResponse, { headers: { "Cache-Control": "no-store" } });
}
