import test from "node:test";
import assert from "node:assert/strict";
import { deleteAllEventMedia, type DeletedRow } from "../../lib/media/bulk-delete.ts";
import { isRoleAllowed, SUPER_ADMIN_ONLY } from "../../lib/auth/roles.ts";

function fakeDb(result: { data: DeletedRow[] | null; error: { message: string } | null }) {
  const calls: Array<[string, ...unknown[]]> = [];
  const q: Record<string, unknown> = {};
  q.update = (v: unknown) => (calls.push(["update", v]), q);
  q.eq = (c: string, v: unknown) => (calls.push(["eq", c, v]), q);
  q.is = (c: string, v: unknown) => (calls.push(["is", c, v]), q);
  q.select = () => Promise.resolve(result);
  return { db: { from: (t: string) => (calls.push(["from", t]), q) } as never, calls };
}

const row = (id: string, source: string): DeletedRow => ({
  id, event_id: "e1", source, original_key: null, web_key: null, thumb_key: null,
});

test("only super_admin passes the bulk-delete role guard", () => {
  assert.equal(isRoleAllowed("super_admin", SUPER_ADMIN_ONLY), true);
  assert.equal(isRoleAllowed("admin", SUPER_ADMIN_ONLY), false);
  assert.equal(isRoleAllowed("media_manager", SUPER_ADMIN_ONLY), false);
  assert.equal(isRoleAllowed(null, SUPER_ADMIN_ONLY), false);
});

test("soft-deletes every live row of the event and cleans Supabase files only", async () => {
  const { db, calls } = fakeDb({ data: [row("a", "supabase"), row("b", "s3"), row("c", "drive")], error: null });
  const cleaned: string[] = [];
  const res = await deleteAllEventMedia(db, "E1", async (r) => (cleaned.push(r.id), { failed: [] }));
  assert.deepEqual(res, { ok: true, removed: 3 });
  assert.deepEqual(cleaned, ["a"]);
  assert.ok(calls.some((c) => c[0] === "eq" && c[1] === "event_id" && c[2] === "e1"));
  assert.ok(calls.some((c) => c[0] === "is" && c[1] === "deleted_at" && c[2] === null));
  const upd = calls.find((c) => c[0] === "update")![1] as { deleted_at: string };
  assert.ok(!Number.isNaN(Date.parse(upd.deleted_at)));
});

test("a database error reports failure and removes no files", async () => {
  const { db } = fakeDb({ data: null, error: { message: "boom" } });
  let called = false;
  const res = await deleteAllEventMedia(db, "e1", async () => ((called = true), { failed: [] }));
  assert.deepEqual(res, { ok: false });
  assert.equal(called, false);
});

test("a storage cleanup failure does not fail the delete", async () => {
  const { db } = fakeDb({ data: [row("a", "supabase"), row("b", "supabase")], error: null });
  let n = 0;
  const res = await deleteAllEventMedia(db, "e1", async () => {
    n++;
    throw new Error("x");
  });
  assert.deepEqual(res, { ok: true, removed: 2 });
  assert.equal(n, 2);
});
