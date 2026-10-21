// ============================================================
// GET  /api/admin/events/media?eventId=...
// POST /api/admin/events/media
//
// Handles persistence of converted WebP promotional posters and
// gallery photos for events. Stores assets under /public/events/uploads/<eventId>/
// and maintains a manifest.json per event, ensuring assets persist
// across sessions and are ready for AWS S3 synchronization.
// Supports full clearing / removal of media when clearAll=true.
// ============================================================

import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

interface StoredMediaItem {
  id?: string;
  url: string;
  name: string;
  size: number;
  originalSize?: number;
}

interface EventMediaManifest {
  eventId: string;
  poster: StoredMediaItem | null;
  photos: StoredMediaItem[];
  updatedAt: string;
}

/**
 * GET: Retrieve saved media assets (poster & photos) for a specific event.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json(
      { success: false, error: "Missing eventId query parameter." },
      { status: 400 }
    );
  }

  const manifestPath = path.join(
    process.cwd(),
    "public",
    "events",
    "uploads",
    eventId,
    "manifest.json"
  );

  try {
    const rawData = await fs.readFile(manifestPath, "utf-8");
    const manifest: EventMediaManifest = JSON.parse(rawData);
    return NextResponse.json({ success: true, data: manifest });
  } catch {
    // No saved manifest on disk yet — return empty media record
    return NextResponse.json({
      success: true,
      data: {
        eventId,
        poster: null,
        photos: [],
        updatedAt: null,
      },
    });
  }
}

/**
 * POST: Upload and persist poster and/or photos for an event,
 * or clear media when clearAll=true.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const eventId = formData.get("eventId") as string | null;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required." },
        { status: 400 }
      );
    }

    const eventDir = path.join(process.cwd(), "public", "events", "uploads", eventId);
    const photosDir = path.join(eventDir, "photos");

    await fs.mkdir(photosDir, { recursive: true });

    const clearAll = formData.get("clearAll") === "true";
    let posterItem: StoredMediaItem | null = null;
    let allPhotos: StoredMediaItem[] = [];

    if (!clearAll) {
      // ── 1. Handle Poster ────────────────────────────────────
      const posterFile = formData.get("poster") as File | null;
      const existingPosterRaw = formData.get("existingPoster") as string | null;
      const posterMetaRaw = formData.get("posterMeta") as string | null;

      if (posterFile && typeof posterFile !== "string") {
        let meta: { name?: string; size?: number; originalSize?: number } = {};
        try {
          if (posterMetaRaw) meta = JSON.parse(posterMetaRaw);
        } catch {}

        const buffer = Buffer.from(await posterFile.arrayBuffer());
        const safeBaseName = (meta.name || posterFile.name || "poster")
          .replace(/\.[^.]+$/, "")
          .replace(/[^a-zA-Z0-9_-]/g, "_");
        const posterFileName = `poster_${Date.now()}_${safeBaseName}.webp`;
        const posterPath = path.join(eventDir, posterFileName);

        await fs.writeFile(posterPath, buffer);

        posterItem = {
          url: `/events/uploads/${eventId}/${posterFileName}`,
          name: meta.name || `${safeBaseName}.webp`,
          size: buffer.length,
          originalSize: meta.originalSize,
        };
      } else if (existingPosterRaw) {
        try {
          posterItem = JSON.parse(existingPosterRaw);
        } catch {}
      }

      // ── 2. Handle Existing Photos ───────────────────────────
      const existingPhotosRaw = formData.get("existingPhotos") as string | null;
      let retainedPhotos: StoredMediaItem[] = [];
      if (existingPhotosRaw) {
        try {
          retainedPhotos = JSON.parse(existingPhotosRaw);
        } catch {}
      }

      // ── 3. Handle Newly Uploaded Photos ─────────────────────
      const newPhotoFiles = formData.getAll("newPhotos") as File[];
      const newPhotosMetaRaw = formData.get("newPhotosMeta") as string | null;
      let newPhotosMeta: Array<{ id?: string; name?: string; size?: number; originalSize?: number }> = [];

      if (newPhotosMetaRaw) {
        try {
          newPhotosMeta = JSON.parse(newPhotosMetaRaw);
        } catch {}
      }

      const newlySavedPhotos: StoredMediaItem[] = [];

      for (let i = 0; i < newPhotoFiles.length; i++) {
        const file = newPhotoFiles[i];
        if (!file || typeof file === "string") continue;

        const meta = newPhotosMeta[i] || {};
        const buffer = Buffer.from(await file.arrayBuffer());
        const rawBase = (meta.name || file.name || `photo_${i + 1}`)
          .replace(/\.[^.]+$/, "")
          .replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeFileName = `${Date.now()}_${i}_${rawBase}.webp`;
        const filePath = path.join(photosDir, safeFileName);

        await fs.writeFile(filePath, buffer);

        newlySavedPhotos.push({
          id: meta.id || `photo_${Date.now()}_${i}`,
          url: `/events/uploads/${eventId}/photos/${safeFileName}`,
          name: meta.name || `${rawBase}.webp`,
          size: buffer.length,
          originalSize: meta.originalSize,
        });
      }

      allPhotos = [...retainedPhotos, ...newlySavedPhotos];
    }

    // ── 4. Write Manifest ───────────────────────────────────
    const manifest: EventMediaManifest = {
      eventId,
      poster: posterItem,
      photos: allPhotos,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(eventDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf-8"
    );

    // ── 5. Optional Supabase Sync ───────────────────────────
    try {
      const supabase = getAdminClient();
      if (supabase) {
        await supabase
          .from("events")
          .update({
            poster_url: posterItem?.url || null,
            photos: allPhotos.map((p) => p.url),
          })
          .eq("id", eventId);
      }
    } catch {
      // Non-fatal if DB schema doesn't have these columns yet
    }

    return NextResponse.json({
      success: true,
      data: manifest,
      message: clearAll
        ? "All media cleared successfully."
        : `Saved ${posterItem ? "poster" : ""}${posterItem && allPhotos.length ? " and " : ""}${allPhotos.length ? `${allPhotos.length} photo(s)` : ""}.`,
    });
  } catch (error: any) {
    console.error("[API/admin/events/media] Save error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to persist media assets." },
      { status: 500 }
    );
  }
}
