import { test } from "node:test";
import assert from "node:assert/strict";
import { BulkDeleteStepError, IN_CHUNK, runBulkDelete } from "../../lib/admin/bulk-delete-run.ts";

// A stand-in for the Supabase client that records every query (table, operation,
// filters) and answers from `respond`. The point is to prove each section deletes
// only what it should: these are the queries that would run against the database.

interface Call {
  table: string;
  op: "select" | "delete" | "update";
  filters: string[];
  payload?: unknown;
  range?: [number, number];
}
type Reply = { data?: unknown; error?: { code?: string; message: string } | null; count?: number | null };

function fakeDb(respond: (call: Call) => Reply = () => ({})) {
  const calls: Call[] = [];
  const db = {
    from(table: string) {
      const call: Call = { table, op: "select", filters: [] };
      const b: any = {
        select: () => b,
        delete: () => ((call.op = "delete"), b),
        update: (payload: unknown) => ((call.op = "update"), (call.payload = payload), b),
        eq: (c: string, v: unknown) => (call.filters.push(`${c}=eq.${v}`), b),
        not: (c: string, o: string, v: unknown) => (call.filters.push(`${c}=not.${o}.${v}`), b),
        in: (c: string, vs: unknown[]) => (call.filters.push(`${c}=in.(${vs.join(",")})`), b),
        is: (c: string, v: unknown) => (call.filters.push(`${c}=is.${v}`), b),
        order: () => b,
        range: (from: number, to: number) => ((call.range = [from, to]), b),
        maybeSingle: () => b,
        then: (ok: (r: unknown) => unknown, ko: (e: unknown) => unknown) => {
          calls.push(call);
          return Promise.resolve({ data: null, error: null, count: null, ...respond(call) }).then(ok, ko);
        },
      };
      return b;
    },
  };
  const deletes = () => calls.filter((c) => c.op === "delete").map((c) => `${c.table}: ${c.filters.join(" & ")}`);
  return { db: db as any, calls, deletes };
}

const EVENT = "11111111-1111-4111-8111-111111111111";
const eventFound = (c: Call): Reply | null =>
  c.table === "events" && c.op === "select" ? { data: { id: EVENT } } : null;

test("registrations: deletes the event's attendance and attendance-linked certificates, keeps Appreciation, cleans orphans", async () => {
  const { db, deletes } = fakeDb((c) => {
    const ev = eventFound(c);
    if (ev) return ev;
    if (c.table === "attendance" && c.op === "select" && c.filters[0] === `event_id=eq.${EVENT}`) {
      return { data: [{ participant_id: "p1" }, { participant_id: "p2" }], count: 2 };
    }
    // p2 still has a certificate elsewhere (e.g. an organiser certificate), so p2 must stay.
    if (c.table === "certificates" && c.op === "select") return { data: [{ participant_id: "p2" }] };
    if (c.op === "select") return { data: [] };
    if (c.table === "certificates") return { count: 2 };
    if (c.table === "attendance") return { count: 2 };
    if (c.table === "participants") return { count: 1 };
    return {};
  });
  const res = await runBulkDelete(db, { section: "registrations", eventId: EVENT });
  assert.deepEqual(res, { ok: true, deleted: { registrations: 2, certificates: 2, participants: 1 } });
  assert.deepEqual(deletes(), [
    `certificates: event_id=eq.${EVENT} & attendance_id=not.is.null`,
    `attendance: event_id=eq.${EVENT}`,
    "participants: id=in.(p1)",
  ]);
});

test("registrations reads every attendee past the 1000-row page limit", async () => {
  const { db, calls } = fakeDb((c) => {
    const ev = eventFound(c);
    if (ev) return ev;
    if (c.table === "attendance" && c.op === "select" && c.range) {
      const [from, to] = c.range;
      return { data: Array.from({ length: to - from + 1 }, (_, i) => ({ participant_id: `p${from + i}` })), count: 2500 };
    }
    if (c.op === "select") return { data: [{ participant_id: "keep-all" }] };
    return { count: 0 };
  });
  await runBulkDelete(db, { section: "registrations", eventId: EVENT });
  const pages = calls.filter((c) => c.table === "attendance" && c.range).map((c) => c.range);
  assert.deepEqual(pages, [[0, 999], [1000, 1999], [2000, 2499]]);
  // 2500 participant ids are checked for cleanup in chunks of IN_CHUNK.
  const lookups = calls.filter((c) => c.table === "top_performers" && c.op === "select");
  assert.equal(lookups.length, Math.ceil(2500 / IN_CHUNK));
});

test("an unknown event deletes nothing", async () => {
  for (const section of ["registrations", "top-performers", "organisers"] as const) {
    const { db, deletes } = fakeDb(() => ({ data: null }));
    const res = await runBulkDelete(db, { section, eventId: EVENT });
    assert.deepEqual(res, { ok: false, status: 404, error: "Event not found." });
    assert.deepEqual(deletes(), [], section);
  }
});

test("top-performers: deletes the event's top performers and only their Excellence certificates, in chunks", async () => {
  const ids = Array.from({ length: 250 }, (_, i) => `t${i}`);
  const { db, deletes } = fakeDb((c) => {
    const ev = eventFound(c);
    if (ev) return ev;
    if (c.table === "top_performers" && c.op === "select") return { data: ids.map((id) => ({ participant_id: id })), count: ids.length };
    if (c.table === "certificates") return { count: 1 };
    if (c.table === "top_performers") return { count: 250 };
    return {};
  });
  const res = await runBulkDelete(db, { section: "top-performers", eventId: EVENT });
  assert.deepEqual(res, { ok: true, deleted: { topPerformers: 250, certificates: 3 } });
  const del = deletes();
  assert.equal(del.length, 4);
  for (const d of del.slice(0, 3)) {
    assert.ok(d.startsWith(`certificates: event_id=eq.${EVENT} & award_title=not.is.null & participant_id=in.(`), d);
  }
  assert.equal(del[3], `top_performers: event_id=eq.${EVENT}`);
});

test("organisers: deletes only the event's organiser certificates", async () => {
  const { db, deletes } = fakeDb((c) => eventFound(c) ?? { count: 4 });
  assert.deepEqual(await runBulkDelete(db, { section: "organisers", eventId: EVENT }), { ok: true, deleted: { certificates: 4 } });
  assert.deepEqual(deletes(), [`certificates: event_id=eq.${EVENT} & certificate_kind=eq.organiser`]);
});

test("organisers before the organiser migration: nothing to delete, not an error", async () => {
  const { db } = fakeDb((c) => eventFound(c) ?? { error: { code: "42703", message: "column certificates.certificate_kind does not exist" } });
  assert.deepEqual(await runBulkDelete(db, { section: "organisers", eventId: EVENT }), { ok: true, deleted: { certificates: 0 } });
});

test("team: one batch, the default batch (with unbatched members), or every batch", async () => {
  let f = fakeDb(() => ({ count: 3 }));
  assert.deepEqual(await runBulkDelete(f.db, { section: "team", batch: "2025-26" }), { ok: true, deleted: { teamMembers: 3 } });
  assert.deepEqual(f.deletes(), ["team_members: batch=eq.2025-26"]);

  f = fakeDb(() => ({ count: 2 }));
  assert.deepEqual(await runBulkDelete(f.db, { section: "team", batch: "2026-27" }), { ok: true, deleted: { teamMembers: 4 } });
  assert.deepEqual(f.deletes(), ["team_members: batch=eq.2026-27", "team_members: batch=is.null"]);

  f = fakeDb(() => ({ count: 9 }));
  assert.deepEqual(await runBulkDelete(f.db, { section: "team", batch: "ALL" }), { ok: true, deleted: { teamMembers: 9 } });
  assert.deepEqual(f.deletes(), ["team_members: id=not.is.null"]);
});

test("events: clears the portal's active event, then deletes every event", async () => {
  const { db, calls, deletes } = fakeDb((c) => (c.table === "events" ? { count: 5 } : {}));
  assert.deepEqual(await runBulkDelete(db, { section: "events" }), { ok: true, deleted: { events: 5 } });
  assert.equal(calls[0].table, "portal_config");
  assert.deepEqual(calls[0].payload, { active_event_id: null, attendance_enabled: false });
  assert.deepEqual(deletes(), ["events: id=not.is.null"]);
});

test("a failed step stops the run with a BulkDeleteStepError", async () => {
  const { db, deletes } = fakeDb((c) => {
    const ev = eventFound(c);
    if (ev) return ev;
    if (c.op === "select") return { data: [], count: 0 };
    if (c.table === "certificates") return { error: { message: "boom" } };
    return { count: 1 };
  });
  await assert.rejects(runBulkDelete(db, { section: "registrations", eventId: EVENT }), BulkDeleteStepError);
  // It stopped at the certificates delete: attendance was not touched.
  assert.deepEqual(deletes(), [`certificates: event_id=eq.${EVENT} & attendance_id=not.is.null`]);
});
