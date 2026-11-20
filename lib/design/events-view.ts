// ============================================================
// /events page: status and row-to-view mapping — PURE
// ============================================================
//
// Pulled out of components/features/events/Events.tsx so the same logic runs on
// the server (first paint) and in the browser, and can be tested. "Today" is a
// parameter: the server passes its own day, the browser re-runs with the
// visitor's day after mount.
// ============================================================

import { eventDateLabel, parseDay } from "./home-events.ts";

export type EventStatus = "past" | "current" | "upcoming";

/** The row fields the events page reads. */
export interface EventRow {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  event_end_date?: string | null;
  event_timing: string | null;
  speaker_name: string | null;
  attendance_open: boolean;
  event_type?: string | null;
  cover_url: string | null;
}

export interface EventView {
  id: string;
  title: string;
  date: string;
  rawDate: string | null; // empty when the event date is TBA
  timing: string | null;
  isoDate: string; // countdown target, empty for past or undated events
  speakerName: string | null;
  attendanceOpen: boolean;
  tag: string;
  description: string;
  status: EventStatus;
  coverUrl: string | null;
}

/** Local midnight of the given moment. */
export function startOfDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** "YYYY-MM-DD" for the calendar day of `now` in the given IANA time zone. */
export function isoDayInZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Event status relative to `today` (local midnight).
 * The first non-past event is labelled "current"; the rest are "upcoming".
 */
export function computeStatus(
  eventDate: string | null,
  firstFutureId: string | null,
  id: string,
  today: Date
): EventStatus {
  // TBA events (empty / null date) have no confirmed date yet: treat as upcoming
  if (!eventDate || eventDate.trim() === "") {
    return id === firstFutureId ? "current" : "upcoming";
  }
  const date = new Date(eventDate + "T00:00:00");
  // If the date string is malformed, also treat as upcoming rather than concluded
  if (isNaN(date.getTime())) return "upcoming";
  if (date < today) return "past";
  if (id === firstFutureId) return "current";
  return "upcoming";
}

/** The first row dated today or later, which gets the "current" label. */
export function firstFutureEventId(rows: readonly EventRow[], today: Date): string | null {
  const row = rows.find((r) => {
    if (!r.event_date) return false;
    const d = new Date(r.event_date + "T00:00:00");
    return !isNaN(d.getTime()) && d >= today;
  });
  return row?.id ?? null;
}

/** Maps database rows to the shape the page renders. */
export function mapEventRows(rows: readonly EventRow[], today: Date): EventView[] {
  const firstFutureId = firstFutureEventId(rows, today);
  return rows.map((row) => {
    const eventDate = row.event_date ?? "";
    const status = computeStatus(eventDate, firstFutureId, row.id, today);
    return {
      id: row.id,
      title: row.name,
      date: eventDateLabel({ event_date: eventDate, event_end_date: row.event_end_date ?? null }),
      rawDate: eventDate,
      timing: row.event_timing ?? "",
      isoDate: status !== "past" && eventDate ? eventDate + "T00:00:00" : "",
      speakerName: row.speaker_name,
      attendanceOpen: row.attendance_open,
      tag: row.event_type || "Event",
      description: row.description ?? "",
      status,
      coverUrl: row.cover_url,
    };
  });
}

/** Local midnight for a "YYYY-MM-DD" day, or null when it is not a real date. */
export function dayFromIso(iso: string | null | undefined): Date | null {
  return parseDay(iso);
}
