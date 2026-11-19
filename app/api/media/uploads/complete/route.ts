// ============================================================
// POST /api/media/uploads/complete   — finish uploads  (media members + admins)
// ============================================================
//
// Body: { mediaIds: string[] }
//
// For each id the server checks the file that really landed in S3 (size,
// Content-Type, first bytes) and only then advances the row. The browser is
// never trusted to say "it worked".
//
// Always 200 with a result per id, so one bad file does not hide the others:
//   accepted | not_uploaded | rejected | failed | not_found | error
// Safe to call again for the same ids (idempotent).

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { MEDIA_PORTAL_ROLES } from "@/lib/auth/roles";
import { getAdminClient } from "@/lib/supabase/admin";
import { getStorage, s3Ports } from "@/lib/storage/s3";
import { supabasePorts } from "@/lib/storage/supabase-storage";
import { dbPorts } from "@/lib/media/db-ports";
import { imagePort } from "@/lib/media/image-port";
import { mapLimit } from "@/lib/media/concurrency";
import { completeUpload, type CompletionOutcome, type CompletionRow } from "@/lib/media/complete";
import { validateCompleteRequest } from "@/lib/media/validate";
import type { ApiResponse } from "@/types/certificate";

const NO_STORE = { "Cache-Control": "no-store" };

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error } satisfies ApiResponse, { status });
}

/** Photos processed at the same time within one request. */
const PROCESS_CONCURRENCY = 3;

type Result = CompletionOutcome | { mediaId: string; state: "error" };

export async function POST(request: NextRequest) {
  const auth = await requireRole(MEDIA_PORTAL_ROLES);
  if (!auth.ok) return auth.response;
  const caller = { role: auth.session.role, userId: auth.session.user.id };

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body.", 400);
  }

  const parsed = validateCompleteRequest(body);
  if (!parsed.ok) return fail(parsed.error, 400);
  const ids = parsed.value;

  const storage = getStorage(); // null is fine when only Supabase uploads are used
  const db = getAdminClient();
  if (!db) return fail("Media uploads are not configured.", 500);

  const rowsRes = await db
    .from("media_items")
    .select("id, event_id, uploaded_by, kind, mime_type, size_bytes, original_key, status, source")
    .in("id", ids)
    .in("source", ["s3", "supabase"]) // Drive items need no completion
    .is("deleted_at", null);
  if (rowsRes.error) {
    console.error("[API/media/complete] Row lookup error:", rowsRes.error.message);
    return fail("Failed to complete the upload.", 500);
  }
  const rows = rowsRes.data as Array<CompletionRow & { source: "s3" | "supabase" }>;
  const byId = new Map(rows.map((r) => [r.id, r]));

  // Same pipeline for both storages: only the file operations differ.
  const common = { ...dbPorts(db), ...imagePort };
  const s3 = storage ? { ...s3Ports(storage), ...common } : null;
  const supabase = { ...supabasePorts(db), ...common };

  // A few at a time: decoding a large photo needs real memory.
  const results: Result[] = await mapLimit(
    ids,
    PROCESS_CONCURRENCY,
    async (id): Promise<Result> => {
      try {
        const row = byId.get(id);
        const ports = row?.source === "supabase" ? supabase : s3;
        if (row && !ports) throw new Error("S3 is not configured for an S3 upload.");
        return await completeUpload(id, row, caller, ports ?? supabase);
      } catch (err) {
        // Log details server-side; the client only learns "error" for this file.
        console.error("[API/media/complete] Item error:", id, err instanceof Error ? err.message : err);
        return { mediaId: id, state: "error" };
      }
    }
  );

  // Every file failed unexpectedly: almost certainly configuration (IAM, env).
  if (results.every((r) => r.state === "error")) {
    return fail("Failed to complete the upload.", 500);
  }

  // Images and videos can go live here, so refresh the cached public gallery.
  if (results.some((r) => r.state === "accepted")) revalidatePath("/gallery", "layout");

  return NextResponse.json(
    { success: true, data: { results } } satisfies ApiResponse,
    { headers: NO_STORE }
  );
}
