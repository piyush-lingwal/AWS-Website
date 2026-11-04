-- ============================================================
-- 20261104000001 — events.event_end_date        (ADDITIVE, SAFE TO RE-RUN)
-- ============================================================
-- Lets an event span several days. event_date stays the start; event_end_date
-- is the optional last day. When set, certificates and event cards show the
-- range (e.g. "29-30 October 2026"); when null they show the single start date.
--
-- Existing events get NULL, so nothing changes until an admin sets an end date.
-- ============================================================

ALTER TABLE public.events
    ADD COLUMN IF NOT EXISTS event_end_date DATE;

-- The end cannot come before the start. NULLs are allowed (single-day events).
ALTER TABLE public.events
    DROP CONSTRAINT IF EXISTS events_end_date_after_start_check;
ALTER TABLE public.events
    ADD CONSTRAINT events_end_date_after_start_check
    CHECK (event_end_date IS NULL OR event_date IS NULL OR event_end_date >= event_date);

-- Make PostgREST (the Supabase API) see the new column straight away.
NOTIFY pgrst, 'reload schema';
