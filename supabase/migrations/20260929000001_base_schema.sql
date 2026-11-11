-- ============================================================
-- 20260929000001 — Base schema                (FRESH DATABASES ONLY, RUN FIRST)
-- ============================================================
-- The starting tables for the AWS SBG site: events, participants, attendance,
-- certificates, the attendance portal's config, and the audit log. Every later
-- migration in this folder builds on it.
--
-- This one file replaces the two old baselines:
--   20260929000001_schema_init.sql  the first schema (events, certificates, ...)
--   20260930000001_schema_v2.sql    dropped those tables and created these ones,
--                                   keeping only audit_logs and set_updated_at()
-- It creates exactly what running both in order left behind, without the
-- DROP TABLE step, so it can never delete data.
--
-- Safe to run? On an EMPTY database, yes. On a database that already has these
-- tables it stops at the first CREATE TABLE and, because it runs in one
-- transaction, changes nothing. It is not meant to be re-run.
--
-- The RLS policies below are the original permissive ones. They are replaced
-- by 20261017000002_lock_down_rls.sql (admins only); apply that migration
-- before going live.
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── 1. participants ─────────────────────────────────────────────

CREATE TABLE public.participants (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name  TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    course     TEXT NOT NULL,
    roll_no    TEXT NOT NULL
);

COMMENT ON TABLE public.participants IS 'Students who have attended SBG events. One row per unique email — reused across events.';

CREATE INDEX idx_participants_email ON public.participants (email);
CREATE INDEX idx_participants_roll_no ON public.participants (roll_no);


-- ── 2. events ───────────────────────────────────────────────────

CREATE TABLE public.events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    event_date      DATE,                -- nullable when session is "To be announced"
    event_timing    TEXT,                -- display-oriented, nullable when date/timing TBA
    speaker_name    TEXT,
    attendance_open BOOLEAN NOT NULL DEFAULT false,
    event_type      TEXT DEFAULT 'Workshop'
);

COMMENT ON TABLE public.events IS 'SBG events/workshops/hackathons. attendance_open controls whether students can submit attendance.';

CREATE INDEX idx_events_date ON public.events (event_date);


-- ── 3. attendance ───────────────────────────────────────────────

CREATE TABLE public.attendance (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id       UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.attendance IS 'One row per participant per event. The unique constraint prevents double-submissions.';

-- Prevent the same participant from submitting attendance twice for the same event
CREATE UNIQUE INDEX uq_attendance_event_participant
    ON public.attendance (event_id, participant_id);

CREATE INDEX idx_attendance_event ON public.attendance (event_id);
CREATE INDEX idx_attendance_participant ON public.attendance (participant_id);


-- ── 4. certificates ─────────────────────────────────────────────

CREATE TABLE public.certificates (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id          TEXT NOT NULL UNIQUE,
    event_id                UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    participant_id          UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    attendance_id           UUID NOT NULL REFERENCES public.attendance(id) ON DELETE CASCADE,

    -- Snapshot fields: preserve exactly what was printed on the certificate
    recipient_name_snapshot TEXT NOT NULL,
    event_name_snapshot     TEXT NOT NULL,
    event_date_snapshot     DATE NOT NULL,

    pdf_url                 TEXT,           -- storage location of the generated PDF
    verification_url        TEXT NOT NULL,
    pdf_hash                TEXT,           -- SHA-256 hash of the PDF if available

    issue_date              DATE NOT NULL DEFAULT CURRENT_DATE
);

COMMENT ON TABLE public.certificates IS 'One certificate per attendance record. Snapshots preserve historical accuracy even if event/participant records are later edited.';

CREATE INDEX idx_certificates_cert_id ON public.certificates (certificate_id);
CREATE INDEX idx_certificates_event ON public.certificates (event_id);
CREATE INDEX idx_certificates_participant ON public.certificates (participant_id);
CREATE INDEX idx_certificates_attendance ON public.certificates (attendance_id);


-- ── 5. portal_config ────────────────────────────────────────────

CREATE TABLE public.portal_config (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    active_event_id    UUID REFERENCES public.events(id) ON DELETE SET NULL,
    attendance_enabled BOOLEAN NOT NULL DEFAULT false
);

COMMENT ON TABLE public.portal_config IS 'Single-row configuration table. Determines which event the Attendance Portal currently serves.';


-- ── 6. audit_logs (from the first schema, kept by v2) ───────────

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    result TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (result IN ('SUCCESS', 'FAILURE')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);


-- ── 7. set_updated_at() (from the first schema, kept by v2) ─────
-- Generic "touch updated_at" trigger function. No table in this file uses it;
-- it is kept so a new database matches existing ones.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── 8. Row Level Security (RLS) ─────────────────────────────────
-- Original permissive policies; 20261017000002_lock_down_rls.sql replaces them.

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PUBLIC (anon) read access — needed for attendance portal + verification

-- Anyone can read portal_config to discover the active event
CREATE POLICY "Public can read portal config"
    ON public.portal_config FOR SELECT
    USING (true);

-- Anyone can read events (needed to display event info on attendance portal)
CREATE POLICY "Public can read events"
    ON public.events FOR SELECT
    USING (true);

-- Anyone can read certificates (needed for verification)
CREATE POLICY "Public can read certificates"
    ON public.certificates FOR SELECT
    USING (true);

-- Anyone can read participants (needed for verification — joins)
-- Note: The API will control which fields are exposed publicly.
CREATE POLICY "Public can read participants"
    ON public.participants FOR SELECT
    USING (true);

-- Public can insert participants (attendance submission creates participants)
CREATE POLICY "Public can insert participants"
    ON public.participants FOR INSERT
    WITH CHECK (true);

-- Public can update participants (upsert on re-attendance with different name/course)
CREATE POLICY "Public can update participants"
    ON public.participants FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Public can insert attendance (student submitting attendance)
CREATE POLICY "Public can insert attendance"
    ON public.attendance FOR INSERT
    WITH CHECK (true);

-- Public can read attendance (for duplicate checks)
CREATE POLICY "Public can read attendance"
    ON public.attendance FOR SELECT
    USING (true);

-- Public can insert certificates (generated during attendance submission)
CREATE POLICY "Public can insert certificates"
    ON public.certificates FOR INSERT
    WITH CHECK (true);

-- ADMIN (authenticated) full access on all tables
CREATE POLICY "Admin full access participants"
    ON public.participants FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access events"
    ON public.events FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access attendance"
    ON public.attendance FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access certificates"
    ON public.certificates FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access portal_config"
    ON public.portal_config FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access audit_logs"
    ON public.audit_logs FOR ALL TO authenticated
    USING (true) WITH CHECK (true);


-- ── 9. Seed portal_config ───────────────────────────────────────

-- The single portal configuration row (no active event yet)
INSERT INTO public.portal_config (active_event_id, attendance_enabled)
VALUES (NULL, false);

COMMIT;
