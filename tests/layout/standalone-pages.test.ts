import test from "node:test";
import assert from "node:assert/strict";
import { isStandalonePage } from "../../lib/layout/standalone-pages.ts";
import { isChatbotHidden } from "../../lib/layout/chatbot-visibility.ts";

test("the design preview draws its own navigation, so the shared navbar and footer step aside", () => {
  assert.equal(isStandalonePage("/preview"), true);
  assert.equal(isStandalonePage("/preview/"), true);
  assert.equal(isStandalonePage("/preview/anything"), true);
});

test("matching is by whole path segment, and normal pages keep the shared navbar and footer", () => {
  assert.equal(isStandalonePage("/previews"), false);
  assert.equal(isStandalonePage("/events/preview"), false);
  assert.equal(isStandalonePage("/"), false);
  assert.equal(isStandalonePage("/gallery"), false);
  assert.equal(isStandalonePage(null), false);
  assert.equal(isStandalonePage(undefined), false);
});

test("the dark chat assistant is hidden on the light preview", () => {
  assert.equal(isChatbotHidden("/preview"), true);
  assert.equal(isChatbotHidden("/previews"), false);
});
