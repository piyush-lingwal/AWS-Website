// ============================================================
// Pagination helpers — PURE logic (no framework imports), unit-tested.
// ============================================================

/** Supabase/PostgREST returns at most this many rows per request by default. */
export const DB_PAGE_LIMIT = 1000;

export function pageCount(total: number, pageSize: number): number {
  if (total <= 0 || pageSize <= 0) return 1;
  return Math.ceil(total / pageSize);
}

/** Keeps a page number inside 1..pageCount, so a shrinking list never shows an empty page. */
export function clampPage(page: number, total: number, pageSize: number): number {
  const last = pageCount(total, pageSize);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.floor(page), last);
}

export function pageSlice<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const p = clampPage(page, items.length, pageSize);
  return items.slice((p - 1) * pageSize, p * pageSize);
}

/** "Showing 51–100 of 1,400" numbers; from/to are 0 for an empty list. */
export function pageRange(page: number, total: number, pageSize: number): { from: number; to: number } {
  if (total <= 0) return { from: 0, to: 0 };
  const p = clampPage(page, total, pageSize);
  return { from: (p - 1) * pageSize + 1, to: Math.min(p * pageSize, total) };
}

/** Inclusive [from, to] row ranges that cover `total` rows in DB-sized chunks. */
export function chunkRanges(total: number, chunk: number = DB_PAGE_LIMIT): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let from = 0; from < total; from += chunk) out.push([from, Math.min(from + chunk, total) - 1]);
  return out;
}
