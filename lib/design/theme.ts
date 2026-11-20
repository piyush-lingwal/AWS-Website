// ============================================================
// Which pages support dark mode — PURE
// ============================================================
//
// Dark mode (DESIGN.md section 13) is live on six pages. The shared chrome
// (nav, footer, atmosphere) is also used by /community, /register and /verify,
// which stay light, so every dark-mode switch is gated by isDarkCapablePath.
// ============================================================

export const THEME_STORAGE_KEY = "sbg-theme";

export const DARK_CAPABLE_EXACT: readonly string[] = ["/", "/about", "/events", "/team", "/learning-hub", "/gallery"];
export const DARK_CAPABLE_PREFIXES: readonly string[] = ["/gallery"];

export function isDarkCapablePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (DARK_CAPABLE_EXACT.includes(path)) return true;
  return DARK_CAPABLE_PREFIXES.some((prefix) => path.startsWith(`${prefix}/`));
}
