/** Pure maths for pointer micro-interactions (see components/design/PointerFx.tsx). */
export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Pull toward the pointer. Returns 0,0 when the pointer is further than `radius` from the box edge.
 * The result is capped at `max` px per axis so the element never leaves the pointer.
 */
export function magnetFor(rect: Box, x: number, y: number, radius: number, strength: number, max: number): { x: number; y: number } {
  const dx = x - (rect.left + rect.width / 2);
  const dy = y - (rect.top + rect.height / 2);
  const outX = Math.max(Math.abs(dx) - rect.width / 2, 0);
  const outY = Math.max(Math.abs(dy) - rect.height / 2, 0);
  if (Math.hypot(outX, outY) > radius) return { x: 0, y: 0 };
  return { x: clamp(dx * strength, -max, max), y: clamp(dy * strength, -max, max) };
}

/** Tilt in degrees (x = rotateX, y = rotateY), at most `max` per axis, 0,0 at the centre. Pointer above the centre tips the top away. */
export function tiltFor(rect: Box, x: number, y: number, max: number): { x: number; y: number } {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
  const nx = clamp(((x - rect.left) / rect.width) * 2 - 1, -1, 1);
  const ny = clamp(((y - rect.top) / rect.height) * 2 - 1, -1, 1);
  return { x: -ny * max || 0, y: nx * max || 0 };
}

/** Pointer position relative to the box centre, in -1..1 on each axis. */
export function parallaxFor(rect: Box, x: number, y: number): { x: number; y: number } {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
  return {
    x: clamp(((x - rect.left) / rect.width) * 2 - 1, -1, 1),
    y: clamp(((y - rect.top) / rect.height) * 2 - 1, -1, 1),
  };
}
