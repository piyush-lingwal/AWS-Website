// ============================================================
// DELETE /api/media/events/[eventId]/items — remove ALL media of an event
// ============================================================
//
// SUPER ADMIN ONLY (checked here, not just hidden in the UI). Soft-deletes
// every item of the event, whoever uploaded it. See lib/media/bulk-delete.ts.
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { SUPER_ADMIN_ONLY, isUuid } from "@/lib/auth/roles";
import { getAdminClient } from "@/lib/supabase/admin";
import { deleteAllEventMedia } from "@/lib/media/bulk-delete";
import { removeSupabaseFiles } from "@/lib/storage/supabase-storage";
import type { ApiResponse } from "@/types/certificate";

const NO_STORE = { "Cache-Control": "no-store" };

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error } satisfies ApiResponse, { status });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  const auth = await requireRole(SUPER_ADMIN_ONLY);
  if (!auth.ok) return auth.response;

  const { eventId } = await context.params;
  if (!isUuid(eventId)) return fail("Invalid event id.", 400);

  const db = getAdminClient();
  if (!db) return fail("Database not configured.", 500);

  const result = await deleteAllEventMedia(db, eventId, (row) => removeSupabaseFiles(db, row));
  if (!result.ok) return fail("Failed to delete the event's media.", 500);

  // "layout" also covers every page under /gallery (including /gallery/[eventId]).
  revalidatePath("/gallery", "layout");
  return NextResponse.json({ success: true, data: { removed: result.removed } } satisfies ApiResponse, { headers: NO_STORE });
}
