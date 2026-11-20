// ============================================================
// PUT    /api/admin/team-members/[id]  — Update a team member
// DELETE /api/admin/team-members/[id]  — Delete a team member
// ============================================================

import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types/certificate";
import type { TeamMemberRow } from "@/lib/team/types";
import { parseTeamMemberInput, isUniqueViolation } from "@/lib/team/validate";

/**
 * PUT: Updates an existing team member.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Database not configured." } satisfies ApiResponse,
      { status: 500 }
    );
  }

  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." } satisfies ApiResponse,
      { status: 400 }
    );
  }

  // Only fields that were sent are validated and updated
  const parsed = parseTeamMemberInput(body ?? {}, true);
  if (!parsed.ok) {
    return NextResponse.json(
      { success: false, error: "Validation failed.", data: parsed.errors } satisfies ApiResponse,
      { status: 400 }
    );
  }
  const updatePayload = parsed.fields;

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json(
      { success: false, error: "No fields to update." } satisfies ApiResponse,
      { status: 400 }
    );
  }

  const { data, error: updateError } = await supabase
    .from("team_members")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    console.error("[API/admin/team-members/[id]] Update error:", updateError);
    if (isUniqueViolation(updateError)) {
      return NextResponse.json(
        { success: false, error: "A team member with this email already exists." } satisfies ApiResponse,
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update team member." } satisfies ApiResponse,
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, data, message: "Team member updated successfully." } satisfies ApiResponse<TeamMemberRow>,
  );
}

/**
 * DELETE: Deletes a team member by ID.
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Database not configured." } satisfies ApiResponse,
      { status: 500 }
    );
  }

  const { id } = await context.params;

  // Check if member exists
  const { data: existingMember, error: fetchError } = await supabase
    .from("team_members")
    .select("id, name")
    .eq("id", id)
    .single();

  if (fetchError || !existingMember) {
    return NextResponse.json(
      { success: false, error: "Team member not found." } satisfies ApiResponse,
      { status: 404 }
    );
  }

  const { error: deleteError } = await supabase
    .from("team_members")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("[API/admin/team-members/[id]] Delete error:", deleteError);
    return NextResponse.json(
      { success: false, error: "Failed to delete team member: " + deleteError.message } satisfies ApiResponse,
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Team member "${existingMember.name}" removed successfully.`,
  } satisfies ApiResponse);
}
