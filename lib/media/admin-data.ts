// ============================================================
// Server-side cover lookup for the admin dashboard (server only)
// ============================================================
//
// lib/media/public-data.ts answers "what should a visitor see?" and, for a
// cover, falls back to any ready image when no explicit cover exists
// (pickCover() in public-view.ts). That fallback is right for a visitor but
// wrong for the admin dashboard's "remove cover" control: it must only ever
// act on the one row the database itself treats as the event's cover, never
// on a gallery photo that merely happens to be the newest ready image.
//
// A "cover slot" here is exactly the row the DB's one-cover-per-event rule
// guards (see media_items_one_cover_per_event_idx in
// supabase/migrations/20261018000002_media_items.sql): purpose = 'cover',
// deleted_at is null, status <> 'failed'. Covers that are still `processing`
// or have been `hidden` are included on purpose, so a stuck upload can still
// be found and removed by an admin.
// ============================================================

import { getAdminClient } from "../supabase/admin";
import { getStorage } from "../storage/s3";
import { driveThumbUrl } from "./drive";
import { publicUrl, supabasePublicUrl } from "./keys";
import { SUPABASE_PUBLIC_BUCKET } from "./public-view";

export interface EventCoverSlot {
  /** media_items.id — pass this to DELETE /api/media/items/[id] to remove it. */
  id: string;
  status: "pending" | "processing" | "ready" | "hidden";
  /** Thumbnail to show, or null while still processing / not yet public. */
  url: string | null;
}

/** Project URL for Supabase Storage files, or null when it is not set. */
function supabaseBase(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  return url && /^https:\/\//.test(url) ? url : null;
}

/**
 * The cover slot (if any) for each requested event. An event with no entry
 * in the returned map has no cover and is free to accept a new upload.
 */
export async function getEventCoverSlots(
  eventIds: readonly string[]
): Promise<Map<string, EventCoverSlot>> {
  const out = new Map<string, EventCoverSlot>();
  if (eventIds.length === 0) return out;

  const db = getAdminClient();
  if (!db) return out;

  const { data, error } = await db
    .from("media_items")
    .select("id, event_id, status, source, drive_file_id, web_key, thumb_key")
    .eq("purpose", "cover")
    .is("deleted_at", null)
    .neq("status", "failed")
    .in("event_id", eventIds);

  if (error) {
    console.error("[media/admin-data] getEventCoverSlots error:", error.message);
    return out;
  }

  const storage = getStorage();
  const cdnBase = storage?.config.cdnUrl ?? null;
  const supaBase = supabaseBase();

  for (const row of data ?? []) {
    let url: string | null = null;
    try {
      if (row.source === "drive" && row.drive_file_id) {
        url = driveThumbUrl(row.drive_file_id, 480);
      } else if (row.source === "supabase" && supaBase) {
        const key = row.thumb_key ?? row.web_key;
        if (key) url = supabasePublicUrl(supaBase, SUPABASE_PUBLIC_BUCKET, key);
      } else if (row.source === "s3" && cdnBase) {
        const key = row.thumb_key ?? row.web_key;
        if (key) url = publicUrl(cdnBase, key);
      }
    } catch (e) {
      // A malformed key must never break the admin events list.
      console.error("[media/admin-data] cover URL build failed:", e);
    }
    out.set(row.event_id as string, {
      id: row.id as string,
      status: row.status as EventCoverSlot["status"],
      url,
    });
  }

  return out;
}
