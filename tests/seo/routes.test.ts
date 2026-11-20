import test from "node:test";
import assert from "node:assert/strict";
import { PUBLIC_ROUTES, ROBOTS_DISALLOW, buildRobots, buildSitemap } from "../../lib/seo/routes.ts";

const BASE = "https://awstulas.org";

test("buildRobots has one group, absolute sitemap and no host", () => {
  const r = buildRobots(BASE);
  assert.equal(r.rules.length, 1);
  assert.deepEqual(r.rules[0].disallow, ["/admin", "/media", "/login", "/api/"]);
  assert.equal(r.sitemap, `${BASE}/sitemap.xml`);
  assert.ok(!("host" in r));
});

test("buildSitemap lists static routes without priority/changefreq", () => {
  const s = buildSitemap(BASE);
  assert.equal(s.length, PUBLIC_ROUTES.length);
  assert.equal(s[0].url, BASE);
  const urls = s.map((e) => e.url);
  assert.ok(urls.includes(`${BASE}/community`) && urls.includes(`${BASE}/verify`));
  for (const bad of ["/attendance", "/certificate", ...ROBOTS_DISALLOW]) {
    assert.ok(!urls.some((u) => u.startsWith(`${BASE}${bad}`)), bad);
  }
  assert.ok(s.every((e) => !("priority" in e) && !("changeFrequency" in e) && !("lastModified" in e)));
});

test("buildSitemap adds gallery entries; lastModified only for valid dates", () => {
  const s = buildSitemap(BASE, [
    { id: "a", event_date: "2025-03-01" },
    { id: "b", event_date: null },
    { id: "c", event_date: "garbage" },
  ]);
  const g = s.slice(PUBLIC_ROUTES.length);
  assert.equal(g[0].url, `${BASE}/gallery/a`);
  assert.ok(g[0].lastModified instanceof Date);
  assert.equal(g[1].lastModified, undefined);
  assert.equal(g[2].lastModified, undefined);
});
