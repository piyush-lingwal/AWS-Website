import test from "node:test";
import assert from "node:assert/strict";
import { THEME_STORAGE_KEY, isDarkCapablePath } from "../../lib/design/theme.ts";

test("the six pages and gallery detail pages are dark capable", () => {
  for (const p of ["/", "/about", "/events", "/team", "/learning-hub", "/gallery", "/gallery/abc", "/about/", "/gallery/"]) {
    assert.equal(isDarkCapablePath(p), true, p);
  }
});

test("light-only and unknown pages are not dark capable", () => {
  for (const p of ["/community", "/register", "/verify", "/verify/x", "/certificate/verify/x", "/gallery-archive", "/admin", "", null, undefined]) {
    assert.equal(isDarkCapablePath(p), false, String(p));
  }
});

test("storage key", () => {
  assert.equal(THEME_STORAGE_KEY, "sbg-theme");
});
