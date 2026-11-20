// ============================================================
// GET  /api/admin/team-members      — List all team members
// POST /api/admin/team-members      — Create a new team member
// ============================================================

import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types/certificate";
import type { TeamMemberRow } from "@/lib/team/types";
import { parseTeamMemberInput, isUniqueViolation } from "@/lib/team/validate";

/** GET: Returns all team members, ordered by name. */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Database not configured." } satisfies ApiResponse,
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[API/admin/team-members] List error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members." } satisfies ApiResponse,
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data } satisfies ApiResponse<TeamMemberRow[]>);
}

/**
 * POST: Creates a new team member.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Database not configured." } satisfies ApiResponse,
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." } satisfies ApiResponse,
      { status: 400 }
    );
  }

  // ── Validate ──────────────────────────────────────────────
  const parsed = parseTeamMemberInput(body ?? {});
  if (!parsed.ok) {
    return NextResponse.json(
      { success: false, error: "Validation failed.", data: parsed.errors } satisfies ApiResponse,
      { status: 400 }
    );
  }

  // ── Insert team member ──────────────────────────────────────
  const { data: newMember, error: insertError } = await supabase
    .from("team_members")
    .insert(parsed.fields)
    .select("*")
    .single();

  if (insertError) {
    console.error("[API/admin/team-members] Insert error:", insertError);
    if (isUniqueViolation(insertError)) {
      return NextResponse.json(
        { success: false, error: "A team member with this email already exists." } satisfies ApiResponse,
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create team member." } satisfies ApiResponse,
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, data: newMember, message: "Team member added successfully." } satisfies ApiResponse<TeamMemberRow>,
    { status: 201 }
  );
}
