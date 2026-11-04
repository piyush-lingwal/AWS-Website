import test from "node:test";
import assert from "node:assert/strict";
import { chunkRanges, clampPage, pageCount, pageRange, pageSlice } from "../../lib/admin/pagination.ts";

test("pageCount never drops below 1", () => {
  assert.equal(pageCount(0, 50), 1);
  assert.equal(pageCount(50, 50), 1);
  assert.equal(pageCount(51, 50), 2);
  assert.equal(pageCount(1400, 50), 28);
});

test("clampPage keeps the page valid when the list shrinks or input is junk", () => {
  assert.equal(clampPage(9, 120, 50), 3);
  assert.equal(clampPage(0, 120, 50), 1);
  assert.equal(clampPage(-4, 120, 50), 1);
  assert.equal(clampPage(Number.NaN, 120, 50), 1);
  assert.equal(clampPage(2.7, 120, 50), 2);
});

test("pageSlice returns the right rows, including a short last page", () => {
  const items = Array.from({ length: 120 }, (_, i) => i);
  assert.deepEqual(pageSlice(items, 1, 50), items.slice(0, 50));
  assert.equal(pageSlice(items, 3, 50).length, 20);
  assert.equal(pageSlice(items, 99, 50)[0], 100);
  assert.deepEqual(pageSlice([], 1, 50), []);
});

test("pageRange gives the 'Showing a–b of n' numbers", () => {
  assert.deepEqual(pageRange(1, 120, 50), { from: 1, to: 50 });
  assert.deepEqual(pageRange(3, 120, 50), { from: 101, to: 120 });
  assert.deepEqual(pageRange(1, 0, 50), { from: 0, to: 0 });
});

test("chunkRanges covers every row exactly once (the 1000-row truncation fix)", () => {
  assert.deepEqual(chunkRanges(0), []);
  assert.deepEqual(chunkRanges(1000), [[0, 999]]);
  assert.deepEqual(chunkRanges(1400), [[0, 999], [1000, 1399]]);
  assert.deepEqual(chunkRanges(2001), [[0, 999], [1000, 1999], [2000, 2000]]);
  const covered = chunkRanges(2345).reduce((n, [a, b]) => n + (b - a + 1), 0);
  assert.equal(covered, 2345);
});
