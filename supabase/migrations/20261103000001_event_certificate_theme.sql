-- ============================================================
-- 20261103000001 — events.certificate_theme        (ADDITIVE, SAFE TO RE-RUN)
-- ============================================================
-- Lets each event pick the colour of its certificates:
--   'orange' (the original AWS look, the default) or 'purple'.
-- The theme chooses which template pair is used and the accent colour of the
-- event name / rank text. See lib/certificates/theme.ts.
--
-- Existing events become 'orange', so nothing changes until an admin picks
-- a different colour in the event form.
-- ============================================================

ALTER TABLE public.events
    ADD COLUMN IF NOT EXISTS certificate_theme TEXT NOT NULL DEFAULT 'orange';

ALTER TABLE public.events
    DROP CONSTRAINT IF EXISTS events_certificate_theme_check;
ALTER TABLE public.events
    ADD CONSTRAINT events_certificate_theme_check
    CHECK (certificate_theme IN ('orange', 'purple'));

-- Make PostgREST (the Supabase API) see the new column straight away.
NOTIFY pgrst, 'reload schema';
