// ============================================================
// Delete every media item of one event — soft delete (server only)
// ============================================================
//
// Same rules as DELETE /api/media/items/[id]: rows get deleted_at = now()
// (S3 files are purged later by the cleanup job) and files held in Supabase
// Storage are removed right away, best effort. The UPDATE returns the rows
// it actually deleted, so an upload finishing mid-way is never missed.
// ============================================================
import type { SupabaseClient } from "@supabase/supabase-js";

export interface DeletedRow {
  id: string;
  event_id: string;
  source: string;
  original_key: string | null;
  web_key: string | null;
  thumb_key: string | null;
}

export type RemoveFiles = (row: DeletedRow) => Promise<{ failed: string[] }>;

export async function deleteAllEventMedia(
  db: Pick<SupabaseClient, "from">,
  eventId: string,
  removeFiles: RemoveFiles
): Promise<{ ok: true; removed: number } | { ok: false }> {
  const { data, error } = await db
    .from("media_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("event_id", eventId.toLowerCase())
    .is("deleted_at", null)
    .select("id, event_id, source, original_key, web_key, thumb_key");
  if (error) {
    console.error("[media/bulk-delete] Update error:", error.message);
    return { ok: false };
  }
  const rows = (data ?? []) as DeletedRow[];
  for (const row of rows) {
    if (row.source !== "supabase") continue;
    try {
      await removeFiles(row);
    } catch (err) {
      console.error("[media/bulk-delete] File cleanup failed:", row.id, err instanceof Error ? err.message : err);
    }
  }
  return { ok: true, removed: rows.length };
}
