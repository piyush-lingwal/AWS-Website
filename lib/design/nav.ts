// ============================================================
// Main navigation of the light theme — PURE
// ============================================================

export interface NavItem {
  label: string;
  href: string;
}

/** The six pages of the site, in the order the old navbar showed them. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Team", href: "/team" },
  { label: "Learning Hub", href: "/learning-hub" },
  { label: "Gallery", href: "/gallery" },
];

/**
 * Home is active on "/" only. Every other item is active on its own page and
 * on anything under it ("/gallery/abc" lights up Gallery), matched by whole
 * path segment so "/events-archive" does not light up Events.
 */
export function isActiveNav(href: string, pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}
