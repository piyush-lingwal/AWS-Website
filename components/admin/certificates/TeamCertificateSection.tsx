"use client";

// ============================================================
// A per-event list of team certificates (Organising Team, Volunteers)
// ============================================================
//
// Loads the chosen event's certificates from `listUrl`, and gives the list the
// same tools as every other list in the Certificates tab: search, row numbers,
// add (dialog), export CSV, download one, remove one, and Delete all (confirmed twice).
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteAllButton } from "@/components/admin/DeleteAllButton";
import { CardsSkeleton, TableRowsSkeleton } from "@/components/admin/Skeletons";
import { ExportButton, SearchField, SectionHeading } from "@/components/admin/certificates/ListControls";
import { exportFileName } from "@/lib/admin/export-rows";
import { filterRows } from "@/lib/admin/list-search";

export interface TeamRow {
  certificateId: string;
  fullName: string;
  email: string;
  issueDate: string;
}

export interface TeamColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "create" | "danger" | "info";
  onConfirm: () => void | Promise<void>;
}

function formatIssued(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function TeamCertificateSection<T extends TeamRow>({
  eventId,
  eventName,
  title,
  description,
  listUrl,
  listKey,
  deleteUrl,
  bulkSection,
  noun,
  renderAdd,
  columns,
  mobileDetail,
  searchFields,
  searchPlaceholder,
  exportRows,
  exportKind,
  emptyText,
  linkClass,
  confirm,
  onCountChange,
}: {
  eventId: string;
  eventName: string;
  title: string;
  description: ReactNode;
  /** GET returns { data: { [listKey]: T[] } }. */
  listUrl: string;
  listKey: string;
  /** DELETE url for one certificate. */
  deleteUrl: (certificateId: string) => string;
  bulkSection: "organisers" | "volunteers";
  /** Plural, lower case: "members", "volunteers". */
  noun: string;
  renderAdd: (reload: () => Promise<void>) => ReactNode;
  /** Extra columns between the name and the certificate ID. */
  columns: TeamColumn<T>[];
  /** Extra line under the name on phones. */
  mobileDetail?: (row: T) => ReactNode;
  searchFields: (row: T) => readonly unknown[];
  searchPlaceholder: string;
  exportRows: (rows: T[], origin: string) => Record<string, string>[];
  exportKind: string;
  emptyText: string;
  /** Text colour of the certificate ID links. */
  linkClass: string;
  confirm: (options: ConfirmOptions) => void;
  onCountChange?: (count: number | null) => void;
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const currentUrl = useRef(listUrl);
  currentUrl.current = listUrl;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(listUrl, { cache: "no-store" });
      const json = await res.json();
      // The admin may have switched events while this was loading: drop the stale answer.
      if (currentUrl.current !== listUrl) return;
      const list = json.success && Array.isArray(json.data?.[listKey]) ? (json.data[listKey] as T[]) : [];
      setRows(list);
    } catch (err) {
      console.error(`Failed to load ${listKey}:`, err);
      if (currentUrl.current === listUrl) setRows([]);
    } finally {
      if (currentUrl.current === listUrl) setLoading(false);
    }
  }, [listUrl, listKey]);

  useEffect(() => {
    setRows([]);
    setQuery("");
    void load();
  }, [load]);

  useEffect(() => {
    onCountChange?.(loading ? null : rows.length);
  }, [loading, rows.length, onCountChange]);

  const shown = useMemo(() => filterRows(rows, query, searchFields), [rows, query, searchFields]);

  const deleteOne = async (certificateId: string) => {
    const res = await fetch(deleteUrl(certificateId), { method: "DELETE" });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) throw new Error(json?.error || "Could not remove the certificate.");
  };

  const revoke = (row: T) => {
    confirm({
      title: "Remove certificate",
      message: `Remove the certificate issued to "${row.fullName}"? It and its verification link will stop working.`,
      confirmLabel: "Remove",
      variant: "danger",
      onConfirm: async () => {
        setBusyId(row.certificateId);
        try {
          await deleteOne(row.certificateId);
          toast.success(`Removed ${row.fullName}'s certificate.`);
          await load();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not remove the certificate.");
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const exportCsv = async () => {
    if (shown.length === 0) return;
    const Papa = (await import("papaparse")).default;
    const csv = Papa.unparse(exportRows(shown, window.location.origin));
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", exportFileName(eventName, exportKind));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(query.trim() ? `Exported ${shown.length} matching rows` : `Exported ${shown.length} rows`);
  };

  const colSpan = columns.length + 4;

  return (
    <section className="space-y-4">
      <SectionHeading title={title} description={description}>
        {renderAdd(load)}
        <ExportButton onClick={exportCsv} disabled={loading || shown.length === 0} label={query.trim() ? "Export matches" : "Export"} />
        <DeleteAllButton
          section={bulkSection}
          noun={`${noun}' certificates`}
          count={rows.length}
          eventId={eventId}
          scope={`for "${eventName}"`}
          disabled={loading}
          consequences="Their verification links stop working. Participants and other certificates are kept."
          onDeleted={load}
        />
      </SectionHeading>

      <SearchField value={query} onChange={setQuery} placeholder={searchPlaceholder} shown={shown.length} total={rows.length} />

      {/* Phones: one card per person */}
      <div className="md:hidden">
        {loading ? (
          <CardsSkeleton count={3} label={`Loading ${title}`} />
        ) : shown.length === 0 ? (
          <p className="rounded-2xl border border-white/[0.08] px-4 py-8 text-center text-xs text-[#71717A]">
            {rows.length === 0 ? emptyText : "Nobody matches this search."}
          </p>
        ) : (
          <ul className="space-y-3">
            {shown.map((row, i) => (
              <li key={`m-${row.certificateId}`} className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      <span className="mr-1.5 font-mono text-[11px] text-[#52525B]">{i + 1}.</span>
                      {row.fullName}
                    </p>
                    {row.email && <p className="truncate font-mono text-[11px] text-[#71717A]">{row.email}</p>}
                    {mobileDetail && <div className="mt-1 text-[11px] text-[#A1A1AA]">{mobileDetail(row)}</div>}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/verify/${row.certificateId}`} target="_blank" className={`flex min-h-10 items-center truncate font-mono text-xs ${linkClass}`}>
                    {row.certificateId}
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={`/api/certificates/${row.certificateId}`}
                      download={`${row.certificateId}.pdf`}
                      aria-label={`Download certificate ${row.certificateId}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[#A1A1AA]"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => revoke(row)}
                      disabled={busyId === row.certificateId}
                      aria-label={`Remove certificate ${row.certificateId}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[#71717A] disabled:opacity-40"
                    >
                      {busyId === row.certificateId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hidden max-h-[70vh] max-w-full overflow-auto rounded-2xl border border-white/[0.08] md:block">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#13131a] text-[10px] uppercase tracking-wider text-[#71717A]">
            <tr>
              <th className="w-12 px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              {columns.map((c) => (
                <th key={c.header} className="px-4 py-3">{c.header}</th>
              ))}
              <th className="px-4 py-3">Certificate ID</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {loading ? (
              <TableRowsSkeleton rows={4} columns={colSpan} label={`Loading ${title}`} />
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center text-[#71717A]">
                  {rows.length === 0 ? emptyText : "Nobody matches this search."}
                </td>
              </tr>
            ) : (
              shown.map((row, i) => (
                <tr key={row.certificateId} className="text-[#D4D4D8] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[11px] tabular-nums text-[#52525B]">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="block font-semibold text-white">{row.fullName}</span>
                    {row.email && <span className="font-mono text-[10px] text-[#71717A]">{row.email}</span>}
                  </td>
                  {columns.map((c) => (
                    <td key={c.header} className="px-4 py-3">{c.cell(row)}</td>
                  ))}
                  <td className="px-4 py-3">
                    <Link href={`/verify/${row.certificateId}`} target="_blank" className={`font-mono text-[11px] hover:underline ${linkClass}`}>
                      {row.certificateId}
                    </Link>
                    <span className="block font-mono text-[10px] text-[#52525B]">{formatIssued(row.issueDate)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`/api/certificates/${row.certificateId}`}
                        download={`${row.certificateId}.pdf`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[#A1A1AA] transition-colors hover:bg-white/[0.08] hover:text-white"
                        title="Download PDF"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => revoke(row)}
                        disabled={busyId === row.certificateId}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[#71717A] transition-colors hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-40"
                        title="Remove certificate"
                      >
                        {busyId === row.certificateId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
