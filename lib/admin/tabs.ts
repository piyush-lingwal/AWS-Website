// ============================================================
// Admin tabs — PURE logic (no framework imports), unit-tested.
// ============================================================
//
// The active tab lives in the URL (`/admin?tab=events`). The URL is the single
// source of truth, so the browser Back button, a refresh and a shared link all
// land on the same tab.
//
// ============================================================

export type AdminTab = "overview" | "events" | "registrations" | "team";

export const ADMIN_TABS: readonly AdminTab[] = ["overview", "events", "registrations", "team"];

export const DEFAULT_ADMIN_TAB: AdminTab = "overview";

/** Reads a `?tab=` value. Anything unknown falls back to the overview. */
export function parseAdminTab(value: string | null | undefined): AdminTab {
  // "settings" was merged into Events; keep old bookmarks working.
  if (value === "settings") return "events";
  return (ADMIN_TABS as readonly string[]).includes(value ?? "") ? (value as AdminTab) : DEFAULT_ADMIN_TAB;
}

export function adminTabHref(tab: AdminTab): string {
  return tab === DEFAULT_ADMIN_TAB ? "/admin" : `/admin?tab=${tab}`;
}
