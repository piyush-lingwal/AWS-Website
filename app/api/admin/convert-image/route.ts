// ============================================================
// POST /api/admin/convert-image
// Converts and compresses any uploaded image to WebP format
// using Sharp. Target output size: 150–200 KB with high visual
// quality preserved.
//
// Accepts: multipart/form-data with a single "file" field.
// Returns: the compressed WebP image as a binary response.
// ============================================================

import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const dynamic = "force-dynamic";

const MAX_INPUT_SIZE = 25 * 1024 * 1024; // 25 MB max upload

// Target output range in bytes
const TARGET_MIN = 140 * 1024; // 140 KB (slight buffer below 150)
const TARGET_MAX = 210 * 1024; // 210 KB (slight buffer above 200)

// Max dimension for gallery photos — keeps files small while
// remaining sharp on modern screens.
const MAX_DIMENSION = 1920;

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only image files are accepted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_INPUT_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds the 25 MB upload limit." },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Step 1: Resize (if needed) and get a baseline pipeline
    let pipeline = sharp(inputBuffer)
      .rotate() // auto-rotate based on EXIF
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });

    // Step 2: Binary-search for the right quality that lands in
    // the 150–200 KB sweet spot. Start with quality 80.
    let lo = 10;
    let hi = 100;
    let bestBuffer: Buffer | null = null;
    let bestQuality = 80;

    // First pass at quality 80
    let result = await pipeline.clone().webp({ quality: 80 }).toBuffer();

    if (result.length <= TARGET_MAX && result.length >= TARGET_MIN) {
      // Lucky — already in range
      bestBuffer = result;
      bestQuality = 80;
    } else if (result.length < TARGET_MIN) {
      // Image is already tiny at q80 (e.g. small badge or icon) — raise quality toward 100
      bestBuffer = result;
      bestQuality = 80;
      lo = 81;
      hi = 100;
      while (lo <= hi) {
        const mid = Math.round((lo + hi) / 2);
        const quality = Math.min(100, Math.max(1, mid));
        result = await pipeline.clone().webp({ quality }).toBuffer();
        if (result.length > TARGET_MAX) {
          hi = quality - 1;
        } else {
          bestBuffer = result;
          bestQuality = quality;
          if (result.length >= TARGET_MIN) break; // in range
          lo = quality + 1;
        }
      }
    } else {
      // Image is too large at q80 — lower quality
      bestBuffer = result;
      bestQuality = 80;
      lo = 10;
      hi = 79;
      while (lo <= hi) {
        const mid = Math.round((lo + hi) / 2);
        const quality = Math.min(100, Math.max(1, mid));
        result = await pipeline.clone().webp({ quality }).toBuffer();
        if (result.length > TARGET_MAX) {
          hi = quality - 1;
        } else {
          bestBuffer = result;
          bestQuality = quality;
          if (result.length >= TARGET_MIN) break; // in range
          lo = quality + 1;
        }
      }
      // If still too large after binary search, use the last best we got
      if (!bestBuffer || bestBuffer.length > TARGET_MAX) {
        const fallbackQ = Math.max(lo, 10);
        bestBuffer = await pipeline
          .clone()
          .webp({ quality: Math.min(100, fallbackQ) })
          .toBuffer();
        bestQuality = Math.min(100, fallbackQ);
      }
    }

    // Derive output filename
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const outputName = `${safeName}.webp`;

    return new NextResponse(bestBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(bestBuffer.length),
        "Content-Disposition": `inline; filename="${outputName}"`,
        "X-Original-Name": file.name,
        "X-Original-Size": String(file.size),
        "X-Compressed-Size": String(bestBuffer.length),
        "X-Webp-Quality": String(bestQuality),
      },
    });
  } catch (error: any) {
    console.error("[convert-image] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Image conversion failed." },
      { status: 500 }
    );
  }
}
