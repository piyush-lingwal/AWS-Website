// ============================================================
// Dark palette: single source of truth for dark mode colours
// ============================================================
//
// Pure TS, no imports, so node:test can load it directly. DESIGN.md section 13
// documents these values; change them here and there first.
// Translucent tokens are CSS rgba() strings, solid tokens are 6-digit hex.
// ============================================================

/** Light values are today's values (tailwind.config.ts and daylight.css). */
export const LIGHT = {
  paper: "#FBF9FF",
  mist: "#F4EFFF",
  ink: "#1B1140",
  "ink-2": "#4D4470",
  "ink-3": "#6A6190",
  spark: "#FF9900",
  "lilac-50": "#F7F3FF",
  "lilac-100": "#EFE8FF",
  "lilac-200": "#E1D4FF",
  "lilac-300": "#CBB5FF",
  "lilac-400": "#AF8CFF",
  "lilac-500": "#9461FA",
  "lilac-600": "#7C3AED",
  "lilac-700": "#6428D4",
  "lilac-800": "#4A1D9E",
  "lilac-900": "#2E1170",
  accent: "#7C3AED",
  "accent-strong": "#6428D4",
  surface: "rgba(255,255,255,.72)",
  "surface-line": "rgba(255,255,255,.9)",
  glass: "rgba(255,255,255,.62)",
  line: "rgba(27,17,64,.10)",
  "shadow-tint": "rgba(76,29,149,.28)",
  "on-ink": "#1B1140",
} as const;

export type TokenName = keyof typeof LIGHT;

export const DARK: Record<TokenName, string> = {
  paper: "#07050F",
  mist: "#0E0A1E",
  ink: "#F5F2FF",
  "ink-2": "#C9C0EA",
  "ink-3": "#A89FCF",
  spark: "#FFA31A",
  "lilac-50": "#110C26",
  "lilac-100": "#1C1442",
  "lilac-200": "#2A1F5E",
  "lilac-300": "#43338A",
  "lilac-400": "#7A5CD6",
  "lilac-500": "#9461FA",
  "lilac-600": "#7C3AED",
  "lilac-700": "#6428D4",
  "lilac-800": "#4A1D9E",
  "lilac-900": "#2E1170",
  accent: "#BBA2FF",
  "accent-strong": "#D6C8FF",
  surface: "rgba(22,16,46,.72)",
  "surface-line": "rgba(255,255,255,.07)",
  glass: "rgba(12,9,26,.72)",
  line: "rgba(241,236,255,.10)",
  "shadow-tint": "rgba(0,0,0,.70)",
  "on-ink": "#1C1442",
};
/** Card tint washes, light then dark. Used as linear-gradient(155deg, tint 0%, <end> 58%). */
export const CARD_TINTS = {
  light: { lilac: "#EFE8FF", peach: "#FFEBD3", rose: "#FFE7F1", sky: "#DCEBFF", mint: "#DDF3E6", blush: "#FFE1E1" },
  dark: { lilac: "#160F36", peach: "#1D130F", rose: "#1D0F1B", sky: "#0D162A", mint: "#0B1B1C", blush: "#1D1014" },
} as const;export interface HexTone {
  base: string;
  a: string;
  b: string;
  c: string;
}

/** Same names as TONES in atmosphere.ts. */
export const DARK_TONES = {
  dawn: { base: "#07050F", a: "#140C3A", b: "#2A180C", c: "#0A1838" },
  bloom: { base: "#08051A", a: "#1E1050", b: "#35123C", c: "#0D1C3C" },
  violet: { base: "#0B0820", a: "#2E1C74", b: "#281E78", c: "#3A230E" },
  dusk: { base: "#0A0616", a: "#3A1535", b: "#20164E", c: "#3A260C" },
  clear: { base: "#050410", a: "#0F0A2C", b: "#140E38", c: "#1E1208" },
} as const satisfies Record<string, HexTone>;type Rgb = [number, number, number];

function parseHex(value: string): Rgb {
  const h = value.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Not a 6-digit hex colour: ${value}`);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** WCAG 2.x relative luminance, 0 to 1. */
export function luminance(color: string): number {
  const [r, g, b] = parseHex(color).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two opaque hex colours (always >= 1). */
export function contrast(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const toHex = (c: Rgb): string => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();

/** Composite a translucent fg over an opaque bg. Returns an opaque hex. */
export function overAlpha(fg: string, bg: string, alpha: number): string {
  const f = parseHex(fg);
  const b = parseHex(bg);
  return toHex([0, 1, 2].map((i) => f[i] * alpha + b[i] * (1 - alpha)) as Rgb);
}

/** Composite a CSS "rgba(r,g,b,a)" token over an opaque hex bg. Returns an opaque hex. */
export function overRgba(rgba: string, bg: string): string {
  const m = /^rgba\((\d+),(\d+),(\d+),(\.?\d*\.?\d+)\)$/.exec(rgba);
  if (!m) throw new Error(`Not an rgba() token: ${rgba}`);
  return overAlpha(toHex([+m[1], +m[2], +m[3]]), bg, +m[4]);
}
