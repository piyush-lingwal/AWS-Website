"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Eye, EyeOff, Film, Image as ImageIcon, Loader2, Pencil, Trash2, X } from "lucide-react";
import { formatBytes } from "@/lib/media/upload-queue";
import { MAX_CAPTION_LENGTH } from "@/lib/media/policy";

export interface MediaListItem {
  id: string;
  kind: "image" | "video";
  purpose: "cover" | "gallery";
  status: "processing" | "ready" | "hidden" | string;
  /** null for a Drive item whose size Drive did not report. */
  size_bytes: number | null;
  source: "s3" | "drive" | "supabase";
  created_at: string;
  caption: string | null;
  mine: boolean;
  /** Whether the signed-in user may hide/caption/delete THIS item (admins: always; members: only their own). */
  canManage: boolean;
}

const STATUS: Record<string, { label: string; className: string }> = {
  ready: { label: "Live", className: "bg-emerald-50 text-emerald-700" },
  processing: { label: "Processing", className: "bg-amber-50 text-amber-800" },
  hidden: { label: "Hidden", className: "bg-sbg-mist text-sbg-ink-2" },
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
}

async function patchItem(id: string, body: Record<string, unknown>): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/media/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) return { ok: true };
    return { ok: false, error: typeof json?.error === "string" ? json.error : "Something went wrong." };
  } catch {
    return { ok: false, error: "Network error. Check your connection." };
  }
}

async function deleteItem(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/media/items/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) return { ok: true };
    return { ok: false, error: typeof json?.error === "string" ? json.error : "Something went wrong." };
  } catch {
    return { ok: false, error: "Network error. Check your connection." };
  }
}

export function MediaList({ items }: { items: MediaListItem[] }) {
  if (items.length === 0) {
    return (
      <p className="surface rounded-[28px] p-6 text-sm text-sbg-ink-2">
        Nothing uploaded for this event yet.
      </p>
    );
  }

  const live = items.filter((i) => i.status === "ready").length;

  return (
    <section aria-labelledby="uploaded-heading" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="uploaded-heading" className="text-lg font-semibold">Uploaded</h2>
        <p className="text-xs text-sbg-ink-2">
          {items.length} item{items.length === 1 ? "" : "s"} · {live} live
        </p>
      </div>
      <ul className="divide-y divide-sbg-ink/10 surface overflow-hidden rounded-[28px]">
        {items.map((item) => (
          <MediaRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function MediaRow({ item }: { item: MediaListItem }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(item.caption ?? "");
  const [busy, setBusy] = useState<"hide" | "caption" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const s = STATUS[item.status] ?? { label: item.status, className: "bg-sbg-mist text-sbg-ink-2" };
  const Icon = item.kind === "video" ? Film : ImageIcon;
  const canToggle = item.canManage && (item.status === "ready" || item.status === "hidden");

  const toggleHidden = async () => {
    setBusy("hide");
    setError(null);
    const result = await patchItem(item.id, { hidden: item.status !== "hidden" });
    setBusy(null);
    if (result.ok) router.refresh();
    else setError(result.error);
  };

  const saveCaption = async () => {
    setBusy("caption");
    setError(null);
    const result = await patchItem(item.id, { caption: caption.trim() === "" ? null : caption });
    setBusy(null);
    if (result.ok) {
      setEditing(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  };

  const remove = async () => {
    setBusy("delete");
    setError(null);
    const result = await deleteItem(item.id);
    setBusy(null);
    if (result.ok) router.refresh();
    else {
      setConfirmingDelete(false);
      setError(result.error);
    }
  };

  return (
    <li className="flex flex-col gap-2.5 p-3.5">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-sbg-ink-2" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">
            {item.kind === "video" ? "Video" : "Photo"}
            {item.purpose === "cover" && (
              <span className="ml-2 rounded-md bg-sbg-lilac-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sbg-lilac-700">
                Cover
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-sbg-ink-3">
            {[
              item.source === "drive" ? "Google Drive" : item.source === "supabase" ? "Supabase" : null,
              item.size_bytes ? formatBytes(item.size_bytes) : null,
              formatWhen(item.created_at),
            ]
              .filter(Boolean)
              .join(" · ")}
            {item.mine ? " · You" : ""}
          </p>
          {!editing && item.caption && <p className="mt-1 truncate text-xs text-sbg-ink-2">{item.caption}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${s.className}`}>{s.label}</span>

        {item.canManage && (
          <div className="flex shrink-0 items-center gap-1">
            {canToggle && (
              <button
                type="button"
                onClick={toggleHidden}
                disabled={busy !== null}
                aria-label={item.status === "hidden" ? "Show on the site" : "Hide from the site"}
                title={item.status === "hidden" ? "Show on the site" : "Hide from the site"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sbg-ink-3 hover:bg-sbg-lilac-50 hover:text-sbg-ink disabled:opacity-50"
              >
                {busy === "hide" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : item.status === "hidden" ? (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setCaption(item.caption ?? "");
                setEditing((v) => !v);
                setError(null);
              }}
              disabled={busy !== null}
              aria-label="Edit caption"
              title="Edit caption"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sbg-ink-3 hover:bg-sbg-lilac-50 hover:text-sbg-ink disabled:opacity-50"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            {confirmingDelete ? (
              <>
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy !== null}
                  aria-label="Confirm delete"
                  title="Confirm delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {busy === "delete" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={busy !== null}
                  aria-label="Cancel delete"
                  title="Cancel"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sbg-ink-3 hover:bg-sbg-lilac-50 hover:text-sbg-ink disabled:opacity-50"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={busy !== null}
                aria-label="Delete"
                title="Delete"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sbg-ink-3 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="flex items-start gap-2 pl-7">
          <div className="flex-1">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))}
              rows={2}
              placeholder="Add a caption…"
              className="w-full resize-none rounded-lg border border-sbg-ink/15 bg-white px-2.5 py-1.5 text-xs text-sbg-ink placeholder:text-sbg-ink-3 focus:border-sbg-lilac-600 focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-sbg-ink-3">{caption.length}/{MAX_CAPTION_LENGTH}</p>
          </div>
          <button
            type="button"
            onClick={saveCaption}
            disabled={busy !== null}
            className="flex h-8 items-center gap-1 rounded-lg bg-sbg-lilac-600 px-2.5 text-xs font-medium text-white hover:bg-sbg-lilac-700 disabled:opacity-50"
          >
            {busy === "caption" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={busy !== null}
            className="flex h-8 items-center rounded-lg border border-sbg-ink/15 px-2.5 text-xs text-sbg-ink-2 hover:bg-sbg-lilac-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="flex items-center gap-1.5 pl-7 text-xs text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}
    </li>
  );
}
