import { test } from "node:test";
import assert from "node:assert/strict";
import { formatEventDate, validateEventEndDate } from "../../lib/certificates/event-date.ts";

test("a single day (no end date) is the long form with a two-digit day", () => {
  assert.equal(formatEventDate("2026-10-30"), "30 October 2026");
  assert.equal(formatEventDate("2026-01-05"), "05 January 2026");
  assert.equal(formatEventDate("2026-10-30", null), "30 October 2026");
  assert.equal(formatEventDate("2026-10-30", ""), "30 October 2026");
});

test("a range in one month collapses to e.g. 29-30 October 2026", () => {
  assert.equal(formatEventDate("2026-10-29", "2026-10-30"), "29-30 October 2026");
  assert.equal(formatEventDate("2026-11-01", "2026-11-05"), "01-05 November 2026");
});

test("a range across months in one year uses short months once with the year", () => {
  assert.equal(formatEventDate("2026-10-29", "2026-11-05"), "29 Oct - 05 Nov 2026");
});

test("a range across years shows both years", () => {
  assert.equal(formatEventDate("2026-12-29", "2027-01-05"), "29 Dec 2026 - 05 Jan 2027");
});

test("an end on or before the start is treated as a single day", () => {
  assert.equal(formatEventDate("2026-10-30", "2026-10-30"), "30 October 2026");
  assert.equal(formatEventDate("2026-10-30", "2026-10-29"), "30 October 2026");
});

test("invalid or missing input returns an empty string, never a crash", () => {
  for (const bad of ["", "TBA", "2026-13-01", "2026-02-30", "30-10-2026", null, undefined, 20261030, {}]) {
    assert.equal(formatEventDate(bad), "", `start: ${JSON.stringify(bad)}`);
  }
  // A bad end date just falls back to the single start date.
  assert.equal(formatEventDate("2026-10-29", "not-a-date"), "29 October 2026");
  assert.equal(formatEventDate("2026-10-29", "2026-13-40"), "29 October 2026");
});

test("validateEventEndDate: optional, must be valid and not before the start", () => {
  assert.deepEqual(validateEventEndDate(null, "2026-10-29"), { ok: true, value: null });
  assert.deepEqual(validateEventEndDate("", "2026-10-29"), { ok: true, value: null });
  assert.deepEqual(validateEventEndDate(undefined, "2026-10-29"), { ok: true, value: null });
  assert.deepEqual(validateEventEndDate("2026-10-30", "2026-10-29"), { ok: true, value: "2026-10-30" });
  assert.deepEqual(validateEventEndDate("2026-10-29", "2026-10-29"), { ok: true, value: "2026-10-29" });

  const before = validateEventEndDate("2026-10-28", "2026-10-29");
  assert.equal(before.ok, false);
  if (!before.ok) assert.match(before.error, /before the start/);

  assert.equal(validateEventEndDate("nope", "2026-10-29").ok, false);
  assert.equal(validateEventEndDate("2026-10-30", "TBA").ok, false);
});
