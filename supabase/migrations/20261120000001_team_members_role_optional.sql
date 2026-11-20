-- ============================================================
-- Team roster: make team_members.role optional
-- ============================================================
-- role now holds a leadership designation only (Leader, Vice-Leader,
-- Secretary, Technical Lead, Event Lead, PR Lead, Technical Co-Lead, ...).
-- NULL means a plain member of the wing in the `wing` column.
--
-- 20261119000001 defined role as TEXT NOT NULL with no CHECK constraint,
-- so there is nothing else to drop. Non-destructive and safe to re-run:
-- existing rows and data are unchanged.
-- Apply by hand in the Supabase SQL Editor (see supabase/README.md).
-- ============================================================

ALTER TABLE public.team_members ALTER COLUMN role DROP NOT NULL;

COMMENT ON COLUMN public.team_members.role IS 'Leadership designation (e.g. Leader, Tech Lead). NULL = plain member of the wing.';
