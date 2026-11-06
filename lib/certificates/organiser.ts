// ============================================================
// Organiser certificate input — PURE
// ============================================================
//
// A Certificate of Appreciation for an organising-team member needs a name,
// an email and the event. Two ways to say what they did:
//
//   - a specific ROLE (free text, e.g. "Technical Co-Lead")  -> printed as the role
//   - otherwise their WING (Media, Event, PR or Tech)        -> "Media member of the Organising Team for"
//
// A wing is therefore required when there is no role, and optional (but kept)
// when there is one. Same name/email rules as the attendance portal.
// ============================================================

import { cleanFullName } from "../utils.ts";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ORGANISER_ROLE_MAX = 60;

/** The wings an organiser can belong to, exactly as printed on the certificate. */
export const ORGANISER_WINGS = ["Media", "Event", "PR", "Tech"] as const;

export type OrganiserWing = (typeof ORGANISER_WINGS)[number];

// Spreadsheets are messy: accept common spellings and map them to the four wings.
const WING_ALIASES: Record<string, OrganiserWing> = {
  media: "Media",
  event: "Event",
  events: "Event",
  pr: "PR",
  "public relations": "PR",
  tech: "Tech",
  technical: "Tech",
  technology: "Tech",
};

/** Maps free text to a wing, or null when it is not one of the four. */
export function parseWing(value: unknown): OrganiserWing | null {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase().replace(/\s+wing$/, "").replace(/\s+/g, " ");
  return WING_ALIASES[key] ?? null;
}

/** Shown when a wing is chosen before the wing migration has been applied. */
export const WING_MIGRATION_HINT =
  "Wings are not set up in the database yet. Apply " +
  "supabase/migrations/20261106000001_organiser_wing.sql in the Supabase SQL Editor, then try again.";

export interface OrganiserInput {
  fullName: string;
  email: string;
  /** Empty string when the person has no specific role. */
  role: string;
  wing: OrganiserWing | null;
}

export type OrganiserValidation =
  | { ok: true; value: OrganiserInput }
  | { ok: false; error: string };

export function validateOrganiser(body: unknown): OrganiserValidation {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }
  const { fullName, email, role, wing } = body as Record<string, unknown>;

  const name = typeof fullName === "string" ? fullName.trim().replace(/\s+/g, " ") : "";
  if (!name) return { ok: false, error: "Full name is required." };
  if (name.length < 2) return { ok: false, error: "Full name must be at least 2 characters." };
  if (name.length > 100) return { ok: false, error: "Full name cannot exceed 100 characters." };

  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!cleanEmail) return { ok: false, error: "Email is required." };
  if (cleanEmail.length > 254 || !EMAIL_PATTERN.test(cleanEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const cleanRole = typeof role === "string" ? role.trim().replace(/\s+/g, " ") : "";
  if (cleanRole.length > ORGANISER_ROLE_MAX) {
    return { ok: false, error: `Role cannot exceed ${ORGANISER_ROLE_MAX} characters.` };
  }

  // A wing that is filled in must be a real one, even if a role is also given.
  const wingText = typeof wing === "string" ? wing.trim() : "";
  const parsedWing = wingText ? parseWing(wingText) : null;
  if (wingText && !parsedWing) {
    return { ok: false, error: `Wing must be one of: ${ORGANISER_WINGS.join(", ")}.` };
  }
  if (!cleanRole && !parsedWing) {
    return { ok: false, error: `Choose a wing (${ORGANISER_WINGS.join(", ")}) or enter a role.` };
  }

  return {
    ok: true,
    value: { fullName: cleanFullName(name), email: cleanEmail, role: cleanRole, wing: parsedWing },
  };
}
