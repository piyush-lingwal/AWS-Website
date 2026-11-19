import test from "node:test";
import assert from "node:assert/strict";
import { CLOUD_BUILT_AT, CLOUD_HEAD_START, CLOUD_MASK, CLOUD_PALETTE, SPARK, buildCloud, mulberry32 } from "../../lib/design/pixel-cloud.ts";

test("the cloud mask is a clean rectangle of X and dots", () => {
  const width = CLOUD_MASK[0].length;
  for (const row of CLOUD_MASK) {
    assert.equal(row.length, width);
    assert.match(row, /^[X.]+$/);
  }
});

test("one square per X, all inside the mask", () => {
  const cells = buildCloud();
  const expected = CLOUD_MASK.join("").split("X").length - 1;
  assert.equal(cells.length, expected);
  for (const c of cells) {
    assert.equal(CLOUD_MASK[c.y][c.x], "X");
  }
  assert.equal(new Set(cells.map((c) => `${c.x},${c.y}`)).size, cells.length, "no square drawn twice");
});

test("the same input gives the same cloud (server and browser agree)", () => {
  assert.deepEqual(buildCloud(), buildCloud());
  assert.notDeepEqual(buildCloud(CLOUD_MASK, 7), buildCloud(CLOUD_MASK, 8));
});

test("squares land bottom-up: the average delay grows toward the top", () => {
  const cells = buildCloud();
  const avg = (rows: number[]) => {
    const picked = cells.filter((c) => rows.includes(c.y));
    return picked.reduce((s, c) => s + c.delay, 0) / picked.length;
  };
  assert.ok(avg([0, 1, 2]) > avg([7, 8, 9]) + 0.15);
});

test("every delay is within 0..0.5, so the whole cloud is built by CLOUD_BUILT_AT", () => {
  for (const c of buildCloud()) {
    assert.ok(c.delay >= 0 && c.delay <= 0.5, `delay ${c.delay}`);
  }
  assert.ok(CLOUD_BUILT_AT < 0.8, "the cloud finishes well before the end of the hero");
  assert.ok(Math.abs(CLOUD_BUILT_AT - 0.5) < 1e-9);
});

test("the first screen is never empty: some squares have already landed at scroll position 0", () => {
  // Mirrors .cloud-cell in preview.css: k = clamp((t + HEAD_START - delay) * 5, 0, 1)
  const landedAtStart = buildCloud().filter((c) => (0 + CLOUD_HEAD_START - c.delay) * 5 > 0.5);
  assert.ok(landedAtStart.length >= 20, `only ${landedAtStart.length} squares visible at the start`);
  // ...but the cloud is not finished before the reader scrolls
  const doneAtStart = buildCloud().filter((c) => (0 + CLOUD_HEAD_START - c.delay) * 5 >= 1);
  assert.ok(doneAtStart.length < buildCloud().length * 0.3);
});

test("squares start above (falling in) and use only palette colours or the orange spark", () => {
  const allowed = new Set([...CLOUD_PALETTE, SPARK]);
  for (const c of buildCloud()) {
    assert.ok(c.dy < 0, "starts above its final spot");
    assert.ok(allowed.has(c.color));
  }
});

test("a few orange squares echo the brand artwork, but orange stays rare", () => {
  const sparks = buildCloud().filter((c) => c.color === SPARK);
  assert.ok(sparks.length >= 2 && sparks.length <= 4);
});

test("mulberry32 stays in [0, 1)", () => {
  const rnd = mulberry32(42);
  for (let i = 0; i < 1000; i++) {
    const n = rnd();
    assert.ok(n >= 0 && n < 1);
  }
});
