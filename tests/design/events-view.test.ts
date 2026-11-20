import test from "node:test";
import assert from "node:assert/strict";
import { computeStatus, dayFromIso, isoDayInZone, mapEventRows, type EventRow } from "../../lib/design/events-view.ts";

const TODAY = new Date(2026, 9, 10); // 10 Oct 2026, local midnight

const row = (over: Partial<EventRow>): EventRow => ({
  id: "x",
  name: "Event",
  description: null,
  event_date: "2026-10-20",
  event_timing: null,
  speaker_name: null,
  attendance_open: false,
  cover_url: null,
  ...over,
});

test("computeStatus: past, current and upcoming for dated rows", () => {
  assert.equal(computeStatus("2026-10-01", "b", "a", TODAY), "past");
  assert.equal(computeStatus("2026-10-20", "b", "b", TODAY), "current");
  assert.equal(computeStatus("2026-10-25", "b", "c", TODAY), "upcoming");
  assert.equal(computeStatus("2026-10-10", "d", "e", TODAY), "upcoming");
});

test("computeStatus: TBA row is upcoming, or current when it is the first future row", () => {
  assert.equal(computeStatus("", null, "a", TODAY), "upcoming");
  assert.equal(computeStatus(null, "a", "b", TODAY), "upcoming");
  assert.equal(computeStatus("", "a", "a", TODAY), "current");
});

test("computeStatus: malformed date is upcoming", () => {
  assert.equal(computeStatus("soon-ish", null, "a", TODAY), "upcoming");
});

test("mapEventRows: the first future row is current and others follow", () => {
  const rows = [
    row({ id: "old", event_date: "2026-09-01" }),
    row({ id: "next", event_date: "2026-10-12", event_type: "Hackathon" }),
    row({ id: "later", event_date: "2026-11-01" }),
    row({ id: "tba", event_date: null }),
  ];
  const view = mapEventRows(rows, TODAY);
  assert.deepEqual(view.map((v) => v.status), ["past", "current", "upcoming", "upcoming"]);
  assert.equal(view[1].tag, "Hackathon");
  assert.equal(view[0].tag, "Event");
  assert.equal(view[0].isoDate, "");
  assert.equal(view[1].isoDate, "2026-10-12T00:00:00");
  assert.equal(view[3].isoDate, "");
  assert.equal(view[3].date, "Announcing soon");
});

test("mapEventRows: a malformed date row does not become the first future event", () => {
  const view = mapEventRows([row({ id: "bad", event_date: "nope" }), row({ id: "ok", event_date: "2026-10-15" })], TODAY);
  assert.deepEqual(view.map((v) => v.status), ["upcoming", "current"]);
});

test("mapEventRows: the same rows give a different status for a different day", () => {
  const rows = [row({ id: "a", event_date: "2026-10-12" })];
  assert.equal(mapEventRows(rows, TODAY)[0].status, "current");
  assert.equal(mapEventRows(rows, new Date(2026, 9, 13))[0].status, "past");
});

test("isoDayInZone and dayFromIso", () => {
  const instant = new Date("2026-10-10T20:00:00Z"); // already 11 Oct in India
  assert.equal(isoDayInZone(instant, "Asia/Kolkata"), "2026-10-11");
  assert.equal(isoDayInZone(instant, "UTC"), "2026-10-10");
  assert.equal(dayFromIso("2026-10-11")?.getDate(), 11);
  assert.equal(dayFromIso("2026-02-31"), null);
});
