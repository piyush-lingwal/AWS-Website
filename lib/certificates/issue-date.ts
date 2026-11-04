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
 * Inserts a certificate row that includes event_date_display_snapshot, retrying
 * without that column if the event_end_date migration has not been applied yet.
 * Returns the insert error (or null on success), mirroring supabase-js.
 */
export async function insertCertificateWithDisplayDate(
  db: SupabaseClient,
  row: Record<string, unknown> & { event_date_display_snapshot?: string }
): Promise<{ error: { message: string; code?: string } | null }> {
  const first = await db.from("certificates").insert(row);
  if (first.error && isMissingColumnError(first.error, "event_date_display_snapshot")) {
    const { event_date_display_snapshot: _drop, ...withoutDisplay } = row;
    return db.from("certificates").insert(withoutDisplay);
  }
  return first;
}

/**
 * The date string to show for an issued certificate: the stored display
 * snapshot when present, otherwise the start-date snapshot formatted as a
 * single day (certificates issued before the display column existed).
 */
export function certificateDisplayDate(cert: {
  event_date_display_snapshot?: string | null;
  event_date_snapshot?: string | null;
}): string {
  const display = cert.event_date_display_snapshot?.trim();
  if (display) return display;
  return formatEventDate(cert.event_date_snapshot ?? null) || (cert.event_date_snapshot ?? "");
}

export interface EventIssueDate {
  /** The event's start date (YYYY-MM-DD) or null — goes in certificates.event_date_snapshot (a DATE). */
  start: string | null;
  /** The human string, single day or range — goes in certificates.event_date_display_snapshot (text). */
  display: string;
}

/**
 * Loads an event's dates for stamping onto a certificate. `event_end_date` is
 * selected separately so a missing column degrades to the start date instead
 * of failing the whole certificate.
 */
export async function getEventIssueDate(db: SupabaseClient, eventId: string): Promise<EventIssueDate> {
  const withEnd = await db
    .from("events")
    .select("event_date, event_end_date")
    .eq("id", eventId)
    .maybeSingle();

  if (!withEnd.error) {
    const row = (withEnd.data ?? { event_date: null }) as { event_date: string | null; event_end_date?: string | null };
    return { start: row.event_date, display: eventDisplayDate(row) };
  }

  if (isMissingColumnError(withEnd.error, "event_end_date")) {
    const startOnly = await db.from("events").select("event_date").eq("id", eventId).maybeSingle();
    if (!startOnly.error) {
      const start = (startOnly.data?.event_date ?? null) as string | null;
      return { start, display: formatEventDate(start) };
    }
  }

  console.error("[certificates] Event date lookup failed:", withEnd.error.message);
  return { start: null, display: "" };
}
