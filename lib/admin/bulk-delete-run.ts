// ============================================================
// Runs a "delete all" for one admin section (server only)
// ============================================================
//
// Each section deletes exactly what its one-row delete deletes, for every row:
//   events          all events. The database cascades to their attendance,
//                   certificates, top performers and gallery rows; the portal's
//                   active event is cleared first (as for a single event).
//   registrations   all attendance rows of one event and the certificates issued
//                   through them. Organiser certificates have no attendance row,
//                   so they stay. Participants left with no other records go too.
//   top-performers  all top performers of one event and their Excellence certificates.
//   organisers      all Certificates of Appreciation of one event.
//   team            all team members of one batch, or of every batch ("ALL").
//
// Takes the Supabase client as a parameter so tests can pass a fake one and
// check every filter (tests/admin/bulk-delete-run.test.ts).
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingColumnError } from "../certificates/event-theme.ts";
import { chunkRanges, DB_PAGE_LIMIT } from "./pagination.ts";
import { ALL_TEAM_BATCHES, DEFAULT_TEAM_BATCH, chunk, type BulkDeleteRequest } from "./bulk-delete.ts";

/** Ids per `.in(...)` filter, so the request URL stays short. */
export const IN_CHUNK = 100;

export type BulkDeleteCounts = Record<string, number>;

export type BulkDeleteResult =
  | { ok: true; deleted: BulkDeleteCounts }
  | { ok: false; status: number; error: string };

/** A database step failed; earlier steps may already have deleted rows. */
export class BulkDeleteStepError extends Error {}

type Db = Pick<SupabaseClient, "from">;
type Res = { data?: unknown; error: { code?: string; message: string } | null; count?: number | null };

function check<T extends Res>(res: T, step: string): T {
  if (res.error) throw new BulkDeleteStepError(`${step}: ${res.error.message}`);
  return res;
}

/** Every value of `column` for rows matching `filter`, read past PostgREST's 1000-row cap. */
async function selectAll(db: Db, table: string, column: string, filter: (q: any) => any): Promise<string[]> {
  const first = check(
    await filter(db.from(table).select(column, { count: "exact" })).order(column).range(0, DB_PAGE_LIMIT - 1),
    `${table} lookup`
  );
  const values: string[] = ((first.data ?? []) as Record<string, string>[]).map((r) => r[column]);
  const total = first.count ?? values.length;
  for (const [from, to] of chunkRanges(total).slice(1)) {
    const page = check(await filter(db.from(table).select(column)).order(column).range(from, to), `${table} lookup`);
    values.push(...((page.data ?? []) as Record<string, string>[]).map((r) => r[column]));
  }
  return [...new Set(values)];
}

async function eventExists(db: Db, eventId: string): Promise<boolean> {
  const res = check(await db.from("events").select("id").eq("id", eventId).maybeSingle(), "event lookup");
  return !!res.data;
}

/** Removes participants who no longer have any attendance, certificate or top-performer row. */
async function removeOrphanParticipants(db: Db, participantIds: string[]): Promise<number> {
  let removed = 0;
  for (const ids of chunk(participantIds, IN_CHUNK)) {
    const [att, certs, tops] = await Promise.all([
      db.from("attendance").select("participant_id").in("participant_id", ids),
      db.from("certificates").select("participant_id").in("participant_id", ids),
      db.from("top_performers").select("participant_id").in("participant_id", ids),
    ]);
    // Cleanup is best effort: if any lookup fails, keep these participants.
    if (att.error || certs.error || tops.error) {
      console.error("[bulk-delete] Participant cleanup lookup failed:", (att.error ?? certs.error ?? tops.error)?.message);
      continue;
    }
    const inUse = new Set(
      [...(att.data ?? []), ...(certs.data ?? []), ...(tops.data ?? [])].map((r) => (r as { participant_id: string }).participant_id)
    );
    const orphans = ids.filter((id) => !inUse.has(id));
    if (orphans.length === 0) continue;
    const del = await db.from("participants").delete({ count: "exact" }).in("id", orphans);
    if (del.error) console.error("[bulk-delete] Participant cleanup failed:", del.error.message);
    else removed += del.count ?? 0;
  }
  return removed;
}

const NOT_FOUND: BulkDeleteResult = { ok: false, status: 404, error: "Event not found." };

export async function runBulkDelete(db: Db, req: BulkDeleteRequest): Promise<BulkDeleteResult> {
  switch (req.section) {
    case "events": {
      check(
        await db.from("portal_config").update({ active_event_id: null, attendance_enabled: false }).not("id", "is", null),
        "portal reset"
      );
      const del = check(await db.from("events").delete({ count: "exact" }).not("id", "is", null), "events delete");
      return { ok: true, deleted: { events: del.count ?? 0 } };
    }

    case "registrations": {
      if (!(await eventExists(db, req.eventId))) return NOT_FOUND;
      const participantIds = await selectAll(db, "attendance", "participant_id", (q) => q.eq("event_id", req.eventId));
      const certs = check(
        await db.from("certificates").delete({ count: "exact" }).eq("event_id", req.eventId).not("attendance_id", "is", null),
        "certificates delete"
      );
      const att = check(await db.from("attendance").delete({ count: "exact" }).eq("event_id", req.eventId), "attendance delete");
      const participants = await removeOrphanParticipants(db, participantIds);
      return { ok: true, deleted: { registrations: att.count ?? 0, certificates: certs.count ?? 0, participants } };
    }

    case "top-performers": {
      if (!(await eventExists(db, req.eventId))) return NOT_FOUND;
      const participantIds = await selectAll(db, "top_performers", "participant_id", (q) => q.eq("event_id", req.eventId));
      let certificates = 0;
      for (const ids of chunk(participantIds, IN_CHUNK)) {
        const del = check(
          await db
            .from("certificates")
            .delete({ count: "exact" })
            .eq("event_id", req.eventId)
            .not("award_title", "is", null)
            .in("participant_id", ids),
          "excellence certificates delete"
        );
        certificates += del.count ?? 0;
      }
      const del = check(
        await db.from("top_performers").delete({ count: "exact" }).eq("event_id", req.eventId),
        "top performers delete"
      );
      return { ok: true, deleted: { topPerformers: del.count ?? 0, certificates } };
    }

    case "organisers": {
      if (!(await eventExists(db, req.eventId))) return NOT_FOUND;
      const del = await db
        .from("certificates")
        .delete({ count: "exact" })
        .eq("event_id", req.eventId)
        .eq("certificate_kind", "organiser");
      // Before the organiser migration there are no organiser certificates to delete.
      if (del.error && isMissingColumnError(del.error, "certificate_kind")) return { ok: true, deleted: { certificates: 0 } };
      check(del, "organiser certificates delete");
      return { ok: true, deleted: { certificates: del.count ?? 0 } };
    }

    case "team": {
      if (req.batch === ALL_TEAM_BATCHES) {
        const del = check(await db.from("team_members").delete({ count: "exact" }).not("id", "is", null), "team delete");
        return { ok: true, deleted: { teamMembers: del.count ?? 0 } };
      }
      const del = check(await db.from("team_members").delete({ count: "exact" }).eq("batch", req.batch), "team delete");
      let teamMembers = del.count ?? 0;
      // Members saved without a batch are listed under the default batch.
      if (req.batch === DEFAULT_TEAM_BATCH) {
        const unbatched = check(await db.from("team_members").delete({ count: "exact" }).is("batch", null), "team delete");
        teamMembers += unbatched.count ?? 0;
      }
      return { ok: true, deleted: { teamMembers } };
    }
  }
}
