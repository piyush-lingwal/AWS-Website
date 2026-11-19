// ============================================================
// Gallery masonry layout — PURE
// ============================================================
//
// Each tile in an event's gallery keeps the photo's real shape (Pinterest
// style) instead of a square crop. Only extreme shapes are limited, so one
// long screenshot or a panorama cannot take over the whole grid; those few
// are trimmed at the edges (object-cover), everything else shows uncropped.
// ============================================================

/** Tallest tile shape (width / height): at most 2.5x as tall as it is wide. */
export const MIN_TILE_RATIO = 0.4;
/** Widest tile shape (width / height): at most 3x as wide as it is tall. */
export const MAX_TILE_RATIO = 3;

/** Width / height for a tile, or null when the size is not known. */
export function tileAspectRatio(width: number | null | undefined, height: number | null | undefined): number | null {
  if (typeof width !== "number" || typeof height !== "number") return null;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  return Math.min(MAX_TILE_RATIO, Math.max(MIN_TILE_RATIO, width / height));
}

// ── Grid maths (see .gallery-masonry in app/globals.css) ─────────────────
//
// The grid's rows are tiny: `scale` rows make up one column width. A tile
// that is W wide and W / ratio tall therefore spans scale / ratio rows, plus
// a few rows of gap. With `grid-auto-flow: dense` the browser puts every tile
// into the shortest column, left to right: Pinterest's layout, in plain CSS,
// correct from the first server-rendered paint at every screen size.

/** Finest grid: a tile's height is exact to 1/48 of its width (about 3 px on a desktop column). */
export const MAX_ROW_SCALE = 48;
const MIN_ROW_SCALE = 8;
/** Gap between tiles, as a share of the column width (about 12 px on a desktop column). */
export const GAP_FRACTION = 0.04;
/** Firefox caps a grid at 10,000 lines; stay under it even for very big galleries. */
const ROW_BUDGET = 9000;

/** Rows per column width for this gallery (coarser only for galleries with hundreds of tiles). */
export function masonryRowScale(ratios: readonly number[], minColumns = 2): number {
  const rowsPerScale = ratios.reduce((sum, r) => sum + 1 / r + GAP_FRACTION, 0) / minColumns;
  if (!(rowsPerScale > 0)) return MAX_ROW_SCALE;
  return Math.max(MIN_ROW_SCALE, Math.min(MAX_ROW_SCALE, Math.floor(ROW_BUDGET / rowsPerScale)));
}

/** Rows of gap under each tile (the same distance is used between columns). */
export function masonryGapRows(scale: number): number {
  return Math.max(1, Math.round(scale * GAP_FRACTION));
}

/** Rows one tile occupies, gap included. */
export function masonrySpan(ratio: number, scale: number): number {
  return Math.max(1, Math.round(scale / ratio)) + masonryGapRows(scale);
}
