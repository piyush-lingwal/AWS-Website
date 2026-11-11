"use client";

// ============================================================
// Loading skeletons for the admin panel
// ============================================================
//
// Grey placeholder blocks in the shape of what is loading (tiles, table rows,
// cards), with a shimmer (.admin-skeleton in app/globals.css). Each loading area
// is announced once to screen readers ("Loading participants"), and the blocks
// themselves are hidden from them.
// ============================================================

import type { ReactNode } from "react";

/** One placeholder block. Size and shape come from className. */
export function Bone({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`admin-skeleton block rounded-md ${className}`} />;
}

/** A loading number inside text (counts, totals). */
export function CountBone({ className = "h-6 w-10" }: { className?: string }) {
  return <Bone className={`inline-block align-middle ${className}`} />;
}

function Loading({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}

// Varying widths so the rows do not look like a barcode.
const NAME_WIDTHS = ["w-40", "w-32", "w-44", "w-28", "w-36", "w-48"];
const SUB_WIDTHS = ["w-24", "w-20", "w-28", "w-16", "w-24", "w-20"];

/** The whole admin page while its first data loads. */
export function AdminPageSkeleton({ label = "Loading the admin panel" }: { label?: string }) {
  return (
    <Loading label={label} className="space-y-6">
      <div className="space-y-2">
        <Bone className="h-7 w-44" />
        <Bone className="h-3 w-72 max-w-full" />
      </div>
      <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 sm:p-6">
        <Bone className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Bone className="h-3 w-24" />
          <Bone className="h-6 w-64 max-w-full" />
          <Bone className="h-3 w-40" />
        </div>
        <Bone className="hidden h-9 w-32 shrink-0 rounded-xl sm:block" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5">
            <Bone className="h-3 w-20" />
            <Bone className="mt-3 h-7 w-14" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
            <Bone className="h-4 w-32" />
            <Bone className="h-10 w-full rounded-xl" />
            <Bone className="h-10 w-full rounded-xl" />
            <Bone className="h-10 w-3/4 rounded-xl" />
          </div>
        ))}
      </div>
    </Loading>
  );
}

/** A list of people while it loads: cards on phones, table-like rows from md up. */
export function ListSkeleton({ rows = 6, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <Loading label={label}>
      <ul className="divide-y divide-white/[0.05] md:hidden" aria-hidden="true">
        {Array.from({ length: Math.min(rows, 4) }, (_, i) => (
          <li key={i} className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <Bone className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Bone className={`h-3.5 ${NAME_WIDTHS[i % NAME_WIDTHS.length]}`} />
                <Bone className={`h-3 ${SUB_WIDTHS[i % SUB_WIDTHS.length]}`} />
              </div>
            </div>
            <Bone className="h-10 w-full rounded-lg" />
          </li>
        ))}
      </ul>
      <div className="hidden md:block" aria-hidden="true">
        <div className="flex items-center gap-6 border-b border-white/[0.06] bg-[#13131a] px-5 py-3.5">
          {["w-6", "w-24", "w-20", "w-28", "w-20", "w-24"].map((w, i) => (
            <Bone key={i} className={`h-2.5 ${w}`} />
          ))}
        </div>
        <div className="divide-y divide-white/[0.04]">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex items-center gap-6 px-5 py-4" style={{ opacity: 1 - i * (0.6 / rows) }}>
              <Bone className="h-3 w-6" />
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Bone className="h-8 w-8 shrink-0 rounded-full" />
                <div className="space-y-1.5">
                  <Bone className={`h-3.5 ${NAME_WIDTHS[i % NAME_WIDTHS.length]}`} />
                  <Bone className={`h-2.5 ${SUB_WIDTHS[i % SUB_WIDTHS.length]}`} />
                </div>
              </div>
              <Bone className="h-3 w-36" />
              <Bone className="h-6 w-16 rounded-lg" />
              <Bone className="h-3 w-24" />
              <div className="flex gap-1.5">
                <Bone className="h-7 w-7 rounded-lg" />
                <Bone className="h-7 w-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Loading>
  );
}

/** Rows for inside an existing <tbody>. The first cell carries the screen-reader label. */
export function TableRowsSkeleton({ rows = 4, columns, label = "Loading" }: { rows?: number; columns: number; label?: string }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} aria-busy="true" style={{ opacity: 1 - r * (0.55 / rows) }}>
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className="px-4 py-3.5">
              {r === 0 && c === 0 && (
                <span role="status" className="sr-only">
                  {label}…
                </span>
              )}
              {c === 0 ? (
                <Bone className="h-3 w-8" />
              ) : c === 1 ? (
                <div className="space-y-1.5">
                  <Bone className={`h-3.5 ${NAME_WIDTHS[r % NAME_WIDTHS.length]}`} />
                  <Bone className={`h-2.5 ${SUB_WIDTHS[r % SUB_WIDTHS.length]}`} />
                </div>
              ) : c === columns - 1 ? (
                <div className="flex justify-end gap-1.5">
                  <Bone className="h-7 w-7 rounded-lg" />
                  <Bone className="h-7 w-7 rounded-lg" />
                </div>
              ) : (
                <Bone className={`h-3 ${SUB_WIDTHS[(r + c) % SUB_WIDTHS.length]}`} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Stacked cards (phone layout of a list) while it loads. */
export function CardsSkeleton({ count = 3, label = "Loading" }: { count?: number; label?: string }) {
  return (
    <Loading label={label} className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4" aria-hidden="true">
          <div className="space-y-2">
            <Bone className="h-3 w-20" />
            <Bone className={`h-4 ${NAME_WIDTHS[i % NAME_WIDTHS.length]}`} />
            <Bone className={`h-3 ${SUB_WIDTHS[i % SUB_WIDTHS.length]}`} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Bone className="h-3 w-36" />
            <div className="flex gap-2">
              <Bone className="h-10 w-10 rounded-lg" />
              <Bone className="h-10 w-10 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </Loading>
  );
}

/** Team members: a batch bar and a grid of member cards. */
export function TeamGridSkeleton({ label = "Loading the team" }: { label?: string }) {
  return (
    <Loading label={label} className="space-y-4">
      <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.015] p-4 sm:p-5" aria-hidden="true">
        <Bone className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="space-y-2">
          <Bone className="h-4 w-32" />
          <Bone className="h-3 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4">
            <Bone className="h-12 w-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className={`h-3.5 ${NAME_WIDTHS[i % NAME_WIDTHS.length]} max-w-full`} />
              <Bone className={`h-3 ${SUB_WIDTHS[i % SUB_WIDTHS.length]}`} />
            </div>
          </div>
        ))}
      </div>
    </Loading>
  );
}
