-- ============================================================
-- 20261105000001 — organiser (team) certificates        (ADDITIVE, SAFE TO RE-RUN)
-- ============================================================
-- Certificates of Appreciation for the organising team. Until now a certificate
-- was participation (award_title IS NULL) or excellence (award_title set). Add a
-- kind so organiser certificates are their own category, and a role snapshot
-- (e.g. "Technical Lead") shown on the certificate.
--
-- Existing rows get 'participation' / 'excellence' backfilled from award_title,
-- so nothing about current certificates changes.
-- ============================================================

ALTER TABLE public.certificates
    ADD COLUMN IF NOT EXISTS certificate_kind TEXT;

ALTER TABLE public.certificates
    ADD COLUMN IF NOT EXISTS role_snapshot TEXT;

-- Backfill existing certificates from the award_title convention.
UPDATE public.certificates
    SET certificate_kind = CASE WHEN award_title IS NULL THEN 'participation' ELSE 'excellence' END
    WHERE certificate_kind IS NULL;

ALTER TABLE public.certificates
    ALTER COLUMN certificate_kind SET DEFAULT 'participation';

ALTER TABLE public.certificates
    DROP CONSTRAINT IF EXISTS certificates_kind_check;
ALTER TABLE public.certificates
    ADD CONSTRAINT certificates_kind_check
    CHECK (certificate_kind IN ('participation', 'excellence', 'organiser'));

-- One organiser certificate per person per event (like the excellence index).
CREATE UNIQUE INDEX IF NOT EXISTS uq_certificates_organiser_event_participant
    ON public.certificates (event_id, participant_id)
    WHERE certificate_kind = 'organiser';

-- Make PostgREST (the Supabase API) see the new columns straight away.
NOTIFY pgrst, 'reload schema';
