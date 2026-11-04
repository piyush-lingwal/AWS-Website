// ============================================================
// Event date formatting — PURE (no framework or Node imports)
// ============================================================
//
// An event has a start date and an optional end date (events.event_date and
// events.event_end_date, both "YYYY-MM-DD"). This turns the pair into the one
// human string shown on the certificate and the event cards, collapsing the
// shared parts of a range:
//
//   29 & 30 Oct -> "29-30 October 2026"
//   Oct -> Nov   -> "29 Oct - 05 Nov 2026"
//   Oct -> next   year -> "29 Oct 2026 - 05 Nov 2027"
//   single day   -> "30 October 2026"
//
// The formatted string is what gets stored in certificates.event_date_snapshot
// at issue time, so changing the wording here only affects certificates issued
// afterwards (old ones keep the text they were issued with).
// ============================================================

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface Ymd {
  year: number;
  /** 1-12 */
  month: number;
  /** 1-31 */
  day: number;
}

/** Parses "YYYY-MM-DD" into parts, or null if it is not a real calendar date. */
function parseIsoDate(value: unknown): Ymd | null {
  if (typeof value !== "string" || !ISO_DATE.test(value.trim())) return null;
  const [year, month, day] = value.trim().split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // Reject impossible days (e.g. 2026-02-30) by round-tripping through Date.
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  return { year, month, day };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** A single day, e.g. "30 October 2026". Uses two-digit days to match the certificate style. */
function formatSingle(d: Ymd): string {
  return `${pad2(d.day)} ${MONTHS_LONG[d.month - 1]} ${d.year}`;
}

function cmp(a: Ymd, b: Ymd): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

/**
 * The display date for an event.
 *
 * - No valid start date -> "" (callers decide the fallback, e.g. "Date to be announced").
 * - No end date, or an end that is not after the start -> the single start date.
 * - A real range -> the shortest unambiguous form, collapsing shared month/year.
 */
export function formatEventDate(startIso: unknown, endIso?: unknown): string {
  const start = parseIsoDate(startIso);
  if (!start) return "";

  const end = parseIsoDate(endIso);
  if (!end || cmp(end, start) <= 0) return formatSingle(start);

  // Same month and year: "29-30 October 2026"
  if (start.year === end.year && start.month === end.month) {
    return `${pad2(start.day)}-${pad2(end.day)} ${MONTHS_LONG[start.month - 1]} ${start.year}`;
  }
  // Same year, different month: "29 Oct - 05 Nov 2026"
  if (start.year === end.year) {
    return `${pad2(start.day)} ${MONTHS_SHORT[start.month - 1]} - ${pad2(end.day)} ${MONTHS_SHORT[end.month - 1]} ${start.year}`;
  }
  // Different year: "29 Dec 2026 - 05 Jan 2027"
  return (
    `${pad2(start.day)} ${MONTHS_SHORT[start.month - 1]} ${start.year} - ` +
    `${pad2(end.day)} ${MONTHS_SHORT[end.month - 1]} ${end.year}`
  );
}

/**
 * Already-formatted strings (e.g. "29-30 October 2026") pass through unchanged;
 * a bare ISO date is formatted as a single day. Used by the certificate PDF
 * generator, which may receive either.
 */
export function formatSingleOrPassThrough(value: string): string {
  const single = formatEventDate(value);
  return single || value;
}

export type EndDateValidation =
  | { ok: true; value: string | null }
  | { ok: false; error: string };

/**
 * Validates an event end date against its start. An end date is optional; when
 * given it must be a valid ISO date on or after the start.
 */
export function validateEventEndDate(endIso: unknown, startIso: unknown): EndDateValidation {
  if (endIso === null || endIso === undefined || (typeof endIso === "string" && endIso.trim() === "")) {
    return { ok: true, value: null };
  }
  const end = parseIsoDate(endIso);
  if (!end) return { ok: false, error: "Enter the end date as a valid calendar date." };

  const start = parseIsoDate(startIso);
  if (!start) return { ok: false, error: "Set a valid start date before adding an end date." };
  if (cmp(end, start) < 0) return { ok: false, error: "The end date cannot be before the start date." };

  return { ok: true, value: (endIso as string).trim() };
}
