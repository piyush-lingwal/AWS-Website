// ============================================================
// Volunteer certificate input — PURE
// ============================================================
//
// A volunteer is described by four fields (the same four as the attendance
// portal): Name, College ID, Email Address and Course. The rules are the
// attendance portal's (lib/attendance/import.ts): name 2-100 characters, a valid
// email, College ID digits only, a course. This file validates one volunteer and
// turns an uploaded or pasted sheet into rows.
// ============================================================

import { HEADER_ALIASES, cellToText, normalizeHeader, validateAttendee } from "../attendance/import.ts";

export interface VolunteerInput {
  fullName: string;
  collegeId: string;
  email: string;
  course: string;
}

export type VolunteerValidation =
  | { ok: true; value: VolunteerInput }
  | { ok: false; error: string };

export function validateVolunteer(body: unknown): VolunteerValidation {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }
  const { fullName, collegeId, email, course } = body as Record<string, unknown>;
  const checked = validateAttendee({ fullName, email, collegeId, course });
  if (!checked.ok) return checked;
  const { fullName: name, collegeId: id, email: mail, course: crs } = checked.value;
  return { ok: true, value: { fullName: name, collegeId: id, email: mail, course: crs } };
}

/** Shown when volunteer certificates are issued before the volunteer migration has been applied. */
export const VOLUNTEER_MIGRATION_HINT =
  "Volunteer certificates are not set up in the database yet. Apply " +
  "supabase/migrations/20261105000001_organiser_certificates.sql and " +
  "supabase/migrations/20261108000001_volunteer_kind.sql in the Supabase SQL Editor, then try again.";

// ── Sheet layout ────────────────────────────────────────────────

export interface VolunteerSheetRow {
  fullName: string;
  collegeId: string;
  email: string;
  course: string;
}

/** Header row of the downloadable template, in sheet order. */
export const VOLUNTEER_TEMPLATE_HEADERS = ["Name", "College ID", "Email Address", "Course"] as const;

/** Second worksheet of the template; the importer only reads the first one. */
export const VOLUNTEER_TEMPLATE_NOTES: string[][] = [
  ["Column", "Required?", "What to enter"],
  ["Name", "Yes", "Full name as it should appear on the certificate."],
  ["College ID", "Yes", "Numbers only."],
  ["Email Address", "Yes", "The volunteer's email address."],
  ["Course", "Yes", "For example B.Tech, BCA, MCA, BBA or MBA (anything else is kept as typed)."],
  [],
  ["Example", "", "", ""],
  ["Aarav Sharma", "2201234", "aarav@example.com", "B.Tech"],
  [],
  ["Fill in the first sheet (Volunteers) and keep its header row."],
];

const HEADER_SEARCH_ROWS = 10;
const FIELD_ORDER = ["fullName", "collegeId", "email", "course"] as const;
type Field = (typeof FIELD_ORDER)[number];

/**
 * Turns a grid of cells into rows. A header row (within the first rows) that names an
 * email column maps columns by name, in any order: Name / Full Name, College ID /
 * Roll No, Email / Email Address, Course. Without one, the order Name, College ID,
 * Email Address, Course is assumed. Cells that are numbers keep every digit.
 */
export function volunteerRowsFromMatrix(matrix: readonly (readonly unknown[])[]): VolunteerSheetRow[] {
  let headerIndex = -1;
  let columns: Partial<Record<Field, number>> = {};
  for (let i = 0; i < Math.min(matrix.length, HEADER_SEARCH_ROWS); i += 1) {
    const mapped: Partial<Record<Field, number>> = {};
    (matrix[i] ?? []).forEach((value, columnIndex) => {
      const field = HEADER_ALIASES[normalizeHeader(value)];
      if (field && mapped[field] === undefined) mapped[field] = columnIndex;
    });
    if (mapped.email !== undefined) {
      headerIndex = i;
      columns = mapped;
      break;
    }
  }
  if (headerIndex < 0) columns = { fullName: 0, collegeId: 1, email: 2, course: 3 };

  const cellAt = (cells: readonly unknown[], field: Field) => {
    const at = columns[field];
    return at === undefined ? "" : cellToText(cells[at]);
  };

  return matrix.slice(headerIndex + 1).map((cells) => ({
    fullName: cellAt(cells, "fullName"),
    collegeId: cellAt(cells, "collegeId"),
    email: cellAt(cells, "email"),
    course: cellAt(cells, "course"),
  }));
}

/** Pasted text (tab or comma separated, one person per line) to rows. */
export function volunteerRowsFromText(pasted: string): VolunteerSheetRow[] {
  const matrix = pasted
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => line.trim() !== "")
    .map((line) => line.split(/\t|,/).map((c) => c.trim()));
  return volunteerRowsFromMatrix(matrix);
}
