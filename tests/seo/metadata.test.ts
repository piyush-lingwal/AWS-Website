import test from "node:test";
import assert from "node:assert/strict";
import { buildPageMetadata } from "../../lib/seo/metadata.ts";

test("buildPageMetadata emits canonical and complete og/twitter", () => {
  const m = buildPageMetadata({ path: "/about", title: "About", description: "d" });
  assert.equal(m.alternates?.canonical, "/about");
  assert.equal(m.title, "About");
  const og = m.openGraph as Record<string, unknown>;
  assert.equal(og.url, "/about");
  assert.equal(og.type, "website");
  assert.equal(og.locale, "en_US");
  const imgs = og.images as { url: string; width: number; height: number; alt: string }[];
  assert.equal(imgs[0].url, "/opengraph-image");
  assert.equal(imgs[0].width, 1200);
  assert.equal(imgs[0].height, 630);
  const tw = m.twitter as Record<string, unknown>;
  assert.equal(tw.card, "summary_large_image");
  assert.deepEqual(tw.images, ["/opengraph-image"]);
  assert.equal(m.robots, undefined);
});

test("buildPageMetadata noindex omits canonical", () => {
  const m = buildPageMetadata({ path: "/login", title: "Login", description: "d", noindex: true });
  assert.equal(m.alternates, undefined);
  assert.deepEqual(m.robots, { index: false, follow: true });
});

test("buildPageMetadata supports absoluteTitle and custom image", () => {
  const m = buildPageMetadata({ path: "/", title: "Home", description: "d", absoluteTitle: true, image: "/x.png" });
  assert.deepEqual(m.title, { absolute: "Home" });
  assert.deepEqual((m.twitter as { images: string[] }).images, ["/x.png"]);
});
