// ============================================================
// Which event an admin request is about (server only)
// ============================================================
//
// The Certificates tab works on the event the admin picked. Requests send that
// event's id; when they do not (older clients), the portal's active event is used,
// which is how Top Performers worked before they became event-wise.
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import { isUuid } from "@/lib/auth/roles";

export interface ScopedEvent {
  id: string;
  name: string;
  event_date: string | null;
}

export type EventScope =
  | { ok: true; event: ScopedEvent | null }
  | { ok: false; status: number; error: string };

/**
 * Loads the requested event, or the active event when no id is given.
 * `event` is null only when no id was given and there is no active event.
 */
export async function resolveEventScope(db: SupabaseClient, eventId: unknown): Promise<EventScope> {
  const requested = typeof eventId === "string" ? eventId.trim() : "";

  let id = requested.toLowerCase();
  if (requested) {
    if (!isUuid(requested)) return { ok: false, status: 400, error: "Invalid event id." };
  } else {
    const config = await db.from("portal_config").select("active_event_id").limit(1).maybeSingle();
    if (config.error) {
      console.error("[event-scope] Active event lookup failed:", config.error.message);
      return { ok: false, status: 500, error: "Failed to load the active event." };
    }
    const active = (config.data as { active_event_id?: string | null } | null)?.active_event_id;
    if (!active) return { ok: true, event: null };
    id = active;
  }

  const ev = await db.from("events").select("id, name, event_date").eq("id", id).maybeSingle();
  if (ev.error) {
    console.error("[event-scope] Event lookup failed:", ev.error.message);
    return { ok: false, status: 500, error: "Failed to load the event." };
  }
  if (!ev.data) return { ok: false, status: 404, error: "Event not found." };
  return { ok: true, event: ev.data as ScopedEvent };
}
