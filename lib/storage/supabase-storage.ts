// ============================================================
// Supabase Storage for the Media Portal (server only)
// ============================================================
//
// The stop-gap storage until S3 is set up. It plugs into the SAME upload
// pipeline as S3 (lib/media/complete.ts): this file only supplies the
// storage "ports" and the signed upload link. All rules (size, type, byte
// sniffing, image processing, status changes) are shared and tested there.
//
// Two buckets (see supabase/migrations/20261112000001_media_supabase_source.sql):
//   event-originals  PRIVATE  image uploads land here (keys under original/)
//   event-media      PUBLIC   processed images and videos
//
// The browser never gets a key to write with. It gets a single-use signed
// upload URL for exactly one path that this server generated.
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import { parseMediaKey } from "../media/keys.ts";
import type { CompletionPorts } from "../media/complete.ts";

export const ORIGINALS_BUCKET = "event-originals";
export const PUBLIC_BUCKET = "event-media";

/** Which bucket a generated key lives in. Throws for a key we did not generate. */
export function bucketForKey(key: string): string {
  const parsed = parseMediaKey(key);
  if (!parsed) throw new Error("Not a media key.");
  return parsed.area === "original" ? ORIGINALS_BUCKET : PUBLIC_BUCKET;
}

export interface SignedSupabaseUpload {
  url: string;
  fields: Record<string, string>;
}

/** Single-use upload link for one server-generated key. */
export async function signSupabaseUpload(db: SupabaseClient, key: string): Promise<SignedSupabaseUpload> {
  const { data, error } = await db.storage.from(bucketForKey(key)).createSignedUploadUrl(key);
  if (error || !data) throw new Error(`createSignedUploadUrl failed: ${error?.message ?? "no data"}`);
  return { url: data.signedUrl, fields: {} };
}

function isNotFound(err: unknown): boolean {
  const e = err as { status?: number; statusCode?: string | number; message?: string } | null;
  const code = Number(e?.status ?? e?.statusCode);
  return code === 404 || code === 400 || /not.?found/i.test(e?.message ?? "");
}

/** The Supabase half of the completion ports. */
export function supabasePorts(
  db: SupabaseClient
): Pick<CompletionPorts, "headObject" | "readFirstBytes" | "readObject" | "putObject" | "deleteObject"> {
  return {
    async headObject(key) {
      const { data, error } = await db.storage.from(bucketForKey(key)).info(key);
      if (error) {
        if (isNotFound(error)) return null;
        throw new Error(`info failed: ${error.message}`);
      }
      return { size: typeof data?.size === "number" ? data.size : -1, contentType: data?.contentType ?? undefined };
    },

    async readFirstBytes(key, count) {
      const { data, error } = await db.storage.from(bucketForKey(key)).createSignedUrl(key, 60);
      if (error || !data) throw new Error(`createSignedUrl failed: ${error?.message ?? "no data"}`);
      const res = await fetch(data.signedUrl, { headers: { Range: `bytes=0-${count - 1}` }, cache: "no-store" });
      if (res.status === 416) return new Uint8Array(); // zero-byte object
      if (!res.ok || !res.body) throw new Error(`read failed (${res.status})`);
      // Range honoured: the body is at most `count` bytes, so read it whole.
      if (res.status === 206) return new Uint8Array(await res.arrayBuffer()).slice(0, count);
      // Range ignored: the server sends the whole file. Read only what we need, then stop.
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let have = 0;
      while (have < count) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        have += value.length;
      }
      // Never await cancel(): inside Next.js the response body is a tee'd stream and
      // cancel() does not settle until the other branch is cancelled too, which hung
      // every completion at "Checking the file…".
      void reader.cancel().catch(() => undefined);
      const out = new Uint8Array(Math.min(have, count));
      let at = 0;
      for (const c of chunks) {
        const take = Math.min(c.length, out.length - at);
        out.set(c.subarray(0, take), at);
        at += take;
        if (at >= out.length) break;
      }
      return out;
    },

    async readObject(key) {
      const { data, error } = await db.storage.from(bucketForKey(key)).download(key);
      if (error || !data) throw new Error(`download failed: ${error?.message ?? "no data"}`);
      return new Uint8Array(await data.arrayBuffer());
    },

    async putObject(key, body, contentType) {
      const { error } = await db.storage.from(bucketForKey(key)).upload(key, body, {
        contentType,
        // Keys are unique per media id, so they may be cached for a year.
        cacheControl: "31536000",
        upsert: true, // idempotent: a retried completion writes the same bytes
      });
      if (error) throw new Error(`upload failed: ${error.message}`);
    },

    async deleteObject(key) {
      const { error } = await db.storage.from(bucketForKey(key)).remove([key]);
      if (error) throw new Error(`remove failed: ${error.message}`);
    },
  };
}

/** Removes every file a Supabase row owns (original, web, thumb, video). Best effort. */
export async function removeSupabaseFiles(
  db: SupabaseClient,
  row: { event_id: string; id: string; original_key: string | null; web_key: string | null; thumb_key: string | null }
): Promise<{ failed: string[] }> {
  const keys = new Set<string>();
  for (const key of [row.original_key, row.web_key, row.thumb_key]) {
    if (!key) continue;
    const parsed = parseMediaKey(key);
    // Only keys that are ours AND belong to this exact row (same rule as lib/media/cleanup.ts).
    if (parsed && parsed.eventId === row.event_id.toLowerCase() && parsed.mediaId === row.id.toLowerCase()) {
      keys.add(key);
    }
  }
  const failed: string[] = [];
  const ports = supabasePorts(db);
  for (const key of keys) {
    try {
      await ports.deleteObject(key);
    } catch (err) {
      console.error("[storage/supabase] delete failed:", key, err instanceof Error ? err.message : err);
      failed.push(key);
    }
  }
  return { failed };
}
