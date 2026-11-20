import { absoluteUrl } from "./site.ts";

export const PUBLIC_ROUTES: readonly string[] = [
  "/",
  "/about",
  "/events",
  "/team",
  "/learning-hub",
  "/gallery",
  "/register",
  "/community",
  "/verify",
];

export const ROBOTS_DISALLOW: readonly string[] = ["/admin", "/media", "/login", "/api/"];

export function buildRobots(base: string) {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [...ROBOTS_DISALLOW] }],
    sitemap: `${base}/sitemap.xml`,
  };
}

export interface GalleryEntry {
  id: string;
  event_date: string | null;
}

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
}

/** Static routes plus one /gallery/<id> per event that has media. No priority or changefreq. */
export function buildSitemap(base: string, galleryEvents: readonly GalleryEntry[] = []): SitemapEntry[] {
  const entries: SitemapEntry[] = PUBLIC_ROUTES.map((path) => ({ url: absoluteUrl(path, base) }));
  for (const ev of galleryEvents) {
    const entry: SitemapEntry = { url: absoluteUrl(`/gallery/${encodeURIComponent(ev.id)}`, base) };
    if (ev.event_date) {
      const d = new Date(ev.event_date);
      if (!Number.isNaN(d.getTime())) entry.lastModified = d;
    }
    entries.push(entry);
  }
  return entries;
}
