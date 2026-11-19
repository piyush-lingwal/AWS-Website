// ============================================================
// Photo compression before upload — PURE rules
// ============================================================
//
// The browser shrinks every photo and converts it to WebP BEFORE it is
// uploaded (components/features/media/compress-image.ts does the work), so
// storage only ever receives a small file. The server still checks the bytes
// and still makes the public web + thumb versions (lib/media/process-image.ts),
// exactly as for any other upload.
//
// Redrawing a photo on a canvas also drops all of its metadata (GPS location,
// phone model, timestamps), so even the stored copy no longer carries them.
// ============================================================

/** Longest side after compression. Same as WEB_MAX_PX (process-image.ts): the largest size the site ever shows. */
export const COMPRESS_MAX_PX = 1920;
/** WebP quality (0-1). A little above the server's 0.82 so its re-encode loses almost nothing more. */
export const COMPRESS_WEBP_QUALITY = 0.85;
/** Bigger files are not opened in the browser (memory); they keep the normal 25 MB upload limit. */
export const COMPRESS_MAX_INPUT_BYTES = 100 * 1024 * 1024;
/** Same pixel ceiling as the server (MAX_INPUT_PIXELS in process-image.ts). */
export const COMPRESS_MAX_INPUT_PIXELS = 80_000_000;

const COMPRESSIBLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface FileLike {
  type: string;
  size: number;
}

/** Photos the browser converts. HEIC is converted to JPEG first, then lands here too. */
export function canCompressImage(file: FileLike): boolean {
  return COMPRESSIBLE_TYPES.has(file.type) && file.size > 0 && file.size <= COMPRESS_MAX_INPUT_BYTES;
}

/** Size that fits inside max x max, keeping the aspect ratio. Never enlarges. */
export function fitWithin(width: number, height: number, max = COMPRESS_MAX_PX): { width: number; height: number } {
  if (!(width > 0) || !(height > 0)) return { width: 0, height: 0 };
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** photo.PNG -> photo.webp (the name is only a label; storage keys never use it). */
export function toWebpName(name: string): string {
  const base = name.replace(/\.[a-z0-9]{1,5}$/i, "");
  return `${base || "photo"}.webp`;
}

/**
 * Use the WebP only when it is actually smaller. An already well-compressed
 * small file is kept as it is; the site still shows WebP versions of it.
 */
export function keepCompressed(originalBytes: number, compressedBytes: number): boolean {
  return compressedBytes > 0 && compressedBytes < originalBytes;
}
