import test from "node:test";
import assert from "node:assert/strict";
import { NAV_ITEMS, isActiveNav } from "../../lib/design/nav.ts";

test("the navigation lists the six real pages of the site", () => {
  assert.deepEqual(
    NAV_ITEMS.map((i) => i.href),
    ["/", "/about", "/events", "/team", "/learning-hub", "/gallery"]
  );
  assert.equal(new Set(NAV_ITEMS.map((i) => i.label)).size, NAV_ITEMS.length);
});

test("Home is active on the landing page only", () => {
  assert.equal(isActiveNav("/", "/"), true);
  assert.equal(isActiveNav("/", "/about"), false);
  assert.equal(isActiveNav("/", "/gallery/abc"), false);
});

test("a page and everything under it light up its item", () => {
  assert.equal(isActiveNav("/gallery", "/gallery"), true);
  assert.equal(isActiveNav("/gallery", "/gallery/5e2942e1"), true);
  assert.equal(isActiveNav("/gallery", "/gallery/"), true);
  assert.equal(isActiveNav("/learning-hub", "/learning-hub"), true);
});

test("matching is by whole path segment", () => {
  assert.equal(isActiveNav("/events", "/events-archive"), false);
  assert.equal(isActiveNav("/team", "/teams"), false);
});

test("no current path means nothing is active", () => {
  assert.equal(isActiveNav("/", null), false);
  assert.equal(isActiveNav("/about", undefined), false);
});
