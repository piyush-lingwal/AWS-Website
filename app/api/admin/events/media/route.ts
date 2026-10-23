// ============================================================
// GET  /api/admin/events/media?eventId=...
// POST /api/admin/events/media
//
// Handles persistence of converted WebP promotional posters and
// gallery photos for events. Stores assets directly in Supabase Storage
// (bucket: 'event-media') and syncs poster_url and photos in the
// Supabase 'events' database table, with local disk backup for offline resilience.
// Supports full clearing / removal of media when clearAll=true.
// ============================================================

import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

const BUCKET_NAME = "event-media";

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
 * Helper to ensure the Supabase Storage bucket exists.
 */
async function ensureBucket(supabase: any) {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b: any) => b.name === BUCKET_NAME);

    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
      });
      if (bucketError) {
        console.warn("[media/storage] Note on creating bucket:", bucketError.message);
      }
    }
  } catch (err) {
    console.warn("[media/storage] Error checking bucket:", err);
  }
}

/**
 * GET: Retrieve saved media assets (poster & photos) for a specific event.
 * Queries Supabase 'events' table as primary source of truth,
 * with fallback to local manifest.json.
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

  // ── 1. Read local manifest if present (preserves original names and sizes) ──
  let localManifest: EventMediaManifest | null = null;
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
    localManifest = JSON.parse(rawData);
  } catch {
    // No local manifest on disk
  }

  // ── 2. Check Supabase DB events table ──
  const supabase = getAdminClient();
  let dbPosterUrl: string | null = null;
  let dbPhotosUrls: string[] = [];
  let dbQueried = false;

  if (supabase) {
    try {
      const { data: eventRow, error } = await supabase
        .from("events")
        .select("id, poster_url, photos")
        .eq("id", eventId)
        .single();

      if (!error && eventRow) {
        dbQueried = true;
        dbPosterUrl = eventRow.poster_url || null;
        dbPhotosUrls = Array.isArray(eventRow.photos) ? eventRow.photos : [];
      }
    } catch (err) {
      console.warn("[media/GET] Supabase lookup error:", err);
    }
  }

  // ── 3. Reconcile Supabase DB & Local Manifest ──
  if (dbQueried) {
    // If Supabase has data or was explicitly queried
    let posterItem: StoredMediaItem | null = null;
    if (dbPosterUrl) {
      if (localManifest?.poster && localManifest.poster.url === dbPosterUrl) {
        posterItem = localManifest.poster;
      } else {
        posterItem = {
          url: dbPosterUrl,
          name: dbPosterUrl.split("/").pop() || "poster.webp",
          size: localManifest?.poster?.size || 180 * 1024,
          originalSize: localManifest?.poster?.originalSize,
        };
      }
    }

    const photosItems: StoredMediaItem[] = dbPhotosUrls.map((url, idx) => {
      const matchedLocal = localManifest?.photos?.find((p) => p.url === url);
      if (matchedLocal) return matchedLocal;
      return {
        id: `supabase_${idx}`,
        url,
        name: url.split("/").pop() || `photo_${idx + 1}.webp`,
        size: 175 * 1024,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        eventId,
        poster: posterItem,
        photos: photosItems,
        updatedAt: localManifest?.updatedAt || new Date().toISOString(),
      },
    });
  }

  // If Supabase wasn't queried or is offline, use local manifest
  if (localManifest) {
    return NextResponse.json({ success: true, data: localManifest });
  }

  // Default empty media state
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

/**
 * POST: Upload and persist poster and/or photos for an event to Supabase,
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

    const supabase = getAdminClient();
    if (supabase) {
      await ensureBucket(supabase);
    }

    // Local mirror directory
    const eventDir = path.join(process.cwd(), "public", "events", "uploads", eventId);
    const photosDir = path.join(eventDir, "photos");
    try {
      await fs.mkdir(photosDir, { recursive: true });
    } catch {}

    const clearAll = formData.get("clearAll") === "true";
    let posterItem: StoredMediaItem | null = null;
    let allPhotos: StoredMediaItem[] = [];

    if (clearAll && supabase) {
      // ── Clean up files in Supabase Storage for this event ──
      try {
        const { data: rootFiles } = await supabase.storage.from(BUCKET_NAME).list(eventId);
        if (rootFiles && rootFiles.length > 0) {
          const filesToRemove = rootFiles
            .filter((f: any) => f.name && !f.id) // files only, not subfolders
            .map((f: any) => `${eventId}/${f.name}`);
          if (filesToRemove.length > 0) {
            await supabase.storage.from(BUCKET_NAME).remove(filesToRemove);
          }
        }

        const { data: photoFiles } = await supabase.storage.from(BUCKET_NAME).list(`${eventId}/photos`);
        if (photoFiles && photoFiles.length > 0) {
          const photosToRemove = photoFiles.map((f: any) => `${eventId}/photos/${f.name}`);
          if (photosToRemove.length > 0) {
            await supabase.storage.from(BUCKET_NAME).remove(photosToRemove);
          }
        }
      } catch (cleanErr) {
        console.warn("[media/storage] Supabase storage cleanup warning:", cleanErr);
      }
    }

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

        let finalUrl: string | null = null;

        // Upload to Supabase Storage
        if (supabase) {
          try {
            const storagePath = `${eventId}/${posterFileName}`;
            const { error: uploadError } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(storagePath, buffer, {
                contentType: "image/webp",
                upsert: true,
              });

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(storagePath);

              if (publicUrlData?.publicUrl) {
                finalUrl = publicUrlData.publicUrl;
              }
            } else {
              console.warn("[media/storage] Supabase poster upload warning:", uploadError.message);
            }
          } catch (storageErr) {
            console.warn("[media/storage] Supabase poster storage error:", storageErr);
          }
        }

        // Local mirror / fallback
        try {
          const posterPath = path.join(eventDir, posterFileName);
          await fs.writeFile(posterPath, buffer);
          if (!finalUrl) {
            finalUrl = `/events/uploads/${eventId}/${posterFileName}`;
          }
        } catch {}

        if (finalUrl) {
          posterItem = {
            url: finalUrl,
            name: meta.name || `${safeBaseName}.webp`,
            size: buffer.length,
            originalSize: meta.originalSize,
          };
        }
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

        let finalUrl: string | null = null;

        // Upload to Supabase Storage
        if (supabase) {
          try {
            const storagePath = `${eventId}/photos/${safeFileName}`;
            const { error: uploadError } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(storagePath, buffer, {
                contentType: "image/webp",
                upsert: true,
              });

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(storagePath);

              if (publicUrlData?.publicUrl) {
                finalUrl = publicUrlData.publicUrl;
              }
            } else {
              console.warn("[media/storage] Supabase photo upload warning:", uploadError.message);
            }
          } catch (storageErr) {
            console.warn("[media/storage] Supabase photo storage error:", storageErr);
          }
        }

        // Local mirror / fallback
        try {
          const filePath = path.join(photosDir, safeFileName);
          await fs.writeFile(filePath, buffer);
          if (!finalUrl) {
            finalUrl = `/events/uploads/${eventId}/photos/${safeFileName}`;
          }
        } catch {}

        if (finalUrl) {
          newlySavedPhotos.push({
            id: meta.id || `photo_${Date.now()}_${i}`,
            url: finalUrl,
            name: meta.name || `${rawBase}.webp`,
            size: buffer.length,
            originalSize: meta.originalSize,
          });
        }
      }

      allPhotos = [...retainedPhotos, ...newlySavedPhotos];
    }

    // ── 4. Save to Supabase Database (events table) ──────────
    if (supabase) {
      try {
        const dbPayload: { poster_url: string | null; photos: string[] } = {
          poster_url: posterItem?.url || null,
          photos: allPhotos.map((p) => p.url),
        };

        const { error: updateError } = await supabase
          .from("events")
          .update(dbPayload)
          .eq("id", eventId);

        if (updateError) {
          console.warn("[media/supabase] Failed updating events row:", updateError.message);
        }
      } catch (dbErr) {
        console.warn("[media/supabase] Database sync exception:", dbErr);
      }
    }

    // ── 5. Write Manifest on Disk ───────────────────────────
    const manifest: EventMediaManifest = {
      eventId,
      poster: posterItem,
      photos: allPhotos,
      updatedAt: new Date().toISOString(),
    };

    try {
      await fs.writeFile(
        path.join(eventDir, "manifest.json"),
        JSON.stringify(manifest, null, 2),
        "utf-8"
      );
    } catch {}

    return NextResponse.json({
      success: true,
      data: manifest,
      message: clearAll
        ? "All media cleared successfully from Supabase."
        : `Saved ${posterItem ? "poster" : ""}${posterItem && allPhotos.length ? " and " : ""}${allPhotos.length ? `${allPhotos.length} photo(s)` : ""} to Supabase.`,
    });
  } catch (error: any) {
    console.error("[API/admin/events/media] Save error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to persist media assets." },
      { status: 500 }
    );
  }
}
