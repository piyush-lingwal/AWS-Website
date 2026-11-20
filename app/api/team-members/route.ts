// ============================================================
// GET /api/team-members — Public API to retrieve the team roster
// ============================================================
// team_members is admin-only under RLS, so this route reads it with the
// service-role key and returns only the public columns (no email).
// ============================================================

import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types/certificate";
import { PUBLIC_TEAM_COLUMNS, type PublicTeamMember } from "@/lib/team/roster";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Database not configured." } satisfies ApiResponse,
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("team_members")
    .select(PUBLIC_TEAM_COLUMNS)
    .order("name", { ascending: true });

  if (error) {
    console.error("[API/team-members] Fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members." } satisfies ApiResponse,
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: (data ?? []) as PublicTeamMember[],
  } satisfies ApiResponse<PublicTeamMember[]>);
}
