// ============================================================
// Helpers for the public /verify pages — PURE (no framework imports)
// ============================================================

import { isValidCertificateIdFormat } from "./id-format.ts";

export type VerifyKind = "organiser" | "volunteer" | null | undefined;

/** The title of a certificate as shown on /verify. */
export function certificateTypeLabel(kind: VerifyKind, awardTitle?: string | null): string {
  if (awardTitle) return "Certificate of Excellence";
  if (kind === "organiser") return "Certificate of Appreciation";
  if (kind === "volunteer") return "Certificate of Volunteering";
  return "Certificate of Participation";
}

/** A short second line for the type: the award, role or wing, when there is one. */
export function certificateTypeDetail(opts: {
  kind: VerifyKind;
  awardTitle?: string | null;
  role?: string | null;
  wing?: string | null;
}): string {
  if (opts.awardTitle) return opts.awardTitle;
  if (opts.kind === "organiser") {
    if (opts.role) return opts.role;
    if (opts.wing) return `${opts.wing} Wing`;
    return "Organising Team";
  }
  if (opts.kind === "volunteer") return "Event Volunteer";
  return "";
}

const ID_IN_TEXT = /AWS-SBG-\d{4}-[A-Z2-9]{6}/i;

/**
 * Pulls a certificate ID out of whatever was typed or pasted: the bare ID, an ID
 * with spaces or lower case, or a whole verification link
 * ("https://awstulas.org/verify/aws-sbg-2026-gktz4w"). Returns null when none is found.
 */
export function extractCertificateId(input: string): string | null {
  const compact = input.trim().replace(/\s+/g, "");
  const found = compact.match(ID_IN_TEXT)?.[0]?.toUpperCase();
  return found && isValidCertificateIdFormat(found) ? found : null;
}
