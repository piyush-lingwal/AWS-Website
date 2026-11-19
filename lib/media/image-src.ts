// ============================================================
// Which media URLs skip the Next.js image optimizer — PURE
// ============================================================
//
// Our own media is already prepared for the web before it is public:
//   - Supabase Storage files are resized WebP (lib/media/process-image.ts),
//   - Google Drive URLs are Drive's own sized thumbnails.
// Sending them through /_next/image again only adds work, and it can break:
// the optimizer refuses any host whose DNS answer includes an address it
// treats as private (for example NAT64 "64:ff9b::" addresses on some
// networks), which left uploaded covers as broken images.
// ============================================================

import { isDriveUrl } from "./drive.ts";

/** A file in a public Supabase Storage bucket. */
export function isSupabaseStorageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      u.hostname.endsWith(".supabase.co") &&
      u.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

/** True when `<Image>` should load the URL as-is (`unoptimized`). */
export function isPreprocessedMediaUrl(url: string): boolean {
  return isDriveUrl(url) || isSupabaseStorageUrl(url);
}
