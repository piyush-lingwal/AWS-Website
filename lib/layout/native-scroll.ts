// ============================================================
// Pages that scroll natively (no smooth-scroll library) — PURE
// ============================================================
//
// The public site uses Lenis smooth scrolling. The admin screens are dense
// dashboards with scrollable tables, pickers, dialogs and lists that grow and
// shrink; Lenis intercepts the mouse wheel and stops it reaching the page
// there, so only the scroll bar worked. Admin pages use the browser's own scrolling.
// ============================================================

const NATIVE_SCROLL_PREFIXES = ["/admin"] as const;

export function usesNativeScroll(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return NATIVE_SCROLL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
