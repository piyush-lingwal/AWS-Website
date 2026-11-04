// Run with:  npm test      (Node 22.6+, no extra dependencies)

import test from "node:test";
import assert from "node:assert/strict";
import { ADMIN_TABS, DEFAULT_ADMIN_TAB, adminTabHref, parseAdminTab } from "../../lib/admin/tabs.ts";

test("parseAdminTab accepts every known tab", () => {
  for (const tab of ADMIN_TABS) assert.equal(parseAdminTab(tab), tab);
});

test("parseAdminTab falls back to the overview for anything else", () => {
  assert.equal(parseAdminTab(null), DEFAULT_ADMIN_TAB);
  assert.equal(parseAdminTab(undefined), DEFAULT_ADMIN_TAB);
  assert.equal(parseAdminTab(""), DEFAULT_ADMIN_TAB);
  assert.equal(parseAdminTab("EVENTS"), DEFAULT_ADMIN_TAB);
  assert.equal(parseAdminTab("<script>"), DEFAULT_ADMIN_TAB);
  assert.equal(parseAdminTab("constructor"), DEFAULT_ADMIN_TAB);
});

test("adminTabHref round-trips through parseAdminTab", () => {
  for (const tab of ADMIN_TABS) {
    const href = adminTabHref(tab);
    const value = new URL(href, "http://x").searchParams.get("tab");
    assert.equal(parseAdminTab(value), tab);
  }
  assert.equal(adminTabHref("overview"), "/admin");
});

test("the removed settings tab sends old links to events", () => {
  assert.equal(parseAdminTab("settings"), "events");
  assert.equal((ADMIN_TABS as readonly string[]).includes("settings"), false);
});
