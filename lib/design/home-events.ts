// ============================================================
// Which events the landing page shows — PURE
// ============================================================
//
// The home page shows the next event and up to three recent past events.
// Rules (ported from the old UpcomingEventCard, with one fix):
//
//   upcoming  an event with NO date yet (announcing soon), or whose last day
//             is today or later. Earliest first; undated events last.
//   past      an event with a valid date whose last day is before today.
//             Most recent first.
//   invalid   a date that is not a real YYYY-MM-DD is shown nowhere.
//
// The fix: the last day is the END date when there is one. Before, a multi-day
// event counted as "past" from the morning of its second day, while it was
// still running.
// ============================================================

import { formatEventDate } from "../certificates/event-date.ts";

export interface HomeEvent {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  event_end_date?: string | null;
  event_timing: string | null;
  cover_url?: string | null;
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** A real calendar day as local midnight, or null. Rejects "2026-02-31" and free text. */
export function parseDay(iso: string | null | undefined): Date | null {
  if (typeof iso !== "string") return null;
  const text = iso.trim();
  if (!ISO_DAY.test(text)) return null;
  const [y, m, d] = text.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}

export function startOfToday(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** True when the event has no usable start date (not set yet, or blank). */
function isUndated(e: HomeEvent): boolean {
  return e.event_date === null || e.event_date === undefined || e.event_date.trim() === "";
}

/** The event's last day: its end date when that is valid and not before the start, else its start. */
export function lastDay(e: HomeEvent): Date | null {
  const start = parseDay(e.event_date);
  if (!start) return null;
  const end = parseDay(e.event_end_date);
  return end && end.getTime() >= start.getTime() ? end : start;
}

export function pickHomeEvents<T extends HomeEvent>(events: readonly T[], today: Date): { next: T | null; past: T[] } {
  const upcoming: T[] = [];
  const past: T[] = [];

  for (const e of events) {
    if (isUndated(e)) {
      upcoming.push(e);
      continue;
    }
    const last = lastDay(e);
    if (!last) continue; // a date we cannot read: show nowhere
    if (last.getTime() >= today.getTime()) upcoming.push(e);
    else past.push(e);
  }

  const startTime = (e: T) => parseDay(e.event_date)?.getTime() ?? Number.POSITIVE_INFINITY;
  upcoming.sort((a, b) => startTime(a) - startTime(b));
  past.sort((a, b) => startTime(b) - startTime(a));

  return { next: upcoming[0] ?? null, past };
}

/** "29 October 2026", "29–30 October 2026" or "Announcing soon". */
export function eventDateLabel(e: Pick<HomeEvent, "event_date" | "event_end_date">): string {
  if (e.event_date === null || e.event_date === undefined || e.event_date.trim() === "") return "Announcing soon";
  return formatEventDate(e.event_date, e.event_end_date ?? null) || e.event_date;
}

/** "Thursday" for a single day, "Multi-day" for a range, "Stay tuned" when undated. */
export function eventDayLabel(e: Pick<HomeEvent, "event_date" | "event_end_date">): string {
  const start = parseDay(e.event_date);
  if (!start) return "Stay tuned";
  const end = parseDay(e.event_end_date);
  if (end && end.getTime() > start.getTime()) return "Multi-day";
  return start.toLocaleDateString("en-IN", { weekday: "long" });
}
