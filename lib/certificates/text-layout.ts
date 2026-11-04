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

/**
 * The line between the name and the event name. Drawn at CERT_TEXT.recognition.
 * Organising team members get their own wording on the Certificate of Appreciation.
 */
export const RECOGNITION_LINE = {
  participation: "in recognition of their participation in",
  organiser: "as a member of the Organising Team of",
} as const;

/**
 * The organiser recognition line, with the role woven in when there is one:
 *   role "Technical Lead" -> "as Technical Lead of the Organising Team of"
 *   no role              -> "as a member of the Organising Team of"
 * Overly long roles fall back to the generic line so the certificate never overflows.
 */
export function organiserRecognitionLine(role?: string | null): string {
  const clean = (role ?? "").trim().replace(/\s+/g, " ");
  if (!clean) return RECOGNITION_LINE.organiser;
  const withRole = `as ${clean} of the Organising Team for`;
  return withRole.length <= 48 ? withRole : RECOGNITION_LINE.organiser;
}

/**
 * Largest font size, up to `spec.size`, at which `charCount` monospaced
 * characters fit inside `spec.maxWidth`. Never below 1.
 */
export function fitMonoSize(charCount: number, spec: TextSpec): number {
  const chars = Math.max(1, charCount);
  if (chars * MONO_ADVANCE_EM * spec.size <= spec.maxWidth) return spec.size;
  return Math.max(1, Math.floor(spec.maxWidth / (chars * MONO_ADVANCE_EM)));
}
