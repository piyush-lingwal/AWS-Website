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
import { isMissingColumnError } from "@/lib/certificates/event-theme";
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

  // 3. Fetch the active event details. event_end_date is optional: if the
  //    migration is not applied yet, fall back to the select without it.
  const columnsWithEnd = "id, name, description, event_date, event_end_date, event_timing, speaker_name, attendance_open";
  const columnsNoEnd = "id, name, description, event_date, event_timing, speaker_name, attendance_open";
  type ActiveEvent = {
    id: string;
    name: string;
    description: string | null;
    event_date: string | null;
    event_end_date?: string | null;
    event_timing: string | null;
    speaker_name: string | null;
    attendance_open: boolean | null;
  };
  let event: ActiveEvent | null;
  let eventError;
  {
    const res = await supabase.from("events").select(columnsWithEnd).eq("id", config.active_event_id).single();
    event = res.data as ActiveEvent | null;
    eventError = res.error;
  }

  if (eventError && isMissingColumnError(eventError, "event_end_date")) {
    const retry = await supabase.from("events").select(columnsNoEnd).eq("id", config.active_event_id).single();
    event = retry.data as ActiveEvent | null;
    eventError = retry.error;
  }

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
      eventEndDate: event.event_end_date ?? null,
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
