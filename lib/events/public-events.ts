// ============================================================
// Public events for server components
// ============================================================
//
// The same query as GET /api/events (same select list, same event_type
// fallback, Media Portal covers), run directly so the page HTML already
// contains the events. Returns null when Supabase is not configured or the
// query fails; callers then fall back to the client-side /api/events fetch.
// ============================================================

import { getAdminClient } from "@/lib/supabase/admin";
import { getEventCovers } from "@/lib/media/public-data";
import type { DbEvent } from "@/types/certificate";

export async function getPublicEvents(): Promise<DbEvent[] | null> {
  const supabase = getAdminClient();
  if (!supabase) return null;

  try {
    let { data, error } = await supabase
      .from("events")
      .select("id, name, description, event_date, event_timing, speaker_name, attendance_open, event_type")
      .order("event_date", { ascending: true });

    // Fallback if column event_type is not yet added to the events table
    if (error && (error.code === "42703" || error.code === "PGRST204" || error.message?.includes("event_type"))) {
      const fallback = await supabase
        .from("events")
        .select("id, name, description, event_date, event_timing, speaker_name, attendance_open")
        .order("event_date", { ascending: true });
      data = fallback.data as typeof data;
      error = fallback.error;
    }

    if (error) {
      console.error("[getPublicEvents] Database query error:", error);
      return null;
    }

    const rows = data ?? [];
    // Covers are best effort: getEventCovers() fails soft with an empty map.
    const covers = await getEventCovers(rows.map((r) => r.id));
    return rows.map((r) => ({ ...r, cover_url: covers.get(r.id)?.url ?? null }));
  } catch (err) {
    console.error("[getPublicEvents] Unexpected error:", err);
    return null;
  }
}
