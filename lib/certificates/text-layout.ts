// ============================================================
// Certificate text sizes — PURE (no framework or Node imports)
// ============================================================
//
// ONE place for how big each line of a certificate is. The PDF/PNG
// (svg-generator.ts) and the /verify page preview (CertificatePreview.tsx)
// both read from here, so changing a size changes both.
//
// Units are the template's 3300 x 2550 canvas, not CSS pixels. The text
// panel on the right is 1320 wide (x 1815 to 3135), centred at x = 2475.
//
// Every line is "fitted": it is drawn at `size` unless that would be wider
// than `maxWidth`, in which case it shrinks (see fitMonoSize).
// ============================================================

/**
 * IBM Plex Mono (regular and bold) has an advance width of 600/1000 em for
 * every character, so a line's width is exactly chars * 0.6 * fontSize. That
 * lets the browser preview fit text without loading the font file.
 */
export const MONO_ADVANCE_EM = 0.6;

export interface TextSpec {
  /** Font size used when the line fits. */
  size: number;
  /** Widest the line may be before it is shrunk. */
  maxWidth: number;
}

export const CERT_TEXT = {
  /** "This certificate is proudly presented to" */
  presentedTo: { size: 42, maxWidth: 1180 },
  /** The recipient's name (bold). */
  name: { size: 96, maxWidth: 1200 },
  /** "in recognition of their participation in" */
  recognition: { size: 42, maxWidth: 1180 },
  /** The event name on a participation certificate (bold, accent colour). */
  eventName: { size: 58, maxWidth: 1200 },
  /** "conducted by AWS Student Builder Group at Tulas University" */
  conductedBy: { size: 34, maxWidth: 1200 },
  /** "on 30 October 2026" (bold). */
  date: { size: 38, maxWidth: 1180 },
  /** Signer title and organisation under the signature line. */
  signer: { size: 32, maxWidth: 580 },
  /** "Certificate ID: ..." under the QR code. */
  certId: { size: 30, maxWidth: 1850 },
  /** "Verify Certificate: ..." under the QR code. */
  verifyUrl: { size: 28, maxWidth: 1850 },
  /** Certificate of Excellence only. */
  award: {
    /** "for securing" */
    securing: { size: 36, maxWidth: 1180 },
    /** "1st Position" etc. (bold, accent colour). */
    rank: { size: 112, maxWidth: 850 },
    /** "in" / "Position in" */
    context: { size: 36, maxWidth: 1240 },
    /** The event name (bold, accent colour). */
    eventName: { size: 62, maxWidth: 1240 },
    /** "conducted by AWS Student Builder Group at Tulas University" */
    conductedBy: { size: 34, maxWidth: 1240 },
  },
} as const satisfies Record<string, TextSpec | Record<string, TextSpec>>;

/** The line between the name and the event name on a participation certificate. */
export const RECOGNITION_LINE = {
  participation: "in recognition of their participation in",
} as const;

// ------------------------------------------------------------
// Certificate of Appreciation (organising team)
// ------------------------------------------------------------
//
// Two wordings, depending on whether the person has a specific role:
//
//   With a role                              Without a role (their wing)
//   ------------------------------------     ------------------------------------
//   This certificate is proudly presented to This certificate is proudly presented to
//   Vivek Dharmwan                           Vivek Dharmwan
//   In recognition of your valuable          In recognition of your valuable
//     contribution as                          contribution as
//   TECHNICAL CO-LEAD                        Media member of the Organising Team for
//   of the Organising Team for               BUILD-VERSE 2026
//   BUILD-VERSE 2026                         Organised by AWS Student Builder Group ...
//   Organised by AWS Student Builder Group   29-30 October 2026
//   29-30 October 2026
// ------------------------------------------------------------

export const ORGANISER_COPY = {
  presentedTo: "This certificate is proudly presented to",
  recognition: "In recognition of your valuable contribution as",
  /** Follows the role line. */
  teamAfterRole: "of the Organising Team for",
  organisedBy: "Organised by AWS Student Builder Group at Tulas University",
} as const;

export interface OrganiserLines {
  /** The big accent line holding the role (UPPERCASE), or null when the person has no role. */
  roleLine: string | null;
  /** The plain line saying which team: "of the Organising Team for", or "Media member of ...". */
  teamLine: string;
}

/**
 * The role/team lines for an organiser certificate.
 *   role "Technical Co-Lead" -> roleLine "TECHNICAL CO-LEAD", teamLine "of the Organising Team for"
 *   no role, wing "Media"    -> roleLine null, teamLine "Media member of the Organising Team for"
 *   no role, no wing         -> roleLine null, teamLine "a member of the Organising Team for"
 */
export function organiserLines(role?: string | null, wing?: string | null): OrganiserLines {
  const cleanRole = (role ?? "").trim().replace(/\s+/g, " ");
  if (cleanRole) {
    return { roleLine: cleanRole.toUpperCase(), teamLine: ORGANISER_COPY.teamAfterRole };
  }
  const cleanWing = (wing ?? "").trim().replace(/\s+/g, " ");
  return {
    roleLine: null,
    teamLine: `${cleanWing ? `${cleanWing} member` : "a member"} of the Organising Team for`,
  };
}

/** The event name as printed on an organiser certificate (UPPERCASE). */
export function organiserEventLine(eventTitle: string): string {
  return eventTitle.trim().toUpperCase();
}

/**
 * The date as printed on an organiser certificate. Ranges use an en dash:
 * "29-30 October 2026" -> "29–30 October 2026", "29 Oct - 05 Nov 2026" -> "29 Oct – 05 Nov 2026".
 * A single day is unchanged.
 */
export function organiserDateText(display: string): string {
  return display.trim().replace(/(\d)-(\d)/g, "$1\u2013$2").replace(/ - /g, " \u2013 ");
}

/** Font sizes for the organiser layout (same fitting rule as every other line). */
export const ORGANISER_TEXT = {
  presentedTo: { size: 42, maxWidth: 1180 },
  name: { size: 96, maxWidth: 1200 },
  recognition: { size: 38, maxWidth: 1200 },
  /** The role (bold, accent colour). */
  role: { size: 84, maxWidth: 1200 },
  team: { size: 38, maxWidth: 1200 },
  event: { size: 62, maxWidth: 1240 },
  organisedBy: { size: 32, maxWidth: 1240 },
  date: { size: 38, maxWidth: 1180 },
} as const satisfies Record<string, TextSpec>;

/**
 * Baselines (canvas y) for the organiser layout. `organisedBy` and `date` sit
 * below y=1870, where the template's lower white box starts, so both renderers
 * draw them in the signer layer (as the Certificate of Excellence does).
 */
export const ORGANISER_Y = {
  presentedTo: 1330,
  name: 1475,
  recognition: 1550,
  /** With a role: ROLE line, then the team line below it. */
  withRole: { role: 1655, team: 1730, event: 1832 },
  /** Without a role: one team line ("Media member of ..."), then the event. */
  withoutRole: { team: 1655, event: 1790 },
  organisedBy: 1912,
  date: 1976,
} as const;

/**
 * Largest font size, up to `spec.size`, at which `charCount` monospaced
 * characters fit inside `spec.maxWidth`. Never below 1.
 */
export function fitMonoSize(charCount: number, spec: TextSpec): number {
  const chars = Math.max(1, charCount);
  if (chars * MONO_ADVANCE_EM * spec.size <= spec.maxWidth) return spec.size;
  return Math.max(1, Math.floor(spec.maxWidth / (chars * MONO_ADVANCE_EM)));
}
