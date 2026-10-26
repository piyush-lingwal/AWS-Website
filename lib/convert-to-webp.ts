// ============================================================
// Client-side Image → WebP Converter (via Server Sharp API)
// ============================================================
//
// Sends images to /api/admin/convert-image which uses Sharp
// to convert AND compress to WebP at 150–200 KB target size.
//
// Falls back to the browser Canvas API if the server call
// fails (e.g., network error, dev mode without server).
//
// Usage:
//   import { convertToWebp } from "@/lib/convert-to-webp";
//   const webpFile = await convertToWebp(originalFile);
//
// ============================================================

/**
 * Convert and compress an image File to WebP via the server-side
 * Sharp API. Falls back to client-side Canvas conversion if the
 * server is unreachable.
 *
 * @param file - The source image file (PNG, JPG, BMP, etc.)
 * @returns A new File with `.webp` extension, compressed to ~150-200 KB.
 */
export async function convertToWebp(file: File): Promise<File> {
  // Already .webp and small enough — skip
  if (file.type === "image/webp" && file.size <= 210 * 1024) {
    return file;
  }

  // SVGs should not be rasterized
  if (file.type === "image/svg+xml") {
    return file;
  }

  try {
    return await convertViaServer(file);
  } catch (err) {
    console.warn("[convert-to-webp] Server conversion failed, falling back to Canvas:", err);
    return await convertViaCanvas(file);
  }
}

/**
 * Batch-convert multiple image Files to WebP.
 * Processes all files in parallel. If any single file fails,
 * the original is returned instead.
 */
export async function convertMultipleToWebp(files: File[]): Promise<File[]> {
  return Promise.all(
    files.map(async (file) => {
      try {
        return await convertToWebp(file);
      } catch (err) {
        console.warn(`[convert-to-webp] Skipping "${file.name}":`, err);
        return file;
      }
    })
  );
}

// ── Server-side conversion (Sharp) ──────────────────────────

async function convertViaServer(file: File): Promise<File> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/convert-image", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${res.status}`);
  }

  const blob = await res.blob();

  // Read filename from response header, or derive from original
  const disposition = res.headers.get("Content-Disposition") || "";
  const filenameMatch = disposition.match(/filename="?([^";\s]+)"?/);
  const outputName = filenameMatch
    ? filenameMatch[1]
    : file.name.replace(/\.[^.]+$/, "") + ".webp";

  return new File([blob], outputName, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

// ── Client-side fallback (Canvas API) ───────────────────────

async function convertViaCanvas(file: File): Promise<File> {
  if (file.type === "image/webp") return file;

  const blobUrl = URL.createObjectURL(file);

  try {
    const img = await loadImage(blobUrl);

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable.");

    ctx.drawImage(img, 0, 0);

    const webpBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error(`Canvas WebP conversion failed for "${file.name}".`));
        },
        "image/webp",
        0.82 // Reasonable quality for fallback
      );
    });

    const baseName = file.name.replace(/\.[^.]+$/, "") || file.name;
    return new File([webpBlob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image."));
    img.src = src;
  });
}
