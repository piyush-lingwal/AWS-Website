// ============================================================
// Pages that bring their own navigation — PURE
// ============================================================
//
// The site wraps every page in the dark navbar and footer (app/layout.tsx).
// Pages built in the light "Daylight Cloud" theme (DESIGN.md) draw their own,
// so the shared ones step aside there: the pages listed below.
//
// STANDALONE_EXACT matches one path only ("/" is the landing page itself, not
// every path that starts with a slash). STANDALONE_PREFIXES matches a path and
// everything under it by whole segment (/gallery and /gallery/<id>). A page
// joins one of the lists once it is moved into app/(light).
// ============================================================

const STANDALONE_EXACT = ["/", "/learning-hub", "/about", "/team", "/events", "/community", "/register", "/attendance", "/certificate", "/login"] as const;
const STANDALONE_PREFIXES: readonly string[] = ["/gallery", "/verify", "/certificate/verify", "/media"];

export function isStandalonePage(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if ((STANDALONE_EXACT as readonly string[]).includes(path)) return true;
  return STANDALONE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
