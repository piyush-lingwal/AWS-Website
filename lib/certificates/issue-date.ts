// ============================================================
// The display date to stamp on a certificate at issue time (server only)
// ============================================================
//
// Reads an event's start and (optional) end date and returns the single
// human string that goes into certificates.event_date_snapshot and onto the
// PDF. A multi-day event becomes a range (lib/certificates/event-date.ts).
//
// Tolerant of the event_end_date migration not being applied yet: if the
// column is missing it falls back to the start date alone.
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import { formatEventDate } from "./event-date";
import { isMissingColumnError } from "./event-theme";

/**
 * Formats an event's display date from a row that already has event_date and,
 * when available, event_end_date. Pure; use this when the row is in hand.
 */
export function eventDisplayDate(event: {
  event_date: string | null;
  event_end_date?: string | null;
}): string {
  return formatEventDate(event.event_date, event.event_end_date ?? null);
}

/**
 * Loads an event's dates and returns its display string. `event_end_date` is
 * selected separately so a missing column degrades to the start date instead
 * of failing the whole certificate.
 */
export async function getEventDisplayDate(db: SupabaseClient, eventId: string): Promise<string> {
  const withEnd = await db
    .from("events")
    .select("event_date, event_end_date")
    .eq("id", eventId)
    .maybeSingle();

  if (!withEnd.error) {
    return eventDisplayDate(withEnd.data ?? { event_date: null });
  }

  if (isMissingColumnError(withEnd.error, "event_end_date")) {
    const startOnly = await db.from("events").select("event_date").eq("id", eventId).maybeSingle();
    if (!startOnly.error) return formatEventDate(startOnly.data?.event_date ?? null);
  }

  console.error("[certificates] Event date lookup failed:", withEnd.error.message);
  return "";
}
