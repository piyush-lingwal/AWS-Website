import type { MetadataRoute } from "next";
import { getAdminClient } from "@/lib/supabase/admin";
import { getGalleryGroups } from "@/lib/media/public-data";
import { buildSitemap, type GalleryEntry } from "@/lib/seo/routes";
import { getSiteUrl } from "@/lib/seo/site";

// Gallery entries come from the database, so render per request rather than at build time.
export const dynamic = "force-dynamic";

async function loadGalleryEntries(): Promise<GalleryEntry[]> {
  const db = getAdminClient();
  if (!db) return [];
  const { data, error } = await db
    .from("events")
    .select("id, name, event_date")
    .order("event_date", { ascending: false, nullsFirst: true });
  if (error) return [];
  const groups = await getGalleryGroups(data ?? []);
  return groups.map((g) => ({ id: g.event.id, event_date: g.event.event_date }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  try {
    return buildSitemap(base, await loadGalleryEntries());
  } catch {
    return buildSitemap(base);
  }
}
