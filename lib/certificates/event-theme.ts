// ============================================================
// Look up an event's certificate colour theme (server only)
// ============================================================
//
// Never throws and never blocks a certificate: if the lookup fails for any
// reason (most likely the certificate_theme migration has not been applied,
// so the column does not exist) the default theme is used.
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_CERTIFICATE_THEME,
  parseCertificateTheme,
  type CertificateTheme,
} from "./theme.ts";

// PostgreSQL "undefined_column" (what PostgREST reports for a missing column).
const UNDEFINED_COLUMN = "42703";

let warnedMissingColumn = false;

/**
 * True when a Supabase/PostgREST error means "this column does not exist
 * (yet)", as opposed to some other failure that merely mentions its name
 * (a CHECK violation, for example).
 */
export function isMissingColumnError(
  error: { code?: string | null; message?: string | null } | null | undefined,
  column: string
): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  return (code === "PGRST204" || code === UNDEFINED_COLUMN) && (error.message ?? "").includes(column);
}

/** Shown when someone picks a non-default colour before the migration has been applied. */
export const THEME_MIGRATION_HINT =
  "Certificate colours are not set up in the database yet. Apply " +
  "supabase/migrations/20261103000001_event_certificate_theme.sql in the Supabase SQL Editor, then try again.";

export async function getEventCertificateTheme(
  db: SupabaseClient,
  eventId: string
): Promise<CertificateTheme> {
  try {
    const { data, error } = await db
      .from("events")
      .select("certificate_theme")
      .eq("id", eventId)
      .maybeSingle();

    if (error) {
      if (error.code === UNDEFINED_COLUMN || /certificate_theme/.test(error.message ?? "")) {
        if (!warnedMissingColumn) {
          warnedMissingColumn = true;
          console.warn(
            "[certificates] events.certificate_theme does not exist yet; using the default colour. " +
              "Apply supabase/migrations/20261103000001_event_certificate_theme.sql."
          );
        }
      } else {
        console.error("[certificates] Theme lookup failed:", error.message);
      }
      return DEFAULT_CERTIFICATE_THEME;
    }

    return parseCertificateTheme((data as { certificate_theme?: unknown } | null)?.certificate_theme);
  } catch (err) {
    console.error("[certificates] Theme lookup threw:", err instanceof Error ? err.message : err);
    return DEFAULT_CERTIFICATE_THEME;
  }
}
