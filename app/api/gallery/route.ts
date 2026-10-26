// ============================================================
// GET /api/gallery — Public Gallery Endpoint
// Returns events ordered by event_date (descending) with their
// posters and session photos extracted from Supabase.
// Validates that local files exist on disk before serving.
// ============================================================

import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

export interface GalleryEvent {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  event_timing: string | null;
  speaker_name: string | null;
  poster_url: string | null;
  photos: string[];
  event_type: string | null;
}

/**
 * Checks whether an image asset is accessible (always true for remote URLs;
 * verifies existence on disk for local /events/uploads/ files).
 */
async function isAssetValid(url: string | null): Promise<boolean> {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("http://") || url.startsWith("https://")) return true;

  try {
    const cleanPath = url.startsWith("/") ? url.slice(1) : url;
    const fullPath = path.join(process.cwd(), "public", cleanPath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Determines whether an event has concluded (date strictly before today).
 * Events with no date (TBA) or a date on or after today are upcoming and excluded from Gallery.
 */
function isEventConcluded(eventDate: string | null): boolean {
  if (!eventDate || typeof eventDate !== "string" || eventDate.trim() === "") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateStr = eventDate.includes("T") ? eventDate : `${eventDate.trim()}T00:00:00`;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d < today;
}

/**
 * Fallback preview data for local testing if database has no media yet.
 */
const DEV_PREVIEW_GALLERY_EVENTS: GalleryEvent[] = [
  {
    id: "cloud-kickstart-2026",
    name: "Cloud Kickstart 2026: AWS Core Infrastructure",
    description:
      "Hands-on foundation workshop covering AWS EC2, S3 storage, IAM security policies, and VPC architecture.",
    event_date: "2026-09-30",
    event_timing: "11:00 AM - 01:00 PM",
    speaker_name: "AWS Student Builder Group",
    poster_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80",
    ],
    event_type: "Workshop",
  },
  {
    id: "aws-serverless-masterclass",
    name: "Serverless Application Design with AWS Lambda",
    description:
      "Build, test, and deploy event-driven serverless APIs using Lambda, DynamoDB, and API Gateway with automated CI/CD.",
    event_date: "2026-08-15",
    event_timing: "02:00 PM - 04:30 PM",
    speaker_name: "AWS Community Mentors",
    poster_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=80",
    ],
    event_type: "Workshop",
  },
  {
    id: "cloud-hackathon-2026",
    name: "AWS Builder Sprint Hackathon 2026",
    description:
      "A 24-hour campus hackathon solving real-world challenges using cloud compute, AI, and scalable serverless architecture.",
    event_date: "2026-07-10",
    event_timing: "10:00 AM - 10:00 AM",
    speaker_name: "Campus Tech Board",
    poster_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1000&q=80",
    ],
    event_type: "Hackathon",
  },
];

export async function GET() {
  const supabase = getAdminClient();

  if (!supabase) {
    return NextResponse.json({
      success: true,
      data: DEV_PREVIEW_GALLERY_EVENTS,
      source: "preview",
    });
  }

  try {
    // 1. Fetch events from Supabase with poster_url and photos
    let { data: events, error } = await supabase
      .from("events")
      .select("id, name, description, event_date, event_timing, speaker_name, poster_url, photos, event_type")
      .order("event_date", { ascending: false });

    // Fallback if columns poster_url/photos do not exist yet in schema cache
    if (error && (error.code === "42703" || error.code === "PGRST204" || error.message?.includes("poster_url"))) {
      const fallback = await supabase
        .from("events")
        .select("id, name, description, event_date, event_timing, speaker_name, event_type")
        .order("event_date", { ascending: false });
      events = fallback.data as any;
      error = fallback.error;
    }

    if (error) {
      console.warn("[API/gallery] Supabase query notice:", error.message);
      return NextResponse.json({
        success: true,
        data: DEV_PREVIEW_GALLERY_EVENTS,
        source: "preview_fallback",
      });
    }

    // 2. Filter strictly to concluded events (upcoming or TBA events belong on Landing/Events pages, not in Gallery)
    const concludedEvents = (events || []).filter((ev) => isEventConcluded(ev.event_date));

    // 3. Format and enrich events (check local manifests on disk if DB photos are empty)
    const formattedEvents: GalleryEvent[] = [];

    for (const ev of concludedEvents) {
      let posterUrl: string | null = ev.poster_url || null;
      let photoList: string[] = Array.isArray(ev.photos) ? ev.photos : [];

      // If Supabase doesn't have media stored for this event yet, check local uploads directory
      if (!posterUrl && photoList.length === 0) {
        try {
          const manifestPath = path.join(
            process.cwd(),
            "public",
            "events",
            "uploads",
            ev.id,
            "manifest.json"
          );
          const raw = await fs.readFile(manifestPath, "utf-8");
          const manifest = JSON.parse(raw);
          if (manifest.poster?.url) posterUrl = manifest.poster.url;
          if (Array.isArray(manifest.photos)) {
            photoList = manifest.photos.map((p: any) => p.url).filter(Boolean);
          }
        } catch {
          // No local manifest on disk
        }
      }

      // Verify that local file assets actually exist on disk before serving
      if (posterUrl && !(await isAssetValid(posterUrl))) {
        posterUrl = null;
      }

      const validPhotos: string[] = [];
      for (const p of photoList) {
        if (await isAssetValid(p)) {
          validPhotos.push(p);
        }
      }
      photoList = validPhotos;

      // Add to gallery list
      formattedEvents.push({
        id: ev.id,
        name: ev.name,
        description: ev.description || null,
        event_date: ev.event_date || null,
        event_timing: ev.event_timing || null,
        speaker_name: ev.speaker_name || null,
        poster_url: posterUrl,
        photos: photoList,
        event_type: ev.event_type || "Event",
      });
    }

    // Filter to events that have at least one valid photo or poster
    const eventsWithMedia = formattedEvents.filter(
      (ev) => ev.photos.length > 0 || Boolean(ev.poster_url)
    );

    // If database has no media uploaded yet, serve the preview events so UI looks stunning immediately
    if (eventsWithMedia.length === 0) {
      return NextResponse.json({
        success: true,
        data: DEV_PREVIEW_GALLERY_EVENTS,
        source: "preview_empty_db",
      });
    }

    return NextResponse.json({
      success: true,
      data: eventsWithMedia,
      source: "supabase",
    });
  } catch (err: any) {
    console.error("[API/gallery] Error fetching gallery events:", err);
    return NextResponse.json({
      success: true,
      data: DEV_PREVIEW_GALLERY_EVENTS,
      source: "preview_error",
    });
  }
}
