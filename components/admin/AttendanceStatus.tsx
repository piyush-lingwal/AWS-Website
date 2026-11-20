"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Power, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminPortal } from "./AdminPortalProvider";

/** What the attendance portal is doing right now, worked out from the portal config and the active event. */
export type AttendanceState = "open" | "paused" | "event-closed" | "no-event";

export function attendanceState(
  masterEnabled: boolean | undefined,
  activeEvent: { attendance_open: boolean } | undefined
): AttendanceState {
  if (!activeEvent) return "no-event";
  if (!masterEnabled) return "paused";
  return activeEvent.attendance_open ? "open" : "event-closed";
}

const LABEL: Record<AttendanceState, string> = {
  open: "Attendance open",
  paused: "Attendance paused",
  "event-closed": "Event closed",
  "no-event": "No active event",
};

const DOT: Record<AttendanceState, string> = {
  open: "bg-[var(--ad-ok-dot)]",
  paused: "bg-[var(--ad-warn-dot)]",
  "event-closed": "bg-[var(--ad-warn-dot)]",
  "no-event": "bg-sbg-ink-3",
};

/**
 * Always-visible attendance control for the admin navbar. During an event this is the one switch an admin needs
 * on every screen. Clicking opens a small panel; the switch itself needs one more click so it cannot be hit by accident.
 */
export function AttendanceStatus({
  align = "right",
  direction = "down",
  className,
}: {
  align?: "right" | "center" | "left";
  /** Which way the panel opens; the sidebar control sits at the bottom, so it opens upward. */
  direction?: "down" | "up";
  className?: string;
}) {
  const { events, portalConfig, loading, setAttendanceEnabled } = useAdminPortal();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const activeEvent = events.find((e) => e.id === portalConfig?.active_event_id);
  const state = attendanceState(portalConfig?.attendance_enabled, activeEvent);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (loading) {
    return <div aria-hidden className={cn("h-8 w-32 animate-pulse rounded-xl bg-sbg-ink/[0.07]", className)} />;
  }

  const masterOn = !!portalConfig?.attendance_enabled;

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={activeEvent ? `${LABEL[state]}: ${activeEvent.name}` : LABEL[state]}
        className="flex h-11 w-full max-w-full items-center gap-2 rounded-xl border border-sbg-ink/10 bg-white/80 px-3 text-xs font-semibold text-sbg-ink transition-colors hover:border-sbg-lilac-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sbg-lilac-600"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          {state === "open" && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--ad-ok-dot)] opacity-60" />}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", DOT[state])} />
        </span>
        <span className="truncate">{LABEL[state]}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Attendance status"
          className={cn(
            "ad-modal absolute z-[70] w-72 max-w-[calc(100vw-2rem)] rounded-2xl p-4 text-left",
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2",
            align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"
          )}
        >
          <div className="flex items-center gap-2 ad-eyebrow !text-[10px] !text-sbg-ink-3">
            <Radio className="h-3 w-3" aria-hidden /> Active portal event
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-sbg-ink">{activeEvent?.name ?? "None selected"}</p>

          <p className="mt-2 text-xs leading-relaxed text-sbg-ink-2">
            {state === "open" && "Students can submit attendance right now."}
            {state === "paused" && "The master switch is off. Students cannot submit attendance."}
            {state === "event-closed" && "The master switch is on, but this event is closed for attendance. Edit the event to reopen it."}
            {state === "no-event" && "Pick an active event in Events before opening attendance."}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {activeEvent && (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await setAttendanceEnabled(!masterOn);
                  setBusy(false);
                }}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sbg-lilac-600",
                  masterOn ? "bg-[var(--ad-danger-bg)] text-[var(--ad-danger)] hover:bg-[#ffd0d0]" : "bg-[var(--ad-ok-bg)] text-[var(--ad-ok)] hover:bg-[#c9ecd6]"
                )}
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Power className="h-3.5 w-3.5" aria-hidden />}
                {masterOn ? "Turn attendance off" : "Turn attendance on"}
              </button>
            )}
            <Link
              href="/admin?tab=events"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 items-center rounded-xl border border-sbg-ink/10 px-3 text-xs font-medium text-sbg-ink-2 hover:bg-sbg-lilac-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sbg-lilac-600"
            >
              {activeEvent ? "Change event" : "Choose event"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
