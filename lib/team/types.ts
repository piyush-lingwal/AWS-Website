// ============================================================
// Team roster — shared row and input types (PURE)
// ============================================================
// Matches public.team_members from
// supabase/migrations/20261119000001_team_members_redefine.sql.
// ============================================================

/** A row of public.team_members. */
export interface TeamMemberRow {
  id: string;
  name: string;
  email: string;
  course: string;
  /** Optional: not every course has a branch. */
  branch: string | null;
  /** Leadership designation (Leader, Tech Lead, ...). NULL = plain member of `wing`. */
  role: string | null;
  /** Optional: leadership members have no wing. */
  wing: string | null;
  /** NULL means "show the shared placeholder photo". */
  picture_url: string | null;
  created_at: string;
  updated_at: string;
}

/** Body of POST/PUT /api/admin/team-members. Only name, email and course are required. */
export interface TeamMemberInput {
  name: string;
  email: string;
  course: string;
  branch?: string | null;
  /** Optional: blank means a plain member of the wing. */
  role?: string | null;
  wing?: string | null;
  pictureUrl?: string | null;
}

/** Shared placeholder shown while a member has no picture_url. */
export const TEAM_PLACEHOLDER_PICTURE = "/members/boy2.png";
