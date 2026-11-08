"use client";

// ============================================================
// Volunteers section of the admin Registrations tab
// ============================================================
//
// Certificates of Volunteering for ONE event: add (dialog), list, download,
// remove one, export CSV, and Delete all (confirmed twice). Switching the event
// switches the list. Volunteers are only ever read and written through
// /api/admin/events/[id]/volunteers, so they cannot mix with other events.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, HandHeart, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { VolunteerIssueDialog } from "@/components/features/VolunteerIssueDialog";
import { DeleteAllButton } from "@/components/admin/DeleteAllButton";
import { exportFileName, volunteerExportRows } from "@/lib/admin/export-rows";

interface VolunteerCertRow {
  certificateId: string;
  fullName: string;
  collegeId: string;
  email: string;
  course: string;
  issueDate: string;
}

interface ConfirmOptions {
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

export function VolunteerSection({
  eventId,
  eventName,
  eventHasDate,
  confirm,
}: {
  eventId: string;
  eventName: string;
  eventHasDate: boolean;
  /** The admin page's confirmation modal. */
  confirm: (options: ConfirmOptions) => void;
}) {
  const [volunteers, setVolunteers] = useState<VolunteerCertRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const currentEvent = useRef(eventId);
  currentEvent.current = eventId;

  const load = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/volunteers`, { cache: "no-store" });
      const json = await res.json();
      // The admin may have switched events while this was loading: drop the stale answer.
      if (currentEvent.current !== eventId) return;
      setVolunteers(json.success && Array.isArray(json.data?.volunteers) ? json.data.volunteers : []);
    } catch (err) {
      console.error("Failed to load volunteer certificates:", err);
      if (currentEvent.current === eventId) setVolunteers([]);
    } finally {
      if (currentEvent.current === eventId) setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    // Clear first so a slow response for the previous event never shows under this one.
    setVolunteers([]);
    void load();
  }, [load]);

  const revoke = (cert: VolunteerCertRow) => {
    confirm({
      title: "Remove certificate",
      message: `Remove the Certificate of Volunteering issued to "${cert.fullName}"? The certificate and its verification link will stop working.`,
      confirmLabel: "Remove",
      variant: "danger",
      onConfirm: async () => {
        setDeletingId(cert.certificateId);
        try {
          const res = await fetch(
            `/api/admin/events/${eventId}/volunteers?certificateId=${encodeURIComponent(cert.certificateId)}`,
            { method: "DELETE" }
          );
          const json = await res.json();
          if (!res.ok || !json.success) throw new Error(json.error || "Could not remove the certificate.");
          toast.success(`Removed ${cert.fullName}'s certificate.`);
          await load();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not remove the certificate.");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const exportCsv = async () => {
    if (volunteers.length === 0) {
      toast.error("No volunteer certificates to export");
      return;
    }
    const Papa = (await import("papaparse")).default;
    const csv = Papa.unparse(volunteerExportRows(volunteers, window.location.origin));
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", exportFileName(eventName, "Volunteers"));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Volunteers exported to CSV");
  };

  return (
    <section className="space-y-5 pt-8 border-t border-white/[0.08]">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono uppercase tracking-wider text-emerald-300 mb-2">
            <HandHeart className="w-3 h-3" />
            <span>Volunteers</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Certificates of Volunteering</h2>
          <p className="text-xs text-[#71717A] mt-1">
            Volunteers of <span className="text-emerald-300">{eventName}</span>. Each certificate is for this event only.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start">
          <span className="text-xs font-mono text-emerald-300 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] whitespace-nowrap">
            {volunteers.length} issued
          </span>
          <VolunteerIssueDialog key={eventId} eventId={eventId} eventName={eventName} eventHasDate={eventHasDate} onIssued={load} />
          <button
            type="button"
            onClick={exportCsv}
            disabled={loading || volunteers.length === 0}
            className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 text-xs font-semibold text-white transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            title="Export Volunteers to CSV"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <DeleteAllButton
            section="volunteers"
            noun="volunteer certificates"
            count={volunteers.length}
            eventId={eventId}
            scope={`for "${eventName}"`}
            disabled={loading}
            consequences="Those certificate links stop verifying. Registrations and other certificates are kept."
            onDeleted={load}
          />
        </div>
      </div>

      {/* Phones: one card per volunteer (a 4-column table cannot fit) */}
      <div className="md:hidden">
        {loading || volunteers.length === 0 ? (
          <p className="rounded-2xl border border-white/[0.08] px-4 py-8 text-center text-xs text-[#71717A]">
            {loading ? "Loading volunteers…" : "No volunteers added for this event yet."}
          </p>
        ) : (
          <ul className="space-y-3">
            {volunteers.map((v) => (
              <li key={`m-${v.certificateId}`} className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{v.fullName}</p>
                  {v.email && <p className="truncate font-mono text-[11px] text-[#71717A]">{v.email}</p>}
                  <p className="mt-1 text-[11px] text-[#A1A1AA]">
                    {[v.collegeId && `ID ${v.collegeId}`, v.course].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/verify/${v.certificateId}`} target="_blank" className="flex min-h-10 items-center truncate font-mono text-xs text-emerald-300">
                    {v.certificateId}
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={`/api/certificates/${v.certificateId}`}
                      download={`${v.certificateId}.pdf`}
                      aria-label={`Download certificate ${v.certificateId}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[#A1A1AA]"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => revoke(v)}
                      disabled={deletingId === v.certificateId}
                      aria-label={`Remove certificate ${v.certificateId}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[#71717A] disabled:opacity-40"
                    >
                      {deletingId === v.certificateId ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border border-red-400/30 border-t-red-400" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hidden max-w-full overflow-x-auto rounded-2xl border border-white/[0.08] md:block">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-[#71717A]">
            <tr>
              <th className="px-4 py-3">Volunteer</th>
              <th className="px-4 py-3">College ID</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Certificate ID</th>
              <th className="px-4 py-3">Issued</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#71717A]">
                  <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading volunteers…</span>
                </td>
              </tr>
            ) : volunteers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#71717A]">No volunteers added for this event yet.</td>
              </tr>
            ) : (
              volunteers.map((v) => (
                <tr key={v.certificateId} className="text-[#D4D4D8] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <span className="block font-semibold text-white">{v.fullName}</span>
                    {v.email && <span className="text-[10px] text-[#71717A] font-mono">{v.email}</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#A1A1AA]">{v.collegeId || "—"}</td>
                  <td className="px-4 py-3 text-[#D4D4D8]">{v.course || "—"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/verify/${v.certificateId}`} target="_blank" className="font-mono text-[11px] text-emerald-300 hover:underline">
                      {v.certificateId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#71717A] whitespace-nowrap">{formatIssued(v.issueDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`/api/certificates/${v.certificateId}`}
                        download={`${v.certificateId}.pdf`}
                        className="h-7 w-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[#A1A1AA] hover:text-white border border-white/[0.06] flex items-center justify-center transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => revoke(v)}
                        disabled={deletingId === v.certificateId}
                        className="h-7 w-7 rounded-lg bg-white/[0.03] hover:bg-red-500/20 text-[#71717A] hover:text-red-400 border border-white/[0.06] hover:border-red-500/30 flex items-center justify-center transition-colors disabled:opacity-40"
                        title="Remove certificate"
                      >
                        {deletingId === v.certificateId ? (
                          <div className="w-3 h-3 rounded-full border border-red-400/30 border-t-red-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
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
