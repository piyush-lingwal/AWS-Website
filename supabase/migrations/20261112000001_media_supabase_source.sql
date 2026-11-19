-- ============================================================
-- 20261112000001 — Supabase Storage as a media source   (ADDITIVE, SAFE)
-- ============================================================
-- Lets the Media Portal store event photos, videos and covers in Supabase
-- Storage instead of S3, until the S3 setup is finished. Existing rows
-- (source 's3' or 'drive') are untouched.
--
--   source = 'supabase' -> same shape as 's3': original_key is required, and
--                          web_key / thumb_key are filled in once processed.
--
-- Two storage buckets (created below):
--   event-originals  PRIVATE  image uploads land here; never served
--   event-media      PUBLIC   processed images (web + thumb) and videos
--
-- Nobody writes to these buckets from the browser directly. The server hands
-- out single-use signed upload links (service role), so no storage.objects
-- policies are needed: a public bucket is readable by URL, and nothing else
-- is allowed to anon or authenticated users.
--
-- Free plan: Supabase caps ONE upload at 50 MB (Dashboard -> Storage ->
-- Settings), so the app limits Supabase videos to 50 MB. Images are
-- resized on the server, so they may be up to 25 MB when uploaded.
-- ============================================================

ALTER TABLE public.media_items DROP CONSTRAINT IF EXISTS media_items_source_check;
ALTER TABLE public.media_items
    ADD CONSTRAINT media_items_source_check
    CHECK (source IN ('s3', 'drive', 'supabase'));

ALTER TABLE public.media_items DROP CONSTRAINT IF EXISTS media_items_source_shape;
ALTER TABLE public.media_items
    ADD CONSTRAINT media_items_source_shape CHECK (
        (source IN ('s3', 'supabase') AND original_key IS NOT NULL AND drive_file_id IS NULL)
     OR (source = 'drive' AND drive_file_id IS NOT NULL AND original_key IS NULL
                          AND web_key IS NULL AND thumb_key IS NULL AND poster_key IS NULL)
    );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('event-originals', 'event-originals', false, 26214400,
     ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('event-media', 'event-media', true, 52428800,
     ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO UPDATE
    SET public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;
