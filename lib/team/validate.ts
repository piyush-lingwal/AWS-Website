// ============================================================
// Team roster — input cleaning and validation (PURE)
// ============================================================
// Shared by the admin API routes. name, email and course are required;
// role, branch, wing and pictureUrl are optional and stored as NULL when blank.
// ============================================================

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface TeamMemberDbFields {
  name: string;
  email: string;
  course: string;
  branch: string | null;
  role: string | null;
  wing: string | null;
  picture_url: string | null;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Maps a request body to DB columns. `partial` skips required checks for fields that were not sent (PUT). */
export function parseTeamMemberInput(
  body: Record<string, unknown>,
  partial = false
): { ok: true; fields: Partial<TeamMemberDbFields> } | { ok: false; errors: Record<string, string> } {
  const fields: Partial<TeamMemberDbFields> = {};
  const errors: Record<string, string> = {};

  const required: Array<["name" | "email" | "course", string]> = [
    ["name", "Name"],
    ["email", "Email"],
    ["course", "Course"],
  ];
  for (const [key, label] of required) {
    if (partial && body[key] === undefined) continue;
    const v = clean(body[key]);
    if (!v) errors[key] = `${label} is required.`;
    else fields[key] = key === "email" ? v.toLowerCase() : v;
  }
  if (fields.email && !EMAIL_PATTERN.test(fields.email)) errors.email = "Enter a valid email address.";

  const optional: Array<["role" | "branch" | "wing" | "picture_url", string]> = [
    ["role", "role"],
    ["branch", "branch"],
    ["wing", "wing"],
    ["picture_url", "pictureUrl"],
  ];
  for (const [column, key] of optional) {
    if (body[key] === undefined) continue;
    fields[column] = clean(body[key]) || null;
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, fields };
}

/** True for a Postgres unique-violation (duplicate email). */
export function isUniqueViolation(error: { code?: string } | null | undefined): boolean {
  return error?.code === "23505";
}
