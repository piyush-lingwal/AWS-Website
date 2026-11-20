// ============================================================
// Admin navigation — PURE logic (no framework imports), unit-tested.
// ============================================================
//
// The five destinations of the admin sidebar. Four are tabs of /admin, Media has
// its own page. The active item comes from the URL only (path + `?tab=`), so Back,
// refresh and shared links always agree.
//
// ============================================================
import { adminTabHref, parseAdminTab } from "./tabs.ts";

export type AdminNavIcon = "overview" | "events" | "registrations" | "team" | "media";

export type AdminNavItem = { id: string; label: string; href: string; icon: AdminNavIcon };

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { id: "overview", label: "Overview", href: adminTabHref("overview"), icon: "overview" },
  { id: "events", label: "Events", href: adminTabHref("events"), icon: "events" },
  { id: "registrations", label: "Certificates", href: adminTabHref("registrations"), icon: "registrations" },
  { id: "team", label: "Team", href: adminTabHref("team"), icon: "team" },
  { id: "media", label: "Media", href: "/admin/media-members", icon: "media" },
];

/** Which nav item is active for this URL, or null when none is (for example a nested admin page). */
export function adminActiveNavId(pathname: string, tabParam: string | null): string | null {
  if (pathname.startsWith("/admin/media-members")) return "media";
  if (pathname === "/admin") return parseAdminTab(tabParam);
  return null;
}
