import { test } from "node:test";
import assert from "node:assert/strict";
import { isChatbotHidden } from "../../lib/layout/chatbot-visibility.ts";

test("the assistant is hidden on the admin screens", () => {
  for (const p of ["/admin", "/admin/", "/admin/media-members", "/admin?tab=events".split("?")[0]]) assert.equal(isChatbotHidden(p), true, p);
});

test("the assistant is hidden on every certificate verification page", () => {
  for (const p of ["/verify", "/verify/", "/verify/AWS-SBG-2026-GKTZ4W", "/verify/AWS-SBG-2026-GKTZ4W/", "/certificate/verify/AWS-SBG-2026-GKTZ4W"]) {
    assert.equal(isChatbotHidden(p), true, p);
  }
});

test("the assistant stays on the public pages", () => {
  for (const p of ["/", "/about", "/events", "/team", "/gallery", "/learning-hub", "/attendance", "/certificate", "/register"]) {
    assert.equal(isChatbotHidden(p), false, p);
  }
});

test("matching is by whole path segment, so look-alike paths are not hidden", () => {
  for (const p of ["/verifying", "/verify-me", "/administrator", "/events/verify", "/certificates"]) assert.equal(isChatbotHidden(p), false, p);
  assert.equal(isChatbotHidden(null), false);
  assert.equal(isChatbotHidden(undefined), false);
  assert.equal(isChatbotHidden(""), false);
});
