// ============================================================
// POST /api/admin/team-members/bulk-import
// Accepts JSON array of team member objects parsed from
// Excel/CSV on the client side and bulk-inserts them.
// ============================================================

import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types/certificate";
import type { TeamMemberRow } from "@/lib/team/types";
import { parseTeamMemberInput, isUniqueViolation, type TeamMemberDbFields } from "@/lib/team/validate";

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

  let body: {
    members: Record<string, unknown>[];
    mode?: "append" | "overwrite";
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." } satisfies ApiResponse,
      { status: 400 }
    );
  }

  const { members, mode = "append" } = body;

  if (!Array.isArray(members) || members.length === 0) {
    return NextResponse.json(
      { success: false, error: "No members provided." } satisfies ApiResponse,
      { status: 400 }
    );
  }

  if (members.length > 200) {
    return NextResponse.json(
      { success: false, error: "Maximum 200 members per import." } satisfies ApiResponse,
      { status: 400 }
    );
  }

  // Validate & normalize each row
  const rows: Partial<TeamMemberDbFields>[] = [];
  const validationErrors: string[] = [];
  const seenEmails = new Set<string>();

  members.forEach((m, i) => {
    const rowNum = i + 2; // +2 because row 1 is header
    const parsed = parseTeamMemberInput(m ?? {});
    if (!parsed.ok) {
      for (const message of Object.values(parsed.errors)) validationErrors.push(`Row ${rowNum}: ${message}`);
      return;
    }
    const email = parsed.fields.email as string;
    if (seenEmails.has(email)) {
      validationErrors.push(`Row ${rowNum}: Email ${email} appears more than once in the file`);
      return;
    }
    seenEmails.add(email);
    rows.push(parsed.fields);
  });

  if (validationErrors.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Validation failed for ${validationErrors.length} issue(s).`,
        data: validationErrors,
      } satisfies ApiResponse,
      { status: 400 }
    );
  }

  // Overwrite mode replaces the whole roster
  if (mode === "overwrite") {
    const { error: deleteError } = await supabase
      .from("team_members")
      .delete()
      .not("id", "is", null);
    if (deleteError) {
      console.error("[API/team-members/bulk-import] Delete error during overwrite:", deleteError);
      return NextResponse.json(
        { success: false, error: "Failed to overwrite existing data: " + deleteError.message } satisfies ApiResponse,
        { status: 500 }
      );
    }
  }

  // Bulk insert
  const { data: inserted, error: insertError } = await supabase
    .from("team_members")
    .insert(rows)
    .select("*");

  if (insertError) {
    console.error("[API/team-members/bulk-import] Insert error:", insertError);
    return NextResponse.json(
      {
        success: false,
        error: isUniqueViolation(insertError)
          ? "One or more emails already exist in the team. Nothing was imported."
          : "Database insert failed: " + insertError.message,
      } satisfies ApiResponse,
      { status: isUniqueViolation(insertError) ? 409 : 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: inserted,
      message:
        mode === "overwrite"
          ? `Successfully overwritten and imported ${inserted?.length ?? 0} team members.`
          : `Successfully imported ${inserted?.length ?? 0} team members.`,
    } satisfies ApiResponse<TeamMemberRow[]>,
    { status: 201 }
  );
}
