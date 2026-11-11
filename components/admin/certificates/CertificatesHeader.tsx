"use client";

// ============================================================
// Top of the admin Certificates tab
// ============================================================
//
//   - Event picker: search and choose the event; everything below follows it.
//   - Section tiles: Participants, Top Performers, Organising Team, Volunteers.
//     Each shows its count and how many certificates are issued, and switches the
//     list shown below (they are the tabs).
//   - Export all: one Excel file with a sheet per section, for the chosen event.
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { Award, CalendarDays, Check, ChevronDown, Download, HandHeart, Loader2, Search, Trophy, Users } from "lucide-react";
import type { DbEvent } from "@/types/certificate";
import { formatEventDate } from "@/lib/certificates/event-date";
import { filterRows } from "@/lib/admin/list-search";
import { CountBone } from "@/components/admin/Skeletons";

export type CertSection = "participants" | "top-performers" | "organisers" | "volunteers";

export const CERT_SECTIONS: readonly CertSection[] = ["participants", "top-performers", "organisers", "volunteers"];

export function parseCertSection(value: string | null | undefined): CertSection {
  return CERT_SECTIONS.includes(value as CertSection) ? (value as CertSection) : "participants";
}

export interface SectionCounts {
  /** null while loading. */
  participants: number | null;
  participationIssued: number | null;
  topPerformers: number | null;
  excellenceIssued: number | null;
  organisers: number | null;
  volunteers: number | null;
}

function eventDate(ev: Pick<DbEvent, "event_date" | "event_end_date">): string {
  return formatEventDate(ev.event_date, ev.event_end_date ?? null) || "Date TBA";
}

/** Active event first, then newest first; events without a date last. */
function sortEvents(events: readonly DbEvent[], activeId: string | null | undefined): DbEvent[] {
  return [...events].sort((a, b) => {
    if (a.id === activeId) return -1;
    if (b.id === activeId) return 1;
    const da = a.event_date || "";
    const db = b.event_date || "";
    if (da && !db) return -1;
    if (!da && db) return 1;
    return db.localeCompare(da);
  });
}

function EventPicker({
  events,
  value,
  activeEventId,
  onChange,
}: {
  events: readonly DbEvent[];
  value: string;
  activeEventId?: string | null;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const sorted = useMemo(() => sortEvents(events, activeEventId), [events, activeEventId]);
  const shown = useMemo(
    () => filterRows(sorted, query, (e) => [e.name, e.event_type, eventDate(e), e.id === activeEventId ? "active" : ""]),
    [sorted, query, activeEventId]
  );
  const current = events.find((e) => e.id === value);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCursor(Math.max(0, sorted.findIndex((e) => e.id === value)));
    const t = setTimeout(() => searchRef.current?.focus(), 0);
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, sorted, value]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor, open]);

  const choose = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0 lg:max-w-xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/[0.1] bg-[#111117] px-4 py-3 text-left transition-colors hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/60"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#6C63FF]/30 bg-[#6C63FF]/10 text-[#A78BFA]">
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-[#71717A]">Event</span>
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-bold text-white sm:text-base">{current?.name ?? "Choose an event"}</span>
            {current && current.id === activeEventId && (
              <span className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                Active
              </span>
            )}
          </span>
          {current && (
            <span className="block truncate text-[11px] text-[#A1A1AA]">
              {eventDate(current)}
              {current.event_type ? ` · ${current.event_type}` : ""}
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#71717A] transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111117] shadow-2xl shadow-black/60">
          <div className="relative border-b border-white/[0.06] p-2">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" aria-hidden="true" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursor(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setCursor((c) => Math.min(shown.length - 1, c + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setCursor((c) => Math.max(0, c - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (shown[cursor]) choose(shown[cursor].id);
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder={`Search ${events.length} events…`}
              aria-label="Search events"
              className="h-10 w-full rounded-xl bg-[#09090E] pl-10 pr-3 text-sm text-white placeholder-[#52525B] focus:outline-none"
            />
          </div>
          <ul ref={listRef} role="listbox" aria-label="Events" className="max-h-[min(60vh,22rem)] overflow-y-auto overscroll-contain p-1.5" data-lenis-prevent>
            {shown.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-[#71717A]">No events match.</li>
            ) : (
              shown.map((ev, i) => {
                const selected = ev.id === value;
                return (
                  <li
                    key={ev.id}
                    role="option"
                    aria-selected={selected}
                    data-index={i}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => choose(ev.id)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === cursor ? "bg-white/[0.06]" : ""}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className={`truncate text-sm ${selected ? "font-bold text-white" : "font-medium text-[#E4E4E7]"}`}>{ev.name}</span>
                        {ev.id === activeEventId && (
                          <span className="shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-emerald-400">Active</span>
                        )}
                      </span>
                      <span className="block truncate text-[11px] text-[#71717A]">
                        {eventDate(ev)}
                        {ev.event_type ? ` · ${ev.event_type}` : ""}
                      </span>
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0 text-[#A78BFA]" aria-hidden="true" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const TILES: {
  id: CertSection;
  label: string;
  icon: typeof Users;
  tone: string;
  count: (c: SectionCounts) => number | null;
  /** null while loading. */
  sub: (c: SectionCounts) => string | null;
}[] = [
  {
    id: "participants",
    label: "Participants",
    icon: Users,
    tone: "text-[#A78BFA] border-[#6C63FF]/30 bg-[#6C63FF]/10",
    count: (c) => c.participants,
    sub: (c) => (c.participationIssued === null ? null : `${c.participationIssued} certificates`),
  },
  {
    id: "top-performers",
    label: "Top Performers",
    icon: Trophy,
    tone: "text-amber-300 border-amber-500/30 bg-amber-500/10",
    count: (c) => c.topPerformers,
    sub: (c) => (c.excellenceIssued === null || c.topPerformers === null ? null : `${c.excellenceIssued} of ${c.topPerformers} issued`),
  },
  {
    id: "organisers",
    label: "Organising Team",
    icon: Award,
    tone: "text-[#C4B5FD] border-[#8B5CF6]/30 bg-[#8B5CF6]/10",
    count: (c) => c.organisers,
    sub: () => "Appreciation",
  },
  {
    id: "volunteers",
    label: "Volunteers",
    icon: HandHeart,
    tone: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
    count: (c) => c.volunteers,
    sub: () => "Volunteering",
  },
];

export function CertificatesHeader({
  events,
  selectedEventId,
  activeEventId,
  onSelectEvent,
  section,
  onSection,
  counts,
  onExportAll,
  exporting,
}: {
  events: readonly DbEvent[];
  selectedEventId: string;
  activeEventId?: string | null;
  onSelectEvent: (id: string) => void;
  section: CertSection;
  onSection: (section: CertSection) => void;
  counts: SectionCounts;
  onExportAll: () => void;
  exporting: boolean;
}) {
  const parts = [counts.participationIssued, counts.excellenceIssued, counts.organisers, counts.volunteers];
  const total = parts.some((n) => n === null) ? null : parts.reduce<number>((sum, n) => sum + (n ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <EventPicker events={events} value={selectedEventId} activeEventId={activeEventId} onChange={onSelectEvent} />
        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <p className="text-xs text-[#A1A1AA]">
            <span className="text-lg font-bold tabular-nums text-white">{total ?? <CountBone className="h-5 w-8" />}</span> certificates issued for this event
          </p>
          <button
            type="button"
            onClick={onExportAll}
            disabled={exporting}
            className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 text-xs font-semibold text-white transition-all hover:bg-white/[0.08] disabled:cursor-wait disabled:opacity-60"
            title="Download every list of this event as one Excel file"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 text-emerald-400" />}
            <span>Export all</span>
          </button>
        </div>
      </div>

      <div role="tablist" aria-label="Certificate lists" className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {TILES.map((tile) => {
          const selected = tile.id === section;
          const Icon = tile.icon;
          const n = tile.count(counts);
          return (
            <button
              key={tile.id}
              type="button"
              role="tab"
              id={`cert-tab-${tile.id}`}
              aria-selected={selected}
              aria-controls={`cert-panel-${tile.id}`}
              onClick={() => onSection(tile.id)}
              className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/60 sm:p-4 ${
                selected ? "border-white/25 bg-white/[0.07] shadow-lg shadow-black/30" : "border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
              }`}
            >
              <span className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:flex ${tile.tone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-medium text-[#A1A1AA] sm:text-xs">{tile.label}</span>
                <span className="block text-xl font-bold tabular-nums leading-tight text-white sm:text-2xl">
                  {n ?? <CountBone className="my-1 h-6 w-10 sm:h-7" />}
                </span>
                <span className="block truncate text-[10px] text-[#71717A] sm:text-[11px]">
                  {tile.sub(counts) ?? <CountBone className="h-2.5 w-20" />}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
