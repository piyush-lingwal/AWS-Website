// ============================================================
// Size of the full-size certificate viewer — PURE (no framework imports)
// ============================================================
//
// The certificate is 3300 x 2550. "Fit" is the largest size that shows the WHOLE
// certificate inside the space the viewer really has (its measured width and height,
// after padding), so it is exactly 100% in view on any screen, any window shape and
// after a rotation. Zooming multiplies the fit size; the viewer scrolls (and a
// finger drags) when it is bigger than that space.
// ============================================================

export const CERT_ASPECT = 3300 / 2550;
export const ZOOM_STEPS = [1, 1.75, 2.5, 3.5] as const;

/** Width, in px, of the largest certificate that fits an available box. */
export function fitWidth(boxWidth: number, boxHeight: number): number {
  if (!(boxWidth > 0) || !(boxHeight > 0)) return 0;
  return Math.max(1, Math.floor(Math.min(boxWidth, boxHeight * CERT_ASPECT)));
}

/** The next zoom step up or down, staying inside the list. */
export function stepZoom(current: number, direction: 1 | -1): number {
  const at = ZOOM_STEPS.findIndex((z) => z >= current);
  const index = at < 0 ? ZOOM_STEPS.length - 1 : at;
  const next = Math.min(ZOOM_STEPS.length - 1, Math.max(0, index + direction));
  return ZOOM_STEPS[next];
}
