// ============================================================
// POST /api/admin/events/[id]/organisers — issue Certificates of Appreciation
// ============================================================
//
// Body: { rows: [{ rowNumber?, fullName, email, role }] } (max 100 per request)
//
// For each organising-team member: validate, find-or-create the participant,
// then issue one Certificate of Appreciation for the event in the URL. The
// role (e.g. "Technical Lead") is stamped onto the certificate and stored in
// role_snapshot; certificate_kind = 'organiser' keeps these distinct from
// participation and excellence certificates (unique per event + participant).
//
// The PDF is rendered on demand by /api/certificates/[id] like every other
// certificate, so this route only stores the snapshots.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminClient } from "@/lib/supabase/admin";
import { generateCertificateId } from "@/lib/certificates/id-generator";
import { getVerificationUrl } from "@/lib/certificates/qr-generator";
import { getEventIssueDate } from "@/lib/certificates/issue-date";
import { mapLimit } from "@/lib/media/concurrency";
import { isUuid } from "@/lib/auth/roles";
import { validateOrganiser } from "@/lib/certificates/organiser";
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

async function findOrCreateParticipant(db: Db, fullName: string, email: string): Promise<string> {
  const existing = await db.from("participants").select("id").eq("email", email).maybeSingle();
  if (existing.error) throw new Error(`participant lookup: ${existing.error.message}`);
  if (existing.data) return existing.data.id as string;

  const created = await db
    .from("participants")
    // Organisers may not have a course/roll; store placeholders the schema accepts.
    .insert({ email, full_name: fullName, course: "N/A", roll_no: "N/A" })
    .select("id")
    .single();
  if (!created.error && created.data) return created.data.id as string;
  if (created.error?.code === "23505") {
    const raced = await db.from("participants").select("id").eq("email", email).maybeSingle();
    if (raced.data) return raced.data.id as string;
  }
  throw new Error(`participant insert: ${created.error?.message ?? "no row returned"}`);
}

interface EventInfo {
  id: string;
  name: string;
  startDate: string | null;
  displayDate: string;
}

async function issueOne(db: Db, event: EventInfo, rowNumber: number, raw: unknown): Promise<RowResult> {
  const parsed = validateOrganiser(raw);
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
  const { fullName, email, role } = parsed.value;

  try {
    const participantId = await findOrCreateParticipant(db, fullName, email);

    const prior = await db
      .from("certificates")
      .select("certificate_id")
      .eq("event_id", event.id)
      .eq("participant_id", participantId)
      .eq("certificate_kind", "organiser")
      .maybeSingle();
    if (prior.error) throw new Error(`existing lookup: ${prior.error.message}`);
    if (prior.data) {
      return { rowNumber, status: "already_issued", message: "Already has an appreciation certificate for this event.", fullName, email, certificateId: prior.data.certificate_id as string };
    }

    const certificateId = await generateCertificateId(async (id) => {
      const { data, error } = await db.from("certificates").select("id").eq("certificate_id", id).maybeSingle();
      if (error) throw new Error(`id check: ${error.message}`);
      return !!data;
    });

    const insert = await db.from("certificates").insert({
      certificate_id: certificateId,
      event_id: event.id,
      participant_id: participantId,
      attendance_id: null,
      recipient_name_snapshot: fullName,
      event_name_snapshot: event.name,
      event_date_snapshot: event.startDate,
      event_date_display_snapshot: event.displayDate,
      certificate_kind: "organiser",
      role_snapshot: role,
      pdf_url: `/api/certificates/${certificateId}`,
      verification_url: getVerificationUrl(certificateId),
      issue_date: new Date().toISOString().split("T")[0],
    });
    if (insert.error?.code === "23505") {
      return { rowNumber, status: "already_issued", message: "Already issued (just now by someone else).", fullName, email };
    }
    if (insert.error) throw new Error(`certificate insert: ${insert.error.message}`);

    return { rowNumber, status: "issued", message: "Certificate of Appreciation issued.", fullName, email, certificateId };
  } catch (err) {
    console.error(`[API/admin/organisers] row ${rowNumber} failed:`, err instanceof Error ? err.message : err);
    return { rowNumber, status: "error", message: "Could not issue this certificate. Try again.", fullName, email };
  }
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
  if (!Array.isArray(rows) || rows.length === 0) return fail("Provide the organising team members to issue.", 400);
  if (rows.length > MAX_ROWS) return fail(`Send at most ${MAX_ROWS} rows per request.`, 400);

  const db = getAdminClient();
  if (!db) return fail("Database not configured.", 500);

  const ev = await db.from("events").select("id, name, event_date").eq("id", id.toLowerCase()).maybeSingle();
  if (ev.error) {
    console.error("[API/admin/organisers] Event lookup error:", ev.error.message);
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
