// ============================================================
// POST /api/admin/bulk-delete — delete every entry of one admin section
// ============================================================
//
// Body: { section, eventId?, batch?, confirm: "DELETE" }  (see lib/admin/bulk-delete.ts)
// What each section deletes: lib/admin/bulk-delete-run.ts.
// The admin dashboard calls this from components/admin/DeleteAllButton.tsx,
// after two confirmation steps.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminClient } from "@/lib/supabase/admin";
import { validateBulkDelete } from "@/lib/admin/bulk-delete";
import { BulkDeleteStepError, runBulkDelete } from "@/lib/admin/bulk-delete-run";
import type { ApiResponse } from "@/types/certificate";

export const dynamic = "force-dynamic";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error } satisfies ApiResponse, { status });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  // A JSON content type forces a CORS preflight, so another site cannot post this from a form.
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return fail("Send the request as JSON.", 415);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body.", 400);
  }
  const parsed = validateBulkDelete(body);
  if (!parsed.ok) return fail(parsed.error, 400);

  const db = getAdminClient();
  if (!db) return fail("Database not configured.", 500);

  try {
    const result = await runBulkDelete(db, parsed.value);
    if (!result.ok) return fail(result.error, result.status);
    // Audit line: who wiped which section, and how much went.
    console.warn(`[API/admin/bulk-delete] admin ${auth.session.user.id} deleted all ${parsed.value.section}:`, result.deleted);
    return NextResponse.json({ success: true, data: { deleted: result.deleted } } satisfies ApiResponse, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[API/admin/bulk-delete] Failed:", err instanceof Error ? err.message : err);
    return fail(
      err instanceof BulkDeleteStepError
        ? "Delete stopped part way. Some entries may already be gone; refresh and try again."
        : "Delete failed. Try again.",
      500
    );
  }
}
