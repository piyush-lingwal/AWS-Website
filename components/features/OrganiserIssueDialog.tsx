"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, Loader2, Plus, Trash2, Upload, Users, X } from "lucide-react";
import { ORGANISER_WINGS, validateOrganiser } from "@/lib/certificates/organiser";
import {
  ORGANISER_TEMPLATE_HEADERS,
  ORGANISER_TEMPLATE_NOTES,
  organiserRowsFromMatrix,
  organiserRowsFromText,
} from "@/lib/certificates/organiser-sheet";

/** Rows per request; must not exceed the API's MAX_ROWS. */
const BATCH_SIZE = 100;

type RowStatus = "ready" | "error" | "issued" | "already_issued";

interface Row {
  fullName: string;
  email: string;
  /** Optional specific role; when blank the certificate uses the wing. */
  role: string;
  wing: string;
}
const emptyRow = (): Row => ({ fullName: "", email: "", role: "", wing: "" });
interface PreviewRow extends Row {
  rowNumber: number;
  status: RowStatus;
  message: string;
}
interface ServerResult {
  rowNumber: number;
  status: "issued" | "already_issued" | "error";
  message: string;
}

function toPreview(rows: Row[]): PreviewRow[] {
  const seen = new Set<string>();
  return rows.map((r, i) => {
    const rowNumber = i + 1;
    const v = validateOrganiser(r);
    if (!v.ok) return { ...r, rowNumber, status: "error", message: v.error };
    if (seen.has(v.value.email)) return { ...r, rowNumber, status: "error", message: "Duplicate email in this list." };
    seen.add(v.value.email);
    return { fullName: v.value.fullName, email: v.value.email, role: v.value.role, wing: v.value.wing ?? "", rowNumber, status: "ready", message: "" };
  });
}

const STATUS_STYLE: Record<RowStatus, string> = {
  ready: "text-emerald-400",
  issued: "text-emerald-400",
  already_issued: "text-amber-300",
  error: "text-red-400",
};
const STATUS_LABEL: Record<RowStatus, string> = {
  ready: "Ready",
  issued: "Issued",
  already_issued: "Already issued",
  error: "Error",
};

export function OrganiserIssueDialog({
  eventId,
  eventName,
  eventHasDate,
  onIssued,
}: {
  eventId: string;
  eventName: string;
  eventHasDate: boolean;
  onIssued?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [manual, setManual] = useState<Row[]>([emptyRow()]);
  const [pasteText, setPasteText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const count = (s: RowStatus) => rows.filter((r) => r.status === s).length;
  const readyCount = count("ready");

  const loadRows = (next: Row[]) => {
    setFinished(false);
    setError("");
    const nonEmpty = next.filter((r) => r.fullName.trim() || r.email.trim() || r.role.trim() || r.wing.trim());
    if (nonEmpty.length === 0) { setRows([]); return; }
    if (nonEmpty.length > BATCH_SIZE) { setRows([]); setError(`Up to ${BATCH_SIZE} people at a time.`); return; }
    setRows(toPreview(nonEmpty));
  };

  const previewManual = () => loadRows(manual);

  const previewPaste = () => {
    // Columns: Name, Email, Role, Wing (an optional header row is matched by name).
    loadRows(organiserRowsFromText(pasteText));
  };

  // A starter sheet: header on the first worksheet, notes and examples on the second.
  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[...ORGANISER_TEMPLATE_HEADERS]]), "Organising Team");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ORGANISER_TEMPLATE_NOTES), "How to fill");
    XLSX.writeFile(wb, "organising-team-template.xlsx");
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError("");
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) { setError("Choose an .xlsx, .xls or .csv file."); return; }
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      if (!sheet) throw new Error("The file has no worksheets.");
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: true, blankrows: false });
      // Columns are matched by header when present, else Name, Email, Role, Wing in that order.
      loadRows(organiserRowsFromMatrix(matrix));
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : "Could not read this file.");
    }
  };

  const issue = async () => {
    const ready = rows.filter((r) => r.status === "ready");
    if (ready.length === 0 || busy) return;
    setBusy(true);
    setError("");
    const byRow = new Map<number, ServerResult>();
    try {
      for (let i = 0; i < ready.length; i += BATCH_SIZE) {
        const batch = ready.slice(i, i + BATCH_SIZE);
        const res = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}/organisers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: batch.map((r) => ({ rowNumber: r.rowNumber, fullName: r.fullName, email: r.email, role: r.role, wing: r.wing })) }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) throw new Error(typeof json?.error === "string" ? json.error : "Issuing failed.");
        for (const r of (json.data?.results ?? []) as ServerResult[]) byRow.set(r.rowNumber, r);
        setRows((prev) => prev.map((row) => {
          const r = byRow.get(row.rowNumber);
          return r ? { ...row, status: r.status, message: r.message } : row;
        }));
      }
      setFinished(true);
      onIssued?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Issuing failed.");
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    if (busy) return;
    setOpen(false);
    setRows([]);
    setManual([emptyRow()]);
    setPasteText("");
    setError("");
    setFinished(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] flex items-center gap-2 transition-all cursor-pointer"
        title="Issue Certificates of Appreciation to the organising team"
      >
        <Users className="w-4 h-4 text-[#A78BFA]" />
        <span className="hidden sm:inline">Organising Team</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto overscroll-contain bg-black/75 p-2 backdrop-blur-sm sm:p-4"
          role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="organiser-issue-title"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="my-auto flex max-h-[95dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0F0F16] shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-4 sm:p-5">
              <div className="min-w-0">
                <h2 id="organiser-issue-title" className="text-lg font-bold text-white">Organising Team certificates</h2>
                <p className="mt-1 truncate text-xs text-[#A1A1AA]">Certificates of Appreciation for <span className="font-medium text-white">{eventName}</span></p>
                <p className="mt-1 text-xs text-[#71717A]">
                  Columns: Name, Email, Role (optional) and Wing ({ORGANISER_WINGS.join(", ")}). A specific role is printed on the certificate as the role.
                  With no role, pick the member&apos;s wing and it reads &ldquo;&lt;Wing&gt; member of the Organising Team&rdquo;.
                </p>
              </div>
              <button type="button" onClick={close} disabled={busy} aria-label="Close" className="rounded-lg p-2 text-[#A1A1AA] hover:bg-white/[0.06] hover:text-white disabled:opacity-40">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="space-y-4 overflow-y-auto p-4 sm:p-5">
              {!eventHasDate ? (
                <p role="alert" className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Set this event&apos;s date before issuing certificates — they show the event date.
                </p>
              ) : (
                <>
                  {/* Manual entry */}
                  <div className="space-y-2">
                    {manual.map((r, i) => (
                      <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1.2fr_1.2fr_1fr_7.5rem_auto]">
                        <input value={r.fullName} onChange={(e) => setManual((m) => m.map((x, j) => j === i ? { ...x, fullName: e.target.value } : x))} placeholder="Full name" className="h-10 rounded-lg border border-white/[0.1] bg-[#09090E] px-3 text-sm text-white placeholder:text-[#52525B] focus:border-[#8B5CF6] focus:outline-none" />
                        <input value={r.email} onChange={(e) => setManual((m) => m.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} placeholder="Email" className="h-10 rounded-lg border border-white/[0.1] bg-[#09090E] px-3 text-sm text-white placeholder:text-[#52525B] focus:border-[#8B5CF6] focus:outline-none" />
                        <input value={r.role} onChange={(e) => setManual((m) => m.map((x, j) => j === i ? { ...x, role: e.target.value } : x))} placeholder="Role (optional)" className="h-10 rounded-lg border border-white/[0.1] bg-[#09090E] px-3 text-sm text-white placeholder:text-[#52525B] focus:border-[#8B5CF6] focus:outline-none" />
                        <select value={r.wing} onChange={(e) => setManual((m) => m.map((x, j) => j === i ? { ...x, wing: e.target.value } : x))} aria-label="Wing" className={`h-10 rounded-lg border border-white/[0.1] bg-[#09090E] px-2 text-sm focus:border-[#8B5CF6] focus:outline-none ${r.wing ? "text-white" : "text-[#52525B]"}`}>
                          <option value="">Wing</option>
                          {ORGANISER_WINGS.map((w) => <option key={w} value={w}>{w}</option>)}
                        </select>
                        <button type="button" onClick={() => setManual((m) => m.length > 1 ? m.filter((_, j) => j !== i) : m)} aria-label="Remove row" className="flex h-10 w-10 items-center justify-center rounded-lg text-[#71717A] hover:bg-red-500/10 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setManual((m) => [...m, emptyRow()])} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 text-xs font-medium text-[#D4D4D8] hover:bg-white/[0.05]">
                        <Plus className="h-3.5 w-3.5" /> Add person
                      </button>
                      <button type="button" onClick={previewManual} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 text-xs font-medium text-[#D4D4D8] hover:bg-white/[0.05]">
                        Preview
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#8B5CF6]/90 px-3 text-xs font-semibold text-white hover:bg-[#8B5CF6]">
                        <Upload className="h-3.5 w-3.5" /> Upload sheet
                      </button>
                      <button type="button" onClick={() => void downloadTemplate()} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 text-xs font-medium text-[#D4D4D8] hover:bg-white/[0.05]">
                        <Download className="h-3.5 w-3.5" /> Download template
                      </button>
                      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { void handleFile(e.target.files?.[0]); e.currentTarget.value = ""; }} />
                    </div>
                  </div>

                  {/* Paste */}
                  <div className="space-y-2">
                    <label htmlFor="organiser-paste" className="block text-xs font-semibold text-[#D4D4D8]">Or paste rows (Name, Email, Role, Wing)</label>
                    <textarea id="organiser-paste" value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={3} placeholder={"Name\tEmail\tRole\tWing"} className="w-full rounded-xl border border-white/[0.1] bg-[#09090E] p-3 font-mono text-xs text-white placeholder:text-[#52525B] focus:border-[#8B5CF6] focus:outline-none" />
                    <button type="button" onClick={previewPaste} disabled={!pasteText.trim()} className="h-8 rounded-lg border border-white/[0.1] px-3 text-xs font-medium text-[#D4D4D8] hover:bg-white/[0.05] disabled:opacity-40">Preview pasted rows</button>
                  </div>
                </>
              )}

              {error && <p role="alert" className="flex items-start gap-2 text-xs text-red-400"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}</p>}

              {rows.length > 0 && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-[#A1A1AA]">
                      {finished ? `${count("issued")} issued, ${count("already_issued")} already issued, ${count("error")} errors` : `${readyCount} ready, ${count("error")} errors`}
                    </p>
                    <button type="button" onClick={() => void issue()} disabled={readyCount === 0 || busy || finished} className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-45">
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {busy ? "Issuing…" : finished ? "Done" : `Issue ${readyCount} ${readyCount === 1 ? "certificate" : "certificates"}`}
                    </button>
                  </div>
                  <div className="max-w-full overflow-x-auto rounded-xl border border-white/[0.08]">
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-[#71717A]">
                        <tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Role</th><th className="px-3 py-2">Wing</th><th className="px-3 py-2">Status</th></tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {rows.map((row) => (
                          <tr key={row.rowNumber} className="text-[#D4D4D8]">
                            <td className="px-3 py-2">{row.fullName}</td>
                            <td className="px-3 py-2">{row.email}</td>
                            <td className="px-3 py-2">{row.role || <span className="text-[#52525B]">-</span>}</td>
                            <td className="px-3 py-2">{row.wing || <span className="text-[#52525B]">-</span>}</td>
                            <td className={`px-3 py-2 ${STATUS_STYLE[row.status]}`}>{STATUS_LABEL[row.status]}{row.message ? `: ${row.message}` : ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
