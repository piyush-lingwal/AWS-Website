// ============================================================
// Certificate colour themes — PURE (no framework or Node imports)
// ============================================================
//
// Each event picks one theme (events.certificate_theme). A theme decides
//   - which set of SVG templates is used (public/templates/, one per
//     certificate kind), and
//   - the accent colour the generator draws dynamic text in (event name,
//     rank lines), so it matches the template's coloured panel.
//
// "kiro" is the orange design with the Kiro logo added to the logo tiles in the
// top right. It shares orange's accent colour, so only its template files differ.
//
// Kept dependency-free so the admin form (browser), the generator (server)
// and the tests (node --test) can all share it.
//
// To add a theme: add its name here, create its three templates (one per kind),
// and update the events_certificate_theme_check constraint in a new migration.
// ============================================================

export const CERTIFICATE_THEMES = ["orange", "purple", "kiro"] as const;

export type CertificateTheme = (typeof CERTIFICATE_THEMES)[number];

/** Used when an event has no theme, an unknown theme, or the column is missing. */
export const DEFAULT_CERTIFICATE_THEME: CertificateTheme = "orange";

/**
 * Which certificate design to draw:
 *   participation — attendees ("Certificate of Participation")
 *   excellence    — top performers ("Certificate of Excellence"), chosen by an award title
 *   organiser     — organising team members ("Certificate of Appreciation")
 */
export const CERTIFICATE_KINDS = ["participation", "excellence", "organiser"] as const;

export type CertificateKind = (typeof CERTIFICATE_KINDS)[number];

export interface CertificateThemeInfo {
  label: string;
  /** The coloured panel / accent colour baked into the template files. */
  accent: string;
  /** Short extra line for the picker, for themes that differ by more than colour. */
  note?: string;
  /** File names inside public/templates/, one per certificate kind. */
  templates: Record<CertificateKind, string>;
}

export const CERTIFICATE_THEME_INFO: Record<CertificateTheme, CertificateThemeInfo> = {
  orange: {
    label: "Orange",
    accent: "#FF9900",
    templates: {
      participation: "Certificate-Template.svg",
      excellence: "Certificate-of-Excellence-Template.svg",
      organiser: "Certificate-of-Appreciation-Template.svg",
    },
  },
  purple: {
    label: "Purple",
    accent: "#8B5CF6",
    templates: {
      participation: "Certificate-Template-Purple.svg",
      excellence: "Certificate-of-Excellence-Template-Purple.svg",
      organiser: "Certificate-of-Appreciation-Template-Purple.svg",
    },
  },
  kiro: {
    label: "Kiro Sponsored",
    accent: "#FF9900",
    note: "Orange + Kiro logo",
    templates: {
      participation: "Certificate-Template-Kiro-Sponsored.svg",
      excellence: "Certificate-of-Excellence-Template-Kiro-Sponsored.svg",
      organiser: "Certificate-of-Appreciation-Template-Kiro-Sponsored.svg",
    },
  },
};

export function isCertificateTheme(value: unknown): value is CertificateTheme {
  return typeof value === "string" && (CERTIFICATE_THEMES as readonly string[]).includes(value);
}

/** Anything that is not a known theme name falls back to the default. */
export function parseCertificateTheme(value: unknown): CertificateTheme {
  return isCertificateTheme(value) ? value : DEFAULT_CERTIFICATE_THEME;
}

export type ThemeValidation =
  | { ok: true; value: CertificateTheme }
  | { ok: false; error: string };

/** Strict check for API input: a missing value is a mistake the caller should hear about. */
export function validateCertificateTheme(value: unknown): ThemeValidation {
  if (isCertificateTheme(value)) return { ok: true, value };
  return {
    ok: false,
    error: `Certificate template must be one of: ${CERTIFICATE_THEMES.join(", ")}.`,
  };
}

/**
 * Shown when a template newer than the database's events_certificate_theme_check
 * constraint is chosen (the constraint only lists the themes known when it was last updated).
 */
export const THEME_CONSTRAINT_HINT =
  "This certificate template is not enabled in the database yet. Apply " +
  "supabase/migrations/20261107000001_kiro_sponsored_theme.sql in the Supabase SQL Editor, then try again.";

/** True when the database rejected a theme value because of events_certificate_theme_check. */
export function isThemeConstraintError(
  error: { code?: string | null; message?: string | null } | null | undefined
): boolean {
  if (!error) return false;
  return error.code === "23514" && (error.message ?? "").includes("events_certificate_theme_check");
}

/** The template file for a colour theme and certificate kind. */
export function templateFileName(theme: CertificateTheme, kind: CertificateKind): string {
  return CERTIFICATE_THEME_INFO[theme].templates[kind];
}

/**
 * An award title always means a Certificate of Excellence. Otherwise the
 * requested kind is used, defaulting to participation.
 */
export function resolveCertificateKind(
  hasAwardTitle: boolean,
  kind?: CertificateKind
): CertificateKind {
  if (hasAwardTitle) return "excellence";
  return kind === "organiser" ? "organiser" : "participation";
}
