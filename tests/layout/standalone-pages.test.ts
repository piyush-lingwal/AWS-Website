import test from "node:test";
import assert from "node:assert/strict";
import { isStandalonePage } from "../../lib/layout/standalone-pages.ts";
import { isChatbotHidden, CHATBOT_HIDDEN_SITEWIDE } from "../../lib/layout/chatbot-visibility.ts";

test("the light landing page draws its own navigation, so the shared dark navbar and footer step aside", () => {
  assert.equal(isStandalonePage("/"), true);
  assert.equal(isStandalonePage(""), false);
});

test("only the landing page itself: every other page keeps the shared navbar and footer", () => {
  for (const path of ["/gallery-archive", "/admin"]) {
    assert.equal(isStandalonePage(path), false, path);
  }
  assert.equal(isStandalonePage(null), false);
  assert.equal(isStandalonePage(undefined), false);
});

test("the gallery and every event gallery under it draw the light navigation", () => {
  for (const path of ["/gallery", "/gallery/", "/gallery/abc"]) {
    assert.equal(isStandalonePage(path), true, path);
  }
});

test("the old /preview address is an ordinary path now", () => {
  assert.equal(isStandalonePage("/preview"), false);
});

test("the chat assistant stays on the landing page", () => {
  assert.equal(isChatbotHidden("/"), CHATBOT_HIDDEN_SITEWIDE);
  assert.equal(isChatbotHidden("/gallery"), CHATBOT_HIDDEN_SITEWIDE);
  assert.equal(isChatbotHidden("/gallery/abc"), CHATBOT_HIDDEN_SITEWIDE);
});

test("the learning hub draws the light navigation and keeps the chat assistant", () => {
  assert.equal(isStandalonePage("/learning-hub"), true);
  assert.equal(isChatbotHidden("/learning-hub"), CHATBOT_HIDDEN_SITEWIDE);
});

test("the about page draws the light navigation and keeps the chat assistant", () => {
  assert.equal(isStandalonePage("/about"), true);
  assert.equal(isStandalonePage("/about/"), true);
  assert.equal(isStandalonePage("/about-us"), false);
  assert.equal(isChatbotHidden("/about"), CHATBOT_HIDDEN_SITEWIDE);
});

test("the team page draws the light navigation and keeps the chat assistant", () => {
  assert.equal(isStandalonePage("/team"), true);
  assert.equal(isStandalonePage("/team/"), true);
  assert.equal(isStandalonePage("/teams"), false);
  assert.equal(isChatbotHidden("/team"), CHATBOT_HIDDEN_SITEWIDE);
});

test("the community page draws the light navigation and keeps the chat assistant", () => {
  assert.equal(isStandalonePage("/community"), true);
  assert.equal(isStandalonePage("/community/"), true);
  assert.equal(isStandalonePage("/communityx"), false);
  assert.equal(isChatbotHidden("/community"), CHATBOT_HIDDEN_SITEWIDE);
});

test("the certificate verification pages draw the light navigation", () => {
  for (const path of ["/verify", "/verify/", "/verify/AWS-SBG-2026-GKTZ4W", "/certificate/verify/AWS-SBG-2026-GKTZ4W"]) {
    assert.equal(isStandalonePage(path), true, path);
  }
  for (const path of ["/verifying", "/verify-me"]) {
    assert.equal(isStandalonePage(path), false, path);
  }
});

test("the attendance page and its /certificate twin draw the light navigation", () => {
  for (const path of ["/attendance", "/attendance/", "/certificate", "/certificate/"]) {
    assert.equal(isStandalonePage(path), true, path);
  }
  for (const path of ["/attendance-x", "/certificates"]) {
    assert.equal(isStandalonePage(path), false, path);
  }
});

test("the register page draws the light navigation and keeps the chat assistant", () => {
  assert.equal(isStandalonePage("/register"), true);
  assert.equal(isStandalonePage("/register/"), true);
  assert.equal(isStandalonePage("/registered"), false);
  assert.equal(isChatbotHidden("/register"), CHATBOT_HIDDEN_SITEWIDE);
});

test("the events page draws the light navigation and keeps the chat assistant", () => {
  assert.equal(isStandalonePage("/events"), true);
  assert.equal(isStandalonePage("/events/"), true);
  assert.equal(isStandalonePage("/events-old"), false);
  assert.equal(isChatbotHidden("/events"), CHATBOT_HIDDEN_SITEWIDE);
});

test("the staff login page draws its own shell, not the shared navbar and footer", () => {
  for (const path of ["/login", "/login/"]) assert.equal(isStandalonePage(path), true, path);
  assert.equal(isStandalonePage("/login-help"), false);
});

test("the media portal pages draw their own staff shell, not the shared navbar and footer", () => {
  for (const path of ["/media", "/media/", "/media/login", "/media/change-password", "/media/events/abc"]) {
    assert.equal(isStandalonePage(path), true, path);
  }
  assert.equal(isStandalonePage("/mediation"), false);
});