import test from "node:test";
import assert from "node:assert/strict";
import { eventDateLabel, eventDayLabel, lastDay, parseDay, pickHomeEvents, startOfToday, type HomeEvent } from "../../lib/design/home-events.ts";

const TODAY = new Date(2026, 10, 15); // 15 Nov 2026, local midnight

const ev = (id: string, event_date: string | null, extra: Partial<HomeEvent> = {}): HomeEvent => ({
  id,
  name: id,
  description: null,
  event_date,
  event_timing: null,
  ...extra,
});

test("parseDay accepts only real calendar days", () => {
  assert.equal(parseDay("2026-11-15")?.getDate(), 15);
  assert.equal(parseDay("2026-02-31"), null);
  assert.equal(parseDay("tomorrow"), null);
  assert.equal(parseDay("2026-1-5"), null);
  assert.equal(parseDay(""), null);
  assert.equal(parseDay(null), null);
  assert.equal(parseDay(undefined), null);
});

test("startOfToday drops the time of day", () => {
  const t = startOfToday(new Date(2026, 10, 15, 23, 59, 59));
  assert.deepEqual([t.getHours(), t.getMinutes(), t.getDate()], [0, 0, 15]);
});

test("an event today is upcoming; yesterday is past", () => {
  const { next, past } = pickHomeEvents([ev("today", "2026-11-15"), ev("yesterday", "2026-11-14")], TODAY);
  assert.equal(next?.id, "today");
  assert.deepEqual(past.map((e) => e.id), ["yesterday"]);
});

test("upcoming is earliest first and the next one is returned", () => {
  const { next } = pickHomeEvents([ev("c", "2026-12-20"), ev("a", "2026-11-20"), ev("b", "2026-12-01")], TODAY);
  assert.equal(next?.id, "a");
});

test("an undated event counts as upcoming but comes after dated ones", () => {
  assert.equal(pickHomeEvents([ev("tba", null), ev("dated", "2026-12-01")], TODAY).next?.id, "dated");
  assert.equal(pickHomeEvents([ev("tba", null)], TODAY).next?.id, "tba");
  assert.equal(pickHomeEvents([ev("blank", "  ")], TODAY).next?.id, "blank");
});

test("past is most recent first", () => {
  const { past } = pickHomeEvents([ev("old", "2026-09-01"), ev("recent", "2026-11-10"), ev("mid", "2026-10-05")], TODAY);
  assert.deepEqual(past.map((e) => e.id), ["recent", "mid", "old"]);
});

test("a date that cannot be read is shown nowhere (not as upcoming, not as past)", () => {
  const { next, past } = pickHomeEvents([ev("bad", "soon-ish"), ev("worse", "2026-02-31")], TODAY);
  assert.equal(next, null);
  assert.deepEqual(past, []);
});

test("FIX: a multi-day event that is still running is upcoming, not past", () => {
  // Started 14 Nov, ends 16 Nov: on 15 Nov it is still happening.
  const running = ev("running", "2026-11-14", { event_end_date: "2026-11-16" });
  const { next, past } = pickHomeEvents([running], TODAY);
  assert.equal(next?.id, "running");
  assert.deepEqual(past, []);
});

test("a multi-day event is past once its LAST day has gone", () => {
  const done = ev("done", "2026-11-10", { event_end_date: "2026-11-12" });
  assert.deepEqual(pickHomeEvents([done], TODAY).past.map((e) => e.id), ["done"]);
});

test("an end date before the start (bad data) is ignored: the start day is used", () => {
  const e = ev("odd", "2026-11-20", { event_end_date: "2026-11-01" });
  assert.equal(lastDay(e)?.getDate(), 20);
  assert.equal(pickHomeEvents([e], TODAY).next?.id, "odd");
});

test("no events at all is fine", () => {
  assert.deepEqual(pickHomeEvents([], TODAY), { next: null, past: [] });
});

test("date labels: single day, range, and not announced yet", () => {
  assert.match(eventDateLabel({ event_date: "2026-10-29", event_end_date: null }), /29/);
  assert.match(eventDateLabel({ event_date: "2026-10-29", event_end_date: null }), /October 2026/);
  assert.match(eventDateLabel({ event_date: "2026-10-29", event_end_date: "2026-10-30" }), /29.30 October 2026/);
  assert.equal(eventDateLabel({ event_date: null }), "Announcing soon");
  assert.equal(eventDateLabel({ event_date: "  " }), "Announcing soon");
});

test("day labels", () => {
  assert.equal(eventDayLabel({ event_date: "2026-10-29" }), "Thursday");
  assert.equal(eventDayLabel({ event_date: "2026-10-29", event_end_date: "2026-10-30" }), "Multi-day");
  assert.equal(eventDayLabel({ event_date: null }), "Stay tuned");
});
