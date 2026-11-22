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
  /** Grid thumbnail (same URL the public gallery uses), or null when there is no web file yet. */
  thumbUrl?: string | null;
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
export function MediaList({
  items,
  eventId,
  canDeleteAll = false,
}: {
  items: MediaListItem[];
  /** Needed for "Delete all". */
  eventId?: string;
  /** Only ever true for super_admin (the API enforces it too). */
  canDeleteAll?: boolean;
}) {
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
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="uploaded-heading" className="text-lg font-semibold">Uploaded</h2>
        <p className="text-xs text-sbg-ink-2">
          {items.length} item{items.length === 1 ? "" : "s"} · {live} live
        </p>
      </div>
      {canDeleteAll && eventId && <DeleteAll eventId={eventId} count={items.length} />}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <MediaRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}
async function deleteAllItems(eventId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/media/events/${eventId}/items`, { method: "DELETE" });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) return { ok: true };
    return { ok: false, error: typeof json?.error === "string" ? json.error : "Something went wrong." };
  } catch {
    return { ok: false, error: "Network error. Check your connection." };
  }
}

const DELETE_ALL_PHRASE = "delete all";

/** Super admin only: step 1 is the button, step 2 is a typed "delete all" + confirm/cancel. */
function DeleteAll({ eventId, count }: { eventId: string; count: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matched = typed.trim().toLowerCase() === DELETE_ALL_PHRASE;

  const reset = () => {
    setConfirming(false);
    setTyped("");
    setError(null);
  };

  const run = async () => {
    if (!matched) return;
    setBusy(true);
    setError(null);
    const result = await deleteAllItems(eventId);
    setBusy(false);
    if (result.ok) {
      reset();
      router.refresh();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {confirming ? (
        <>
          <div className="mr-auto flex flex-col gap-1.5 text-xs">
            <p role="alert" className="font-medium text-red-700">
              Delete all {count} item{count === 1 ? "" : "s"}? This cannot be undone.
            </p>
            <label className="flex items-center gap-1.5 text-sbg-ink-2">
              Type <span className="font-mono font-semibold text-sbg-ink">{DELETE_ALL_PHRASE}</span> to confirm:
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={busy}
                autoFocus
                autoComplete="off"
                aria-label={`Type "${DELETE_ALL_PHRASE}" to confirm`}
                className="w-32 rounded-lg border border-sbg-ink/15 bg-white px-2 py-1 text-xs text-sbg-ink focus:border-red-500 focus:outline-none disabled:opacity-50"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={run}
            disabled={busy || !matched}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {busy ? "Deleting…" : "Confirm"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            className="flex h-8 items-center rounded-lg border border-sbg-ink/15 px-3 text-xs text-sbg-ink-2 hover:bg-sbg-lilac-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete all
        </button>
      )}
      {error && (
        <p role="alert" className="flex basis-full items-start justify-end gap-1.5 text-xs text-red-700">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

const ACTION_BTN =
  "flex h-8 w-8 items-center justify-center rounded-lg text-sbg-ink-3 transition-colors hover:bg-sbg-lilac-50 hover:text-sbg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sbg-lilac-600 disabled:opacity-50";
function MediaRow({ item }: { item: MediaListItem }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(item.caption ?? "");
  const [busy, setBusy] = useState<"hide" | "caption" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const s = STATUS[item.status] ?? { label: item.status, className: "bg-sbg-mist text-sbg-ink-2" };
  const Icon = item.kind === "video" ? Film : ImageIcon;
  const canToggle = item.canManage && (item.status === "ready" || item.status === "hidden");
  const hidden = item.status === "hidden";
  const title = item.kind === "video" ? "Video" : "Photo";
  const meta = [
    item.source === "drive" ? "Google Drive" : item.source === "supabase" ? "Supabase" : null,
    item.size_bytes ? formatBytes(item.size_bytes) : null,
    formatWhen(item.created_at),
  ]
    .filter(Boolean)
    .join(" · ") + (item.mine ? " · You" : "");
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
    <li className="group surface flex flex-col overflow-hidden rounded-2xl transition-shadow duration-200 hover:shadow-[0_12px_28px_-14px_rgb(var(--sbg-lilac-600)/0.45)] focus-within:ring-2 focus-within:ring-sbg-lilac-600/40">
      <div className="relative aspect-square overflow-hidden bg-sbg-mist">
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-7 w-7 text-sbg-ink-3" aria-hidden="true" />
        </div>
        {item.thumbUrl && !thumbFailed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbUrl}
            alt={item.caption ? `${title}: ${item.caption}` : `${title} uploaded ${formatWhen(item.created_at)}`}
            loading="lazy"
            decoding="async"
            onError={() => setThumbFailed(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-[transform,filter,opacity] duration-300 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
              hidden ? "opacity-60 grayscale" : ""
            }`}
          />
        )}
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/30 to-transparent" />
        <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold shadow-sm ${s.className}`}>{s.label}</span>
        {item.purpose === "cover" && (
          <span className="absolute right-2 top-2 rounded-md bg-sbg-lilac-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
            Cover
          </span>
        )}
        {item.kind === "video" && (
          <span className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white">
            <Film className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Video</span>
          </span>
        )}
        {hidden && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-sbg-ink-2 shadow">
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            </span>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{!editing && item.caption ? item.caption : title}</p>
          <p className="mt-0.5 truncate text-[11px] text-sbg-ink-3" title={meta}>{meta}</p>
        </div>
        {item.canManage && (
          <div className="-mx-1 mt-auto flex items-center gap-0.5 border-t border-sbg-ink/10 pt-1.5">
            {canToggle && (
              <button
                type="button"
                onClick={toggleHidden}
                disabled={busy !== null}
                aria-label={item.status === "hidden" ? "Show on the site" : "Hide from the site"}
                title={item.status === "hidden" ? "Show on the site" : "Hide from the site"}
                className={ACTION_BTN}
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
              aria-expanded={editing}
              title="Edit caption"
              className={ACTION_BTN}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="flex-1" />
            {confirmingDelete ? (
              <>
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy !== null}
                  aria-label="Confirm delete"
                  title="Confirm delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50"
                >
                  {busy === "delete" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={busy !== null}
                  aria-label="Cancel delete"
                  title="Cancel"
                  className={ACTION_BTN}
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
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sbg-ink-3 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        {editing && (
          <div className="space-y-1.5">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))}
              rows={2}
              aria-label="Caption"
              placeholder="Add a caption…"
              className="w-full resize-none rounded-lg border border-sbg-ink/15 bg-white px-2.5 py-1.5 text-xs text-sbg-ink placeholder:text-sbg-ink-3 focus:border-sbg-lilac-600 focus:outline-none"
            />
            <div className="flex items-center gap-1.5">
              <p className="mr-auto text-[10px] text-sbg-ink-3">{caption.length}/{MAX_CAPTION_LENGTH}</p>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={busy !== null}
                className="flex h-7 items-center rounded-lg border border-sbg-ink/15 px-2 text-xs text-sbg-ink-2 hover:bg-sbg-lilac-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCaption}
                disabled={busy !== null}
                className="flex h-7 items-center gap-1 rounded-lg bg-sbg-lilac-600 px-2.5 text-xs font-medium text-white hover:bg-sbg-lilac-700 disabled:opacity-50"
              >
                {busy === "caption" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : "Save"}
              </button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="flex items-start gap-1.5 text-xs text-red-700">
            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {error}
          </p>
        )}
      </div>
    </li>
  );
}
