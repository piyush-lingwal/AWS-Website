-- ============================================================
-- 20261107000001 — Kiro Sponsored certificate themes   (ADDITIVE, SAFE TO RE-RUN)
-- ============================================================
-- Adds the two "Kiro Sponsored" certificate templates: the orange and purple
-- designs with a Kiro logo tile below the SBG tile in the top right. An event
-- picks one in the event form (events.certificate_theme = 'kiro' or 'kiro-purple').
--
-- Only the allowed values change. Existing events keep their theme.
-- Requires 20261103000001_event_certificate_theme.sql to have been applied first.
-- ============================================================
ALTER TABLE public.events
    DROP CONSTRAINT IF EXISTS events_certificate_theme_check;
ALTER TABLE public.events
    ADD CONSTRAINT events_certificate_theme_check
    CHECK (certificate_theme IN ('orange', 'purple', 'kiro', 'kiro-purple'));
-- Make PostgREST (the Supabase API) see the change straight away.
NOTIFY pgrst, 'reload schema';
