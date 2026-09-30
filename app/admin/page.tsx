"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { DbEvent, DbPortalConfig, AdminParticipantRow } from "@/types/certificate";

// ── Helpers ───────────────────────────────────────────────────
function formatDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

// ── Main Admin Page ───────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [portalConfig, setPortalConfig] = useState<DbPortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DbEvent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventDate: "",
    eventTiming: "",
    speakerName: "",
    attendanceOpen: false,
    setAsActive: false,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Section B — Participant state
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [participants, setParticipants] = useState<AdminParticipantRow[]>([]);
  const [totalAttended, setTotalAttended] = useState<number>(0);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");

  // ── Data Fetching ─────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [eventsRes, configRes] = await Promise.all([
        fetch("/api/admin/events"),
        fetch("/api/admin/portal-config"),
      ]);

      const eventsData = await eventsRes.json();
      const configData = await configRes.json();

      if (eventsData.success) {
        const loadedEvents: DbEvent[] = eventsData.data || [];
        setEvents(loadedEvents);
        // Default selected event for Section B
        if (!selectedEventId && loadedEvents.length > 0) {
          const activeId = configData.data?.active_event_id;
          setSelectedEventId(activeId || loadedEvents[0].id);
        }
      }
      if (configData.success) setPortalConfig(configData.data || null);
    } catch (e: any) {
      setError("Failed to load data: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Fetch Participants for Selected Event ──────────────────
  const fetchParticipants = useCallback(async (eventId: string) => {
    if (!eventId) return;
    setLoadingParticipants(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/participants`);
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
      attendanceOpen: false,
      setAsActive: false,
    });
    setEditingEvent(null);
    setFormError("");
    setShowForm(false);
  };

  const startCreate = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, setAsActive: true }));
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

      resetForm();
      await fetchData();
    } catch (e: any) {
      setFormError("Request failed: " + (e.message || "Unknown error"));
    } finally {
      setFormSubmitting(false);
    }
  };

  // ── Toggle Attendance ─────────────────────────────────────
  const toggleAttendance = async (enabled: boolean) => {
    try {
      await fetch("/api/admin/portal-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceEnabled: enabled }),
      });
      await fetchData();
    } catch (e: any) {
      setError("Failed to toggle attendance: " + e.message);
    }
  };

  const activeEvent = events.find((e) => e.id === portalConfig?.active_event_id);
  const currentViewEvent = events.find((e) => e.id === selectedEventId);

  // Filter participants by search query
  const filteredParticipants = participants.filter((p) => {
    if (!participantSearch.trim()) return true;
    const q = participantSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.rollNo.toLowerCase().includes(q) ||
      p.course.toLowerCase().includes(q) ||
      (p.certificateId && p.certificateId.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="min-h-screen text-[#F4F4F6]"
      style={{
        background: `
          radial-gradient(800px 400px at 20% 0%, rgba(124,58,237,0.12), transparent 70%),
          radial-gradient(600px 300px at 80% 100%, rgba(139,92,246,0.08), transparent 70%),
          #09090B
        `,
      }}
    >
      {/* ── Top Bar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#09090B]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">AWS SBG Admin</h1>
              <p className="text-[11px] text-[#71717A]">Event & Certificate Management</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-[#71717A] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* ══════════════════════════════════════════════════ */}
            {/* ── SECTION A: CURRENT / UPCOMING EVENT ─────────── */}
            {/* ══════════════════════════════════════════════════ */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">Current Event</h2>
                  <p className="text-xs text-[#71717A] mt-0.5">The event currently served by the Attendance Portal</p>
                </div>
                <button
                  onClick={startCreate}
                  className="h-9 px-4 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Create Event
                </button>
              </div>

              {activeEvent ? (
                <div className="rounded-2xl border border-white/[0.06] bg-[#111113] overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-medium font-mono">
                            Active Portal Event
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{activeEvent.name}</h3>
                        {activeEvent.description && (
                          <p className="text-sm text-[#A1A1AA] max-w-lg leading-relaxed">{activeEvent.description}</p>
                        )}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#A1A1AA]">
                          <span className="flex items-center gap-1.5">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5 text-[#71717A]">
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                            {formatDate(activeEvent.event_date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5 text-[#71717A]">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                            {activeEvent.event_timing}
                          </span>
                          {activeEvent.speaker_name && (
                            <span className="flex items-center gap-1.5">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5 text-[#71717A]">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                              </svg>
                              {activeEvent.speaker_name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Edit button */}
                      <button
                        onClick={() => startEdit(activeEvent)}
                        className="h-9 px-4 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] transition-all cursor-pointer shrink-0"
                      >
                        Edit Event
                      </button>
                    </div>
                  </div>

                  {/* Attendance Toggle Bar */}
                  <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-white">Attendance Collection</span>
                      <p className="text-xs text-[#71717A]">
                        {portalConfig?.attendance_enabled
                          ? "Attendance Portal is accepting submissions"
                          : "Attendance Portal is closed to new submissions"}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleAttendance(!portalConfig?.attendance_enabled)}
                      className={`
                        relative w-11 h-6 rounded-full transition-colors cursor-pointer
                        ${portalConfig?.attendance_enabled
                          ? "bg-emerald-500"
                          : "bg-[#27272A]"
                        }
                      `}
                    >
                      <span
                        className={`
                          absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm
                          ${portalConfig?.attendance_enabled ? "translate-x-5" : "translate-x-0"}
                        `}
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#111113] p-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-5 h-5 text-[#71717A]">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#71717A] mb-4">No active event configured</p>
                  <button
                    onClick={startCreate}
                    className="h-9 px-5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white transition-all cursor-pointer"
                  >
                    Create Your First Event
                  </button>
                </div>
              )}
            </section>

            {/* ── All Events List ───────────────────────── */}
            {events.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4">All Events</h2>
                <div className="space-y-3">
                  {events.map((event) => {
                    const isActive = event.id === portalConfig?.active_event_id;
                    const isViewing = event.id === selectedEventId;
                    return (
                      <div
                        key={event.id}
                        className={`
                          rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors
                          ${isActive
                            ? "border-primary/30 bg-primary/[0.04]"
                            : "border-white/[0.06] bg-[#111113] hover:border-white/10"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isActive ? (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500" title="Active Portal Event" />
                          ) : (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-white/20" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{event.name}</p>
                            <p className="text-xs text-[#71717A] mt-0.5">
                              {formatDate(event.event_date)} · {event.event_timing}
                              {event.speaker_name && ` · ${event.speaker_name}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Set Active via event management */}
                          {!isActive && (
                            <button
                              onClick={async () => {
                                await fetch("/api/admin/portal-config", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    activeEventId: event.id,
                                    attendanceEnabled: event.attendance_open,
                                  }),
                                });
                                await fetchData();
                              }}
                              className="h-8 px-3 rounded-lg text-[11px] font-medium text-primary hover:bg-primary/10 border border-primary/20 transition-all cursor-pointer"
                            >
                              Set Active
                            </button>
                          )}
                          {/* View Participants in Section B */}
                          <button
                            onClick={() => setSelectedEventId(event.id)}
                            className={`h-8 px-3 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                              isViewing
                                ? "bg-white/10 text-white border-white/20"
                                : "text-[#71717A] hover:text-white border-transparent hover:bg-white/5"
                            }`}
                          >
                            View Attendees
                          </button>
                          <button
                            onClick={() => startEdit(event)}
                            className="h-8 px-3 rounded-lg text-[11px] font-medium text-[#A1A1AA] hover:text-white hover:bg-white/5 border border-white/[0.06] transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════ */}
            {/* ── SECTION B: PARTICIPANT DETAILS ──────────────── */}
            {/* ══════════════════════════════════════════════════ */}
            <section className="pt-4 border-t border-white/[0.06]">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Participant Details
                  </h2>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Official attendance records and certificate credentials by event
                  </p>
                </div>

                {/* Event Context Selector & Count Badge */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Event Filter Selector */}
                  <div className="relative">
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="h-10 pl-3 pr-8 rounded-xl text-xs bg-[#111113] border border-white/[0.08] text-white focus:outline-none focus:border-primary/50 transition-colors cursor-pointer appearance-none"
                    >
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.name} ({formatDate(ev.event_date)})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>

                  {/* Calculated Stat Badge: Total Participants Attended */}
                  <div className="h-10 px-4 rounded-xl bg-primary/[0.08] border border-primary/25 flex items-center gap-2">
                    <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider font-mono">
                      Total Attended:
                    </span>
                    <span className="text-sm font-bold text-primary font-mono">
                      {totalAttended}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Context Banner */}
              {currentViewEvent && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs text-[#A1A1AA]">
                  <span className="truncate">
                    Showing attendance records for: <strong className="text-white">{currentViewEvent.name}</strong>
                  </span>
                  {selectedEventId === portalConfig?.active_event_id && (
                    <span className="shrink-0 ml-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                      Active Portal Event
                    </span>
                  )}
                </div>
              )}

              {/* Search Filter */}
              {participants.length > 0 && (
                <div className="mb-4">
                  <div className="relative max-w-sm">
                    <input
                      type="text"
                      value={participantSearch}
                      onChange={(e) => setParticipantSearch(e.target.value)}
                      placeholder="Search by name, email, roll number, or certificate ID…"
                      className="w-full h-9 pl-9 pr-3 rounded-xl text-xs bg-[#111113] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B] pointer-events-none">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Table Container */}
              <div className="rounded-2xl border border-white/[0.06] bg-[#111113] overflow-hidden">
                {loadingParticipants ? (
                  <div className="py-16 text-center">
                    <div className="w-6 h-6 mx-auto mb-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <p className="text-xs text-[#71717A]">Loading participants…</p>
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="py-16 text-center px-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#71717A]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-6 h-6">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-white mb-1">
                      {participantSearch ? "No matching participants found" : "No participants attended yet"}
                    </p>
                    <p className="text-xs text-[#71717A] max-w-sm mx-auto">
                      {participantSearch
                        ? "Try adjusting your search query."
                        : "When students mark attendance in the Attendance Portal, their details and generated certificate ID will appear here."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[#71717A] uppercase font-mono text-[10px] tracking-wider">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Course</th>
                          <th className="py-3 px-4">Roll Number</th>
                          <th className="py-3 px-4">Submitted At</th>
                          <th className="py-3 px-4">Certificate ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredParticipants.map((p, idx) => (
                          <tr
                            key={`${p.email}-${idx}`}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            {/* Name */}
                            <td className="py-3.5 px-4 font-medium text-white">
                              {p.name}
                            </td>

                            {/* Email */}
                            <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">
                              {p.email}
                            </td>

                            {/* Course */}
                            <td className="py-3.5 px-4 text-[#A1A1AA]">
                              {p.course}
                            </td>

                            {/* Roll Number */}
                            <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">
                              {p.rollNo}
                            </td>

                            {/* Attendance Submitted At */}
                            <td className="py-3.5 px-4 text-[#71717A] font-mono whitespace-nowrap">
                              {formatDateTime(p.submittedAt)}
                            </td>

                            {/* Certificate ID */}
                            <td className="py-3.5 px-4 font-mono text-[#A78BFA] whitespace-nowrap">
                              {p.certificateId ? (
                                <a
                                  href={`/verify/${p.certificateId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline flex items-center gap-1.5"
                                  title="Verify Certificate"
                                >
                                  <span>{p.certificateId}</span>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3 h-3 text-[#71717A]">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                  </svg>
                                </a>
                              ) : (
                                <span className="text-[#52525B]">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ── Create/Edit Event Modal ──────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={resetForm}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#111113] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold text-white">
                {editingEvent ? "Edit Event" : "Create Event"}
              </h3>
              <p className="text-xs text-[#71717A] mt-0.5">
                {editingEvent
                  ? "Update event details"
                  : "Create a new event and optionally set it as the active attendance event"}
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit}>
              <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* Event Name */}
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                    Event Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Cloud Kickstart 2026"
                    className="w-full h-10 px-3 rounded-xl text-sm bg-[#0C0C0E] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Getting Started with AWS"
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0C0C0E] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>

                {/* Date & Timing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                      Event Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl text-sm bg-[#0C0C0E] border border-white/[0.08] text-white focus:outline-none focus:border-primary/50 transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                      Timing <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.eventTiming}
                      onChange={(e) => setFormData({ ...formData, eventTiming: e.target.value })}
                      placeholder="e.g. 11:00 AM - 12:30 PM"
                      className="w-full h-10 px-3 rounded-xl text-sm bg-[#0C0C0E] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Speaker Name */}
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                    Speaker Name
                  </label>
                  <input
                    type="text"
                    value={formData.speakerName}
                    onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                    placeholder="e.g. Mr. Aashu Dev"
                    className="w-full h-10 px-3 rounded-xl text-sm bg-[#0C0C0E] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Attendance Open */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.attendanceOpen}
                    onChange={(e) => setFormData({ ...formData, attendanceOpen: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-[#0C0C0E] text-primary focus:ring-primary/50"
                  />
                  <div>
                    <span className="text-sm font-medium text-white">Attendance Open</span>
                    <p className="text-xs text-[#71717A]">
                      Allow students to submit attendance for this event
                    </p>
                  </div>
                </label>

                {/* Set as Active */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.setAsActive}
                    onChange={(e) => setFormData({ ...formData, setAsActive: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-[#0C0C0E] text-primary focus:ring-primary/50"
                  />
                  <div>
                    <span className="text-sm font-medium text-white">Set as Active Portal Event</span>
                    <p className="text-xs text-[#71717A]">
                      Make this the active event shown on the Attendance Portal
                    </p>
                  </div>
                </label>

                {formError && (
                  <p className="text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    {formError}
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-9 px-4 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="h-9 px-5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting
                    ? "Saving…"
                    : editingEvent
                    ? "Save Changes"
                    : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
