// ============================================================
// Find or create a participant by email (server only)
// ============================================================
//
// Shared by the organiser and volunteer issue routes.
//   - Organisers have no course or roll number: new participants get the placeholders
//     the schema accepts, and an existing participant is left as it is.
//   - Volunteers give a College ID and a course: they are saved on the participant
//     (a new one is created with them, an existing one is updated), the same as the
//     attendee import.
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";

export interface ParticipantDetails {
  course: string;
  /** The College ID, stored in participants.roll_no. */
  rollNo: string;
}

export async function findOrCreateParticipant(
  db: SupabaseClient,
  fullName: string,
  email: string,
  details?: ParticipantDetails
): Promise<string> {
  const columns = details
    ? { full_name: fullName, course: details.course, roll_no: details.rollNo }
    : { full_name: fullName, course: "N/A", roll_no: "N/A" };

  const existing = await db.from("participants").select("id").eq("email", email).maybeSingle();
  if (existing.error) throw new Error(`participant lookup: ${existing.error.message}`);
  if (existing.data) {
    if (details) {
      const upd = await db.from("participants").update(columns).eq("id", existing.data.id);
      if (upd.error) throw new Error(`participant update: ${upd.error.message}`);
    }
    return existing.data.id as string;
  }

  const created = await db
    .from("participants")
    .insert({ email, ...columns })
    .select("id")
    .single();
  if (!created.error && created.data) return created.data.id as string;
  if (created.error?.code === "23505") {
    const raced = await db.from("participants").select("id").eq("email", email).maybeSingle();
    if (raced.data) return raced.data.id as string;
  }
  throw new Error(`participant insert: ${created.error?.message ?? "no row returned"}`);
}
