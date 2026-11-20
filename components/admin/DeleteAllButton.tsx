"use client";

// ============================================================
// "Delete all" button for one admin section, confirmed twice
// ============================================================
//
// Step 1 says what will be deleted and asks to continue.
// Step 2 asks the admin to type DELETE; the delete button stays disabled until
// they do, so a double click on step 1 can never confirm step 2 by accident.
// The API checks the same phrase (lib/admin/bulk-delete.ts).
// ============================================================

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { BULK_DELETE_CONFIRMATION, type BulkDeleteSection } from "@/lib/admin/bulk-delete";

interface DeleteAllButtonProps {
  section: BulkDeleteSection;
  /** Plural name of the entries, e.g. "participants". */
  noun: string;
  /** How many entries the admin can see. The button is disabled at 0. */
  count: number;
  eventId?: string;
  /** Where the entries are, e.g. 'for "Build-Verse 2026"'. */
  scope?: string;
  /** What else is deleted with them. */
  consequences: string;
  onDeleted: () => void | Promise<void>;
  disabled?: boolean;
  compact?: boolean;
}

const COUNT_LABELS: Record<string, [string, string]> = {
  events: ["event", "events"],
  registrations: ["participant", "participants"],
  certificates: ["certificate", "certificates"],
  participants: ["unused participant record", "unused participant records"],
  topPerformers: ["top performer", "top performers"],
  teamMembers: ["team member", "team members"],
};

function summarise(deleted: Record<string, number> | undefined): string {
  const parts = Object.entries(deleted ?? {})
    .filter(([, n]) => n > 0)
    .map(([key, n]) => {
      const [one, many] = COUNT_LABELS[key] ?? [key, key];
      return `${n} ${n === 1 ? one : many}`;
    });
  return parts.length ? `Deleted ${parts.join(", ")}.` : "Nothing was left to delete.";
}

export function DeleteAllButton({
  section,
  noun,
  count,
  eventId,
  scope,
  consequences,
  onDeleted,
  disabled = false,
  compact = false,
}: DeleteAllButtonProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    if (busy) return;
    setStep(0);
    setTyped("");
  };

  useEffect(() => {
    if (step === 0) return;
    if (step === 2) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, busy]);

  const confirmed = typed.trim() === BULK_DELETE_CONFIRMATION;
  const what = `${count} ${noun}${scope ? ` ${scope}` : ""}`;

  const run = async () => {
    if (!confirmed || busy) return;
    setBusy(true);
    const toastId = `delete-all-${section}`;
    toast.loading(`Deleting all ${noun}…`, { id: toastId });
    try {
      const res = await fetch("/api/admin/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, eventId, confirm: BULK_DELETE_CONFIRMATION }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(typeof json?.error === "string" ? json.error : `Could not delete the ${noun}.`);
      }
      toast.success(summarise(json.data?.deleted), { id: toastId });
      setBusy(false);
      setStep(0);
      setTyped("");
      await onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Could not delete the ${noun}.`, { id: toastId });
      setBusy(false);
      // Refresh anyway: a failure part way may already have removed some entries.
      await onDeleted();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setStep(1)}
        disabled={disabled || count === 0}
        className={`${compact ? "h-9" : "h-10"} ad-btn ad-btn-danger disabled:opacity-40`}
        title={`Delete all ${noun}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Delete all</span>
      </button>

      {step > 0 && (
        <div
          className="ad-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-all-${section}-title`}
            aria-describedby={`delete-all-${section}-body`}
            className="ad-modal relative w-full max-w-md overflow-hidden p-6"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b91c1c]/60 to-transparent" />

            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#b91c1c]/25 bg-[#ffe1e1] text-[#b91c1c]">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-lt-mono text-[10px] uppercase tracking-wider text-sbg-ink-3">Step {step} of 2</span>
                <button
                  type="button"
                  onClick={close}
                  disabled={busy}
                  aria-label="Close"
                  className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-sbg-ink/5 text-sbg-ink-2 transition-colors hover:bg-sbg-ink/10 hover:text-sbg-ink disabled:opacity-40 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <h3 id={`delete-all-${section}-title`} className="font-lt-display text-lg font-semibold tracking-[-0.03em] text-sbg-ink">
                    Delete all {noun}?
                  </h3>
                  <p id={`delete-all-${section}-body`} className="text-xs leading-relaxed text-sbg-ink-2 sm:text-[13px]">
                    This deletes all {what}. {consequences}
                  </p>
                  <p className="text-xs text-sbg-ink-3">You will be asked to confirm once more.</p>
                </div>
                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-sbg-ink/10 pt-4">
                  <button
                    type="button"
                    onClick={close}
                    className="ad-btn ad-btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="ad-btn ad-btn-danger"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void run();
                }}
              >
                <div className="space-y-2">
                  <h3 id={`delete-all-${section}-title`} className="font-lt-display text-lg font-semibold tracking-[-0.03em] text-sbg-ink">
                    Final confirmation
                  </h3>
                  <p id={`delete-all-${section}-body`} className="text-xs leading-relaxed text-sbg-ink-2 sm:text-[13px]">
                    {what} will be permanently deleted. This cannot be undone.
                  </p>
                </div>
                <label className="mt-4 block space-y-1.5">
                  <span className="text-xs text-sbg-ink">
                    Type <span className="font-lt-mono font-bold text-[#b91c1c]">{BULK_DELETE_CONFIRMATION}</span> to confirm
                  </span>
                  <input
                    ref={inputRef}
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    disabled={busy}
                    autoComplete="off"
                    spellCheck={false}
                    className="ad-input font-lt-mono"
                    placeholder={BULK_DELETE_CONFIRMATION}
                  />
                </label>
                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-sbg-ink/10 pt-4">
                  <button
                    type="button"
                    onClick={close}
                    disabled={busy}
                    className="ad-btn ad-btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!confirmed || busy}
                    className="ad-btn bg-[#b91c1c] text-white hover:bg-[#991b1b] disabled:opacity-40"
                  >
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    {busy ? "Deleting…" : `Delete all ${noun}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
