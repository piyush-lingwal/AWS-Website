// ============================================================
// GET /api/admin/events/[id]/participants — Event Participants
// ============================================================
//
// Returns all participants who attended the specified event,
// joined with their participant details and issued certificate ID.
// Also returns total participant count derived from attendance records.
//
// Admin route — protected via admin Supabase client.
//
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse, AdminParticipantRow } from "@/types/certificate";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required." } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database client unavailable." } satisfies ApiResponse,
        { status: 500 }
      );
    }

    // 1. Verify event exists
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id, name, event_date")
      .eq("id", eventId)
      .single();

    if (eventErr || !event) {
      return NextResponse.json(
        { success: false, error: "Event not found." } satisfies ApiResponse,
        { status: 404 }
      );
    }

    // 2. Fetch attendance rows joined with participants & certificates
    const { data: attendanceRows, error: attError, count } = await supabase
      .from("attendance")
      .select(
        `
        id,
        submitted_at,
        participant:participants!inner (
          id,
          full_name,
          email,
          course,
          roll_no
        ),
        certificate:certificates (
          certificate_id
        )
      `,
        { count: "exact" }
      )
      .eq("event_id", eventId)
      .order("submitted_at", { ascending: false });

    if (attError) {
      console.error("[API/admin/events/participants] Fetch error:", attError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch event participants." } satisfies ApiResponse,
        { status: 500 }
      );
    }

    // 3. Format into AdminParticipantRow array
    const participants: AdminParticipantRow[] = (attendanceRows || []).map((row: any) => {
      const part = Array.isArray(row.participant) ? row.participant[0] : row.participant;
      const cert = Array.isArray(row.certificate) ? row.certificate[0] : row.certificate;

      return {
        name: part?.full_name || "Unknown",
        email: part?.email || "",
        course: part?.course || "",
        rollNo: part?.roll_no || "",
        submittedAt: row.submitted_at,
        certificateId: cert?.certificate_id || null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          event: {
            id: event.id,
            name: event.name,
            eventDate: event.event_date,
          },
          totalCount: count ?? participants.length,
          participants,
        },
      } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API/admin/events/participants] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
