-- ============================================================
-- Team roster: replace team_members with the new column set
-- ============================================================
-- The roster is now fixed (no registrations), so the old table
-- (name, pic_url, course, branch, year, role, batch, display_order from
-- 20261013000001_team_members.sql) is dropped and recreated:
--
--   name, email, course, branch (optional), role, wing (optional), picture_url
--
-- DESTRUCTIVE: every existing team_members row is deleted. Apply by hand in
-- the Supabase SQL Editor (see supabase/README.md).
--
-- What DROP TABLE ... CASCADE removes from the old table: its indexes, the
-- trigger_team_members_updated_at trigger, and the two policies created in
-- 20261013000001 / replaced by "admins_all" in 20261017000002_lock_down_rls.
-- Not touched on purpose:
--   - public.handle_updated_at() (shared helper function from the old file)
--   - the team-avatars storage bucket and its policies. The admin Team tab
--     still uploads photos there (app/api/admin/team-members/upload).
--
-- Access model (same as the lock-down migration): RLS on, ONE admins-only
-- policy. The public Team page reads through /api/team-members with the
-- service-role key, so anonymous users need no direct table access.
--
-- Choices:
--   - email: required, unique case-insensitively (lower(email) index, same as
--     media_members), so the same person cannot be added twice.
--   - branch: nullable, because not every course has a branch.
--   - role: free text ("Leader", "Vice-Leader", "Tech Wing Member", ...).
--     No CHECK, so new roles need no migration.
--   - wing: nullable. Leadership-tier members have no wing.
--   - picture_url: nullable with NO database default. Everyone currently uses
--     one shared placeholder photo, so the app shows that placeholder when
--     the value is NULL. Real photos can be filled in later without a schema
--     change.
-- ============================================================

DROP TABLE IF EXISTS public.team_members CASCADE;

CREATE TABLE public.team_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    course      TEXT NOT NULL,               -- e.g. B.Tech, BCA, MCA
    branch      TEXT,                        -- optional: not every course has one
    role        TEXT NOT NULL,               -- e.g. Leader, Vice-Leader, Tech Wing Member
    wing        TEXT,                        -- optional: leadership has no wing
    picture_url TEXT,                        -- NULL = app shows the shared placeholder
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.team_members IS 'AWS SBG team roster shown on the public Team page. Managed in the admin panel Team tab.';

CREATE UNIQUE INDEX team_members_email_lower_idx ON public.team_members (lower(email));
CREATE INDEX idx_team_members_wing ON public.team_members (wing);

CREATE TRIGGER trigger_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all" ON public.team_members
    FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());
