-- ============================================================
-- Supabase Schema: Event Media (Poster & Photos) Storage Setup
-- ============================================================
-- Run this script in the Supabase SQL Editor if your testing DB
-- does not already have poster_url or photos on the events table.
-- ============================================================

-- 1. Ensure columns exist on the events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS poster_url TEXT,
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- 2. Create the storage bucket for event media if it does not already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-media', 'event-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage Policies (Allows public viewing and authorized uploads)
DO $$
BEGIN
  -- Policy: Public read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for event-media'
  ) THEN
    CREATE POLICY "Public Access for event-media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-media');
  END IF;

  -- Policy: Allow uploads for service role / authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Uploads for event-media'
  ) THEN
    CREATE POLICY "Allow Uploads for event-media"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'event-media');
  END IF;
END $$;
