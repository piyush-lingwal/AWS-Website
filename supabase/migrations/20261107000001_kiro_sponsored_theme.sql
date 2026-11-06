-- ============================================================
-- 20261107000001 — 'kiro' certificate theme            (ADDITIVE, SAFE TO RE-RUN)
-- ============================================================
-- Adds the "Kiro Sponsored" certificate template: the orange design with the
-- Kiro logo in the top-right logo tiles. An event picks it in the event form
-- (events.certificate_theme = 'kiro').
--
-- Only the allowed values change. Existing events keep their theme.
-- Requires 20261103000001_event_certificate_theme.sql to have been applied first.
-- ============================================================
ALTER TABLE public.events
    DROP CONSTRAINT IF EXISTS events_certificate_theme_check;
ALTER TABLE public.events
    ADD CONSTRAINT events_certificate_theme_check
    CHECK (certificate_theme IN ('orange', 'purple', 'kiro'));
-- Make PostgREST (the Supabase API) see the change straight away.
NOTIFY pgrst, 'reload schema';
