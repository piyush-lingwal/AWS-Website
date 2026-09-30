// ============================================================
// GET /api/attendance/config — Public portal configuration
// ============================================================
//
// Returns the currently active event for the Attendance Portal.
// No authentication required — this is a public endpoint.
//
// ============================================================

import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse, PortalConfigResponse } from "@/types/certificate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "Database not configured." } satisfies ApiResponse,
      { status: 500 }
    );
  }

  // 1. Fetch the single portal config row
  const { data: config, error: configError } = await supabase
    .from("portal_config")
    .select("active_event_id, attendance_enabled")
    .limit(1)
    .single();

  if (configError || !config) {
    console.error("[API/attendance/config] Config fetch error:", configError);
    return NextResponse.json(
      { success: false, error: "Portal configuration not found." } satisfies ApiResponse,
      { status: 500 }
    );
  }

  // 2. If no active event is set, return disabled state
  if (!config.active_event_id) {
    const response: PortalConfigResponse = {
      attendanceEnabled: false,
      event: null,
    };
    return NextResponse.json({ success: true, data: response } satisfies ApiResponse<PortalConfigResponse>);
  }

  // 3. Fetch the active event details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name, description, event_date, event_timing, speaker_name, attendance_open")
    .eq("id", config.active_event_id)
    .single();

  if (eventError || !event) {
    console.error("[API/attendance/config] Event fetch error:", eventError);
    const response: PortalConfigResponse = {
      attendanceEnabled: false,
      event: null,
    };
    return NextResponse.json({ success: true, data: response } satisfies ApiResponse<PortalConfigResponse>);
  }

  const response: PortalConfigResponse = {
    attendanceEnabled: config.attendance_enabled && event.attendance_open !== false,
    event: {
      id: event.id,
      name: event.name,
      description: event.description,
      eventDate: event.event_date,
      eventTiming: event.event_timing,
      speakerName: event.speaker_name,
    },
  };

  return NextResponse.json(
    { success: true, data: response } satisfies ApiResponse<PortalConfigResponse>,
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
