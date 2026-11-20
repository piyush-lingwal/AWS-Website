import test from "node:test";
import assert from "node:assert/strict";
import {
  FALLBACK_SITE_URL,
  SITE_DESCRIPTION,
  SOCIAL_PROFILES,
  absoluteUrl,
  resolveSiteUrl,
} from "../../lib/seo/site.ts";

test("resolveSiteUrl falls back when unset, empty or invalid", () => {
  assert.equal(resolveSiteUrl(undefined, "production"), FALLBACK_SITE_URL);
  assert.equal(resolveSiteUrl("  ", "production"), FALLBACK_SITE_URL);
  assert.equal(resolveSiteUrl("not a url", "production"), FALLBACK_SITE_URL);
  assert.equal(resolveSiteUrl("ftp://example.com", "production"), FALLBACK_SITE_URL);
});

test("resolveSiteUrl strips trailing slash and path", () => {
  assert.equal(resolveSiteUrl("https://example.org/", "production"), "https://example.org");
});

test("resolveSiteUrl ignores localhost only in production", () => {
  assert.equal(resolveSiteUrl("http://localhost:3000", "production"), FALLBACK_SITE_URL);
  assert.equal(resolveSiteUrl("http://localhost:3000", "development"), "http://localhost:3000");
});

test("absoluteUrl joins paths", () => {
  assert.equal(absoluteUrl("/", "https://a.org"), "https://a.org");
  assert.equal(absoluteUrl("/about", "https://a.org/"), "https://a.org/about");
  assert.equal(absoluteUrl("about", "https://a.org"), "https://a.org/about");
});

test("constants are sane", () => {
  assert.ok(SITE_DESCRIPTION.length <= 160);
  assert.equal(SOCIAL_PROFILES.length, 3);
  assert.ok(SOCIAL_PROFILES.every((u) => !u.includes("github.com")));
});
