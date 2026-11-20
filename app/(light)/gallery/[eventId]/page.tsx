import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, Film } from "lucide-react";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
import { Reveal } from "@/components/design/Reveal";
import { isUuid } from "@/lib/auth/roles";
import { getAdminClient } from "@/lib/supabase/admin";
import { getEventCover, getEventMedia } from "@/lib/media/public-data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/site";
import { formatEventDate } from "@/lib/media/format";
import { MediaGrid, type LightboxItem } from "@/components/features/gallery/Lightbox";

export const dynamic = "force-dynamic";

interface EventRow {
  id: string;
  name: string;
  event_date: string | null;
}

async function loadEvent(eventId: string): Promise<EventRow | null> {
  const db = getAdminClient();
  if (!db) return null;
  const { data, error } = await db.from("events").select("id, name, event_date").eq("id", eventId).maybeSingle();
  if (error) {
    console.error("[gallery/[eventId]] event load error:", error.message);
    return null;
  }
  return (data as EventRow | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const { eventId } = await params;
  const fallback = buildPageMetadata({
    path: "/gallery",
    title: "Gallery",
    description: "Photos and videos from AWS Student Builder Group events at Tulas University.",
    noindex: true,
  });
  if (!isUuid(eventId)) return fallback;
  const event = await loadEvent(eventId.toLowerCase());
  if (!event) return fallback;
  const cover = await getEventCover(event.id);
  const image = cover && cover.kind === "image" && cover.url.startsWith("https://") ? cover.url : undefined;
  return buildPageMetadata({
    path: `/gallery/${event.id}`,
    title: event.name,
    description: `Photos and videos from ${event.name}, an AWS Student Builder Group event at Tulas University.`,
    image,
  });
}

export default async function EventGalleryPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  if (!isUuid(eventId)) notFound();

  const event = await loadEvent(eventId.toLowerCase());
  if (!event) notFound();

  const { cover, items } = await getEventMedia(event.id);
  const all: LightboxItem[] = [...(cover ? [cover] : []), ...items];
  const photoCount = all.filter((i) => i.kind === "image").length;
  const videoCount = all.filter((i) => i.kind === "video").length;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "Home", path: "/" },
            { name: "Gallery", path: "/gallery" },
            { name: event.name, path: `/gallery/${event.id}` },
          ],
          getSiteUrl(),
        )}
      />
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <main id="top" data-tone="dawn" className="relative min-h-screen pb-24 pt-36 sm:pb-32 sm:pt-44">
          <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
            <Reveal>
              <Link href="/gallery" className="btn btn-ghost !min-h-[40px] !px-4 !text-[13px]">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> All events
              </Link>

              <p className="t-eyebrow mb-4 mt-8 flex items-center gap-3">
                <span className="h-px w-10 bg-sbg-lilac-300" />
                {formatEventDate(event.event_date)}
              </p>
              <h1 className="t-display max-w-4xl text-[clamp(34px,5.4vw,76px)] text-sbg-ink">{event.name}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px] text-sbg-ink-2">
                {photoCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sbg-lilac-100 px-3 py-1.5 font-medium text-sbg-accent-strong">
                    <Camera className="h-3.5 w-3.5" aria-hidden="true" /> {photoCount} photo{photoCount === 1 ? "" : "s"}
                  </span>
                )}
                {videoCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sbg-lilac-100 px-3 py-1.5 font-medium text-sbg-accent-strong">
                    <Film className="h-3.5 w-3.5" aria-hidden="true" /> {videoCount} video{videoCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </Reveal>

            <div className="mt-12 sm:mt-16">
              {all.length === 0 ? (
                <p className="surface rounded-[26px] p-8 text-center text-sm text-sbg-ink-2">
                  No photos or videos have been uploaded for this event yet.
                </p>
              ) : (
                <MediaGrid items={all} />
              )}
            </div>
          </div>
        </main>
        <DesignFooter />
      </div>
    </>
  );
}
