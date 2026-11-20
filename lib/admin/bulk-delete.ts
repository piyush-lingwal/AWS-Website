// ============================================================
// "Delete all" for an admin section — PURE (no framework imports)
// ============================================================
//
// Each list in the admin dashboard has a "Delete all" button that asks twice
// (components/admin/DeleteAllButton.tsx). The second step makes the admin type
// BULK_DELETE_CONFIRMATION, and the API (app/api/admin/bulk-delete) checks the
// same phrase, so a stray request can never wipe a section by itself.
//
// Sections and what "all" means:
//   events          every event (and, by cascade, everything attached to them)
//   registrations   every attendee of one event, with their participation certificates
//   top-performers  every top performer of one event, with their Excellence certificates
//   organisers      every Certificate of Appreciation of one event
//   volunteers      every Certificate of Volunteering of one event
//   team            every team member
// ============================================================

import { isUuid } from "../auth/roles.ts";

export const BULK_DELETE_SECTIONS = ["events", "registrations", "top-performers", "organisers", "volunteers", "team"] as const;

export type BulkDeleteSection = (typeof BULK_DELETE_SECTIONS)[number];

/** What the admin must type in the second confirmation step. */
export const BULK_DELETE_CONFIRMATION = "DELETE";

const EVENT_SECTIONS: readonly BulkDeleteSection[] = ["registrations", "top-performers", "organisers", "volunteers"];

export type BulkDeleteRequest =
  | { section: "events" }
  | { section: "registrations" | "top-performers" | "organisers" | "volunteers"; eventId: string }
  | { section: "team" };

export type BulkDeleteValidation =
  | { ok: true; value: BulkDeleteRequest }
  | { ok: false; error: string };

export function isBulkDeleteSection(value: unknown): value is BulkDeleteSection {
  return typeof value === "string" && (BULK_DELETE_SECTIONS as readonly string[]).includes(value);
}

export function validateBulkDelete(body: unknown): BulkDeleteValidation {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid request body." };
  const { section, eventId, confirm } = body as Record<string, unknown>;

  if (!isBulkDeleteSection(section)) {
    return { ok: false, error: `Section must be one of: ${BULK_DELETE_SECTIONS.join(", ")}.` };
  }
  if (confirm !== BULK_DELETE_CONFIRMATION) {
    return { ok: false, error: `Type ${BULK_DELETE_CONFIRMATION} to confirm.` };
  }

  if (section === "events") return { ok: true, value: { section } };

  if (EVENT_SECTIONS.includes(section)) {
    if (typeof eventId !== "string" || !isUuid(eventId.trim())) {
      return { ok: false, error: "A valid event id is required." };
    }
    return {
      ok: true,
      value: { section: section as "registrations" | "top-performers" | "organisers" | "volunteers", eventId: eventId.trim().toLowerCase() },
    };
  }

  // team
  return { ok: true, value: { section: "team" } };
}

/** Splits ids into groups small enough for one `.in(...)` filter in a URL. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size < 1) throw new Error("chunk size must be at least 1");
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
