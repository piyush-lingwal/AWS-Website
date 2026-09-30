"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/client";
import type { DbEvent, DbPortalConfig, AdminParticipantRow } from "@/types/certificate";
import {
  Award,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Edit3,
  ExternalLink,
  Search,
  Download,
  Send,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Sparkles,
  ShieldCheck,
  Radio,
  FileSpreadsheet,
  X,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────
function formatDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "ST";
}

// ── Main Admin Page ───────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [portalConfig, setPortalConfig] = useState<DbPortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Modal / Form state
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DbEvent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventDate: "",
    eventTiming: "",
    speakerName: "",
    attendanceOpen: true,
    setAsActive: false,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Section B — Participant inspection state
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [inspectingEventId, setInspectingEventId] = useState<string | null>(null);
  const attendeesSectionRef = useRef<HTMLElement | null>(null);
  const [participants, setParticipants] = useState<AdminParticipantRow[]>([]);
  const [totalAttended, setTotalAttended] = useState<number>(0);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("ALL");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ── Data Fetching ─────────────────────────────────────────
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [eventsRes, configRes] = await Promise.all([
        fetch("/api/admin/events", { cache: "no-store" }),
        fetch("/api/admin/portal-config", { cache: "no-store" }),
      ]);

      const eventsData = await eventsRes.json();
      const configData = await configRes.json();

      if (eventsData.success) {
        const loadedEvents: DbEvent[] = eventsData.data || [];
        setEvents(loadedEvents);
      }
      if (configData.success) setPortalConfig(configData.data || null);

      if (isRefresh) toast.success("Dashboard data refreshed");
    } catch (e: any) {
      setError("Failed to load dashboard data: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Fetch Participants for Selected Event ──────────────────
  const fetchParticipants = useCallback(async (eventId: string) => {
    if (!eventId) return;
    setLoadingParticipants(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/participants`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setParticipants(json.data.participants || []);
        setTotalAttended(json.data.totalCount || 0);
      } else {
        setParticipants([]);
        setTotalAttended(0);
      }
    } catch (err) {
      console.error("Failed to load participants:", err);
      setParticipants([]);
      setTotalAttended(0);
    } finally {
      setLoadingParticipants(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchParticipants(selectedEventId);
    }
  }, [selectedEventId, fetchParticipants]);

  // ── Auth ──────────────────────────────────────────────────
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/login");
    router.refresh();
  };

  // ── Form Handlers ─────────────────────────────────────────
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      eventDate: "",
      eventTiming: "",
      speakerName: "",
      attendanceOpen: true,
      setAsActive: false,
    });
    setEditingEvent(null);
    setFormError("");
    setShowForm(false);
  };

  const startCreate = () => {
    resetForm();
    setFormData((prev) => ({
      ...prev,
      eventDate: new Date().toISOString().split("T")[0],
      eventTiming: "11:00 AM - 12:30 PM",
      setAsActive: events.length === 0,
      attendanceOpen: true,
    }));
    setShowForm(true);
  };

  const startEdit = (event: DbEvent) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || "",
      eventDate: event.event_date,
      eventTiming: event.event_timing,
      speakerName: event.speaker_name || "",
      attendanceOpen: event.attendance_open,
      setAsActive: portalConfig?.active_event_id === event.id,
    });
    setFormError("");
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError("");

    try {
      const url = editingEvent
        ? `/api/admin/events/${editingEvent.id}`
        : "/api/admin/events";
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        setFormError(data.error || "Operation failed.");
        return;
      }

      toast.success(editingEvent ? "Event updated successfully" : "Event created successfully");
      resetForm();
      await fetchData();
    } catch (e: any) {
      setFormError("Request failed: " + (e.message || "Unknown error"));
    } finally {
      setFormSubmitting(false);
    }
  };

  // ── Toggle Attendance Master Switch ───────────────────────
  const toggleAttendance = async (enabled: boolean) => {
    try {
      const res = await fetch("/api/admin/portal-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceEnabled: enabled }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(enabled ? "Attendance collection enabled" : "Attendance collection disabled");
        await fetchData();
      } else {
        toast.error(json.error || "Failed to toggle attendance");
      }
    } catch (e: any) {
      setError("Failed to toggle attendance: " + e.message);
    }
  };

  // ── Set Active Event ──────────────────────────────────────
  const handleSetActiveEvent = async (event: DbEvent) => {
    try {
      const res = await fetch("/api/admin/portal-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeEventId: event.id,
          attendanceEnabled: event.attendance_open,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`"${event.name}" is now the active portal event`);
        await fetchData();
      } else {
        toast.error(json.error || "Failed to set active event");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update configuration");
    }
  };

  // ── Inspect Attendees Handler ─────────────────────────────
  const handleInspectAttendees = (eventId: string) => {
    if (inspectingEventId === eventId) {
      setInspectingEventId(null);
      setSelectedEventId("");
      return;
    }
    setInspectingEventId(eventId);
    setSelectedEventId(eventId);
    setTimeout(() => {
      attendeesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  // ── Delete Event ──────────────────────────────────────────
  const handleDeleteEvent = async (event: DbEvent) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to permanently delete "${event.name}"?\n\nWarning: This action will permanently remove the event, its attendance records, and any issued certificates.`
    );
    if (!isConfirmed) return;

    toast.loading(`Deleting "${event.name}"…`, { id: "delete-event" });

    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`Event "${event.name}" has been deleted.`, { id: "delete-event" });
        if (inspectingEventId === event.id) {
          setInspectingEventId(null);
          setSelectedEventId("");
        }
        if (editingEvent?.id === event.id) {
          resetForm();
        }
        await fetchData();
      } else {
        toast.error(json.error || "Failed to delete event", { id: "delete-event" });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event", { id: "delete-event" });
    }
  };

  // ── Copy to Clipboard Helper ──────────────────────────────
  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success(`${label} copied to clipboard`);
  };

  // ── Export Participants to CSV ────────────────────────────
  const handleExportCSV = () => {
    if (participants.length === 0) {
      toast.error("No attendee records available to export");
      return;
    }

    const currentEvent = events.find((e) => e.id === selectedEventId);
    const eventTitle = currentEvent?.name || "AWS_SBG_Event";

    const csvData = participants.map((p) => ({
      "Full Name": p.name,
      "Email Address": p.email,
      "Course / Branch": p.course,
      "Roll Number": p.rollNo,
      "Submitted At": p.submittedAt,
      "Certificate ID": p.certificateId || "N/A",
      "Verification Link": p.certificateId
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${p.certificateId}`
        : "N/A",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${eventTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}_Attendees_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Attendee list exported to CSV");
  };

  // ── Single Certificate Email Send ─────────────────────────
  const handleSendSingleEmail = async (certificateId: string, email: string) => {
    toast.loading(`Dispatching credential to ${email}…`, { id: "email-send" });
    try {
      const res = await fetch("/api/admin/certificates/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Certificate emailed to ${email}`, { id: "email-send" });
      } else {
        toast.error(json.error || "Failed to dispatch email", { id: "email-send" });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch email", { id: "email-send" });
    }
  };

  // ── Bulk Event Email Dispatch ─────────────────────────────
  const handleBulkSendEmails = async () => {
    if (!selectedEventId || participants.length === 0) {
      toast.error("No attendees with credentials to send");
      return;
    }

    const currentEvent = events.find((e) => e.id === selectedEventId);
    if (
      !confirm(
        `Are you sure you want to email certificates with PDF attachments to all ${totalAttended} attendees of "${currentEvent?.name}"?`
      )
    ) {
      return;
    }

    toast.loading(`Dispatching emails to ${totalAttended} attendees in the background…`, {
      id: "bulk-send",
    });

    try {
      const res = await fetch("/api/admin/certificates/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          `Bulk dispatch complete! Sent: ${json.data?.sentCount || 0}, Failed: ${json.data?.failedCount || 0}`,
          { id: "bulk-send", duration: 5000 }
        );
      } else {
        toast.error(json.error || "Bulk email dispatch failed", { id: "bulk-send" });
      }
    } catch (err: any) {
      toast.error(err.message || "Bulk email dispatch failed", { id: "bulk-send" });
    }
  };

  const activeEvent = events.find((e) => e.id === portalConfig?.active_event_id);
  const currentViewEvent = events.find((e) => e.id === selectedEventId);

  // Available course filters
  const courseOptions = useMemo(() => {
    const courses = new Set<string>();
    participants.forEach((p) => {
      if (p.course) courses.add(p.course);
    });
    return ["ALL", ...Array.from(courses)];
  }, [participants]);

  // Filter participants
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchesSearch =
        !participantSearch.trim() ||
        p.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(participantSearch.toLowerCase()) ||
        p.rollNo.toLowerCase().includes(participantSearch.toLowerCase()) ||
        p.course.toLowerCase().includes(participantSearch.toLowerCase()) ||
        (p.certificateId && p.certificateId.toLowerCase().includes(participantSearch.toLowerCase()));

      const matchesCourse =
        selectedCourseFilter === "ALL" || p.course === selectedCourseFilter;

      return matchesSearch && matchesCourse;
    });
  }, [participants, participantSearch, selectedCourseFilter]);

  // Stats calculation
  const totalVerifiedCerts = useMemo(() => {
    return participants.filter((p) => Boolean(p.certificateId)).length;
  }, [participants]);

  return (
    <div
      className="min-h-screen text-[#F4F4F6] selection:bg-[#6C63FF]/30 pb-24"
      style={{
        background: `
          radial-gradient(1000px 500px at 15% 0%, rgba(108,99,255,0.14), transparent 70%),
          radial-gradient(800px 400px at 85% 10%, rgba(255,153,0,0.06), transparent 70%),
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px) 0 0/48px 48px,
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px) 0 0/48px 48px,
          #08080B
        `,
      }}
    >
      {/* ── Main Operations Container ───────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 space-y-10">
        {/* ── Top Bar (Sign Out Only) ───────────────────────── */}
        <div className="flex items-center justify-end">
          <button
            onClick={handleLogout}
            className="h-9 px-3.5 rounded-xl text-xs font-medium text-[#71717A] hover:text-red-400 hover:bg-red-500/10 border border-white/[0.08] hover:border-red-500/20 transition-all flex items-center gap-2 cursor-pointer bg-white/[0.02]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm text-red-400 flex items-center gap-3">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#6C63FF]/30 border-t-[#6C63FF] animate-spin" />
            <p className="text-xs font-mono text-[#71717A] tracking-wider uppercase">
              Loading Operations Cockpit…
            </p>
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════════════════ */}
            {/* ── EXECUTIVE METRIC STRIP ──────────────────────── */}
            {/* ══════════════════════════════════════════════════ */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Active Event */}
              <div className="p-1 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.08] shadow-lg">
                <div className="p-5 rounded-[calc(1.5rem-4px)] bg-[#0D0D12] flex items-center gap-4 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-[#6C63FF] shrink-0">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#71717A] block">
                      Active Portal Event
                    </span>
                    <p className="text-base font-bold text-white truncate mt-0.5">
                      {activeEvent?.name || "None Configured"}
                    </p>
                    <span className="text-xs text-[#A1A1AA] flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          portalConfig?.attendance_enabled && activeEvent?.attendance_open
                            ? "bg-emerald-400 animate-ping"
                            : "bg-amber-400"
                        }`}
                      />
                      {portalConfig?.attendance_enabled && activeEvent?.attendance_open
                        ? "Accepting Submissions"
                        : "Submissions Paused"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Events Managed */}
              <div className="p-1 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.08] shadow-lg">
                <div className="p-5 rounded-[calc(1.5rem-4px)] bg-[#0D0D12] flex items-center gap-4 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#71717A] block">
                      Events Catalog
                    </span>
                    <p className="text-2xl font-mono font-bold text-white tracking-tight mt-0.5">
                      {events.length}
                    </p>
                    <span className="text-xs text-[#A1A1AA]">
                      Workshops &amp; webinars
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════ */}
            {/* ── SECTION A: CURRENT ACTIVE EVENT COCKPIT ─────── */}
            {/* ══════════════════════════════════════════════════ */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-[10px] font-mono uppercase tracking-wider text-[#A78BFA] mb-2">
                    <Sparkles className="w-3 h-3 text-[#6C63FF]" />
                    <span>Real-Time Event Control</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Active Session Controls
                  </h2>
                  <p className="text-xs text-[#71717A]">
                    The session currently served to students accessing the Attendance Portal
                  </p>
                </div>
              </div>

              {activeEvent ? (
                /* Double-Bezel Hardware Card */
                <div className="p-1 rounded-[2rem] bg-white/[0.04] border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
                  <div className="p-6 sm:p-8 rounded-[calc(2rem-4px)] bg-[#0E0E13] space-y-6">
                    {/* Header Row */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                            Live Active Portal Event
                          </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                          {activeEvent.name}
                        </h3>

                        {activeEvent.description && (
                          <p className="text-sm text-[#A1A1AA] leading-relaxed">
                            {activeEvent.description}
                          </p>
                        )}

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap gap-2.5 pt-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#D4D4D8]">
                            <Calendar className="w-3.5 h-3.5 text-[#6C63FF]" />
                            <span>{formatDate(activeEvent.event_date)}</span>
                          </div>

                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#D4D4D8]">
                            <Clock className="w-3.5 h-3.5 text-[#FF9900]" />
                            <span>{activeEvent.event_timing}</span>
                          </div>

                          {activeEvent.speaker_name && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#D4D4D8]">
                              <User className="w-3.5 h-3.5 text-[#34D399]" />
                              <span>{activeEvent.speaker_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action Stack */}
                      <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2.5 shrink-0">
                        <button
                          onClick={() => handleInspectAttendees(activeEvent.id)}
                          className={`h-10 px-4 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                            inspectingEventId === activeEvent.id
                              ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30"
                              : "bg-[#6C63FF]/15 hover:bg-[#6C63FF]/25 border border-[#6C63FF]/30 text-white"
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{inspectingEventId === activeEvent.id ? "Hide Attendees" : "Inspect Attendees"}</span>
                        </button>

                        <button
                          onClick={() => startEdit(activeEvent)}
                          className="h-10 px-4 rounded-xl text-xs font-medium text-white bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#A78BFA]" />
                          <span>Edit Details</span>
                        </button>

                        <Link
                          href="/attendance"
                          target="_blank"
                          className="h-10 px-4 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-white bg-transparent hover:bg-white/[0.04] border border-white/[0.06] transition-all flex items-center gap-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Preview Portal</span>
                        </Link>
                      </div>
                    </div>

                    {/* Master Switch Bar (Nested Island) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#14141A] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            portalConfig?.attendance_enabled
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-zinc-800/50 border-zinc-700 text-zinc-400"
                          }`}
                        >
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              Live Attendance Collection
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                                portalConfig?.attendance_enabled
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                              }`}
                            >
                              {portalConfig?.attendance_enabled ? "OPEN & ACCEPTING" : "CLOSED / PAUSED"}
                            </span>
                          </div>
                          <p className="text-xs text-[#71717A] mt-0.5">
                            {portalConfig?.attendance_enabled
                              ? "Students scanning the session QR code can submit attendance and receive their certificate."
                              : "The attendance portal is closed. Form submissions are currently blocked."}
                          </p>
                        </div>
                      </div>

                      {/* Machined Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => toggleAttendance(!portalConfig?.attendance_enabled)}
                        className={`
                          relative w-14 h-8 rounded-full transition-all duration-300 cursor-pointer shrink-0 p-1
                          ${portalConfig?.attendance_enabled ? "bg-emerald-500 shadow-lg shadow-emerald-500/25" : "bg-[#27272A]"}
                        `}
                      >
                        <span
                          className={`
                            block w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-md
                            ${portalConfig?.attendance_enabled ? "translate-x-6" : "translate-x-0"}
                          `}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Active Event State */
                <div className="p-1 rounded-[2rem] bg-white/[0.03] border border-dashed border-white/10 p-12 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#71717A]">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    No active portal event configured
                  </h3>
                  <p className="text-xs text-[#71717A] max-w-sm mx-auto mb-5">
                    Select an event from the catalog below or create a new session to activate the Attendance Portal.
                  </p>
                  <button
                    onClick={startCreate}
                    className="h-10 px-5 rounded-xl text-xs font-semibold bg-[#6C63FF] hover:brightness-110 text-white transition-all cursor-pointer shadow-lg shadow-[#6C63FF]/20"
                  >
                    Create Your First Event
                  </button>
                </div>
              )}
            </section>

            {/* ══════════════════════════════════════════════════ */}
            {/* ── ALL EVENTS DECK / BENTO GRID ─────────────────── */}
            {/* ══════════════════════════════════════════════════ */}
            {events.length > 0 && (
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      All Events Catalog
                    </h3>
                    <p className="text-xs text-[#71717A]">
                      Select an event to inspect attendee records or switch the active session
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-[#A78BFA] px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      {events.length} Total Sessions
                    </span>
                    <button
                      onClick={startCreate}
                      className="h-10 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:brightness-110 text-white transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-[#6C63FF]/20 active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Event</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {events.map((event) => {
                    const isActive = event.id === portalConfig?.active_event_id;
                    const isViewing = event.id === selectedEventId;

                    return (
                      <div
                        key={event.id}
                        className={`
                          group relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between
                          ${
                            isActive
                              ? "bg-[#6C63FF]/[0.06] border-[#6C63FF]/30 shadow-lg shadow-[#6C63FF]/5"
                              : isViewing
                              ? "bg-white/[0.05] border-white/20"
                              : "bg-[#0E0E13] border-white/[0.06] hover:border-white/15"
                          }
                        `}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/5 text-[#71717A] border border-white/5">
                                Session
                              </span>
                            )}

                            {isViewing && (
                              <span className="text-[10px] font-mono text-[#A78BFA] bg-[#6C63FF]/10 px-2 py-0.5 rounded">
                                Viewing Attendees
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="text-base font-bold text-white group-hover:text-[#A78BFA] transition-colors line-clamp-1">
                              {event.name}
                            </h4>
                            {event.description && (
                              <p className="text-xs text-[#71717A] line-clamp-2 mt-1 leading-relaxed">
                                {event.description}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5 text-xs text-[#A1A1AA] pt-2 border-t border-white/[0.04]">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#71717A]" />
                              <span>{formatDate(event.event_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#71717A]" />
                              <span>{event.event_timing}</span>
                            </div>
                            {event.speaker_name && (
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-[#71717A]" />
                                <span className="truncate">{event.speaker_name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-white/[0.04]">
                          <div className="flex items-center gap-1.5">
                            {/* Set Active Button */}
                            {!isActive && (
                              <button
                                onClick={() => handleSetActiveEvent(event)}
                                className="h-8 px-3 rounded-lg text-[11px] font-medium text-[#6C63FF] hover:bg-[#6C63FF]/10 border border-[#6C63FF]/20 transition-all cursor-pointer"
                              >
                                Set Active
                              </button>
                            )}

                            {/* View Attendees Trigger */}
                            <button
                              onClick={() => handleInspectAttendees(event.id)}
                              className={`h-8 px-3 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                                inspectingEventId === event.id
                                  ? "bg-[#6C63FF] text-white font-semibold shadow-md shadow-[#6C63FF]/25"
                                  : "text-[#A1A1AA] hover:text-white hover:bg-white/5 border border-white/[0.06]"
                              }`}
                            >
                              <Users className="w-3 h-3" />
                              <span>{inspectingEventId === event.id ? "Hide Attendees" : "Inspect Attendees"}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => startEdit(event)}
                              title="Edit Event Details"
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-[#71717A] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event)}
                              title="Delete Event"
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-[#71717A] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════ */}
            {/* ── SECTION B: PARTICIPANT DIRECTORY ────────────── */}
            {/* ══════════════════════════════════════════════════ */}
            {inspectingEventId && currentViewEvent && (
              <section
                ref={attendeesSectionRef}
                className="space-y-5 pt-8 border-t border-white/[0.08] scroll-mt-24"
              >
                {/* Header with Title & Event Context Selector */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-2">
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span>Attendance Records &amp; Credentials</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        Attendee Directory
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#6C63FF]/20 border border-[#6C63FF]/40 text-[#A78BFA]">
                        {currentViewEvent.name}
                      </span>
                    </div>
                    <p className="text-xs text-[#71717A] mt-1">
                      Official student attendance submissions and issued credentials for this session
                    </p>
                  </div>

                  {/* Event Selector & Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Event Select Dropdown */}
                    <div className="relative">
                      <select
                        value={selectedEventId}
                        onChange={(e) => {
                          setSelectedEventId(e.target.value);
                          setInspectingEventId(e.target.value);
                        }}
                        className="h-10 pl-3.5 pr-8 rounded-xl text-xs bg-[#111117] border border-white/[0.1] text-white focus:outline-none focus:border-[#6C63FF] transition-colors cursor-pointer appearance-none"
                      >
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.name} ({formatDate(ev.event_date)})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A]">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Export CSV Button */}
                    <button
                      onClick={handleExportCSV}
                      disabled={participants.length === 0}
                      className="h-10 px-3.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                      title="Export Attendees to CSV"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Export CSV</span>
                    </button>

                    {/* Bulk Email Certificates Button */}
                    <button
                      onClick={handleBulkSendEmails}
                      disabled={participants.length === 0}
                      className="h-10 px-3.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                      title="Email Certificates to all attendees"
                    >
                      <Send className="w-4 h-4 text-[#A78BFA]" />
                      <span className="hidden sm:inline">Email Certificates</span>
                    </button>

                    {/* Close Inspector Button */}
                    <button
                      onClick={() => {
                        setInspectingEventId(null);
                        setSelectedEventId("");
                      }}
                      title="Hide Attendees List"
                      className="h-10 px-3.5 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4 text-[#71717A]" />
                      <span>Close</span>
                    </button>
                  </div>
                </div>

              {/* Event Context Pill Bar */}
              {currentViewEvent && (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#71717A]">Session Context:</span>
                    <strong className="text-white">{currentViewEvent.name}</strong>
                    <span className="text-[#71717A]">• {formatDate(currentViewEvent.event_date)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[#A1A1AA] font-mono text-[11px]">
                      Attended: <strong className="text-white text-sm">{totalAttended}</strong>
                    </span>
                    <span className="text-[#A1A1AA] font-mono text-[11px]">
                      Certificates: <strong className="text-white text-sm">{totalVerifiedCerts}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Search & Course Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Search by student name, roll number, email, or certificate ID…"
                    className="w-full h-10 pl-10 pr-9 rounded-xl text-xs bg-[#111117] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-[#6C63FF] transition-colors"
                  />
                  {participantSearch && (
                    <button
                      onClick={() => setParticipantSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Course Filter Pills */}
                {courseOptions.length > 2 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {courseOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedCourseFilter(c)}
                        className={`h-8 px-3 rounded-lg text-[11px] font-mono uppercase whitespace-nowrap transition-all cursor-pointer ${
                          selectedCourseFilter === c
                            ? "bg-[#6C63FF] text-white font-bold"
                            : "bg-white/[0.03] text-[#71717A] hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── PARTICIPANTS TABLE CONTAINER ────────────── */}
              <div className="p-1 rounded-[2rem] bg-white/[0.03] border border-white/10 shadow-2xl overflow-hidden">
                <div className="rounded-[calc(2rem-4px)] bg-[#0C0C10] overflow-hidden">
                  {loadingParticipants ? (
                    <div className="py-24 text-center space-y-3">
                      <div className="w-7 h-7 mx-auto rounded-full border-2 border-[#6C63FF]/30 border-t-[#6C63FF] animate-spin" />
                      <p className="text-xs text-[#71717A] font-mono">
                        Querying attendance database…
                      </p>
                    </div>
                  ) : filteredParticipants.length === 0 ? (
                    <div className="py-24 text-center px-4 max-w-md mx-auto space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#71717A]">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-white">
                        {participantSearch || selectedCourseFilter !== "ALL"
                          ? "No matching attendees found"
                          : "No participants attended yet"}
                      </h4>
                      <p className="text-xs text-[#71717A] leading-relaxed">
                        {participantSearch || selectedCourseFilter !== "ALL"
                          ? "Try clearing your search query or selecting a different course filter."
                          : "When students mark their attendance using the session QR code, their verified records will appear in this directory."}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[#71717A] font-mono text-[10.5px] uppercase tracking-wider">
                            <th className="py-3.5 px-5">Participant</th>
                            <th className="py-3.5 px-4">Contact</th>
                            <th className="py-3.5 px-4">Academic Details</th>
                            <th className="py-3.5 px-4">Submitted At</th>
                            <th className="py-3.5 px-4">Certificate ID</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {filteredParticipants.map((p, idx) => (
                            <tr
                              key={`${p.email}-${idx}`}
                              className="hover:bg-white/[0.025] transition-colors group"
                            >
                              {/* Name with Avatar Initials */}
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6C63FF]/20 to-[#A78BFA]/20 border border-[#6C63FF]/30 flex items-center justify-center text-[10px] font-bold text-[#A78BFA] shrink-0 font-mono">
                                    {getInitials(p.name)}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-white block truncate">
                                      {p.name}
                                    </span>
                                    <span className="text-[10px] text-[#71717A] font-mono">
                                      Roll: {p.rollNo}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Email */}
                              <td className="py-4 px-4 text-[#A1A1AA] font-mono text-[11.5px]">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate max-w-[190px]">{p.email}</span>
                                  <button
                                    onClick={() => handleCopy(p.email, `email-${idx}`, "Email")}
                                    className="opacity-0 group-hover:opacity-100 text-[#71717A] hover:text-white transition-opacity cursor-pointer"
                                    title="Copy Email"
                                  >
                                    {copiedKey === `email-${idx}` ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* Course */}
                              <td className="py-4 px-4">
                                <span className="inline-block px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#D4D4D8] font-medium text-[11px]">
                                  {p.course}
                                </span>
                              </td>

                              {/* Submitted At */}
                              <td className="py-4 px-4 text-[#71717A] font-mono text-[11px] whitespace-nowrap">
                                {formatDateTime(p.submittedAt)}
                              </td>

                              {/* Certificate ID */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                {p.certificateId ? (
                                  <div className="flex items-center gap-1.5">
                                    <Link
                                      href={`/verify/${p.certificateId}`}
                                      target="_blank"
                                      className="font-mono text-xs font-bold text-[#A78BFA] hover:underline flex items-center gap-1"
                                      title="Open Verification Page"
                                    >
                                      <span>{p.certificateId}</span>
                                      <ExternalLink className="w-3 h-3 text-[#71717A]" />
                                    </Link>
                                    <button
                                      onClick={() =>
                                        handleCopy(p.certificateId!, `cert-${idx}`, "Certificate ID")
                                      }
                                      className="opacity-0 group-hover:opacity-100 text-[#71717A] hover:text-white transition-opacity cursor-pointer"
                                      title="Copy ID"
                                    >
                                      {copiedKey === `cert-${idx}` ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[#52525B] font-mono text-xs">—</span>
                                )}
                              </td>

                              {/* Action Buttons */}
                              <td className="py-4 px-4 text-right whitespace-nowrap">
                                {p.certificateId ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Download PDF button */}
                                    <a
                                      href={`/api/certificates/${p.certificateId}`}
                                      download={`${p.certificateId}.pdf`}
                                      className="h-7 w-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[#A1A1AA] hover:text-white border border-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                                      title="Download PDF Certificate"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </a>

                                    {/* Send email button */}
                                    <button
                                      onClick={() => handleSendSingleEmail(p.certificateId!, p.email)}
                                      className="h-7 w-7 rounded-lg bg-white/[0.03] hover:bg-[#6C63FF]/20 text-[#A1A1AA] hover:text-[#6C63FF] border border-white/[0.06] hover:border-[#6C63FF]/30 flex items-center justify-center transition-colors cursor-pointer"
                                      title="Email Certificate with PDF Attachment"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-[#52525B]">No Cert</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
          </>
        )}
      </main>

      {/* ══════════════════════════════════════════════════ */}
      {/* ── CREATE / EDIT EVENT MODAL (FROSTED GLASS) ───── */}
      {/* ══════════════════════════════════════════════════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
            onClick={resetForm}
          />
          <div className="relative w-full max-w-lg p-1 rounded-[2rem] bg-white/[0.05] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="rounded-[calc(2rem-4px)] bg-[#0F0F14] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {editingEvent ? "Edit Event Session" : "Create New Event Session"}
                  </h3>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    {editingEvent
                      ? "Update session schedule, timing, and keynote details"
                      : "Define a new workshop or webinar for the AWS Student Builder Group"}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="h-8 w-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[#71717A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleFormSubmit}>
                <div className="p-6 space-y-4.5 max-h-[65vh] overflow-y-auto">
                  {/* Event Name */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-medium">
                      Event Title <span className="text-[#6C63FF]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Cloud Kickstart 2026: AWS Architecture"
                      className="w-full h-11 px-3.5 rounded-xl text-sm bg-[#15151C] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-[#6C63FF] transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-medium">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief overview of topics covered, cloud services explored, and student takeaways."
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#15151C] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-[#6C63FF] transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  {/* Date & Timing Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-medium">
                        Event Date <span className="text-[#6C63FF]">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl text-sm bg-[#15151C] border border-white/[0.08] text-white focus:outline-none focus:border-[#6C63FF] transition-colors [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-medium">
                        Timing <span className="text-[#6C63FF]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.eventTiming}
                        onChange={(e) => setFormData({ ...formData, eventTiming: e.target.value })}
                        placeholder="e.g. 11:00 AM - 12:30 PM"
                        className="w-full h-11 px-3.5 rounded-xl text-sm bg-[#15151C] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-[#6C63FF] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Speaker Name */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-1.5 font-medium">
                      Speaker / Lead Presenter
                    </label>
                    <input
                      type="text"
                      value={formData.speakerName}
                      onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                      placeholder="e.g. Mr. Aashu Dev"
                      className="w-full h-11 px-3.5 rounded-xl text-sm bg-[#15151C] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-[#6C63FF] transition-colors"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="pt-2 space-y-3">
                    {/* Attendance Open Toggle */}
                    <label className="p-3.5 rounded-xl bg-[#15151C] border border-white/[0.06] flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Attendance Open
                        </span>
                        <span className="text-[11px] text-[#71717A]">
                          Allow attendees to mark presence and receive certificates
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.attendanceOpen}
                        onChange={(e) =>
                          setFormData({ ...formData, attendanceOpen: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-white/20 bg-black/40 text-[#6C63FF] focus:ring-[#6C63FF]"
                      />
                    </label>

                    {/* Set As Active Toggle */}
                    <label className="p-3.5 rounded-xl bg-[#15151C] border border-white/[0.06] flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Set as Active Portal Event
                        </span>
                        <span className="text-[11px] text-[#71717A]">
                          Immediately display this event on the student Attendance Portal
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.setAsActive}
                        onChange={(e) =>
                          setFormData({ ...formData, setAsActive: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-white/20 bg-black/40 text-[#6C63FF] focus:ring-[#6C63FF]"
                      />
                    </label>
                  </div>

                  {formError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                      {formError}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between gap-2.5">
                  {editingEvent ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(editingEvent)}
                      className="h-10 px-3.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Event</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="h-10 px-4 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="h-10 px-5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:brightness-110 text-white transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-[#6C63FF]/20"
                    >
                      {formSubmitting
                        ? "Saving Session…"
                        : editingEvent
                        ? "Save Changes"
                        : "Create Event"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
