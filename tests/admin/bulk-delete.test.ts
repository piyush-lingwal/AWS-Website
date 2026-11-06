import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ALL_TEAM_BATCHES,
  BULK_DELETE_CONFIRMATION,
  BULK_DELETE_SECTIONS,
  DEFAULT_TEAM_BATCH,
  chunk,
  isBulkDeleteSection,
  validateBulkDelete,
} from "../../lib/admin/bulk-delete.ts";

const EVENT = "3F2504E0-4F89-41D3-9A0C-0305E82C3301";
const ok = (body: unknown) => {
  const v = validateBulkDelete(body);
  assert.equal(v.ok, true, JSON.stringify(v));
  return v.ok ? v.value : null;
};
const bad = (body: unknown, pattern?: RegExp) => {
  const v = validateBulkDelete(body);
  assert.equal(v.ok, false, `accepted ${JSON.stringify(body)}`);
  if (!v.ok && pattern) assert.match(v.error, pattern);
};

test("the sections are the five admin lists", () => {
  assert.deepEqual([...BULK_DELETE_SECTIONS], ["events", "registrations", "top-performers", "organisers", "team"]);
  assert.equal(isBulkDeleteSection("events"), true);
  assert.equal(isBulkDeleteSection("Events"), false);
  assert.equal(isBulkDeleteSection("participants"), false);
});

test("nothing is deleted without the exact confirmation phrase", () => {
  assert.equal(BULK_DELETE_CONFIRMATION, "DELETE");
  for (const confirm of [undefined, "", "delete", "DELETE ", " DELETE", "yes", true]) {
    bad({ section: "events", confirm }, /Type DELETE/);
  }
});

test("events needs nothing else", () => {
  assert.deepEqual(ok({ section: "events", confirm: "DELETE" }), { section: "events" });
});

test("event sections need a valid event id, which is trimmed and lower-cased", () => {
  for (const section of ["registrations", "top-performers", "organisers"]) {
    assert.deepEqual(ok({ section, eventId: ` ${EVENT} `, confirm: "DELETE" }), { section, eventId: EVENT.toLowerCase() });
    bad({ section, confirm: "DELETE" }, /event id/);
    bad({ section, eventId: "not-a-uuid", confirm: "DELETE" }, /event id/);
    bad({ section, eventId: 7, confirm: "DELETE" }, /event id/);
  }
});

test("team needs a batch name or ALL", () => {
  assert.deepEqual(ok({ section: "team", batch: "2026-27", confirm: "DELETE" }), { section: "team", batch: "2026-27" });
  assert.deepEqual(ok({ section: "team", batch: " 2025-26 ", confirm: "DELETE" }), { section: "team", batch: "2025-26" });
  assert.deepEqual(ok({ section: "team", batch: ALL_TEAM_BATCHES, confirm: "DELETE" }), { section: "team", batch: "ALL" });
  bad({ section: "team", confirm: "DELETE" }, /batch/);
  bad({ section: "team", batch: "", confirm: "DELETE" }, /batch/);
  bad({ section: "team", batch: "2026,batch.is.null", confirm: "DELETE" }, /batch/);
  bad({ section: "team", batch: "x".repeat(41), confirm: "DELETE" }, /batch/);
  assert.equal(DEFAULT_TEAM_BATCH, "2026-27");
});

test("unknown sections and bodies are refused", () => {
  bad(null, /Invalid/);
  bad("events", /Invalid/);
  bad({ section: "admins", confirm: "DELETE" }, /Section must be one of/);
  bad({ confirm: "DELETE" }, /Section must be one of/);
});

test("chunk splits ids into groups of at most the given size", () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunk([], 3), []);
  assert.deepEqual(chunk([1, 2], 5), [[1, 2]]);
  assert.throws(() => chunk([1], 0));
});

// The route and the button must agree on the phrase and never skip a step.
test("the API checks admin, JSON and the phrase; the button asks twice before sending", () => {
  const route = readFileSync(new URL("../../app/api/admin/bulk-delete/route.ts", import.meta.url), "utf8");
  assert.match(route, /const auth = await requireAdmin\(\);\s*if \(!auth\.ok\) return auth\.response;/);
  assert.match(route, /application\/json/);
  assert.match(route, /validateBulkDelete\(body\)/);
  assert.match(route, /runBulkDelete\(db, parsed\.value\)/);

  const button = readFileSync(new URL("../../components/admin/DeleteAllButton.tsx", import.meta.url), "utf8");
  assert.match(button, /setStep\(2\)/);
  assert.match(button, /disabled=\{!confirmed \|\| busy\}/);
  assert.match(button, /confirm: BULK_DELETE_CONFIRMATION/);
});
