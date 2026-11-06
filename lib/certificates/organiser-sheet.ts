// ============================================================
// Organising-team sheet layout — PURE
// ============================================================
//
// The columns an organising-team sheet (upload or paste) has, how a header row
// is matched, and the downloadable template. The dialog validates each row
// afterwards with validateOrganiser; this only turns cells into rows.
//
//   Name   required
//   Email  required
//   Role   optional  a specific role, e.g. "Technical Co-Lead"
//   Wing   Media, Event, PR or Tech  (required when Role is blank)
// ============================================================

export interface OrganiserSheetRow {
  fullName: string;
  email: string;
  role: string;
  wing: string;
}

/** Header row of the downloadable template, in sheet order. */
export const ORGANISER_TEMPLATE_HEADERS = ["Name", "Email", "Role", "Wing"] as const;

/**
 * Second worksheet of the template. The importer only reads the first sheet,
 * so these notes and examples can never be issued by accident.
 */
export const ORGANISER_TEMPLATE_NOTES: string[][] = [
  ["Column", "Required?", "What to enter"],
  ["Name", "Yes", "Full name as it should appear on the certificate."],
  ["Email", "Yes", "The member's email address."],
  ["Role", "No", "A specific role, e.g. Technical Co-Lead. When set, the certificate shows this role."],
  ["Wing", "If Role is blank", "Media, Event, PR or Tech. When there is no Role, the certificate reads \"<Wing> member of the Organising Team\"."],
  [],
  ["Example", "", ""],
  ["Piyush Rawat", "piyush@example.com", "Technical Lead (Wing: Tech)"],
  ["Aarav Sharma", "aarav@example.com", "No role, Wing: Media"],
  [],
  ["Fill in the first sheet (Organising Team) and delete nothing from its header row."],
];

function text(value: unknown): string {
  return String(value ?? "").trim();
}

/**
 * Turns a grid of cells into rows. When the first row looks like a header (it
 * has an Email column) columns are matched by name: Name, Email, Role (or
 * Position / Designation) and Wing (or Team / Department), in any order.
 * Otherwise the order Name, Email, Role, Wing is assumed.
 */
export function organiserRowsFromMatrix(matrix: unknown[][]): OrganiserSheetRow[] {
  const header = (matrix[0] ?? []).map((c) => text(c).toLowerCase());
  const isEmail = (h: string) => /e-?mail/.test(h);
  const hasHeader = header.some(isEmail);
  const find = (match: (h: string) => boolean, fallback: number) =>
    hasHeader ? header.findIndex(match) : fallback;

  const idx = {
    name: find((h) => h.includes("name"), 0),
    email: find(isEmail, 1),
    role: find((h) => h.includes("role") || h.includes("position") || h.includes("designation"), 2),
    wing: find((h) => h.includes("wing") || h.includes("team") || h.includes("department"), 3),
  };
  const cellAt = (cells: unknown[], i: number) => (i >= 0 ? text(cells[i]) : "");

  return (hasHeader ? matrix.slice(1) : matrix).map((cells) => ({
    fullName: cellAt(cells, idx.name),
    email: cellAt(cells, idx.email),
    role: cellAt(cells, idx.role),
    wing: cellAt(cells, idx.wing),
  }));
}

/** Pasted text (tab or comma separated, one person per line) to rows. */
export function organiserRowsFromText(pasted: string): OrganiserSheetRow[] {
  const matrix = pasted
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => line.trim() !== "")
    .map((line) => line.split(/\t|,/));
  return organiserRowsFromMatrix(matrix);
}
