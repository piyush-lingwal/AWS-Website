// ============================================================
// Select certificate rows when some columns may not exist yet (server only)
// ============================================================
//
// Several certificates columns arrive through separate migrations that can be
// applied out of order (or not yet on a given database):
//
//   event_date_display_snapshot  20261104000001  date range text
//   certificate_kind, role_snapshot  20261105000001  organiser certificates
//   wing_snapshot                20261106000001  organiser wing
//
// A plain select that names a missing column fails as a whole. This runs the
// query, and each time PostgREST reports one of the optional columns as
// missing it drops just that column and tries again, so one missing column
// never hides the others.
// ============================================================

import { isMissingColumnError } from "./event-theme";

/** Certificate columns added after the original table, in the order they appeared. */
export const CERTIFICATE_OPTIONAL_COLUMNS = [
  "event_date_display_snapshot",
  "certificate_kind",
  "role_snapshot",
  "wing_snapshot",
] as const;

interface DbError {
  code?: string | null;
  message?: string | null;
}

export interface OptionalSelectResult<T> {
  data: T | null;
  /** A real failure (not just a missing optional column). */
  error: DbError | null;
  /** Optional columns this database does not have. */
  missing: string[];
}

/**
 * `run` receives the column list to select and returns the Supabase result.
 * It is called again with fewer columns until the query stops failing on a
 * missing optional column.
 */
export async function selectWithOptionalColumns<T = Record<string, unknown>>(
  baseColumns: string,
  optionalColumns: readonly string[],
  run: (select: string) => PromiseLike<{ data: unknown; error: DbError | null }>
): Promise<OptionalSelectResult<T>> {
  let present = [...optionalColumns];
  const missing: string[] = [];
  for (;;) {
    const select = present.length ? `${baseColumns}, ${present.join(", ")}` : baseColumns;
    const res = await run(select);
    if (!res.error) return { data: (res.data ?? null) as T | null, error: null, missing };
    const gone = present.find((column) => isMissingColumnError(res.error, column));
    if (!gone) return { data: null, error: res.error, missing };
    present = present.filter((column) => column !== gone);
    missing.push(gone);
  }
}
