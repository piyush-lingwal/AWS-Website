// Browser-only: shrinks a photo to at most 1920 px and re-encodes it as WebP
// before upload. The rules (sizes, quality, when to keep the original) live in
// lib/media/client-compress.ts.
//
// Encoding:
//   - Chrome, Edge, Firefox and Android browsers encode WebP natively (canvas).
//   - Safari (and so every browser on iPhone/iPad) cannot: canvas.toBlob quietly
//     returns a PNG instead. There the libwebp WebAssembly encoder (@jsquash/webp,
//     ~300 KB) is loaded, only on first use, so other browsers never download it.
//
// Never throws. If anything goes wrong the original file is returned and takes
// the normal path (the server still converts it to WebP for the site).

import {
  COMPRESS_MAX_INPUT_PIXELS,
  COMPRESS_WEBP_QUALITY,
  canCompressImage,
  fitWithin,
  keepCompressed,
  toWebpName,
} from "@/lib/media/client-compress";

let nativeWebp: boolean | undefined;

/** Can this browser's canvas encode WebP? Checked once on a 1x1 canvas. */
function canvasEncodesWebp(): boolean {
  if (nativeWebp === undefined) {
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    nativeWebp = probe.toDataURL("image/webp").startsWith("data:image/webp");
  }
  return nativeWebp;
}

/** Decode with an <img>: every current browser applies the photo's EXIF rotation when drawing it. */
async function decode(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await img.decode();
  return img;
}

async function encodeWebp(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<Blob | null> {
  if (canvasEncodesWebp()) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", COMPRESS_WEBP_QUALITY));
    if (blob && blob.type === "image/webp") return blob;
  }
  const { default: encode } = await import("@jsquash/webp/encode");
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buffer = await encode(pixels, { quality: Math.round(COMPRESS_WEBP_QUALITY * 100) });
  return new Blob([buffer], { type: "image/webp" });
}

export async function compressToWebp(file: File): Promise<File> {
  if (!canCompressImage(file)) return file;

  const canvas = document.createElement("canvas");
  const url = URL.createObjectURL(file);
  try {
    const img = await decode(url);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h || w * h > COMPRESS_MAX_INPUT_PIXELS) return file;

    const size = fitWithin(w, h);
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, size.width, size.height);

    const blob = await encodeWebp(canvas, ctx);
    if (!blob || !keepCompressed(file.size, blob.size)) return file;
    return new File([blob], toWebpName(file.name), { type: "image/webp", lastModified: file.lastModified });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
    // Release the pixel buffer right away (matters on phones with many photos).
    canvas.width = canvas.height = 0;
  }
}
