import test from "node:test";
import assert from "node:assert/strict";
import { buildLlmsTxt } from "../../lib/seo/llms-txt.ts";

const BASE = "https://awstulas.org";

test("llms.txt starts with the H1 and blockquote", () => {
  const t = buildLlmsTxt(BASE);
  assert.ok(t.startsWith("# AWS Student Builder Group at Tulas University\n\n> "));
  assert.ok(t.includes("\n## Pages\n"));
  assert.ok(t.includes("\n## Contact and profiles\n"));
  assert.ok(t.includes("\n## Optional\n"));
});

test("every markdown link is absolute on the base host", () => {
  const t = buildLlmsTxt(BASE);
  const links = [...t.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
  assert.ok(links.length >= 10);
  for (const l of links) assert.ok(l === BASE || l.startsWith(`${BASE}/`), l);
  assert.ok(links.includes(`${BASE}/sitemap.xml`));
});

test("llms.txt carries no digits-based statistics claims", () => {
  assert.ok(!/\d+\s*\+/.test(buildLlmsTxt(BASE)));
  assert.ok(!/1st AWS/i.test(buildLlmsTxt(BASE)));
});
