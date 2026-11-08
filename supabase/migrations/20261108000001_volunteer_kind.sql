-- ============================================================
-- 20261108000001 — 'volunteer' certificate kind       (ADDITIVE, SAFE TO RE-RUN)
-- ============================================================
-- Certificates of Volunteering are their own kind next to participation,
-- excellence and organiser, issued per event from the admin Registrations tab.
-- Needed before any volunteer certificate can be saved. Existing rows are untouched.
-- Requires 20261105000001_organiser_certificates.sql to have been applied first.
-- ============================================================
ALTER TABLE public.certificates
    DROP CONSTRAINT IF EXISTS certificates_kind_check;
ALTER TABLE public.certificates
    ADD CONSTRAINT certificates_kind_check
    CHECK (certificate_kind IN ('participation', 'excellence', 'organiser', 'volunteer'));
-- One volunteer certificate per person per event (like organisers and excellence).
CREATE UNIQUE INDEX IF NOT EXISTS uq_certificates_volunteer_event_participant
    ON public.certificates (event_id, participant_id)
    WHERE certificate_kind = 'volunteer';
-- Make PostgREST (the Supabase API) see the change straight away.
NOTIFY pgrst, 'reload schema';
