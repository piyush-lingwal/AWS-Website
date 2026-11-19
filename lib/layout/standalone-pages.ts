// ============================================================
// Pages that bring their own navigation — PURE
// ============================================================
//
// The site wraps every page in the dark navbar and footer (app/layout.tsx).
// A standalone page, such as the light-theme design preview, draws its own, so
// the shared ones step aside there. Matching is by whole path segment.
// ============================================================

const STANDALONE_PREFIXES = ["/preview"] as const;

export function isStandalonePage(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return STANDALONE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
