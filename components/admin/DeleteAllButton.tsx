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
  /** Plural name of the entries, e.g. "registrations". */
  noun: string;
  /** How many entries the admin can see. The button is disabled at 0. */
  count: number;
  eventId?: string;
  batch?: string;
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
  registrations: ["registration", "registrations"],
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
  batch,
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
        body: JSON.stringify({ section, eventId, batch, confirm: BULK_DELETE_CONFIRMATION }),
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
        className={`${compact ? "h-9" : "h-10"} inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer`}
        title={`Delete all ${noun}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Delete all</span>
      </button>

      {step > 0 && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
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
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0E0E13] p-6 shadow-2xl"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/70 to-transparent" />

            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 shadow-lg shadow-rose-500/10">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#71717A]">Step {step} of 2</span>
                <button
                  type="button"
                  onClick={close}
                  disabled={busy}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.03] text-[#71717A] transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-40 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <h3 id={`delete-all-${section}-title`} className="text-lg font-bold tracking-tight text-white">
                    Delete all {noun}?
                  </h3>
                  <p id={`delete-all-${section}-body`} className="text-xs leading-relaxed text-[#A1A1AA] sm:text-[13px]">
                    This deletes all {what}. {consequences}
                  </p>
                  <p className="text-xs text-[#71717A]">You will be asked to confirm once more.</p>
                </div>
                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-white/[0.06] pt-4">
                  <button
                    type="button"
                    onClick={close}
                    className="h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-xs font-semibold text-[#A1A1AA] transition-all hover:bg-white/[0.08] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="h-10 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-500/20 cursor-pointer"
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
                  <h3 id={`delete-all-${section}-title`} className="text-lg font-bold tracking-tight text-white">
                    Final confirmation
                  </h3>
                  <p id={`delete-all-${section}-body`} className="text-xs leading-relaxed text-[#A1A1AA] sm:text-[13px]">
                    {what} will be permanently deleted. This cannot be undone.
                  </p>
                </div>
                <label className="mt-4 block space-y-1.5">
                  <span className="text-xs text-[#D4D4D8]">
                    Type <span className="font-mono font-bold text-rose-300">{BULK_DELETE_CONFIRMATION}</span> to confirm
                  </span>
                  <input
                    ref={inputRef}
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    disabled={busy}
                    autoComplete="off"
                    spellCheck={false}
                    className="h-10 w-full rounded-xl border border-white/[0.1] bg-[#09090E] px-3 font-mono text-sm text-white placeholder:text-[#52525B] focus:border-rose-500 focus:outline-none"
                    placeholder={BULK_DELETE_CONFIRMATION}
                  />
                </label>
                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-white/[0.06] pt-4">
                  <button
                    type="button"
                    onClick={close}
                    disabled={busy}
                    className="h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-xs font-semibold text-[#A1A1AA] transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-40 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!confirmed || busy}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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
