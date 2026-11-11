"use client";

import { useRef, useState } from "react";
import { AlertCircle, Award, CheckCircle2, Download, HandHeart, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { PORTAL_COURSES } from "@/lib/attendance/import";
import {
  VOLUNTEER_TEMPLATE_HEADERS,
  VOLUNTEER_TEMPLATE_NOTES,
  validateVolunteer,
  volunteerRowsFromMatrix,
  volunteerRowsFromText,
} from "@/lib/certificates/volunteer";

/** Rows per request; must not exceed the API's MAX_ROWS. */
const BATCH_SIZE = 100;

type RowStatus = "ready" | "error" | "issued" | "already_issued";

interface Row {
  fullName: string;
  collegeId: string;
  email: string;
  course: string;
}
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

const emptyRow = (): Row => ({ fullName: "", collegeId: "", email: "", course: "" });

function toPreview(rows: Row[]): PreviewRow[] {
  const seen = new Set<string>();
  return rows.map((r, i) => {
    const rowNumber = i + 1;
    const v = validateVolunteer(r);
    if (!v.ok) return { ...r, rowNumber, status: "error", message: v.error };
    if (seen.has(v.value.email)) return { ...r, rowNumber, status: "error", message: "Duplicate email in this list." };
    seen.add(v.value.email);
    return { ...v.value, rowNumber, status: "ready", message: "" };
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

const INPUT =
  "h-10 rounded-lg border border-white/[0.1] bg-[#09090E] px-3 text-sm text-white placeholder:text-[#52525B] focus:border-[#8B5CF6] focus:outline-none";

export function VolunteerIssueDialog({
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
  // The list of people to generate for appears below the inputs; bring it into view.
  const resultsRef = useRef<HTMLDivElement>(null);

  const count = (s: RowStatus) => rows.filter((r) => r.status === s).length;
  const readyCount = count("ready");

  const loadRows = (next: Row[]) => {
    setFinished(false);
    setError("");
    const nonEmpty = next.filter((r) => r.fullName.trim() || r.collegeId.trim() || r.email.trim() || r.course.trim());
    if (nonEmpty.length === 0) { setRows([]); return; }
    if (nonEmpty.length > BATCH_SIZE) { setRows([]); setError(`Up to ${BATCH_SIZE} people at a time.`); return; }
    setRows(toPreview(nonEmpty));
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const previewPaste = () => loadRows(volunteerRowsFromText(pasteText));

  // A starter sheet: header on the first worksheet, notes and an example on the second.
  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[...VOLUNTEER_TEMPLATE_HEADERS]]), "Volunteers");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(VOLUNTEER_TEMPLATE_NOTES), "How to fill");
    XLSX.writeFile(wb, "volunteers-template.xlsx");
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
      loadRows(volunteerRowsFromMatrix(matrix));
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
        const res = await fetch(`/api/admin/events/${encodeURIComponent(eventId)}/volunteers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: batch.map((r) => ({ rowNumber: r.rowNumber, fullName: r.fullName, collegeId: r.collegeId, email: r.email, course: r.course })) }),
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
        title="Issue Certificates of Volunteering"
      >
        <HandHeart className="w-4 h-4 text-[#34D399]" />
        <span className="hidden sm:inline">Add Volunteers</span>
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
            aria-labelledby="volunteer-issue-title"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="my-auto flex max-h-[95dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0F0F16] shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-4 sm:p-5">
              <div className="min-w-0">
                <h2 id="volunteer-issue-title" className="text-lg font-bold text-white">Add volunteers</h2>
                <p className="mt-1 truncate text-xs text-[#A1A1AA]">Certificates of Volunteering for <span className="font-medium text-white">{eventName}</span></p>
                <p className="mt-1 text-xs text-[#71717A]">Enter Name, College ID, Email Address and Course, or upload / paste a sheet with those four columns. Each volunteer gets a certificate for this event only.</p>
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
                  <div className="space-y-2">
                    <datalist id="volunteer-courses">
                      {PORTAL_COURSES.map((c) => <option key={c} value={c} />)}
                    </datalist>
                    {manual.map((r, i) => (
                      <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1.2fr_0.8fr_1.3fr_0.8fr_auto]">
                        <input value={r.fullName} onChange={(e) => setManual((m) => m.map((x, j) => j === i ? { ...x, fullName: e.target.value } : x))} placeholder="Name" aria-label="Name" className={INPUT} />
                        <input value={r.collegeId} onChange={(e) => setManual((m) => m.map((x, j) => j === i ? { ...x, collegeId: e.target.value } : x))} placeholder="College ID" aria-label="College ID" inputMode="numeric" className={INPUT} />
                        <input value={r.email} onChange={(e) => setManual((m) => m.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} placeholder="Email Address" aria-label="Email Address" type="email" className={INPUT} />
                        <input value={r.course} onChange={(e) => setManual((m) => m.map((x, j) => j === i ? { ...x, course: e.target.value } : x))} placeholder="Course" aria-label="Course" list="volunteer-courses" className={INPUT} />
                        <button type="button" onClick={() => setManual((m) => m.length > 1 ? m.filter((_, j) => j !== i) : m)} aria-label="Remove row" className="flex h-10 w-10 items-center justify-center rounded-lg text-[#71717A] hover:bg-red-500/10 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setManual((m) => [...m, emptyRow()])} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 text-xs font-medium text-[#D4D4D8] hover:bg-white/[0.05]">
                        <Plus className="h-3.5 w-3.5" /> Add person
                      </button>
                      <button type="button" onClick={() => loadRows(manual)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-500">
                        <Award className="h-3.5 w-3.5" /> Generate certificates
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

                  <div className="space-y-2">
                    <label htmlFor="volunteer-paste" className="block text-xs font-semibold text-[#D4D4D8]">Or paste rows (Name, College ID, Email Address, Course)</label>
                    <textarea id="volunteer-paste" value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={3} placeholder={"Name\tCollege ID\tEmail Address\tCourse"} className="w-full rounded-xl border border-white/[0.1] bg-[#09090E] p-3 font-mono text-xs text-white placeholder:text-[#52525B] focus:border-[#8B5CF6] focus:outline-none" />
                    <button type="button" onClick={previewPaste} disabled={!pasteText.trim()} className="h-8 rounded-lg border border-white/[0.1] px-3 text-xs font-medium text-[#D4D4D8] hover:bg-white/[0.05] disabled:opacity-40">Generate from pasted rows</button>
                  </div>
                </>
              )}

              {error && <p role="alert" className="flex items-start gap-2 text-xs text-red-400"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}</p>}

              {rows.length > 0 && (
                <div ref={resultsRef} className="scroll-mt-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-[#A1A1AA]">
                      {finished
                        ? `${count("issued")} generated, ${count("already_issued")} already had one, ${count("error")} errors`
                        : `${readyCount} ready to generate${count("error") ? `, ${count("error")} need fixing` : ""}. Check the list, then confirm.`}
                    </p>
                    <button type="button" onClick={() => void issue()} disabled={readyCount === 0 || busy || finished} className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-45">
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {busy ? "Generating…" : finished ? "Certificates generated" : `Confirm & generate ${readyCount} ${readyCount === 1 ? "certificate" : "certificates"}`}
                    </button>
                  </div>
                  <div className="max-w-full overflow-x-auto rounded-xl border border-white/[0.08]">
                    <table className="w-full min-w-[640px] text-left text-xs">
                      <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-[#71717A]">
                        <tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">College ID</th><th className="px-3 py-2">Email Address</th><th className="px-3 py-2">Course</th><th className="px-3 py-2">Status</th></tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {rows.map((row) => (
                          <tr key={row.rowNumber} className="text-[#D4D4D8]">
                            <td className="px-3 py-2">{row.fullName}</td>
                            <td className="px-3 py-2 font-mono">{row.collegeId}</td>
                            <td className="px-3 py-2">{row.email}</td>
                            <td className="px-3 py-2">{row.course}</td>
                            <td className={`px-3 py-2 ${STATUS_STYLE[row.status]}`}>{STATUS_LABEL[row.status]}{row.message ? `: ${row.message}` : ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
