// ============================================================
// The hero's pixel cloud — PURE data
// ============================================================
//
// The brand's logo is a pixel chip, so the hero builds a cloud out of pixels.
// Each square gets, once and deterministically (same result on the server and
// in the browser, so nothing mismatches):
//   delay  when, in the 0..0.5 range of the hero's scroll, it starts to land
//          (bottom squares first, so the cloud is built from the ground up)
//   dx, dy where it starts, in square sizes: above and to the side, falling in
//   color  a lilac, lighter toward the top; a few are AWS orange
//
// components/design/Hero.tsx renders them; app/preview/preview.css moves them
// with the scroll position (--t, from 0 to 1).
// ============================================================

import type { CSSProperties } from "react";

export const CLOUD_MASK: readonly string[] = [
  "........XXXXXXXX..........",
  "......XXXXXXXXXXXX..XXXX..",
  ".....XXXXXXXXXXXXXXXXXXXX.",
  "....XXXXXXXXXXXXXXXXXXXXXX",
  "...XXXXXXXXXXXXXXXXXXXXXXX",
  "..XXXXXXXXXXXXXXXXXXXXXXXX",
  ".XXXXXXXXXXXXXXXXXXXXXXXXX",
  "XXXXXXXXXXXXXXXXXXXXXXXXXX",
  "XXXXXXXXXXXXXXXXXXXXXXXXXX",
  "XXXXXXXXXXXXXXXXXXXXXXXXXX",
  ".XXXXXXXXXXXXXXXXXXXXXXXX.",
  "..XXXXXXXXXXXXXXXXXXXXXX..",
];

/** Lightest (top of the cloud) to deepest (bottom). Every shade stays visible against the near-white page. */
export const CLOUD_PALETTE: readonly string[] = ["#E9DEFF", "#DDCEFF", "#CEB9FF", "#BEA3FF", "#AE8CFF"];
export const SPARK = "#FF9900";
/** The few orange squares, as [column, row]. They echo the orange pixels of the event artwork. */
const SPARKS: ReadonlyArray<readonly [number, number]> = [
  [4, 8],
  [21, 2],
  [16, 10],
];

export interface CloudCell {
  x: number;
  y: number;
  delay: number;
  dx: number;
  dy: number;
  color: string;
}

/** Small seeded generator: same numbers every time. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildCloud(mask: readonly string[] = CLOUD_MASK, seed = 7): CloudCell[] {
  const rnd = mulberry32(seed);
  const rows = mask.length;
  const cells: CloudCell[] = [];

  mask.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== "X") return;
      // Always draw the same four numbers per square, so changing the mask never reshuffles the others' look.
      const rDelay = rnd();
      const rDx = rnd();
      const rDy = rnd();
      const rTone = rnd();

      const fromBottom = rows > 1 ? 1 - y / (rows - 1) : 0;
      const delay = fromBottom * 0.3 + rDelay * 0.2;
      const toneIndex = Math.min(CLOUD_PALETTE.length - 1, Math.max(0, Math.floor((y / rows) * CLOUD_PALETTE.length + (rTone - 0.5) * 1.6)));
      const isSpark = SPARKS.some(([sx, sy]) => sx === x && sy === y);

      cells.push({
        x,
        y,
        delay: Math.round(delay * 1000) / 1000,
        dx: Math.round((rDx - 0.5) * 120) / 10,
        dy: -Math.round((5 + rDy * 9) * 10) / 10,
        color: isSpark ? SPARK : CLOUD_PALETTE[toneIndex],
      });
    });
  });

  return cells;
}

/**
 * The build starts this far "ahead" (app/preview/preview.css, .cloud-cell), so the
 * first screen already shows the base of the cloud landing instead of an empty stage.
 */
export const CLOUD_HEAD_START = 0.2;

/**
 * Style for one tile of a small decorative pixel grid: its step in the ambient
 * diagonal wave (--i = column + row), read by .px-tile in daylight.css.
 */
export function pixelWave(index: number, cols: number): CSSProperties {
  return { "--i": (index % cols) + Math.floor(index / cols) } as CSSProperties;
}
/** Scroll position (0..1) at which the last square has fully landed (each square's ramp is 1/5 wide). */
export const CLOUD_BUILT_AT = 0.5 + 1 / 5 - CLOUD_HEAD_START;
