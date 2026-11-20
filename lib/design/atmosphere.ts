// ============================================================
// Scroll atmosphere — PURE colour maths for the dynamic background
// ============================================================
//
// The page background is a base colour plus three soft colour "blobs". Each
// section of the page declares a TONE (data-tone="dawn" ...). While the reader
// scrolls, the background blends from the tone of the section they are leaving
// to the tone of the section they are entering. It holds each tone for the
// middle of its section and only changes near the boundaries, so a long
// section still feels settled and the change reads as a deliberate moment.
//
// Every tone is LIGHT. The site stays white / lilac the whole way down.
// Nothing here touches the DOM (components/design/ScrollAtmosphere.tsx does).
// ============================================================

import { DARK_TONES } from "./dark-palette.ts";

export type RGB = readonly [number, number, number];

export interface Tone {
  /** Page colour. */
  base: RGB;
  /** The three drifting colour blobs. */
  a: RGB;
  b: RGB;
  c: RGB;
}

export function hex(value: string): RGB {
  const h = value.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Not a 6-digit hex colour: ${value}`);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

const tone = (base: string, a: string, b: string, c: string): Tone => ({ base: hex(base), a: hex(a), b: hex(b), c: hex(c) });

/**
 * One tone per mood of the page. Names say what the moment feels like:
 *   dawn    hero: near-white with a lilac glow and a warm peach spark
 *   bloom   mission: lilac and orchid
 *   violet  build: the deepest, most saturated moment (still light)
 *   dusk    why join: rose, lilac and amber
 *   clear   events: nearly white, calm
 */
export const TONES = {
  dawn: tone("#FBF9FF", "#E4D8FF", "#FFE0BC", "#D4E5FF"),
  bloom: tone("#F6F0FF", "#CDB9FF", "#F2C9FF", "#C4DBFF"),
  violet: tone("#EEE6FF", "#B39BFF", "#8F73FF", "#FFD0A3"),
  dusk: tone("#FAF1FF", "#F8C6E6", "#C8B2FF", "#FFDCB0"),
  clear: tone("#FDFCFF", "#ECE5FF", "#E0D5FF", "#FFEFD9"),
} as const satisfies Record<string, Tone>;

export type ToneName = keyof typeof TONES;

export type ThemeName = "light" | "dark";

/** Dark counterparts (values in lib/design/dark-palette.ts, DESIGN.md section 13.5). Same names. */
export const TONES_DARK = {
  dawn: tone(DARK_TONES.dawn.base, DARK_TONES.dawn.a, DARK_TONES.dawn.b, DARK_TONES.dawn.c),
  bloom: tone(DARK_TONES.bloom.base, DARK_TONES.bloom.a, DARK_TONES.bloom.b, DARK_TONES.bloom.c),
  violet: tone(DARK_TONES.violet.base, DARK_TONES.violet.a, DARK_TONES.violet.b, DARK_TONES.violet.c),
  dusk: tone(DARK_TONES.dusk.base, DARK_TONES.dusk.a, DARK_TONES.dusk.b, DARK_TONES.dusk.c),
  clear: tone(DARK_TONES.clear.base, DARK_TONES.clear.a, DARK_TONES.clear.b, DARK_TONES.clear.c),
} as const satisfies Record<ToneName, Tone>;

export type TonePalette = Record<ToneName, Tone>;

export function toneSet(theme: ThemeName): TonePalette {
  return theme === "dark" ? TONES_DARK : TONES;
}

export function isToneName(value: unknown): value is ToneName {
  return typeof value === "string" && Object.hasOwn(TONES, value);
}

export const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Ease in and out: 0 -> 0, 1 -> 1, flat at both ends. */
export const smoothstep = (t: number): number => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

export function mixRgb(from: RGB, to: RGB, t: number): RGB {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t];
}

export function mixTone(from: Tone, to: Tone, t: number): Tone {
  return { base: mixRgb(from.base, to.base, t), a: mixRgb(from.a, to.a, t), b: mixRgb(from.b, to.b, t), c: mixRgb(from.c, to.c, t) };
}

/** A section's tone, anchored at the page position (px) of the section's centre. */
export interface ToneStop {
  at: number;
  tone: ToneName;
}

/** Share of the distance between two stops that each side holds its own tone. */
export const HOLD = 0.3;

/**
 * The background tone at page position `y` (px, from the top of the page).
 * Before the first stop and after the last one the edge tone is used.
 * `stops` must be sorted by `at`.
 */
export function toneAtY(stops: readonly ToneStop[], y: number, palette: TonePalette = TONES): Tone {
  if (stops.length === 0) return palette.dawn;
  if (y <= stops[0].at) return palette[stops[0].tone];
  const last = stops[stops.length - 1];
  if (y >= last.at) return palette[last.tone];

  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];
    if (y < from.at || y > to.at) continue;
    const span = to.at - from.at;
    if (span <= 0) return palette[to.tone];
    const t = (y - from.at) / span;
    const eased = smoothstep((t - HOLD) / (1 - 2 * HOLD));
    return mixTone(palette[from.tone], palette[to.tone], eased);
  }
  return palette[last.tone];
}

/** "251 249 255": the form CSS wants for rgb(var(--x) / alpha). */
export function rgbTriplet(c: RGB): string {
  return `${Math.round(c[0])} ${Math.round(c[1])} ${Math.round(c[2])}`;
}
