// ============================================================
// Scroll atmosphere: pure colour maths for the /events background.
// ============================================================
//
// The page background is a base colour plus three soft colour "blobs". Each
// section declares a TONE (data-tone="dawn" ...). While the reader scrolls, the
// background blends from the tone of the section they are leaving to the tone
// of the one they are entering. Every tone is light.
// Nothing here touches the DOM (EventsAtmosphere.tsx does).
// ============================================================

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

/** Tones used by the events page sections. */
export const TONES = {
  dawn: tone("#FBF9FF", "#E4D8FF", "#FFE0BC", "#D4E5FF"),
  bloom: tone("#F6F0FF", "#CDB9FF", "#F2C9FF", "#C4DBFF"),
  dusk: tone("#FAF1FF", "#F8C6E6", "#C8B2FF", "#FFDCB0"),
  clear: tone("#FDFCFF", "#ECE5FF", "#E0D5FF", "#FFEFD9"),
} as const satisfies Record<string, Tone>;

export type ToneName = keyof typeof TONES;

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
export function toneAtY(stops: readonly ToneStop[], y: number): Tone {
  if (stops.length === 0) return TONES.dawn;
  if (y <= stops[0].at) return TONES[stops[0].tone];
  const last = stops[stops.length - 1];
  if (y >= last.at) return TONES[last.tone];

  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];
    if (y < from.at || y > to.at) continue;
    const span = to.at - from.at;
    if (span <= 0) return TONES[to.tone];
    const t = (y - from.at) / span;
    const eased = smoothstep((t - HOLD) / (1 - 2 * HOLD));
    return mixTone(TONES[from.tone], TONES[to.tone], eased);
  }
  return TONES[last.tone];
}

/** "251 249 255": the form CSS wants for rgb(var(--x) / alpha). */
export function rgbTriplet(c: RGB): string {
  return `${Math.round(c[0])} ${Math.round(c[1])} ${Math.round(c[2])}`;
}

/** Small seeded generator: same numbers every time (so server and client agree). */
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
