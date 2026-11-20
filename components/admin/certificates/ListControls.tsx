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
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sbg-ink-3" aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="h-10 w-full rounded-xl border border-sbg-ink/[0.12] bg-white pl-10 pr-9 text-xs text-sbg-ink placeholder:text-sbg-ink-3 transition-colors focus:border-sbg-lilac-600 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-sbg-ink-3 hover:bg-sbg-lilac-100 hover:text-sbg-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="shrink-0 text-[11px] tabular-nums text-sbg-ink-3" aria-live="polite">
        {value.trim() ? `${shown} of ${total} match` : `${total} total`}
      </p>
    </div>
  );
}

export const TOOLBAR_BUTTON =
  "ad-btn ad-btn-ghost text-xs";

export function ExportButton({ onClick, disabled, label = "Export" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={TOOLBAR_BUTTON} title={`${label} to CSV`}>
      <FileSpreadsheet className="h-4 w-4 text-[#047857]" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

/** Section heading used by every list in the tab. */
export function SectionHeading({ title, description, children }: { title: string; description: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h2 className="font-lt-display text-lg font-semibold tracking-[-0.035em] text-sbg-ink sm:text-xl">{title}</h2>
        <p className="mt-1 text-xs text-sbg-ink-3">{description}</p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
