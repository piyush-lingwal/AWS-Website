import test from "node:test";
import assert from "node:assert/strict";
import { CARD_TINTS, DARK, DARK_TONES, LIGHT, contrast, luminance, overAlpha, overRgba } from "../../lib/design/dark-palette.ts";
import { TONES } from "../../lib/design/atmosphere.ts";

const P = DARK.paper;
const atLeast = (label: string, fg: string, bg: string, min: number) => {
  const r = contrast(fg, bg);
  console.log(`# contrast ${label}: ${r.toFixed(2)} : 1`);
  assert.ok(r >= min, `${label} is ${r.toFixed(2)}, needs ${min}`);
};
const lum255 = (hex: string) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

test("body and secondary text on the dark paper", () => {
  atLeast("ink on paper", DARK.ink, P, 7);
  atLeast("ink-2 on paper", DARK["ink-2"], P, 7);
  atLeast("ink-3 on paper", DARK["ink-3"], P, 4.5);
});

test("ink-2 and ink-3 hold on every dark tone peak and on a surface over it", () => {
  for (const [name, t] of Object.entries(DARK_TONES)) {
    const peak = overAlpha(t.a, t.base, 0.95);
    const peakB = overAlpha(t.b, t.base, 0.95);
    const peakC = overAlpha(t.c, t.base, 0.95);
    for (const [label, bg] of [["a", peak], ["b", peakB], ["c", peakC]] as const) {
      const onSurface = overRgba(DARK.surface, bg);
      atLeast(`ink-3 on surface over ${name} blob ${label}`, DARK["ink-3"], onSurface, 4.5);
      atLeast(`ink-2 on ${name} blob ${label}`, DARK["ink-2"], bg, 4.5);
      atLeast(`ink-2 on surface over ${name} blob ${label}`, DARK["ink-2"], onSurface, 4.5);
    }
  }
});

test("ink-3 sits directly on the lightest tone blob (dawn a) too", () => {
  atLeast("ink-3 on dawn blob a", DARK["ink-3"], overAlpha(DARK_TONES.dawn.a, DARK_TONES.dawn.base, 0.95), 4.5);
});

test("accent roles", () => {
  const surfaceOnPaper = overRgba(DARK.surface, P);
  atLeast("accent on paper", DARK.accent, P, 4.5);
  atLeast("accent on surface", DARK.accent, surfaceOnPaper, 4.5);
  atLeast("accent-strong on lilac-100", DARK["accent-strong"], DARK["lilac-100"], 4.5);
});

test("fills that stay the same in both themes", () => {
  atLeast("white on lilac-600", "#FFFFFF", DARK["lilac-600"], 4.5);
  atLeast("ink on spark", LIGHT.ink, DARK.spark, 4.5);
  atLeast("white on deep CTA card #2E1170", "#FFFFFF", "#2E1170", 7);
  atLeast("spark on dark paper (decoration only)", DARK.spark, P, 3);
});

test("every dark tone base is dark and every dark blob stays below the ceiling", () => {
  for (const [name, t] of Object.entries(DARK_TONES)) {
    assert.ok(lum255(t.base) < 25, `${name} base is too light`);
    for (const blob of [t.a, t.b, t.c]) assert.ok(lum255(blob) < 75, `${name} has a blob that is too bright`);
  }
});

test("DARK_TONES has the same tone names as TONES, DARK has the same tokens as LIGHT", () => {
  assert.deepEqual(Object.keys(DARK_TONES).sort(), Object.keys(TONES).sort());
  assert.deepEqual(Object.keys(DARK).sort(), Object.keys(LIGHT).sort());
  assert.deepEqual(Object.keys(CARD_TINTS.dark), Object.keys(CARD_TINTS.light));
});

test("luminance is 0 for black and 1 for white", () => {
  assert.equal(luminance("#000000"), 0);
  assert.equal(luminance("#FFFFFF"), 1);
});
