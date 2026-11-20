// Run with:  npm test      (Node 22.6+, no extra dependencies)
import test from "node:test";
import assert from "node:assert/strict";
import { ADMIN_NAV_ITEMS, adminActiveNavId } from "../../lib/admin/nav.ts";

test("nav items are the five destinations in order", () => {
  assert.deepEqual(
    ADMIN_NAV_ITEMS.map((i) => [i.id, i.label, i.href]),
    [
      ["overview", "Overview", "/admin"],
      ["events", "Events", "/admin?tab=events"],
      ["registrations", "Certificates", "/admin?tab=registrations"],
      ["team", "Team", "/admin?tab=team"],
      ["media", "Media", "/admin/media-members"],
    ]
  );
});

test("adminActiveNavId follows the tab on /admin", () => {
  assert.equal(adminActiveNavId("/admin", null), "overview");
  assert.equal(adminActiveNavId("/admin", "events"), "events");
  assert.equal(adminActiveNavId("/admin", "registrations"), "registrations");
  assert.equal(adminActiveNavId("/admin", "settings"), "events");
  assert.equal(adminActiveNavId("/admin", "nonsense"), "overview");
});

test("adminActiveNavId marks Media on its page and nothing elsewhere", () => {
  assert.equal(adminActiveNavId("/admin/media-members", null), "media");
  assert.equal(adminActiveNavId("/admin/media-members/x", "team"), "media");
  assert.equal(adminActiveNavId("/admin/other", null), null);
  assert.equal(adminActiveNavId("/", null), null);
});
