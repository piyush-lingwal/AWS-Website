import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { RECRUITMENT_CONFIG, RecruitmentStatusMode, RecruitmentStatus } from "@/config/recruitment";
import { parseDateString } from "@/lib/recruitment";

export const revalidate = 10; // revalidate every 10 seconds

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(fallbackResponse());
    }

    const { data, error } = await supabaseAdmin
      .from("site_config")
      .select("value")
      .eq("key", "recruitment_status")
      .single();

    if (error || !data?.value) {
      console.warn("[recruitment-status] Falling back to local config due to DB fetch error:", error?.message);
      return NextResponse.json(fallbackResponse());
    }

    const config = data.value as {
      status_mode?: RecruitmentStatusMode;
      registration_start_date?: string;
      registration_end_date?: string;
    };

    const statusMode = config.status_mode || RECRUITMENT_CONFIG.statusMode;
    const startDateStr = config.registration_start_date || RECRUITMENT_CONFIG.registrationStartDate;
    const endDateStr = config.registration_end_date || RECRUITMENT_CONFIG.registrationEndDate;

    const computedStatus = computeStatus(statusMode, startDateStr, endDateStr);

    return NextResponse.json({
      status: computedStatus,
      statusMode,
      registrationStartDate: startDateStr,
      registrationEndDate: endDateStr,
    });
  } catch (err) {
    console.error("[recruitment-status] Error fetching recruitment status:", err);
    return NextResponse.json(fallbackResponse());
  }
}

function computeStatus(
  statusMode: RecruitmentStatusMode,
  startDateStr: string,
  endDateStr: string
): RecruitmentStatus {
  if (statusMode && statusMode !== "auto") {
    return statusMode as RecruitmentStatus;
  }

  const now = Date.now();
  const start = parseDateString(startDateStr).getTime();
  const end = parseDateString(endDateStr).getTime();

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "open";
  return "closed";
}

function fallbackResponse() {
  const statusMode = RECRUITMENT_CONFIG.statusMode;
  const startDateStr = RECRUITMENT_CONFIG.registrationStartDate;
  const endDateStr = RECRUITMENT_CONFIG.registrationEndDate;

  return {
    status: computeStatus(statusMode, startDateStr, endDateStr),
    statusMode,
    registrationStartDate: startDateStr,
    registrationEndDate: endDateStr,
  };
}

