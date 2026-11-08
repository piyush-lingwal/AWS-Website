import { test } from "node:test";
import assert from "node:assert/strict";
import { findOrCreateParticipant } from "../../lib/certificates/participants.ts";

// A recording stand-in for the Supabase client: `existing` is the participant row
// the email lookup finds (or null), and every insert/update is captured.
function fakeDb(existing: { id: string } | null) {
  const log: { op: string; payload?: unknown; where?: string }[] = [];
  const db = {
    from(table: string) {
      assert.equal(table, "participants");
      let op = "select";
      let payload: unknown;
      let where = "";
      const b: any = {
        select: () => b,
        insert: (p: unknown) => ((op = "insert"), (payload = p), b),
        update: (p: unknown) => ((op = "update"), (payload = p), b),
        eq: (c: string, v: unknown) => ((where = `${c}=${v}`), b),
        maybeSingle: () => Promise.resolve({ data: existing, error: null }),
        single: () => ((log.push({ op, payload }), Promise.resolve({ data: { id: "new-id" }, error: null }))),
        then: (ok: (r: unknown) => unknown) => {
          log.push({ op, payload, where });
          return Promise.resolve({ data: null, error: null }).then(ok);
        },
      };
      return b;
    },
  };
  return { db: db as any, log };
}

test("a new volunteer is created with their name, course and college id", async () => {
  const { db, log } = fakeDb(null);
  const id = await findOrCreateParticipant(db, "Aarav Sharma", "a@x.in", { course: "B.Tech", rollNo: "2201234" });
  assert.equal(id, "new-id");
  assert.deepEqual(log, [{ op: "insert", payload: { email: "a@x.in", full_name: "Aarav Sharma", course: "B.Tech", roll_no: "2201234" } }]);
});

test("an existing participant is updated with the volunteer's details", async () => {
  const { db, log } = fakeDb({ id: "p1" });
  const id = await findOrCreateParticipant(db, "Aarav Sharma", "a@x.in", { course: "BCA", rollNo: "11" });
  assert.equal(id, "p1");
  assert.deepEqual(log, [{ op: "update", payload: { full_name: "Aarav Sharma", course: "BCA", roll_no: "11" }, where: "id=p1" }]);
});

test("without details (organisers) a new participant gets placeholders and an existing one is left alone", async () => {
  let f = fakeDb(null);
  await findOrCreateParticipant(f.db, "Vivek", "v@x.in");
  assert.deepEqual(f.log, [{ op: "insert", payload: { email: "v@x.in", full_name: "Vivek", course: "N/A", roll_no: "N/A" } }]);

  f = fakeDb({ id: "p2" });
  assert.equal(await findOrCreateParticipant(f.db, "Vivek", "v@x.in"), "p2");
  assert.deepEqual(f.log, []);
});
