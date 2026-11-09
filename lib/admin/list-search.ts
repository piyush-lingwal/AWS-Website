// ============================================================
// Search matching for the admin lists — PURE (no framework imports)
// ============================================================
//
// One rule for every list in the Certificates tab: the query is split into words,
// and a row matches when EVERY word appears in at least one of its fields (case and
// extra spaces ignored). So "aarav btech" finds Aarav in B.Tech, and a certificate
// ID or part of an email works as well.
// ============================================================

function normalise(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).toLowerCase().replace(/[.\s]+/g, " ").trim();
}

/** The words of a search query, normalised. Empty when the query is blank. */
export function searchTerms(query: string): string[] {
  return normalise(query).split(" ").filter(Boolean);
}

/** True when every term appears in at least one field. No terms matches everything. */
export function matchesTerms(terms: readonly string[], fields: readonly unknown[]): boolean {
  if (terms.length === 0) return true;
  const haystack = fields.map(normalise);
  const joined = haystack.join(" ").replace(/\s+/g, "");
  return terms.every((term) => haystack.some((field) => field.includes(term)) || joined.includes(term.replace(/\s+/g, "")));
}

/** Filters `rows` by `query` using the fields returned by `fieldsOf`. */
export function filterRows<T>(rows: readonly T[], query: string, fieldsOf: (row: T) => readonly unknown[]): T[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return [...rows];
  return rows.filter((row) => matchesTerms(terms, fieldsOf(row)));
}
