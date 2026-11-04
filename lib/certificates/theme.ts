// ============================================================
// Certificate colour themes — PURE (no framework or Node imports)
// ============================================================
//
// Each event picks one theme (events.certificate_theme). A theme decides
//   - which pair of SVG templates is used (public/templates/), and
//   - the accent colour the generator draws dynamic text in (event name,
//     rank lines), so it matches the template's coloured panel.
//
// Kept dependency-free so the admin form (browser), the generator (server)
// and the tests (node --test) can all share it.
//
// To add a theme: add its name here, create its two templates, and add a
// `ALTER TABLE ... CHECK` update in a new migration.
// ============================================================

export const CERTIFICATE_THEMES = ["orange", "purple"] as const;

export type CertificateTheme = (typeof CERTIFICATE_THEMES)[number];

/** Used when an event has no theme, an unknown theme, or the column is missing. */
export const DEFAULT_CERTIFICATE_THEME: CertificateTheme = "orange";

export interface CertificateThemeInfo {
  label: string;
  /** The coloured panel / accent colour baked into the template files. */
  accent: string;
  /** File names inside public/templates/. */
  participationTemplate: string;
  excellenceTemplate: string;
}

export const CERTIFICATE_THEME_INFO: Record<CertificateTheme, CertificateThemeInfo> = {
  orange: {
    label: "Orange",
    accent: "#FF9900",
    participationTemplate: "Certificate-Template.svg",
    excellenceTemplate: "Certificate-of-Excellence-Template.svg",
  },
  purple: {
    label: "Purple",
    accent: "#8B5CF6",
    participationTemplate: "Certificate-Template-Purple.svg",
    excellenceTemplate: "Certificate-of-Excellence-Template-Purple.svg",
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
    error: `Certificate colour must be one of: ${CERTIFICATE_THEMES.join(", ")}.`,
  };
}

/** The template file for a theme; `isAward` selects the Certificate of Excellence design. */
export function templateFileName(theme: CertificateTheme, isAward: boolean): string {
  const info = CERTIFICATE_THEME_INFO[theme];
  return isAward ? info.excellenceTemplate : info.participationTemplate;
}
