-- ============================================================
-- 20261106000001 — organiser wing                       (ADDITIVE, SAFE TO RE-RUN)
-- ============================================================
-- A Certificate of Appreciation names either the member's specific role
-- (role_snapshot, e.g. "Technical Co-Lead") or, when there is no role, the
-- wing they served in ("Media member of the Organising Team"). Store the
-- wing as its own column. Allowed values mirror ORGANISER_WINGS in
-- lib/certificates/organiser.ts.
--
-- Existing certificates are untouched (wing_snapshot stays NULL).
-- ============================================================
ALTER TABLE public.certificates
    ADD COLUMN IF NOT EXISTS wing_snapshot TEXT;
ALTER TABLE public.certificates
    DROP CONSTRAINT IF EXISTS certificates_wing_check;
ALTER TABLE public.certificates
    ADD CONSTRAINT certificates_wing_check
    CHECK (wing_snapshot IS NULL OR wing_snapshot IN ('Media', 'Event', 'PR', 'Tech'));
-- Make PostgREST (the Supabase API) see the new column straight away.
NOTIFY pgrst, 'reload schema';
