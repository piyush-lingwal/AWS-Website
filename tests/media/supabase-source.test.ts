import test from "node:test";
import assert from "node:assert/strict";
import { validateInitRequest } from "../../lib/media/validate.ts";
import { planPendingRows } from "../../lib/media/plan.ts";
import { supabasePublicUrl } from "../../lib/media/keys.ts";
import { toPublicView, toPublicViews } from "../../lib/media/public-view.ts";
import { buildQueueItem } from "../../lib/media/upload-queue.ts";
import { bucketForKey, ORIGINALS_BUCKET, PUBLIC_BUCKET } from "../../lib/storage/supabase-storage.ts";
import type { PublicMediaItem } from "../../lib/media/types.ts";

const EVENT = "abcdefab-abcd-4bcd-8bcd-abcdefabcdef";
const MEDIA = "fedcbafe-dcba-4cba-8cba-fedcbafedcba";
const USER = "99999999-9999-4999-8999-999999999999";
const SUPA = "https://abcd.supabase.co";
const MB = 1024 * 1024;

test("target defaults to s3 and only 's3' or 'supabase' are accepted", () => {
  const files = [{ type: "image/jpeg", size: 1000 }];
  const dflt = validateInitRequest({ eventId: EVENT, files });
  assert.ok(dflt.ok && dflt.value.target === "s3");
  const sb = validateInitRequest({ eventId: EVENT, files, target: "supabase" });
  assert.ok(sb.ok && sb.value.target === "supabase");
  assert.equal(validateInitRequest({ eventId: EVENT, files, target: "gcs" }).ok, false);
  assert.equal(validateInitRequest({ eventId: EVENT, files, target: 5 }).ok, false);
});

test("a video over 50 MB is refused for Supabase but fine for S3", () => {
  const files = [{ type: "video/mp4", size: 80 * MB }];
  assert.equal(validateInitRequest({ eventId: EVENT, files, target: "s3" }).ok, true);
  const sb = validateInitRequest({ eventId: EVENT, files, target: "supabase" });
  assert.equal(sb.ok, false);
  if (!sb.ok) assert.match(sb.error, /50 MB/);
});

test("images keep the 25 MB limit on Supabase", () => {
  assert.equal(validateInitRequest({ eventId: EVENT, target: "supabase", files: [{ type: "image/png", size: 24 * MB }] }).ok, true);
  assert.equal(validateInitRequest({ eventId: EVENT, target: "supabase", files: [{ type: "image/png", size: 26 * MB }] }).ok, false);
});

test("planned rows carry the chosen storage as their source", () => {
  const v = validateInitRequest({ eventId: EVENT, target: "supabase", files: [{ type: "image/jpeg", size: 10 }] });
  assert.ok(v.ok);
  if (!v.ok) return;
  const [p] = planPendingRows(v.value, USER, () => MEDIA);
  assert.equal(p.row.source, "supabase");
  assert.match(p.row.original_key, /\/original\//);
});

test("supabasePublicUrl builds the public bucket URL and refuses private or foreign keys", () => {
  assert.equal(
    supabasePublicUrl(SUPA, "event-media", `events/${EVENT}/web/${MEDIA}.webp`),
    `${SUPA}/storage/v1/object/public/event-media/events/${EVENT}/web/${MEDIA}.webp`
  );
  assert.throws(() => supabasePublicUrl(SUPA, "event-media", `events/${EVENT}/original/${MEDIA}.jpg`));
  assert.throws(() => supabasePublicUrl(SUPA, "event-media", "../secret.png"));
  assert.throws(() => supabasePublicUrl("http://abcd.supabase.co", "event-media", `events/${EVENT}/web/${MEDIA}.webp`));
  assert.throws(() => supabasePublicUrl(`${SUPA}/`, "event-media", `events/${EVENT}/web/${MEDIA}.webp`));
});

function row(over: Partial<PublicMediaItem> = {}): PublicMediaItem {
  return {
    id: MEDIA, event_id: EVENT, kind: "image", purpose: "cover", width: 800, height: 600, duration_s: null,
    caption: null, source: "supabase", drive_file_id: null,
    web_key: `events/${EVENT}/web/${MEDIA}.webp`, thumb_key: `events/${EVENT}/thumb/${MEDIA}.webp`,
    poster_key: null, created_at: "2026-11-01T00:00:00Z", ...over,
  };
}

test("a Supabase row renders from the Supabase URL, with no CDN needed", () => {
  const v = toPublicView(row(), null, SUPA);
  assert.ok(v);
  assert.equal(v?.source, "supabase");
  assert.equal(v?.url, `${SUPA}/storage/v1/object/public/event-media/events/${EVENT}/web/${MEDIA}.webp`);
  assert.match(v?.thumbUrl ?? "", /\/thumb\//);
});

test("a Supabase row is skipped when the project URL is unknown or the file is not ready", () => {
  assert.equal(toPublicView(row(), "https://cdn.example.com", null), null);
  assert.equal(toPublicView(row({ web_key: null }), null, SUPA), null);
  assert.equal(toPublicViews([row(), row({ web_key: null })], null, SUPA).length, 1);
});

test("Supabase videos play from the public bucket and fall back thumb to the file", () => {
  const key = `events/${EVENT}/video/${MEDIA}.mp4`;
  const v = toPublicView(row({ kind: "video", purpose: "gallery", web_key: key, thumb_key: null }), null, SUPA);
  assert.equal(v?.url, `${SUPA}/storage/v1/object/public/event-media/${key}`);
  assert.equal(v?.thumbUrl, v?.url);
});

test("the queue applies the Supabase video limit before uploading", () => {
  const big = { name: "a.mp4", type: "video/mp4", size: 80 * MB };
  assert.equal(buildQueueItem("1", big, "gallery", "s3").state, "queued");
  const blocked = buildQueueItem("2", big, "gallery", "supabase");
  assert.equal(blocked.state, "error");
  assert.match(blocked.error ?? "", /50 MB/);
});

test("bucketForKey sends originals to the private bucket and everything else to the public one", () => {
  assert.equal(bucketForKey(`events/${EVENT}/original/${MEDIA}.jpg`), ORIGINALS_BUCKET);
  assert.equal(bucketForKey(`events/${EVENT}/web/${MEDIA}.webp`), PUBLIC_BUCKET);
  assert.equal(bucketForKey(`events/${EVENT}/thumb/${MEDIA}.webp`), PUBLIC_BUCKET);
  assert.equal(bucketForKey(`events/${EVENT}/video/${MEDIA}.mp4`), PUBLIC_BUCKET);
  assert.throws(() => bucketForKey("../etc/passwd"));
});
