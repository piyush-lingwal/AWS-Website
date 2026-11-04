// ============================================================
// Organiser certificate input — PURE
// ============================================================
//
// A Certificate of Appreciation for an organising-team member needs a name,
// an email, their role (e.g. "Technical Lead"), and the event. Same name/email
// rules as the attendance portal; the role is free text shown on the certificate.
// ============================================================

import { cleanFullName } from "../utils.ts";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ORGANISER_ROLE_MAX = 60;

export interface OrganiserInput {
  fullName: string;
  email: string;
  role: string;
}

export type OrganiserValidation =
  | { ok: true; value: OrganiserInput }
  | { ok: false; error: string };

export function validateOrganiser(body: unknown): OrganiserValidation {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }
  const { fullName, email, role } = body as Record<string, unknown>;

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
  if (!cleanRole) return { ok: false, error: "Role is required (e.g. Technical Lead)." };
  if (cleanRole.length > ORGANISER_ROLE_MAX) {
    return { ok: false, error: `Role cannot exceed ${ORGANISER_ROLE_MAX} characters.` };
  }

  return { ok: true, value: { fullName: cleanFullName(name), email: cleanEmail, role: cleanRole } };
}
