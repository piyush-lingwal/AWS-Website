"use client";

// ============================================================
// Small controls shared by every list in the Certificates tab:
// search box, export button and section heading.
// ============================================================

import { FileSpreadsheet, Search, X } from "lucide-react";

export function SearchField({
  value,
  onChange,
  placeholder,
  shown,
  total,
  label = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Rows that match, and rows in the list, for the "12 of 120" count. */
  shown: number;
  total: number;
  label?: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <div className="relative min-w-0 flex-1 sm:max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#111117] pl-10 pr-9 text-xs text-white placeholder-[#52525B] transition-colors focus:border-[#6C63FF] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-[#71717A] hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="shrink-0 text-[11px] tabular-nums text-[#71717A]" aria-live="polite">
        {value.trim() ? `${shown} of ${total} match` : `${total} total`}
      </p>
    </div>
  );
}

export const TOOLBAR_BUTTON =
  "inline-flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 text-xs font-semibold text-white transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40";

export function ExportButton({ onClick, disabled, label = "Export" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={TOOLBAR_BUTTON} title={`${label} to CSV`}>
      <FileSpreadsheet className="h-4 w-4 text-emerald-400" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

/** Section heading used by every list in the tab. */
export function SectionHeading({ title, description, children }: { title: string; description: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h2>
        <p className="mt-1 text-xs text-[#71717A]">{description}</p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
