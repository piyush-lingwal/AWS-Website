import test from "node:test";
import assert from "node:assert/strict";
import { HOLD, TONES, TONES_DARK, toneSet, hex, isToneName, mixRgb, rgbTriplet, smoothstep, toneAtY, type ToneStop } from "../../lib/design/atmosphere.ts";

const stops: ToneStop[] = [
  { at: 1000, tone: "dawn" },
  { at: 3000, tone: "violet" },
  { at: 5000, tone: "clear" },
];

test("hex parses 6-digit colours and rejects anything else", () => {
  assert.deepEqual(hex("#FFFFFF"), [255, 255, 255]);
  assert.deepEqual(hex("7C3AED"), [124, 58, 237]);
  assert.throws(() => hex("#FFF"));
  assert.throws(() => hex("purple"));
});

test("smoothstep is flat at both ends and 0.5 in the middle", () => {
  assert.equal(smoothstep(-3), 0);
  assert.equal(smoothstep(4), 1);
  assert.equal(smoothstep(0.5), 0.5);
});

test("mixRgb returns its endpoints and the midpoint", () => {
  assert.deepEqual(mixRgb([0, 0, 0], [100, 200, 50], 0), [0, 0, 0]);
  assert.deepEqual(mixRgb([0, 0, 0], [100, 200, 50], 1), [100, 200, 50]);
  assert.deepEqual(mixRgb([0, 0, 0], [100, 200, 50], 0.5), [50, 100, 25]);
});

test("before the first stop and after the last one the edge tone is used", () => {
  assert.deepEqual(toneAtY(stops, -500), TONES.dawn);
  assert.deepEqual(toneAtY(stops, 1000), TONES.dawn);
  assert.deepEqual(toneAtY(stops, 5000), TONES.clear);
  assert.deepEqual(toneAtY(stops, 99999), TONES.clear);
});

test("a tone is held for the first and last share of the way between two stops", () => {
  // Between 1000 and 3000: the first 30% stays dawn, the last 30% is already violet.
  assert.deepEqual(toneAtY(stops, 1000 + 2000 * (HOLD - 0.01)), TONES.dawn);
  assert.deepEqual(toneAtY(stops, 3000 - 2000 * (HOLD - 0.01)), TONES.violet);
});

test("halfway between two stops is the midpoint of the two tones", () => {
  const mid = toneAtY(stops, 2000);
  assert.deepEqual(mid.base, mixRgb(TONES.dawn.base, TONES.violet.base, 0.5));
  assert.deepEqual(mid.a, mixRgb(TONES.dawn.a, TONES.violet.a, 0.5));
});

test("the blend never overshoots: every channel stays between the two tones", () => {
  for (let y = 1000; y <= 3000; y += 37) {
    const t = toneAtY(stops, y);
    for (let i = 0; i < 3; i++) {
      const lo = Math.min(TONES.dawn.base[i], TONES.violet.base[i]);
      const hi = Math.max(TONES.dawn.base[i], TONES.violet.base[i]);
      assert.ok(t.base[i] >= lo - 1e-9 && t.base[i] <= hi + 1e-9, `y=${y} channel ${i}`);
    }
  }
});

test("no stops falls back to the hero tone; two stops at the same place do not divide by zero", () => {
  assert.deepEqual(toneAtY([], 123), TONES.dawn);
  const tie = toneAtY([{ at: 10, tone: "dawn" }, { at: 10, tone: "dusk" }, { at: 20, tone: "clear" }], 10);
  assert.ok(tie.base.every(Number.isFinite));
});

test("every tone is light: the page base is near white and the blobs are never dark", () => {
  const luminance = ([r, g, b]: readonly [number, number, number]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  for (const [name, t] of Object.entries(TONES)) {
    assert.ok(luminance(t.base) > 225, `${name} base is too dark`);
    for (const blob of [t.a, t.b, t.c]) assert.ok(luminance(blob) > 120, `${name} has a dark blob`);
  }
});

test("isToneName only accepts real tones (no prototype tricks)", () => {
  assert.equal(isToneName("dusk"), true);
  assert.equal(isToneName("night"), false);
  assert.equal(isToneName("toString"), false);
  assert.equal(isToneName(undefined), false);
});

test("TONES_DARK has the same tone names as TONES and toneSet picks by theme", () => {
  assert.deepEqual(Object.keys(TONES_DARK).sort(), Object.keys(TONES).sort());
  assert.equal(toneSet("dark"), TONES_DARK);
  assert.equal(toneSet("light"), TONES);
});

test("toneAtY with the dark palette uses dark tones at the edges and the midpoint between", () => {
  assert.deepEqual(toneAtY(stops, -5, TONES_DARK), TONES_DARK.dawn);
  assert.deepEqual(toneAtY(stops, 99999, TONES_DARK), TONES_DARK.clear);
  const mid = toneAtY(stops, 2000, TONES_DARK);
  assert.deepEqual(mid.base, mixRgb(TONES_DARK.dawn.base, TONES_DARK.violet.base, 0.5));
  assert.deepEqual(toneAtY([], 1, TONES_DARK), TONES_DARK.dawn);
});

test("rgbTriplet rounds to the space-separated form CSS rgb() wants", () => {
  assert.equal(rgbTriplet([251.4, 249.6, 255]), "251 250 255");
});
