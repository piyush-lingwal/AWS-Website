"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
// papaparse (~6 KB), xlsx (~135 KB) and the Supabase browser client (~48 KB) are
// loaded on demand inside the handlers that need them, so they are not part of
// the /admin first-load bundle.
import type { DbEvent, DbPortalConfig, AdminParticipantRow } from "@/types/certificate";
import { parseAdminTab, adminTabHref, type AdminTab } from "@/lib/admin/tabs";
import { clampPage, pageCount, pageRange, pageSlice } from "@/lib/admin/pagination";
import { useAdminPortal } from "@/components/admin/AdminPortalProvider";
import { formatFullName, cn } from "@/lib/utils";
import { getAwardTitle } from "@/lib/certificates/award-title";
import { formatEventDate } from "@/lib/certificates/event-date";
import { DatePicker } from "@/components/ui/date-picker";
import { TopPerformerImportDialog } from "@/components/features/TopPerformerImportDialog";
import { AttendeeImportDialog } from "@/components/features/AttendeeImportDialog";
import { DeleteAllButton } from "@/components/admin/DeleteAllButton";
import { TeamTab } from "@/components/admin/team/TeamTab";
import type { TeamMemberRow } from "@/lib/team/types";
import { AdminPageSkeleton, CardsSkeleton, ListSkeleton, TableRowsSkeleton } from "@/components/admin/Skeletons";
import { OrganiserSection, VolunteerSection } from "@/components/admin/certificates/TeamSections";
import { CertificatesHeader, parseCertSection, type CertSection, type SectionCounts } from "@/components/admin/certificates/CertificatesHeader";
import { ExportButton, SearchField, SectionHeading, TOOLBAR_BUTTON } from "@/components/admin/certificates/ListControls";
import { filterRows } from "@/lib/admin/list-search";
import { exportFileName, organiserExportRows, participantExportRows, topPerformerExportRows, volunteerExportRows } from "@/lib/admin/export-rows";
import { CertificateThemePicker } from "@/components/features/CertificateThemePicker";
import {
  DEFAULT_CERTIFICATE_THEME,
  parseCertificateTheme,
  type CertificateTheme,
} from "@/lib/certificates/theme";
import {
  ArrowRight,
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
  Award,
  Download,
  Send,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Radio,
  FileSpreadsheet,
  X,
  Trash2,
  UserPlus,
  GraduationCap,
  Trophy,
  HelpCircle,
  PenTool,
  Briefcase,
  Upload,
  Camera,
  Loader2,
  Link2,
  Table2,
  AlertCircle,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react";


// ── Helpers ───────────────────────────────────────────────────
function formatDate(iso?: string | null, endIso?: string | null): string {
  if (!iso || !iso.trim() || iso.toLowerCase() === "tba") {
    return "To be announced";
  }
  // Collapses a start/end pair into a single range string (lib/certificates/event-date.ts).
  const ranged = formatEventDate(iso, endIso ?? null);
  if (ranged) return ranged;
  try {
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return "To be announced";
    return d.toLocaleDateString("en-IN", {
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

interface TopPerformerRow {
  id: string;
  participantId: string;
  rank: number;
  fullName: string;
  email: string;
  course: string;
  rollNo: string;
  certificateId: string | null;
}

// ── Main Admin Page ───────────────────────────────────────────
function PageHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <p className="ad-eyebrow mb-1">Admin Portal</p>
      <h1 className="font-lt-display text-2xl font-semibold tracking-[-0.035em] text-sbg-ink sm:text-3xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-sbg-ink-2">{description}</p>}
    </div>
  );
}

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation: the URL (?tab=) is the single source of truth, so Back, refresh and shared links agree.
  const activeTab: AdminTab = parseAdminTab(searchParams.get("tab"));
  const setActiveTab = useCallback(
    (tab: AdminTab) => router.push(adminTabHref(tab), { scroll: false }),
    [router]
  );

  // Shared data (events, portal config) is loaded once by <AdminPortalProvider> in app/admin/layout.tsx.
  const {
    events,
    portalConfig,
    loading,
    refreshing,
    error,
    refresh: fetchData,
    setAttendanceEnabled,
    setActiveEvent: handleSetActiveEvent,
  } = useAdminPortal();
  // Modal / Form state
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DbEvent | null>(null);
  const [isTBA, setIsTBA] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventDate: "",
    eventTiming: "",
    speakerName: "",
    attendanceOpen: true,
    setAsActive: false,
    eventType: "" as string,
    customEventType: "",
    certificateTheme: DEFAULT_CERTIFICATE_THEME as CertificateTheme,
    eventEndDate: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Lock body scroll and background mouse wheel when modal is open
  useEffect(() => {
    if (showForm) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showForm]);

  // Section B — Participant inspection state
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [inspectingEventId, setInspectingEventId] = useState<string | null>(null);

  // Auto-select active event if none selected
  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      // A shared or reloaded link (?event=) wins, then the active event, then the newest.
      const fromUrl = searchParams.get("event");
      const defaultId =
        (fromUrl && events.some((e) => e.id === fromUrl) ? fromUrl : null) || portalConfig?.active_event_id || events[0].id;
      setSelectedEventId(defaultId);
      setInspectingEventId(defaultId);
    }
  }, [selectedEventId, events, portalConfig, searchParams]);
  const attendeesSectionRef = useRef<HTMLElement | null>(null);
  const [participants, setParticipants] = useState<AdminParticipantRow[]>([]);
  const [totalAttended, setTotalAttended] = useState<number>(0);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("ALL");
  const [participantPage, setParticipantPage] = useState(1);
  // Phones get shorter pages (20 cards) than desktop (50 table rows); a 50-card list is a very long scroll.
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsPhone(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deletingParticipantKey, setDeletingParticipantKey] = useState<string | null>(null);
  // Inline "assign as Top Performer" modal (from the attendee directory).
  const [rankModal, setRankModal] = useState<{ participant: AdminParticipantRow; rank: string } | null>(null);
  const [assigningTopPerformer, setAssigningTopPerformer] = useState(false);
  const [topPerformers, setTopPerformers] = useState<TopPerformerRow[]>([]);
  const [topPerformersEvent, setTopPerformersEvent] = useState<{
    id: string;
    name: string;
    eventDate: string | null;
  } | null>(null);
  const [loadingTopPerformers, setLoadingTopPerformers] = useState(false);
  const [topPerformersError, setTopPerformersError] = useState("");
  const [addingTopPerformer, setAddingTopPerformer] = useState(false);
  const [deletingTopPerformerId, setDeletingTopPerformerId] = useState<string | null>(null);
  const [removingCoverId, setRemovingCoverId] = useState<string | null>(null);
  // Certificates tab: which list is shown, counts reported by the team lists, and busy flags.
  const [certSection, setCertSection] = useState<CertSection>(() => parseCertSection(searchParams.get("section")));
  const [organiserCount, setOrganiserCount] = useState<number | null>(null);
  const [volunteerCount, setVolunteerCount] = useState<number | null>(null);
  const [exportingAll, setExportingAll] = useState(false);
  const [topPerformerSearch, setTopPerformerSearch] = useState("");
  const [showAddTopPerformer, setShowAddTopPerformer] = useState(false);
  // The event the Certificates tab shows, readable from callbacks without re-creating them.
  const certEventRef = useRef("");
  const [issuingTopPerformerId, setIssuingTopPerformerId] = useState<string | null>(null);
  const [issuingAllTopPerformers, setIssuingAllTopPerformers] = useState(false);
  const [sendingTopPerformerId, setSendingTopPerformerId] = useState<string | null>(null);
  const [topPerformerForm, setTopPerformerForm] = useState({
    rank: "1",
    fullName: "",
    email: "",
    rollNo: "",
    course: "",
  });

  // Section C — Team Members state
  const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);
  // ── Custom Confirmation Modal State ───────────────────────
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "create" | "danger" | "info";
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showConfirm = useCallback((opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "create" | "danger" | "info";
    onConfirm: () => void | Promise<void>;
  }) => {
    setConfirmModal({
      isOpen: true,
      ...opts,
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Escape key listener for confirmation modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && confirmModal.isOpen) {
        closeConfirm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmModal.isOpen, closeConfirm]);

  // ── Data Fetching ─────────────────────────────────────────
  // ── Fetch Team Members ─────────────────────────────────────
  const fetchTeamMembers = useCallback(async () => {
    setLoadingTeamMembers(true);
    try {
      const res = await fetch("/api/admin/team-members", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setTeamMembers(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load team members:", err);
    } finally {
      setLoadingTeamMembers(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

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
        const cleaned = (json.data.participants || []).map((p: AdminParticipantRow) => ({
          ...p,
          name: formatFullName(p.name),
        }));
        setParticipants(cleaned);
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

  // Top performers of the event the Certificates tab shows (not only the active event).
  const fetchTopPerformers = useCallback(async () => {
    const eventId = certEventRef.current;
    if (!eventId) return;
    setLoadingTopPerformers(true);
    setTopPerformersError("");
    try {
      const res = await fetch(`/api/admin/top-performers?eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Could not load top performers.");
      }
      if (certEventRef.current !== eventId) return; // another event was chosen meanwhile
      setTopPerformersEvent(json.data?.event || null);
      setTopPerformers(json.data?.topPerformers || []);
    } catch (err) {
      if (certEventRef.current !== eventId) return;
      const message = err instanceof Error ? err.message : "Could not load top performers.";
      setTopPerformersError(message);
      setTopPerformers([]);
      setTopPerformersEvent(null);
    } finally {
      if (certEventRef.current === eventId) setLoadingTopPerformers(false);
    }
  }, []);

  useEffect(() => {
    certEventRef.current = selectedEventId;
    if (selectedEventId) {
      fetchParticipants(selectedEventId);
      setTopPerformers([]);
      setTopPerformersEvent(null);
      void fetchTopPerformers();
    }
  }, [selectedEventId, fetchParticipants, fetchTopPerformers]);

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
      eventType: "",
      customEventType: "",
      certificateTheme: DEFAULT_CERTIFICATE_THEME,
      eventEndDate: "",
    });
    setIsTBA(false);
    setEditingEvent(null);
    setFormError("");
    setShowForm(false);
  };

  const handleToggleTBA = (checked: boolean) => {
    setIsTBA(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        eventTiming: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        eventDate: prev.eventDate || new Date().toISOString().split("T")[0],
        eventTiming: prev.eventTiming || "11:00 AM - 12:30 PM",
      }));
    }
  };

  const startCreate = () => {
    resetForm();
    setIsTBA(false);
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
    const eventIsTBA = !event.event_date || event.event_date.toLowerCase() === "tba" || !event.event_timing;
    setIsTBA(eventIsTBA);
    const eventTypeSaved = event.event_type || "";
    const knownTypes = ["Workshop", "Hackathon", "Quiz", "Event"];
    const isKnown = knownTypes.includes(eventTypeSaved);
    setFormData({
      name: event.name,
      description: event.description || "",
      eventDate: event.event_date || "",
      eventTiming: event.event_timing || "",
      speakerName: event.speaker_name || "",
      attendanceOpen: event.attendance_open,
      setAsActive: portalConfig?.active_event_id === event.id,
      eventType: eventTypeSaved ? (isKnown ? eventTypeSaved : "Custom") : "",
      customEventType: isKnown ? "" : eventTypeSaved,
      certificateTheme: parseCertificateTheme(event.certificate_theme),
      eventEndDate: event.event_end_date || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Event Title is required.");
      setFormSubmitting(false);
      return;
    }

    if (!isTBA) {
      if (!formData.eventDate) {
        setFormError("Event Date is required unless marked as To be announced.");
        setFormSubmitting(false);
        return;
      }
      if (!formData.eventTiming.trim()) {
        setFormError("Timing is required unless marked as To be announced.");
        setFormSubmitting(false);
        return;
      }
    }

    try {
      const url = editingEvent
        ? `/api/admin/events/${editingEvent.id}`
        : "/api/admin/events";
      const method = editingEvent ? "PUT" : "POST";

      const resolvedEventType =
        formData.eventType === "Custom"
          ? formData.customEventType.trim() || null
          : formData.eventType.trim() || null;

      const payload = {
        ...formData,
        isTBA,
        eventDate: isTBA ? null : formData.eventDate,
        eventEndDate: isTBA ? null : (formData.eventEndDate || null),
        eventTiming: isTBA ? null : formData.eventTiming,
        eventType: resolvedEventType,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  // ── Inspect Attendees Handler ─────────────────────────────
  const handleInspectAttendees = (eventId: string) => {
    if (inspectingEventId === eventId && activeTab === "registrations") {
      setInspectingEventId(null);
      setSelectedEventId("");
      return;
    }
    setInspectingEventId(eventId);
    setSelectedEventId(eventId);
    setCertSection("participants");
    setActiveTab("registrations");
    setTimeout(() => {
      attendeesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  // ── Delete Event ──────────────────────────────────────────
  const handleDeleteEvent = (event: DbEvent) => {
    showConfirm({
      title: "Delete Event",
      message: `Are you sure you want to permanently delete "${event.name}"?\n\nWarning: This action will permanently remove the event, its attendance records, and any issued certificates.`,
      confirmLabel: "Delete Event",
      variant: "danger",
      onConfirm: async () => {
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
      },
    });
  };

  // ── Remove Cover Photo ──────────────────────────────────────
  const handleRemoveCover = (event: DbEvent) => {
    if (!event.cover_id) return;
    const coverId = event.cover_id;
    showConfirm({
      title: "Remove Cover Photo",
      message: `Remove the cover photo for "${event.name}"?\n\nIt will disappear from the Home and Events pages right away. A new one can be uploaded from the Media Portal afterwards.`,
      confirmLabel: "Remove Cover",
      variant: "danger",
      onConfirm: async () => {
        setRemovingCoverId(coverId);
        toast.loading("Removing cover photo…", { id: "remove-cover" });
        try {
          const res = await fetch(`/api/media/items/${coverId}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            toast.success("Cover photo removed.", { id: "remove-cover" });
            await fetchData();
          } else {
            toast.error(json.error || "Failed to remove cover photo", { id: "remove-cover" });
          }
        } catch (err: any) {
          toast.error(err.message || "Failed to remove cover photo", { id: "remove-cover" });
        } finally {
          setRemovingCoverId(null);
        }
      },
    });
  };

  // ── Remove Participant ──────────────────────────────────────
  const handleRemoveParticipant = (p: AdminParticipantRow) => {
    if (!selectedEventId) return;

    showConfirm({
      title: "Remove Participant",
      message: `Are you sure you want to remove participant "${p.name}" (${p.email})?\n\nWarning: This will permanently delete their attendance record and any associated certificate for this event.`,
      confirmLabel: "Remove Participant",
      variant: "danger",
      onConfirm: async () => {
        const key = p.attendanceId || p.email;
        setDeletingParticipantKey(key);
        toast.loading(`Removing ${p.name}…`, { id: "remove-participant" });

        try {
          const res = await fetch(`/api/admin/events/${selectedEventId}/participants`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              attendanceId: p.attendanceId,
              participantId: p.participantId,
              certificateId: p.certificateId,
            }),
          });

          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.error || "Failed to remove participant");
          }

          toast.success(`Removed "${p.name}" from event.`, { id: "remove-participant" });
          await fetchParticipants(selectedEventId);
          await fetchData();
        } catch (err: any) {
          toast.error(err.message || "Failed to remove participant", { id: "remove-participant" });
        } finally {
          setDeletingParticipantKey(null);
        }
      },
    });
  };

  const handleAddTopPerformer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddingTopPerformer(true);
    try {
      const res = await fetch("/api/admin/top-performers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          rank: Number(topPerformerForm.rank),
          fullName: topPerformerForm.fullName,
          email: topPerformerForm.email,
          rollNo: topPerformerForm.rollNo,
          course: topPerformerForm.course,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Could not add this top performer.");
      }

      toast.success(json.message || "Top performer added.");
      setTopPerformerForm((current) => ({
        ...current,
        fullName: "",
        email: "",
        rollNo: "",
        course: "",
      }));
      await fetchTopPerformers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add this top performer.");
    } finally {
      setAddingTopPerformer(false);
    }
  };

  const handleRemoveTopPerformer = (topPerformer: TopPerformerRow) => {
    const isIssued = !!topPerformer.certificateId;
    showConfirm({
      title: isIssued ? "Delete Top Performer & Certificate" : "Delete Top Performer",
      message: isIssued
        ? `Delete "${topPerformer.fullName}" from top performers? Their issued Certificate of Excellence will also be deleted.`
        : `Delete "${topPerformer.fullName}" from this event's top performers?`,
      confirmLabel: isIssued ? "Delete Top Performer & Certificate" : "Delete Top Performer",
      variant: "danger",
      onConfirm: async () => {
        setDeletingTopPerformerId(topPerformer.id);
        try {
          const res = await fetch(`/api/admin/top-performers/${topPerformer.id}?eventId=${encodeURIComponent(selectedEventId)}`, {
            method: "DELETE",
          });
          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.error || "Could not delete this top performer.");
          }

          toast.success(json.message || "Top performer deleted.");
          await fetchTopPerformers();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not delete this top performer.");
        } finally {
          setDeletingTopPerformerId(null);
        }
      },
    });
  };

  const issueTopPerformerCertificate = async (topPerformer: TopPerformerRow) => {
    const res = await fetch(`/api/admin/top-performers/${topPerformer.id}/issue`, {
      method: "POST",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Could not issue this certificate.");
    }
    return json.data as { certificateId: string };
  };

  // Assign a participant from the attendee directory as a Top Performer, with a rank.
  const submitRankAssignment = async () => {
    if (!rankModal || assigningTopPerformer) return;
    const { participant, rank } = rankModal;
    const rankNumber = Number(rank);
    if (!rank.trim() || !Number.isSafeInteger(rankNumber) || rankNumber < 1) {
      toast.error("Enter a rank of 1 or higher.");
      return;
    }
    if (!currentViewEvent) {
      toast.error("Select an event first.");
      return;
    }

    setAssigningTopPerformer(true);
    try {
      const res = await fetch("/api/admin/top-performers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: currentViewEvent.id,
          rank: rankNumber,
          fullName: participant.name,
          email: participant.email,
          rollNo: participant.rollNo,
          course: participant.course,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(typeof json?.error === "string" ? json.error : "Could not assign this top performer.");
      }
      toast.success(`${participant.name} assigned as a top performer (rank ${rankNumber}).`);
      setRankModal(null);
      await fetchTopPerformers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not assign this top performer.");
    } finally {
      setAssigningTopPerformer(false);
    }
  };

  const handleIssueTopPerformer = async (topPerformer: TopPerformerRow) => {
    setIssuingTopPerformerId(topPerformer.id);
    try {
      const data = await issueTopPerformerCertificate(topPerformer);
      toast.success(`Certificate issued: ${data.certificateId}`);
      await fetchTopPerformers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not issue this certificate.");
    } finally {
      setIssuingTopPerformerId(null);
    }
  };

  const handleIssueAllPendingTopPerformers = async () => {
    const pending = topPerformers.filter((performer) => !performer.certificateId);
    if (pending.length === 0) {
      toast.info("There are no pending top performer certificates to issue.");
      return;
    }

    setIssuingAllTopPerformers(true);
    let issuedCount = 0;
    const failures: string[] = [];
    try {
      for (const performer of pending) {
        setIssuingTopPerformerId(performer.id);
        try {
          await issueTopPerformerCertificate(performer);
          issuedCount++;
        } catch (err) {
          failures.push(
            `${performer.fullName}: ${err instanceof Error ? err.message : "Unknown error"}`
          );
        }
      }

      await fetchTopPerformers();
      if (failures.length === 0) {
        toast.success(`Issued ${issuedCount} certificate${issuedCount === 1 ? "" : "s"}.`);
      } else {
        toast.error(
          `Issued ${issuedCount} of ${pending.length} certificates; ${failures.length} failed.`,
          {
            description: failures.join("\n"),
            duration: 12000,
          }
        );
      }
    } finally {
      setIssuingTopPerformerId(null);
      setIssuingAllTopPerformers(false);
    }
  };

  const handleSendTopPerformerEmail = async (topPerformer: TopPerformerRow) => {
    if (!topPerformer.certificateId) return;

    setSendingTopPerformerId(topPerformer.id);
    try {
      const res = await fetch("/api/admin/certificates/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId: topPerformer.certificateId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Could not send the certificate to ${topPerformer.email}.`);
      }
      toast.success(`Certificate sent to ${topPerformer.email}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Could not send the certificate to ${topPerformer.email}.`);
    } finally {
      setSendingTopPerformerId(null);
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
  const handleExportCSV = async () => {
    // Exports what the list shows: everyone, or only the rows matching the search / course filter.
    if (filteredParticipants.length === 0) {
      toast.error("No participants to export");
      return;
    }

    const currentEvent = events.find((e) => e.id === selectedEventId);
    const eventTitle = currentEvent?.name || "AWS_SBG_Event";

    const csvData = participantExportRows(filteredParticipants, window.location.origin);

    const Papa = (await import("papaparse")).default;
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
    toast.success(`Exported ${filteredParticipants.length} participants`);
  };

  // ── Export Organising Team / Top Performers to CSV ────────
  const downloadCsv = async (rows: Record<string, string>[], kind: string, label: string) => {
    const currentEvent = events.find((e) => e.id === selectedEventId);
    const Papa = (await import("papaparse")).default;
    const blob = new Blob([Papa.unparse(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", exportFileName(currentEvent?.name || "", kind));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${label} exported to CSV`);
  };

  const handleExportTopPerformersCSV = async () => {
    if (shownTopPerformers.length === 0) {
      toast.error("No top performers to export");
      return;
    }
    await downloadCsv(topPerformerExportRows(shownTopPerformers, window.location.origin), "Top_Performers", "Top performers");
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
  const shownTopPerformers = useMemo(
    () =>
      filterRows(topPerformers, topPerformerSearch, (t) => [
        t.fullName,
        t.email,
        t.rollNo,
        t.course,
        getAwardTitle(t.rank),
        t.certificateId,
        t.certificateId ? "issued" : "not issued pending",
      ]),
    [topPerformers, topPerformerSearch]
  );

  // One message for every "no list to show" state of Top Performers (used by the phone layout).
  const topPerformerStatus = loadingTopPerformers
    ? "Loading top performers…"
    : topPerformersEvent?.id !== currentViewEvent?.id
      ? topPerformersError
        ? "Top performers are unavailable."
        : "Loading event details…"
      : topPerformers.length === 0
        ? "No top performers added for this event yet."
        : shownTopPerformers.length === 0
          ? "Nobody matches this search."
          : null;

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
    const inCourse = selectedCourseFilter === "ALL" ? participants : participants.filter((p) => p.course === selectedCourseFilter);
    return filterRows(inCourse, participantSearch, (p) => [p.name, p.email, p.rollNo, p.course, p.certificateId]);
  }, [participants, participantSearch, selectedCourseFilter]);

  const certCounts: SectionCounts = {
    participants: loadingParticipants ? null : participants.length,
    participationIssued: loadingParticipants ? null : participants.filter((p) => p.certificateId).length,
    topPerformers: loadingTopPerformers || topPerformersEvent?.id !== selectedEventId ? null : topPerformers.length,
    excellenceIssued:
      loadingTopPerformers || topPerformersEvent?.id !== selectedEventId ? null : topPerformers.filter((t) => t.certificateId).length,
    organisers: organiserCount,
    volunteers: volunteerCount,
  };

  // Keep ?tab=registrations&event=…&section=… in the address bar, so reloads and shared links open the same list.
  const writeCertUrl = (patch: { event?: string; section?: CertSection }) => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "registrations");
    if (patch.event) params.set("event", patch.event);
    if (patch.section) params.set("section", patch.section);
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  const selectCertEvent = (id: string) => {
    if (!id || id === selectedEventId) return;
    setSelectedEventId(id);
    setInspectingEventId(id);
    setParticipantSearch("");
    setSelectedCourseFilter("ALL");
    setParticipantPage(1);
    setTopPerformerSearch("");
    setShowAddTopPerformer(false);
    setOrganiserCount(null);
    setVolunteerCount(null);
    writeCertUrl({ event: id });
  };

  const selectCertSection = (section: CertSection) => {
    setCertSection(section);
    writeCertUrl({ section });
  };

  // One Excel file with every list of the chosen event, a sheet each.
  const handleExportAllCertificates = async () => {
    const ev = currentViewEvent;
    if (!ev || exportingAll) return;
    setExportingAll(true);
    try {
      const [orgJson, volJson] = await Promise.all([
        fetch(`/api/admin/events/${ev.id}/organisers`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch(`/api/admin/events/${ev.id}/volunteers`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      ]);
      const origin = window.location.origin;
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const addSheet = (name: string, rows: Record<string, string>[]) => {
        const sheet = rows.length ? XLSX.utils.json_to_sheet(rows) : XLSX.utils.aoa_to_sheet([["None for this event"]]);
        XLSX.utils.book_append_sheet(wb, sheet, name);
      };
      addSheet("Participants", participantExportRows(participants, origin));
      addSheet("Top Performers", topPerformerExportRows(topPerformers, origin));
      addSheet("Organising Team", organiserExportRows(Array.isArray(orgJson?.data?.organisers) ? orgJson.data.organisers : [], origin));
      addSheet("Volunteers", volunteerExportRows(Array.isArray(volJson?.data?.volunteers) ? volJson.data.volunteers : [], origin));
      XLSX.writeFile(wb, exportFileName(ev.name, "Certificates").replace(/\.csv$/, ".xlsx"));
      toast.success("Exported every list of this event");
    } catch (err) {
      console.error("Export all failed:", err);
      toast.error("Could not export this event's lists.");
    } finally {
      setExportingAll(false);
    }
  };

  // Show the list 50 rows at a time. The page is clamped at render time, so a shrinking
  // list (new search, a removed attendee) can never leave the table on an empty page.
  const PARTICIPANTS_PER_PAGE = isPhone ? 20 : 50;
  const currentParticipantPage = clampPage(participantPage, filteredParticipants.length, PARTICIPANTS_PER_PAGE);
  const visibleParticipants = pageSlice(filteredParticipants, currentParticipantPage, PARTICIPANTS_PER_PAGE);
  const participantRange = pageRange(currentParticipantPage, filteredParticipants.length, PARTICIPANTS_PER_PAGE);
  const participantPages = pageCount(filteredParticipants.length, PARTICIPANTS_PER_PAGE);

  // Row actions shared by the desktop table and the mobile card list. `size` sets the
  // button size: compact in the table, a full 40px touch target on phones.
  const renderParticipantActions = (p: AdminParticipantRow, size: string) => (
                                <div className="flex items-center justify-end gap-1.5">
                                  {p.certificateId && (
                                    <>
                                      {/* Download PDF button */}
                                      <a
                                        href={`/api/certificates/${p.certificateId}`}
                                        download={`${p.certificateId}.pdf`}
                                        className={`${size} rounded-lg bg-white/60 hover:bg-sbg-lilac-100 text-sbg-ink-2 hover:text-sbg-ink border border-sbg-ink/[0.08] flex items-center justify-center transition-colors cursor-pointer`}
                                        title="Download PDF Certificate"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </a>

                                      {/* Send email button */}
                                      <button
                                        onClick={() => handleSendSingleEmail(p.certificateId!, p.email)}
                                        className={`${size} rounded-lg bg-white/60 hover:bg-sbg-lilac-100 text-sbg-ink-2 hover:text-sbg-lilac-700 border border-sbg-ink/[0.08] hover:border-sbg-lilac-400 flex items-center justify-center transition-colors cursor-pointer`}
                                        title="Email Certificate with PDF Attachment"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}

                                  {/* Assign as Top Performer */}
                                  <button
                                    onClick={() => setRankModal({ participant: p, rank: "" })}
                                    className={`${size} rounded-lg bg-white/60 hover:bg-[#ffe6c2] text-sbg-ink-3 hover:text-[#92400e] border border-sbg-ink/[0.08] hover:border-[#92400e]/40 flex items-center justify-center transition-colors cursor-pointer`}
                                    title="Assign as Top Performer"
                                  >
                                    <Trophy className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Remove participant button */}
                                  <button
                                    onClick={() => handleRemoveParticipant(p)}
                                    disabled={deletingParticipantKey === (p.attendanceId || p.email)}
                                    className={`${size} rounded-lg bg-white/60 hover:bg-[#ffe1e1] text-sbg-ink-3 hover:text-[#b91c1c] border border-sbg-ink/[0.08] hover:border-[#b91c1c]/40 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40`}
                                    title="Remove Participant & Certificate"
                                  >
                                    {deletingParticipantKey === (p.attendanceId || p.email) ? (
                                      <div className="w-3 h-3 rounded-full border border-red-400/30 border-t-red-400 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
  );

  // Stats calculation
  const totalVerifiedCerts = useMemo(() => {
    return participants.filter((p) => Boolean(p.certificateId)).length;
  }, [participants]);

  return (
    <div
      className="admin-responsive w-full overflow-x-clip pb-8 text-sbg-ink selection:bg-sbg-lilac-200"
    >
      {/* ── Main Operations Container ───────────────────────── */}
      <main className="mx-auto w-full min-w-0 space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-[#ffe1e1] border border-[#b91c1c]/30 text-xs sm:text-sm text-[#b91c1c] flex items-center gap-3">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <AdminPageSkeleton />
        ) : (
          <>
            {/* ── OVERVIEW ─────────────────────────────────────── */}
            {activeTab === "overview" && (
              <section className="space-y-6">
                <PageHeading title="Overview" description="What is live right now, and where to go next." />

                <div className="ad-card ad-card-tint-lilac flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-sbg-ink-2">Active event</p>
                    <h2 className="mt-1 truncate font-lt-display text-xl font-semibold tracking-[-0.035em] text-sbg-ink sm:text-2xl">
                      {activeEvent?.name || "No active event"}
                    </h2>
                    <p className="mt-1 text-sm text-sbg-ink-2">
                      {activeEvent
                        ? [formatDate(activeEvent.event_date, activeEvent.event_end_date), activeEvent.event_timing, activeEvent.speaker_name]
                            .filter(Boolean)
                            .join(" · ")
                        : "Choose an event to start collecting attendance."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`ad-chip ${
                        activeEvent && portalConfig?.attendance_enabled && activeEvent.attendance_open
                          ? "ad-chip-ok"
                          : "ad-chip-warn"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {activeEvent && portalConfig?.attendance_enabled && activeEvent.attendance_open
                        ? "Attendance open"
                        : "Attendance closed"}
                    </span>
                    <button onClick={() => setActiveTab("events")} className="ad-btn ad-btn-primary">
                      Manage event <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {[
                    { label: "Events", value: events.length, tab: "events" as AdminTab, tint: "ad-card-tint-sky" },
                    {
                      label: "Checked in",
                      value: currentViewEvent?.id === activeEvent?.id ? totalAttended : "—",
                      tab: "registrations" as AdminTab,
                      tint: "ad-card-tint-mint",
                    },
                    { label: "Team members", value: teamMembers.length, tab: "team" as AdminTab, tint: "ad-card-tint-peach" },
                  ].map((stat) => (
                    <button
                      key={stat.label}
                      onClick={() => setActiveTab(stat.tab)}
                      className={`ad-card ${stat.tint} cursor-pointer p-3 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 sm:p-5`}
                    >
                      <p className="text-xs font-semibold text-sbg-ink-2">{stat.label}</p>
                      <p className="mt-1 font-lt-display text-3xl font-semibold tracking-[-0.035em] text-sbg-ink">{stat.value}</p>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="ad-card p-5">
                    <h3 className="font-lt-display text-base font-semibold tracking-[-0.02em] text-sbg-ink">Quick actions</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={startCreate} className="ad-btn ad-btn-primary">
                        <Plus className="h-3.5 w-3.5" /> New event
                      </button>
                      <button onClick={() => setActiveTab("registrations")} className="ad-btn ad-btn-ghost">
                        <Users className="h-3.5 w-3.5" /> View attendees
                      </button>
                      <button onClick={() => setActiveTab("team")} className="ad-btn ad-btn-ghost">
                        <Users className="h-3.5 w-3.5" /> Manage team
                      </button>
                    </div>
                  </div>

                  <div className="ad-card p-5">
                    <h3 className="font-lt-display text-base font-semibold tracking-[-0.02em] text-sbg-ink">Public links</h3>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between rounded-2xl border border-sbg-ink/10 bg-white/70 px-3 py-2">
                        <span className="text-sbg-ink-2">
                          Student check-in <code className="font-lt-mono text-sbg-lilac-700">/attendance</code>
                        </span>
                        <button
                          onClick={() => handleCopy(`${window.location.origin}/attendance`, "attendance-link", "Check-in link")}
                          className="inline-flex min-h-10 cursor-pointer items-center gap-1 pl-3 font-semibold text-sbg-lilac-700 transition-colors hover:text-sbg-ink"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-sbg-ink/10 bg-white/70 px-3 py-2">
                        <span className="text-sbg-ink-2">
                          Certificate check <code className="font-lt-mono text-sbg-lilac-700">/verify</code>
                        </span>
                        <Link
                          href="/verify"
                          target="_blank"
                          className="inline-flex min-h-10 items-center gap-1 pl-3 font-semibold text-sbg-lilac-700 transition-colors hover:text-sbg-ink"
                        >
                          <ExternalLink className="h-3 w-3" /> Open
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════ */}
            {/* ── SECTION A: CURRENT ACTIVE EVENT COCKPIT ─────── */}
            {/* ══════════════════════════════════════════════════ */}
            {activeTab === "events" && (
              <section className="space-y-4">
              <PageHeading title="Events" description="Choose which event students can check in to, and manage your event list." />

              {activeEvent ? (
                <div className="ad-card ad-card-tint-lilac space-y-6 p-5 sm:p-7">
                    {/* Header Row */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1fa35b] animate-pulse" />
                          <span className="font-lt-mono text-[11px] uppercase tracking-[0.16em] text-[#047857] font-semibold">
                            Live Active Portal Event
                          </span>
                          {activeEvent.event_type && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-lt-mono text-[10.5px] font-medium uppercase tracking-wider bg-sbg-lilac-100 border border-sbg-lilac-300 text-sbg-lilac-700">
                              {activeEvent.event_type}
                            </span>
                          )}
                        </div>

                        <h3 className="font-lt-display text-2xl sm:text-3xl font-semibold text-sbg-ink tracking-[-0.035em]">
                          {activeEvent.name}
                        </h3>

                        {activeEvent.description && (
                          <p className="text-sm text-sbg-ink-2 leading-relaxed">
                            {activeEvent.description}
                          </p>
                        )}

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap gap-2.5 pt-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-sbg-ink/10 text-xs text-sbg-ink">
                            <Calendar className="w-3.5 h-3.5 text-sbg-lilac-600" />
                            <span>{formatDate(activeEvent.event_date, activeEvent.event_end_date)}</span>
                          </div>

                          {activeEvent.event_timing ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-sbg-ink/10 text-xs text-sbg-ink">
                              <Clock className="w-3.5 h-3.5 text-sbg-lilac-600" />
                              <span>{activeEvent.event_timing}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-sbg-ink/10 text-xs text-sbg-ink-3">
                              <Clock className="w-3.5 h-3.5 text-sbg-ink-3" />
                              <span>Timing TBA</span>
                            </div>
                          )}

                          {activeEvent.speaker_name && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-sbg-ink/10 text-xs text-sbg-ink">
                              <User className="w-3.5 h-3.5 text-sbg-lilac-600" />
                              <span>{activeEvent.speaker_name}</span>
                            </div>
                          )}
                        </div>

                        {/* Cover Photo */}
                        {activeEvent.cover_id && (
                          <div className="flex items-center gap-2.5 p-2 pr-3 rounded-xl bg-white/80 border border-sbg-ink/10 w-fit">
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-sbg-mist border border-sbg-ink/10 shrink-0 flex items-center justify-center">
                              {activeEvent.cover_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={activeEvent.cover_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Loader2 className="w-3.5 h-3.5 text-sbg-ink-3 animate-spin" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-sbg-ink">Cover photo</p>
                              <p className="text-[10px] text-sbg-ink-2">
                                {activeEvent.cover_status === "pending"
                                  ? "Upload not finished"
                                  : activeEvent.cover_status === "processing"
                                  ? "Processing…"
                                  : activeEvent.cover_status === "hidden"
                                  ? "Hidden from site"
                                  : "Live on site"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCover(activeEvent)}
                              disabled={removingCoverId === activeEvent.cover_id}
                              title="Remove cover photo"
                              className="h-10 w-10 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center text-sbg-ink-3 hover:text-[#b91c1c] hover:bg-[#ffe1e1] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              {removingCoverId === activeEvent.cover_id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right Action Stack */}
                      <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2.5 shrink-0">

                        <button onClick={() => startEdit(activeEvent)} className="ad-btn ad-btn-ghost">
                          <Edit3 className="w-3.5 h-3.5 text-sbg-lilac-600" />
                          <span>Edit Details</span>
                        </button>

                        <Link href="/attendance" target="_blank" className="ad-btn ad-btn-ghost">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Preview Portal</span>
                        </Link>
                      </div>
                    </div>

                    {/* Master Switch Bar */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-sbg-ink/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            portalConfig?.attendance_enabled
                              ? "bg-[#ddf3e6] border-[#047857]/30 text-[#047857]"
                              : "bg-sbg-mist border-sbg-ink/10 text-sbg-ink-3"
                          }`}
                        >
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-sbg-ink">
                              Live Attendance Collection
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded font-lt-mono text-[10px] uppercase font-semibold tracking-wider ${
                                portalConfig?.attendance_enabled
                                  ? "bg-[#ddf3e6] text-[#047857] border border-[#047857]/30"
                                  : "bg-sbg-mist text-sbg-ink-2 border border-sbg-ink/10"
                              }`}
                            >
                              {portalConfig?.attendance_enabled ? "OPEN & ACCEPTING" : "CLOSED / PAUSED"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Toggle switch */}
                      <button
                        type="button"
                        onClick={() => setAttendanceEnabled(!portalConfig?.attendance_enabled)}
                        className={`
                          relative w-14 h-8 rounded-full transition-colors duration-200 cursor-pointer shrink-0 p-1
                          ${portalConfig?.attendance_enabled ? "bg-[#1fa35b] shadow-lg shadow-[#1fa35b]/25" : "bg-sbg-ink/25"}
                        `}
                      >
                        <span
                          className={`
                            block w-6 h-6 rounded-full bg-white transition-transform duration-200 shadow-md
                            ${portalConfig?.attendance_enabled ? "translate-x-6" : "translate-x-0"}
                          `}
                        />
                      </button>
                    </div>

                </div>
              ) : (
                /* Empty Active Event State */
                <div className="ad-card border-dashed border-sbg-lilac-300 p-12 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sbg-lilac-100 border border-sbg-lilac-200 flex items-center justify-center text-sbg-lilac-700">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="font-lt-display text-base font-semibold text-sbg-ink mb-1">
                    No active portal event configured
                  </h3>
                  <p className="text-xs text-sbg-ink-2 max-w-sm mx-auto mb-5">
                    Select an event from the catalog below or create a new session to activate the Attendance Portal.
                  </p>
                  <button onClick={startCreate} className="ad-btn ad-btn-primary">
                    Create Your First Event
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ══════════════════════════════════════════════════ */}
          {/* ── ALL EVENTS DECK / BENTO GRID ─────────────────── */}
          {/* ══════════════════════════════════════════════════ */}
          {activeTab === "events" && events.length > 0 && (
            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-lt-display text-lg font-semibold text-sbg-ink tracking-[-0.02em]">
                      All Events Catalog
                    </h3>
                    <p className="text-xs text-sbg-ink-2">
                      Select an event to inspect attendee records or switch the active session
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button onClick={startCreate} className="ad-btn ad-btn-primary">
                      <Plus className="w-4 h-4" />
                      <span>Create New Event</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {events.map((event) => {
                    const isActive = event.id === portalConfig?.active_event_id;
                    const isViewing = event.id === selectedEventId;

                    return (
                      <div
                        key={event.id}
                        className={`
                          ad-card group relative p-5 transition-[transform,box-shadow,border-color] duration-200 flex flex-col justify-between
                          ${
                            isActive
                              ? "ad-card-tint-lilac !border-sbg-lilac-400"
                              : isViewing
                              ? "!border-sbg-lilac-300 !bg-white"
                              : "hover:-translate-y-0.5"
                          }
                        `}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isActive ? (
                                <span className="ad-chip ad-chip-ok font-lt-mono !text-[10px] uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#1fa35b] animate-pulse" />
                                  Active
                                </span>
                              ) : null}

                              <span className="ad-chip font-lt-mono !text-[10px] uppercase tracking-wider">
                                {event.event_type || "Event"}
                              </span>

                              {isViewing && (
                                <span className="font-lt-mono text-[10px] text-sbg-lilac-700 bg-sbg-lilac-100 px-2 py-0.5 rounded whitespace-nowrap">
                                  Viewing
                                </span>
                              )}
                            </div>

                            {/* Card Utility Actions (Media Portal link, Edit & Delete) */}
                            <div className="flex items-center gap-1">
                                <a
                                  href={`/media/events/${encodeURIComponent(event.id)}`}
                                  onClick={(e) => e.stopPropagation()}
                                  title="Manage photos & videos in the Media Portal"
                                  className="h-10 w-10 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center text-sbg-ink-3 hover:text-sbg-lilac-700 hover:bg-sbg-lilac-100 transition-colors cursor-pointer"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEdit(event);
                                  }}
                                  title="Edit Event Details"
                                  className="h-10 w-10 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center text-sbg-ink-3 hover:text-sbg-ink hover:bg-sbg-ink/10 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEvent(event);
                                  }}
                                  title="Delete Event"
                                  className="h-10 w-10 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center text-sbg-ink-3 hover:text-[#b91c1c] hover:bg-[#ffe1e1] transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-lt-display text-base font-semibold tracking-[-0.02em] text-sbg-ink group-hover:text-sbg-lilac-700 transition-colors line-clamp-1">
                              {event.name}
                            </h4>
                            {event.description && (
                              <p className="text-xs text-sbg-ink-2 line-clamp-2 mt-1 leading-relaxed">
                                {event.description}
                              </p>
                            )}
                          </div>

                          {event.cover_id && (
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-sbg-ink/10">
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-sbg-mist border border-sbg-ink/10 shrink-0 flex items-center justify-center">
                                {event.cover_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={event.cover_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Loader2 className="w-3.5 h-3.5 text-sbg-ink-3 animate-spin" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold text-sbg-ink">Cover photo</p>
                                <p className="text-[10px] text-sbg-ink-2">
                                  {event.cover_status === "pending"
                                    ? "Upload not finished"
                                    : event.cover_status === "processing"
                                    ? "Processing…"
                                    : event.cover_status === "hidden"
                                    ? "Hidden from site"
                                    : "Live on site"}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveCover(event);
                                }}
                                disabled={removingCoverId === event.cover_id}
                                title="Remove cover photo"
                                className="h-10 w-10 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center text-sbg-ink-3 hover:text-[#b91c1c] hover:bg-[#ffe1e1] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                              >
                                {removingCoverId === event.cover_id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}

                          <div className="space-y-1.5 text-xs text-sbg-ink-2 pt-2 border-t border-sbg-ink/10">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-sbg-ink-3 shrink-0" />
                              <span className="truncate">{formatDate(event.event_date, event.event_end_date)}</span>
                            </div>
                            {event.event_timing ? (
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-sbg-ink-3 shrink-0" />
                                <span className="truncate">{event.event_timing}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sbg-ink-3">
                                <Clock className="w-3.5 h-3.5 text-sbg-ink-3 shrink-0" />
                                <span className="truncate">Timing to be announced</span>
                              </div>
                            )}
                            {event.speaker_name && (
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-sbg-ink-3 shrink-0" />
                                <span className="truncate">{event.speaker_name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="pt-4 mt-4 border-t border-sbg-ink/10">
                          {!isActive ? (
                            <div className="flex items-center gap-2">
                              {/* Set Active Button */}
                              <button
                                onClick={() => handleSetActiveEvent(event)}
                                className="ad-btn flex-1 border-sbg-lilac-300 bg-sbg-lilac-100 text-sbg-lilac-700 hover:bg-sbg-lilac-600 hover:text-white"
                              >
                                Set Active
                              </button>

                              {/* View Attendees Trigger */}
                              <button
                                onClick={() => handleInspectAttendees(event.id)}
                                className={`ad-btn flex-1 gap-1.5 ${
                                  inspectingEventId === event.id ? "ad-btn-primary" : "ad-btn-ghost"
                                }`}
                              >
                                <Users className="w-3.5 h-3.5 shrink-0" />
                                <span>{inspectingEventId === event.id ? "Hide Attendees" : "Inspect Attendees"}</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleInspectAttendees(event.id)}
                              className={`ad-btn w-full gap-2 ${
                                inspectingEventId === event.id ? "ad-btn-primary" : "ad-btn-ghost"
                              }`}
                            >
                              <Users className="w-3.5 h-3.5 shrink-0" />
                              <span>{inspectingEventId === event.id ? "Hide Attendees" : "Inspect Attendees"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Danger zone: bulk delete lives apart from the everyday actions */}
                <div className="ad-danger-zone flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <DeleteAllButton
                    section="events"
                    noun="events"
                    count={events.length}
                    consequences="Every event's participants, certificates (participation, Excellence and Appreciation), top performers and gallery entries go with them, and the attendance portal is switched off. Team members are not affected."
                    onDeleted={async () => {
                      setInspectingEventId(null);
                      setSelectedEventId("");
                      resetForm();
                      await fetchData();
                    }}
                  />
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════════════ */}
            {/* ── SECTION B: PARTICIPANT DIRECTORY & CREDENTIALS ─ */}
            {/* ══════════════════════════════════════════════════ */}
            {activeTab === "registrations" && (
              currentViewEvent ? (
                <div className="space-y-5 sm:space-y-6">
                  <CertificatesHeader
                    events={events}
                    selectedEventId={selectedEventId}
                    activeEventId={portalConfig?.active_event_id}
                    onSelectEvent={selectCertEvent}
                    section={certSection}
                    onSection={selectCertSection}
                    counts={certCounts}
                    onExportAll={handleExportAllCertificates}
                    exporting={exportingAll}
                  />

                  {/* ── PARTICIPANTS ─────────────────────────────── */}
                  <div id="cert-panel-participants" role="tabpanel" aria-labelledby="cert-tab-participants" className={certSection === "participants" ? "ad-card p-3 sm:p-5 lg:p-6" : "hidden"}>
                  <section
                    ref={attendeesSectionRef}
                className="space-y-4 scroll-mt-24"
              >
                <SectionHeading
                  title="Participants"
                  description={<>Attendance submissions and Certificates of Participation for <span className="text-sbg-lilac-700">{currentViewEvent.name}</span>.</>}
                >
                  <AttendeeImportDialog
                    key={currentViewEvent.id}
                    eventId={currentViewEvent.id}
                    eventName={currentViewEvent.name}
                    eventDate={currentViewEvent.event_date?.trim() ? currentViewEvent.event_date : null}
                    existingEmails={participants.map((p) => p.email)}
                    onImported={() => fetchParticipants(currentViewEvent.id)}
                  />
                  <ExportButton
                    onClick={handleExportCSV}
                    disabled={loadingParticipants || filteredParticipants.length === 0}
                    label={participantSearch.trim() || selectedCourseFilter !== "ALL" ? "Export matches" : "Export"}
                  />
                  <button
                    type="button"
                    onClick={handleBulkSendEmails}
                    disabled={participants.length === 0}
                    className={TOOLBAR_BUTTON}
                    title="Email every participant their certificate"
                  >
                    <Send className="h-4 w-4 text-sbg-lilac-700" />
                    <span>Email all</span>
                  </button>
                </SectionHeading>

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <SearchField
                    value={participantSearch}
                    onChange={(value) => {
                      setParticipantSearch(value);
                      setParticipantPage(1);
                    }}
                    placeholder="Search name, roll no, email, course or certificate…"
                    shown={filteredParticipants.length}
                    total={participants.length}
                  />
                  {courseOptions.length > 2 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0" role="group" aria-label="Filter by course">
                      {courseOptions.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setSelectedCourseFilter(c);
                            setParticipantPage(1);
                          }}
                          aria-pressed={selectedCourseFilter === c}
                          className={`h-8 shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-3 font-mono text-[11px] uppercase transition-all ${
                            selectedCourseFilter === c
                              ? "bg-sbg-lilac-600 font-bold text-white"
                              : "border border-sbg-ink/[0.08] bg-white/60 text-sbg-ink-3 hover:bg-sbg-lilac-100 hover:text-sbg-ink"
                          }`}
                        >
                          {c === "ALL" ? "All courses" : c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              {/* ── PARTICIPANTS TABLE CONTAINER ────────────── */}
              <div className="ad-card overflow-hidden bg-white">
                <div className="overflow-hidden">
                  {loadingParticipants ? (
                    <ListSkeleton rows={8} label="Loading participants" />
                  ) : filteredParticipants.length === 0 ? (
                    <div className="py-24 text-center px-4 max-w-md mx-auto space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-white/60 border border-sbg-ink/[0.08] flex items-center justify-center text-sbg-ink-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-sbg-ink">
                        {participantSearch || selectedCourseFilter !== "ALL"
                          ? "No matching attendees found"
                          : "No participants attended yet"}
                      </h4>
                      <p className="text-xs text-sbg-ink-3 leading-relaxed">
                        {participantSearch || selectedCourseFilter !== "ALL"
                          ? "Try clearing your search query or selecting a different course filter."
                          : "When students mark their attendance using the session QR code, their verified records will appear in this directory."}
                      </p>
                    </div>
                  ) : (
                    <>
                    {/* Phones: one card per attendee (a 6-column table cannot fit) */}
                    <ul className="divide-y divide-sbg-ink/[0.07] md:hidden">
                      {visibleParticipants.map((p, idx) => (
                        <li key={`m-${p.email}-${idx}`} className="space-y-3 p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sbg-lilac-300 bg-gradient-to-tr from-sbg-lilac-100 to-sbg-lilac-200 font-mono text-xs font-bold text-sbg-lilac-700">
                              {getInitials(p.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-sbg-ink">
                                <span className="mr-1.5 font-mono text-[11px] font-normal text-sbg-ink-3">{participantRange.from + idx}.</span>
                                {p.name}
                              </p>
                              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-sbg-ink-3">
                                <span className="font-mono">Roll: {p.rollNo}</span>
                                {p.course && (
                                  <span className="rounded-md border border-sbg-ink/[0.08] bg-white/60 px-1.5 py-0.5 text-sbg-ink">
                                    {p.course}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.email, `email-${idx}`, "Email")}
                            className="flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-sbg-ink/[0.08] bg-white/60 px-3 text-left font-mono text-[11.5px] text-sbg-ink-2 active:bg-sbg-lilac-100"
                            aria-label={`Copy email ${p.email}`}
                          >
                            <span className="truncate">{p.email}</span>
                            {copiedKey === `email-${idx}` ? (
                              <Check className="h-3.5 w-3.5 shrink-0 text-[#047857]" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 shrink-0" />
                            )}
                          </button>
                          <div className="flex items-center justify-between gap-3 text-[11px] text-sbg-ink-3">
                            <span className="font-mono">{formatDateTime(p.submittedAt)}</span>
                            {p.certificateId ? (
                              <Link
                                href={`/verify/${p.certificateId}`}
                                target="_blank"
                                className="flex min-h-10 items-center gap-1 truncate font-mono text-xs font-bold text-sbg-lilac-700"
                              >
                                <span className="truncate">{p.certificateId}</span>
                                <ExternalLink className="h-3 w-3 shrink-0 text-sbg-ink-3" />
                              </Link>
                            ) : (
                              <span className="font-mono text-sbg-ink-3">No certificate</span>
                            )}
                          </div>
                          {renderParticipantActions(p, "h-10 w-10")}
                        </li>
                      ))}
                    </ul>
                    <div className="hidden max-h-[70vh] max-w-full overflow-auto md:block">
                      <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                        <thead>
                          <tr className="sticky top-0 z-10 border-b border-sbg-ink/[0.08] bg-sbg-mist text-sbg-ink-3 font-mono text-[10.5px] uppercase tracking-wider">
                            <th className="w-12 py-3.5 pl-5 pr-2">#</th>
                            <th className="py-3.5 px-4">Participant</th>
                            <th className="py-3.5 px-4">Contact</th>
                            <th className="py-3.5 px-4">Academic Details</th>
                            <th className="py-3.5 px-4">Submitted At</th>
                            <th className="py-3.5 px-4">Certificate ID</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sbg-ink/[0.07]">
                          {visibleParticipants.map((p, idx) => (
                            <tr
                              key={`${p.email}-${idx}`}
                              className="hover:bg-sbg-lilac-50 transition-colors group"
                            >
                              <td className="py-4 pl-5 pr-2 font-mono text-[11px] tabular-nums text-sbg-ink-3">{participantRange.from + idx}</td>
                              {/* Name with Avatar Initials */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sbg-lilac-100 to-sbg-lilac-200 border border-sbg-lilac-300 flex items-center justify-center text-[10px] font-bold text-sbg-lilac-700 shrink-0 font-mono">
                                    {getInitials(p.name)}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-sbg-ink block truncate">
                                      {p.name}
                                    </span>
                                    <span className="text-[10px] text-sbg-ink-3 font-mono">
                                      Roll: {p.rollNo}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Email */}
                              <td className="py-4 px-4 text-sbg-ink-2 font-mono text-[11.5px]">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate max-w-[190px]">{p.email}</span>
                                  <button
                                    onClick={() => handleCopy(p.email, `email-${idx}`, "Email")}
                                    className="opacity-0 group-hover:opacity-100 text-sbg-ink-3 hover:text-sbg-ink transition-opacity cursor-pointer"
                                    title="Copy Email"
                                  >
                                    {copiedKey === `email-${idx}` ? (
                                      <Check className="w-3 h-3 text-[#047857]" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* Course */}
                              <td className="py-4 px-4">
                                <span className="inline-block px-2.5 py-1 rounded-lg bg-white/60 border border-sbg-ink/[0.08] text-sbg-ink font-medium text-[11px]">
                                  {p.course}
                                </span>
                              </td>

                              {/* Submitted At */}
                              <td className="py-4 px-4 text-sbg-ink-3 font-mono text-[11px] whitespace-nowrap">
                                {formatDateTime(p.submittedAt)}
                              </td>

                              {/* Certificate ID */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                {p.certificateId ? (
                                  <div className="flex items-center gap-1.5">
                                    <Link
                                      href={`/verify/${p.certificateId}`}
                                      target="_blank"
                                      className="font-mono text-xs font-bold text-sbg-lilac-700 hover:underline flex items-center gap-1"
                                      title="Open Verification Page"
                                    >
                                      <span>{p.certificateId}</span>
                                      <ExternalLink className="w-3 h-3 text-sbg-ink-3" />
                                    </Link>
                                    <button
                                      onClick={() =>
                                        handleCopy(p.certificateId!, `cert-${idx}`, "Certificate ID")
                                      }
                                      className="opacity-0 group-hover:opacity-100 text-sbg-ink-3 hover:text-sbg-ink transition-opacity cursor-pointer"
                                      title="Copy ID"
                                    >
                                      {copiedKey === `cert-${idx}` ? (
                                        <Check className="w-3 h-3 text-[#047857]" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-sbg-ink-3 font-mono text-xs">—</span>
                                )}
                              </td>

                              {/* Action Buttons */}
                              <td className="py-4 px-4 text-right whitespace-nowrap">
                                {renderParticipantActions(p, "h-7 w-7")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </>
                  )}
                  {!loadingParticipants && filteredParticipants.length > PARTICIPANTS_PER_PAGE && (
                    <div className="flex items-center justify-between gap-3 border-t border-sbg-ink/[0.08] px-4 py-3 text-xs text-sbg-ink-2">
                      <span>
                        Showing {participantRange.from}–{participantRange.to} of {filteredParticipants.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setParticipantPage(currentParticipantPage - 1)}
                          disabled={currentParticipantPage <= 1}
                          className="h-10 cursor-pointer rounded-lg border border-sbg-ink/[0.14] px-3.5 hover:bg-sbg-lilac-100 disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:px-3"
                        >
                          Previous
                        </button>
                        <span className="tabular-nums">
                          {currentParticipantPage} / {participantPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setParticipantPage(currentParticipantPage + 1)}
                          disabled={currentParticipantPage >= participantPages}
                          className="h-10 cursor-pointer rounded-lg border border-sbg-ink/[0.14] px-3.5 hover:bg-sbg-lilac-100 disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:px-3"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
<div className="ad-danger-zone flex flex-wrap items-center justify-end gap-3 p-3 sm:p-4">
                  <DeleteAllButton
                    section="registrations"
                    noun="participants"
                    count={participants.length}
                    eventId={currentViewEvent.id}
                    scope={`for "${currentViewEvent.name}"`}
                    consequences="Their attendance records and the certificates issued through them are deleted, so those certificate links stop verifying. Certificates of Appreciation are kept."
                    onDeleted={async () => {
                      await Promise.all([fetchParticipants(currentViewEvent.id), fetchTopPerformers()]);
                    }}
                  />
</div>
            </section>

                  </div>

                  {/* ── TOP PERFORMERS ───────────────────────────── */}
                  <div id="cert-panel-top-performers" role="tabpanel" aria-labelledby="cert-tab-top-performers" className={certSection === "top-performers" ? "ad-card p-3 sm:p-5 lg:p-6" : "hidden"}>
            <section className="space-y-4">
              <SectionHeading
                title="Top Performers"
                description={<>Certificates of Excellence for <span className="text-[#92400e]">{currentViewEvent.name}</span>. The rank becomes the award, e.g. 1st Position.</>}
              >
                <button
                  type="button"
                  onClick={() => setShowAddTopPerformer((open) => !open)}
                  aria-expanded={showAddTopPerformer}
                  className={TOOLBAR_BUTTON}
                >
                  {showAddTopPerformer ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4 text-[#92400e]" />}
                  <span>{showAddTopPerformer ? "Close form" : "Add one"}</span>
                </button>
                <TopPerformerImportDialog
                  key={`tp-import-${currentViewEvent.id}`}
                  eventId={currentViewEvent.id}
                  existingEmails={topPerformers.map((performer) => performer.email)}
                  onImported={fetchTopPerformers}
                />
                <ExportButton
                  onClick={handleExportTopPerformersCSV}
                  disabled={loadingTopPerformers || topPerformersEvent?.id !== currentViewEvent.id || shownTopPerformers.length === 0}
                  label={topPerformerSearch.trim() ? "Export matches" : "Export"}
                />
                <button
                  type="button"
                  onClick={handleIssueAllPendingTopPerformers}
                  disabled={
                    loadingTopPerformers ||
                    topPerformersEvent?.id !== currentViewEvent.id ||
                    issuingAllTopPerformers ||
                    issuingTopPerformerId !== null ||
                    topPerformers.filter((performer) => !performer.certificateId).length === 0
                  }
                  className="inline-flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-[#92400e]/30 bg-[#fff1dc] px-3.5 text-xs font-semibold text-[#92400e] hover:bg-[#ffe6c2] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {issuingAllTopPerformers ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Award className="h-3.5 w-3.5" />}
                  {issuingAllTopPerformers
                    ? "Issuing…"
                    : `Issue pending (${topPerformers.filter((performer) => !performer.certificateId).length})`}
                </button>
              </SectionHeading>

                  {showAddTopPerformer && (
                  <div className="rounded-2xl border border-[#92400e]/20 bg-[#fff8ec] p-3 sm:p-4">
                  <form onSubmit={handleAddTopPerformer} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sbg-ink-2">Rank</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={topPerformerForm.rank}
                        onChange={(e) => setTopPerformerForm((current) => ({ ...current, rank: e.target.value }))}
                        className="h-10 w-full rounded-xl bg-white border border-sbg-ink/[0.14] px-3 text-sm text-sbg-ink focus:outline-none focus:border-sbg-lilac-600"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sbg-ink-2">Name</span>
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={100}
                        value={topPerformerForm.fullName}
                        onChange={(e) => setTopPerformerForm((current) => ({ ...current, fullName: e.target.value }))}
                        placeholder="Full name"
                        className="h-10 w-full rounded-xl bg-white border border-sbg-ink/[0.14] px-3 text-sm text-sbg-ink placeholder:text-sbg-ink-3 focus:outline-none focus:border-sbg-lilac-600"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sbg-ink-2">Email</span>
                      <input
                        type="email"
                        required
                        maxLength={254}
                        value={topPerformerForm.email}
                        onChange={(e) => setTopPerformerForm((current) => ({ ...current, email: e.target.value }))}
                        placeholder="name@example.com"
                        className="h-10 w-full rounded-xl bg-white border border-sbg-ink/[0.14] px-3 text-sm text-sbg-ink placeholder:text-sbg-ink-3 focus:outline-none focus:border-sbg-lilac-600"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sbg-ink-2">Roll No.</span>
                      <input
                        type="text"
                        required
                        value={topPerformerForm.rollNo}
                        onChange={(e) => setTopPerformerForm((current) => ({ ...current, rollNo: e.target.value }))}
                        placeholder="Roll number"
                        className="h-10 w-full rounded-xl bg-white border border-sbg-ink/[0.14] px-3 text-sm text-sbg-ink placeholder:text-sbg-ink-3 focus:outline-none focus:border-sbg-lilac-600"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sbg-ink-2">Course</span>
                      <input
                        type="text"
                        required
                        value={topPerformerForm.course}
                        onChange={(e) => setTopPerformerForm((current) => ({ ...current, course: e.target.value }))}
                        placeholder="Course"
                        className="h-10 w-full rounded-xl bg-white border border-sbg-ink/[0.14] px-3 text-sm text-sbg-ink placeholder:text-sbg-ink-3 focus:outline-none focus:border-sbg-lilac-600"
                      />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={addingTopPerformer || !topPerformersEvent || topPerformersEvent.id !== currentViewEvent.id}
                        className="h-10 w-full px-4 rounded-xl text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {addingTopPerformer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                        Add Top Performer
                      </button>
                    </div>
                  </form>
                  </div>
                  )}

                  <SearchField
                    value={topPerformerSearch}
                    onChange={setTopPerformerSearch}
                    placeholder="Search name, email, roll no, course, award or certificate…"
                    shown={shownTopPerformers.length}
                    total={topPerformers.length}
                  />

                  {topPerformersError && (
                    <p role="alert" className="text-xs text-[#b91c1c]">{topPerformersError}</p>
                  )}

                  <div className="md:hidden">
                    {loadingTopPerformers ? (
                      <CardsSkeleton count={3} label="Loading top performers" />
                    ) : topPerformerStatus ? (
                      <p className="rounded-xl border border-sbg-ink/[0.1] px-4 py-8 text-center text-xs text-sbg-ink-3">
                        {topPerformerStatus}
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {shownTopPerformers.map((performer) => (
                          <li key={`m-${performer.id}`} className="space-y-3 rounded-xl border border-sbg-ink/[0.1] bg-white/60 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-mono text-xs font-semibold text-[#92400e]">{getAwardTitle(performer.rank)}</p>
                                <p className="mt-1 truncate text-sm font-semibold text-sbg-ink">{performer.fullName}</p>
                                <p className="text-[11px] text-sbg-ink-3">Roll: {performer.rollNo} · {performer.course}</p>
                              </div>
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${performer.certificateId ? "bg-[#e3f6ec] text-[#047857]" : "bg-sbg-lilac-50 text-sbg-ink-2"}`}>
                                {performer.certificateId ? "Issued" : "Not issued"}
                              </span>
                            </div>
                            <p className="truncate font-mono text-[11px] text-sbg-ink-2">{performer.email}</p>
                            {performer.certificateId && (
                              <div className="flex items-center gap-2">
                                <Link href={`/verify/${performer.certificateId}`} target="_blank" className="flex min-h-10 items-center truncate font-mono text-xs text-sbg-lilac-700">
                                  {performer.certificateId}
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(performer.certificateId!, `top-performer-cert-${performer.id}`, "Certificate ID")}
                                  aria-label="Copy certificate ID"
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sbg-ink-3 active:bg-sbg-lilac-100"
                                >
                                  {copiedKey === `top-performer-cert-${performer.id}` ? <Check className="h-3.5 w-3.5 text-[#047857]" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              {performer.certificateId ? (
                                <button
                                  type="button"
                                  onClick={() => handleSendTopPerformerEmail(performer)}
                                  disabled={sendingTopPerformerId === performer.id || deletingTopPerformerId === performer.id}
                                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-sbg-lilac-300 bg-sbg-lilac-100 px-3 text-xs font-medium text-sbg-lilac-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {sendingTopPerformerId === performer.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                  Send email
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleIssueTopPerformer(performer)}
                                  disabled={issuingTopPerformerId !== null || issuingAllTopPerformers || deletingTopPerformerId === performer.id}
                                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#92400e]/30 bg-[#fff1dc] px-3 text-xs font-medium text-[#92400e] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {issuingTopPerformerId === performer.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Award className="h-3.5 w-3.5" />}
                                  Issue certificate
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveTopPerformer(performer)}
                                disabled={deletingTopPerformerId === performer.id || issuingAllTopPerformers || issuingTopPerformerId !== null || sendingTopPerformerId === performer.id}
                                aria-label={`Remove ${performer.fullName}`}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#b91c1c]/25 bg-[#fff3f3] text-[#b91c1c] disabled:opacity-50"
                              >
                                {deletingTopPerformerId === performer.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="hidden max-w-full overflow-x-auto rounded-xl border border-sbg-ink/[0.1] md:block">
                    <table className="w-full min-w-[900px] text-left text-xs">
                      <thead className="bg-white/60 text-[10px] font-mono uppercase tracking-wider text-sbg-ink-3">
                        <tr>
                          <th className="px-4 py-3">Rank</th>
                          <th className="px-4 py-3">Participant</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Course</th>
                          <th className="px-4 py-3">Certificate Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sbg-ink/[0.07]">
                        {loadingTopPerformers ? (
                          <TableRowsSkeleton rows={4} columns={6} label="Loading top performers" />
                        ) : topPerformersEvent?.id !== currentViewEvent.id ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-sbg-ink-3">
                              {topPerformersError ? "Top performers are unavailable." : "Loading event details…"}
                            </td>
                          </tr>
                        ) : shownTopPerformers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-sbg-ink-3">
                              {topPerformers.length === 0 ? "No top performers added for this event yet." : "Nobody matches this search."}
                            </td>
                          </tr>
                        ) : shownTopPerformers.map((performer) => (
                          <tr key={performer.id} className="text-sbg-ink hover:bg-sbg-lilac-50">
                            <td className="px-4 py-3 font-mono font-semibold text-[#92400e]">{getAwardTitle(performer.rank)}</td>
                            <td className="px-4 py-3">
                              <span className="block font-semibold text-sbg-ink">{performer.fullName}</span>
                              <span className="text-[10px] text-sbg-ink-3">Roll: {performer.rollNo}</span>
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px]">{performer.email}</td>
                            <td className="px-4 py-3">{performer.course}</td>
                            <td className="px-4 py-3">
                              {performer.certificateId ? (
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#047857]">Issued</span>
                                  <div className="mt-1 flex items-center gap-1.5">
                                    <Link href={`/verify/${performer.certificateId}`} target="_blank" className="font-mono text-[11px] text-sbg-lilac-700 hover:underline">
                                      {performer.certificateId}
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(performer.certificateId!, `top-performer-cert-${performer.id}`, "Certificate ID")}
                                      title="Copy Certificate ID"
                                      className="text-sbg-ink-3 hover:text-sbg-ink"
                                    >
                                      {copiedKey === `top-performer-cert-${performer.id}` ? <Check className="h-3 w-3 text-[#047857]" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sbg-ink-2">Not issued</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1.5">
                                {performer.certificateId ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSendTopPerformerEmail(performer)}
                                    disabled={sendingTopPerformerId === performer.id || deletingTopPerformerId === performer.id}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-sbg-lilac-300 bg-sbg-lilac-100 px-2.5 text-[11px] font-medium text-sbg-lilac-700 hover:bg-sbg-lilac-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {sendingTopPerformerId === performer.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                                    Send Email
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleIssueTopPerformer(performer)}
                                    disabled={issuingTopPerformerId !== null || issuingAllTopPerformers || deletingTopPerformerId === performer.id}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#92400e]/30 bg-[#fff1dc] px-2.5 text-[11px] font-medium text-[#92400e] hover:bg-[#ffe6c2] disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {issuingTopPerformerId === performer.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Award className="h-3 w-3" />}
                                    Issue Certificate of Excellence
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTopPerformer(performer)}
                                  disabled={deletingTopPerformerId === performer.id || issuingAllTopPerformers || issuingTopPerformerId !== null || sendingTopPerformerId === performer.id}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#b91c1c]/25 bg-[#fff3f3] px-2.5 text-[11px] font-medium text-[#b91c1c] hover:bg-[#ffe1e1] disabled:opacity-50"
                                >
                                  {deletingTopPerformerId === performer.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                  
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
<div className="ad-danger-zone flex flex-wrap items-center justify-end gap-3 p-3 sm:p-4">
                <DeleteAllButton
                  section="top-performers"
                  noun="top performers"
                  count={topPerformers.length}
                  eventId={currentViewEvent.id}
                  scope={`for "${currentViewEvent.name}"`}
                  disabled={loadingTopPerformers || topPerformersEvent?.id !== currentViewEvent.id}
                  consequences="Their Certificates of Excellence are deleted too, so those certificate links stop verifying."
                  onDeleted={fetchTopPerformers}
                />
</div>
            </section>
                  </div>

                  {/* ── ORGANISING TEAM ──────────────────────────── */}
                  <div id="cert-panel-organisers" role="tabpanel" aria-labelledby="cert-tab-organisers" className={certSection === "organisers" ? "ad-card p-3 sm:p-5 lg:p-6" : "hidden"}>
                    <OrganiserSection
                      key={`org-${currentViewEvent.id}`}
                      eventId={currentViewEvent.id}
                      eventName={currentViewEvent.name}
                      eventHasDate={Boolean(currentViewEvent.event_date?.trim())}
                      confirm={showConfirm}
                      onCountChange={setOrganiserCount}
                    />
                  </div>

                  {/* ── VOLUNTEERS ───────────────────────────────── */}
                  <div id="cert-panel-volunteers" role="tabpanel" aria-labelledby="cert-tab-volunteers" className={certSection === "volunteers" ? "ad-card p-3 sm:p-5 lg:p-6" : "hidden"}>
                    <VolunteerSection
                      key={`vol-${currentViewEvent.id}`}
                      eventId={currentViewEvent.id}
                      eventName={currentViewEvent.name}
                      eventHasDate={Boolean(currentViewEvent.event_date?.trim())}
                      confirm={showConfirm}
                      onCountChange={setVolunteerCount}
                    />
                  </div>
                </div>
              ) : (
                <div className="ad-card p-12 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-white/70 border border-sbg-ink/[0.14] flex items-center justify-center text-sbg-ink-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-sbg-ink">No Events Available</h3>
                    <p className="text-xs text-sbg-ink-3 max-w-sm mx-auto">
                      Create an event first in the Events tab to view participants and certificates.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("events")}
                    className="h-9 px-4 rounded-xl text-xs font-semibold bg-sbg-lilac-600 hover:brightness-110 text-white transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Go to Events Catalog</span>
                  </button>
                </div>
              )
            )}

            {/* ── TEAM TAB ─────────────────────────────────────── */}
            {activeTab === "team" && (
              <TeamTab members={teamMembers} loading={loadingTeamMembers} onChanged={fetchTeamMembers} showConfirm={showConfirm} />
            )}
        </>
      )}
    </main>

      {/* ══════════════════════════════════════════════════ */}
      {/* ── CREATE / EDIT EVENT MODAL (FROSTED GLASS) ───── */}
      {/* ══════════════════════════════════════════════════ */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 flex items-center justify-center overscroll-contain"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="ad-backdrop fixed inset-0 transition-opacity"
            onClick={resetForm}
          />
          <div
            className="ad-modal relative w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="px-6 sm:px-7 py-5 border-b border-sbg-ink/10 flex items-center justify-between shrink-0 flex-nowrap gap-3">
                <div>
                  <h3 className="font-lt-display text-lg font-semibold text-sbg-ink tracking-[-0.03em]">
                    {editingEvent ? "Edit Event Session" : "Create New Event Session"}
                  </h3>
                  <p className="text-xs text-sbg-ink-3 mt-0.5">
                    {editingEvent
                      ? "Update session schedule, timing, and keynote details"
                      : "Define a new workshop or webinar for the AWS Student Builder Group"}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="h-10 w-10 sm:h-8 sm:w-8 rounded-xl bg-sbg-ink/5 hover:bg-sbg-ink/10 text-sbg-ink-2 hover:text-sbg-ink flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleFormSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                <div
                  className="p-6 sm:p-7 space-y-5 overflow-y-auto overscroll-contain flex-1 min-h-0"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(27, 17, 64, 0.25) transparent",
                  }}
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                >
                  {/* Event Name */}
                  <div className="space-y-2">
                    <label className="block font-lt-mono text-[11px] uppercase tracking-[0.12em] text-sbg-ink-2 font-medium">
                      Event Title <span className="text-sbg-lilac-700">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Cloud Kickstart 2026: AWS Architecture"
                      className="ad-input h-11"
                    />
                  </div>

                  {/* Event Type / Category */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block font-lt-mono text-[11px] uppercase tracking-[0.12em] text-sbg-ink-2 font-medium flex items-center gap-1.5">
                        <span>Event Type</span>
                        <span className="text-[10px] text-sbg-ink-3 font-normal normal-case tracking-normal">
                          (Optional)
                        </span>
                      </label>
                      {formData.eventType && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, eventType: "", customEventType: "" })}
                          className="text-[11px] text-sbg-ink-3 hover:text-[#b91c1c] font-mono transition-colors cursor-pointer"
                        >
                          Clear selection
                        </button>
                      )}
                    </div>

                    {/* Segmented Category Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        {
                          type: "Workshop",
                          icon: GraduationCap,
                          label: "Workshop",
                          activeBg: "bg-sbg-lilac-100 border-sbg-lilac-600 text-sbg-ink ring-1 ring-sbg-lilac-600/30",
                          activeIcon: "text-sbg-lilac-700",
                          idleIcon: "text-sbg-lilac-600 group-hover:text-sbg-lilac-700",
                        },
                        {
                          type: "Hackathon",
                          icon: Trophy,
                          label: "Hackathon",
                          activeBg: "bg-[#ffebd3] border-[#d97706] text-sbg-ink ring-1 ring-[#d97706]/30",
                          activeIcon: "text-[#92400e]",
                          idleIcon: "text-[#d97706] group-hover:text-[#92400e]",
                        },
                        {
                          type: "Quiz",
                          icon: HelpCircle,
                          label: "Quiz",
                          activeBg: "bg-[#dcebff] border-[#1f4f9a] text-sbg-ink ring-1 ring-[#1f4f9a]/30",
                          activeIcon: "text-[#1f4f9a]",
                          idleIcon: "text-[#1f4f9a]/70 group-hover:text-[#1f4f9a]",
                        },
                        {
                          type: "Event",
                          icon: Calendar,
                          label: "Event",
                          activeBg: "bg-[#ddf3e6] border-[#047857] text-sbg-ink ring-1 ring-[#047857]/30",
                          activeIcon: "text-[#047857]",
                          idleIcon: "text-[#047857]/70 group-hover:text-[#047857]",
                        },
                        {
                          type: "Custom",
                          icon: PenTool,
                          label: "Custom",
                          activeBg: "bg-[#ffe7f1] border-[#be185d] text-sbg-ink ring-1 ring-[#be185d]/30",
                          activeIcon: "text-[#9d174d]",
                          idleIcon: "text-[#be185d]/70 group-hover:text-[#9d174d]",
                        },
                      ].map((item) => {
                        const isSelected = formData.eventType === item.type;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => {
                              const nextType = isSelected ? "" : item.type;
                              setFormData({
                                ...formData,
                                eventType: nextType,
                                customEventType: nextType === "Custom" ? formData.customEventType : "",
                              });
                            }}
                            className={cn(
                              "group relative flex items-center justify-center gap-2 h-11 px-3 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer select-none",
                              isSelected
                                ? item.activeBg
                                : "bg-white/80 border-sbg-ink/15 text-sbg-ink-2 hover:text-sbg-ink hover:bg-white hover:border-sbg-lilac-300"
                            )}
                          >
                            <Icon className={cn("w-3.5 h-3.5 transition-colors", isSelected ? item.activeIcon : item.idleIcon)} />
                            <span className="font-semibold tracking-wide">{item.label}</span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse ml-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom event type input with quick suggestions */}
                    {formData.eventType === "Custom" && (
                      <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sbg-lilac-600">
                            <PenTool className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            value={formData.customEventType}
                            onChange={(e) => setFormData({ ...formData, customEventType: e.target.value })}
                            placeholder="Enter custom category (e.g. Webinar, Boot Camp, Panel Discussion)…"
                            className="ad-input h-10 pl-9 pr-8 text-xs sm:text-sm"
                            autoFocus
                          />
                          {formData.customEventType && (
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, customEventType: "" })}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sbg-ink-3 hover:text-sbg-ink cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {/* Quick Suggestions Chips */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-sbg-ink-3">Suggestions:</span>
                          {["Webinar", "Panel Discussion", "Boot Camp", "Study Sprint"].map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setFormData({ ...formData, customEventType: suggestion })}
                              className={cn(
                                "px-2 py-0.5 rounded-lg text-[10.5px] font-mono border transition-all cursor-pointer",
                                formData.customEventType.toLowerCase() === suggestion.toLowerCase()
                                  ? "bg-sbg-lilac-100 border-sbg-lilac-600 text-sbg-lilac-700"
                                  : "bg-white/80 border-sbg-ink/15 text-sbg-ink-2 hover:text-sbg-ink hover:border-sbg-lilac-300"
                              )}
                            >
                              +{suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Certificate Color */}
                  <CertificateThemePicker
                    value={formData.certificateTheme}
                    onChange={(certificateTheme) => setFormData((prev) => ({ ...prev, certificateTheme }))}
                    disabled={formSubmitting}
                  />

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-lt-mono text-[11px] uppercase tracking-[0.12em] text-sbg-ink-2 font-medium">
                        Description
                      </label>
                      <span className="text-[11px] text-sbg-ink-3">Optional</span>
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief overview of topics covered, cloud services explored, and student takeaways."
                      rows={2}
                      className="ad-input resize-none leading-relaxed"
                    />
                  </div>

                  {/* Date & Timing Grid */}
                  <div className={cn("grid gap-4", isTBA ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
                    {/* Event Date Column */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between min-h-[20px]">
                        <label className="block font-lt-mono text-[11px] uppercase tracking-[0.12em] text-sbg-ink-2 font-medium">
                          Event Date {!isTBA && <span className="text-sbg-lilac-700">*</span>}
                        </label>
                      </div>

                      {isTBA ? (
                        <div
                          onClick={() => handleToggleTBA(false)}
                          className="w-full h-11 px-3.5 rounded-xl bg-white/80 border border-dashed border-sbg-lilac-400 hover:border-sbg-lilac-600 text-sbg-ink flex items-center justify-between cursor-pointer transition-all group"
                          title="Click to specify date and timing"
                        >
                          <div className="flex items-center gap-2.5">
                            <Calendar className="w-4 h-4 text-sbg-lilac-700" />
                            <span className="text-xs sm:text-sm text-sbg-ink font-medium">
                              Date & Timing to be announced
                            </span>
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-sbg-lilac-100 text-sbg-lilac-700 border border-sbg-lilac-300 font-semibold group-hover:bg-sbg-lilac-200 transition-colors">
                            Set Date
                          </span>
                        </div>
                      ) : (
                        <DatePicker
                          value={formData.eventDate}
                          onChange={(date) =>
                            setFormData((prev) => ({ ...prev, eventDate: date }))
                          }
                          onSelectTBA={() => handleToggleTBA(true)}
                          placeholder="Select event date"
                          required
                        />
                      )}
                    </div>

                    {/* Timing Column - Hidden if TBA */}
                    {!isTBA && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between min-h-[20px]">
                          <label className="block font-lt-mono text-[11px] uppercase tracking-[0.12em] text-sbg-ink-2 font-medium">
                            Timing <span className="text-sbg-lilac-700">*</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.eventTiming}
                          onChange={(e) =>
                            setFormData({ ...formData, eventTiming: e.target.value })
                          }
                          placeholder="e.g. 11:00 AM - 12:30 PM"
                          className="ad-input h-11"
                        />
                      </div>
                    )}
                  </div>

                  {/* End Date — optional, for multi-day events */}
                  {!isTBA && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between min-h-[20px]">
                        <label className="block font-lt-mono text-[11px] uppercase tracking-[0.12em] text-sbg-ink-2 font-medium">
                          End Date
                        </label>
                        <span className="text-[11px] text-sbg-ink-3">Optional — for multi-day events</span>
                      </div>
                      <DatePicker
                        value={formData.eventEndDate}
                        onChange={(date) => setFormData((prev) => ({ ...prev, eventEndDate: date }))}
                        placeholder="Select end date (leave empty for a single-day event)"
                        minDate={formData.eventDate || undefined}
                      />
                      {formData.eventEndDate && (
                        <p className="text-[11px] text-sbg-ink-3">
                          Certificates will show{" "}
                          <span className="font-mono text-sbg-lilac-700">
                            {formatEventDate(formData.eventDate, formData.eventEndDate) || "—"}
                          </span>
                          .
                        </p>
                      )}
                    </div>
                  )}

                  {/* Speaker Name */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-lt-mono text-[11px] uppercase tracking-[0.12em] text-sbg-ink-2 font-medium">
                        Speaker / Lead Presenter
                      </label>
                      <span className="text-[11px] text-sbg-ink-3">Optional</span>
                    </div>
                    <input
                      type="text"
                      value={formData.speakerName}
                      onChange={(e) =>
                        setFormData({ ...formData, speakerName: e.target.value })
                      }
                      placeholder="e.g. Mr. Aashu Dev"
                      className="ad-input h-11"
                    />
                  </div>

                  {/* Set As Active Toggle */}
                  <div className="pt-1">
                    <label className="p-3.5 sm:p-4 rounded-xl bg-white/80 border border-sbg-ink/10 hover:border-sbg-lilac-300 flex items-center justify-between cursor-pointer transition-colors group">
                      <div className="pr-3">
                        <span className="text-xs font-semibold text-sbg-ink block group-hover:text-sbg-lilac-700 transition-colors">
                          Set as Active Portal Event
                        </span>
                        <span className="text-[11px] text-sbg-ink-3 mt-0.5 block leading-normal">
                          Immediately display this event on the student Attendance Portal
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.setAsActive}
                        onChange={(e) =>
                          setFormData({ ...formData, setAsActive: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-sbg-ink/30 accent-[#7C3AED] cursor-pointer shrink-0"
                      />
                    </label>
                  </div>

                  {formError && (
                    <div className="p-3.5 rounded-xl bg-[#ffe1e1] border border-[#b91c1c]/30 text-xs text-[#b91c1c]">
                      {formError}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-sbg-ink/10 bg-sbg-paper flex items-center justify-between gap-2.5 shrink-0">
                  {editingEvent ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(editingEvent)}
                      className="ad-btn ad-btn-danger gap-1.5"
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
                      className="ad-btn ad-btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="ad-btn ad-btn-primary"
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
      {/* ══════════════════════════════════════════════════ */}
      {/* ── ASSIGN TOP PERFORMER (RANK) MODAL ───────────── */}
      {/* ══════════════════════════════════════════════════ */}
      {rankModal && (
        <div
          className="fixed inset-0 z-[60] overflow-y-auto p-2 sm:p-4 flex items-center justify-center overscroll-contain animate-in fade-in duration-150"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="ad-backdrop fixed inset-0"
            onClick={() => !assigningTopPerformer && setRankModal(null)}
          />
          <div className="ad-modal relative z-10 w-full max-w-md p-5 sm:p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border bg-[#fff1dc] border-[#92400e]/25 text-[#92400e]">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-sbg-ink tracking-tight">Assign as Top Performer</h3>
                <p className="mt-1 text-xs text-sbg-ink-2">
                  <span className="font-medium text-sbg-ink">{rankModal.participant.name}</span>
                  {" · "}
                  {rankModal.participant.course}
                  {currentViewEvent ? (
                    <>
                      <br />
                      Event: <span className="text-sbg-ink">{currentViewEvent.name}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submitRankAssignment();
              }}
              className="mt-4 space-y-3"
            >
              <label htmlFor="tp-rank" className="block text-xs font-semibold text-sbg-ink">
                Rank <span className="text-[#92400e]">*</span>
              </label>
              <input
                id="tp-rank"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                autoFocus
                value={rankModal.rank}
                onChange={(e) => setRankModal((prev) => (prev ? { ...prev, rank: e.target.value.replace(/\D/g, "") } : prev))}
                placeholder="e.g. 1"
                disabled={assigningTopPerformer}
                className="w-full h-11 rounded-xl border border-sbg-ink/[0.14] bg-sbg-mist px-3.5 text-sm text-sbg-ink placeholder:text-sbg-ink-3 focus:border-sbg-lilac-600 focus:outline-none"
              />
              <p className="text-[11px] text-sbg-ink-3">
                Rank 1, 2 and 3 map to Gold, Silver and Bronze certificates. Issue the certificate from the Top Performers section after assigning.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRankModal(null)}
                  disabled={assigningTopPerformer}
                  className="h-10 px-4 rounded-xl text-xs font-semibold text-sbg-ink-2 hover:text-sbg-ink bg-white/60 hover:bg-sbg-lilac-100 border border-sbg-ink/[0.12] transition-all cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningTopPerformer || !rankModal.rank.trim()}
                  className="h-10 px-5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-amber-700 to-amber-800 hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-600/20 flex items-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  {assigningTopPerformer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                  {assigningTopPerformer ? "Assigning…" : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ══════════════════════════════════════════════════ */}
      {/* ── CUSTOM CONFIRMATION DIALOG MODAL ────────────── */}
      {/* ══════════════════════════════════════════════════ */}
      {confirmModal.isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 flex items-center justify-center overscroll-contain animate-in fade-in duration-150"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Backdrop with blur */}
          <div
            className="ad-backdrop fixed inset-0 transition-opacity"
            onClick={closeConfirm}
          />

          {/* Dialog Card */}
          <div
            className="ad-modal relative w-full max-w-md p-6 sm:p-7 overflow-hidden z-10 animate-in zoom-in-95 duration-200"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Top Glow Hairline */}
            <div
              className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${
                confirmModal.variant === "danger"
                  ? "via-[#b91c1c]/60"
                  : "via-sbg-lilac-500/70"
              } to-transparent`}
            />

            {/* Header: Icon badge & Close button */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  confirmModal.variant === "danger"
                    ? "bg-[#ffe1e1] border-[#b91c1c]/25 text-[#b91c1c]"
                    : "bg-sbg-lilac-100 border-sbg-lilac-300 text-sbg-lilac-700"
                }`}
              >
                {confirmModal.variant === "danger" ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : confirmModal.variant === "create" ? (
                  <Plus className="w-6 h-6" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>
              <button
                onClick={closeConfirm}
                className="h-10 w-10 sm:h-8 sm:w-8 rounded-xl bg-sbg-ink/5 hover:bg-sbg-ink/10 text-sbg-ink-2 hover:text-sbg-ink flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="font-lt-display text-lg font-semibold text-sbg-ink tracking-[-0.03em]">
                {confirmModal.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-sbg-ink-2 leading-relaxed whitespace-pre-line">
                {confirmModal.message}
              </p>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-sbg-ink/10">
              <button
                type="button"
                onClick={closeConfirm}
                className="ad-btn ad-btn-ghost"
              >
                {confirmModal.cancelLabel || "Cancel"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const cb = confirmModal.onConfirm;
                  closeConfirm();
                  await cb();
                }}
                className={`ad-btn active:scale-[0.98] ${
                  confirmModal.variant === "danger"
                    ? "bg-[#b91c1c] text-white hover:bg-[#991b1b]"
                    : "ad-btn-primary"
                }`}
              >
                {confirmModal.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @media (max-width: 1023px) {
          .admin-responsive button {
            min-height: 44px;
          }

          /* Rows wrap on small screens unless they opt out with the flex-nowrap class
             (modal headers must keep the close button on the title row). */
          .admin-responsive [class*="justify-between"]:not(.flex-nowrap),
          .admin-responsive [class*="justify-end"]:not(.flex-nowrap) {
            flex-wrap: wrap;
          }

          .admin-responsive button[class~="w-7"],
          .admin-responsive button[class~="w-8"],
          .admin-responsive button[class~="w-9"],
          .admin-responsive button[class~="w-10"] {
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="w-full min-w-0"><AdminPageSkeleton /></div>}>
      <AdminPageContent />
    </Suspense>
  );
}
