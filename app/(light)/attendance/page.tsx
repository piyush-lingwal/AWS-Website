"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Award,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Calendar,
  Clock,
  User,
  Mail,
  GraduationCap,
  Hash,
  Download,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import type {
  PortalConfigResponse,
  AttendanceSubmitResponse,
  ApiResponse,
} from "@/types/certificate";
import { formatFullName, cleanFullName } from "@/lib/utils";
import { formatEventDate } from "@/lib/certificates/event-date";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";

interface FormData {
  name: string;
  email: string;
  rollNo: string;
  course: string;
  customCourse: string;
}

const DEFAULT_FORM: FormData = {
  name: "",
  email: "",
  rollNo: "",
  course: "",
  customCourse: "",
};

const COURSE_OPTIONS = [
  "B.Tech",
  "BCA",
  "MCA",
  "BBA",
  "MBA",
  "Other",
];

// Card tints from DESIGN.md 2.3 (soft wash over white).
const wash = (tint: string) => `linear-gradient(155deg, ${tint} 0%, rgba(255,255,255,.8) 58%)`;
const WASH = {
  lilac: wash("#EFE8FF"),
  peach: wash("#FFEBD3"),
  sky: wash("#DCEBFF"),
  mint: wash("#DDF3E6"),
};

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sbg-lilac-600 focus-visible:ring-offset-2";
const LABEL = "t-eyebrow mb-2 block";
const ICON = "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sbg-ink-3";
// 16px minimum font size keeps iOS from zooming on focus.
const INPUT =
  "block h-12 w-full rounded-2xl border border-sbg-ink/15 bg-white pr-4 text-base text-sbg-ink placeholder:text-sbg-ink-3 focus:border-sbg-lilac-600 focus:outline-none focus:ring-2 focus:ring-sbg-lilac-600";

function AttendanceShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <main>
          <section data-tone="dawn" className="px-[var(--gutter)] pb-16 pt-36 sm:pb-24">
            {children}
          </section>
        </main>
        <DesignFooter />
      </div>
    </>
  );
}
export default function AttendancePortalPage() {
  // ── Portal Configuration State ─────────────────────────────
  const [portalConfig, setPortalConfig] = useState<PortalConfigResponse | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState("");

  // ── Form State ─────────────────────────────────────────────
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<AttendanceSubmitResponse | null>(null);
  const [duplicateCertId, setDuplicateCertId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Fetch Active Event from portal_config ──────────────────
  const fetchConfig = useCallback(async () => {
    setConfigLoading(true);
    setConfigError("");
    try {
      const res = await fetch("/api/attendance/config", {
        cache: "no-store",
      });
      const json: ApiResponse<PortalConfigResponse> = await res.json();
      if (json.success && json.data) {
        setPortalConfig(json.data);
      } else {
        setConfigError(json.error || "Unable to load event information.");
      }
    } catch {
      setConfigError("Failed to connect to server. Please check your connection.");
    } finally {
      setConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // ── Form Helpers ───────────────────────────────────────────
  /** Formats name to proper Title Case preserving spacing while typing. */
  const toTitleCase = (value: string): string => formatFullName(value);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
    setDuplicateCertId(null);
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setErrorMsg("");
    setDuplicateCertId(null);
    setSubmittedData(null);
  };

  const validate = (): string | null => {
    const name = form.name.trim();
    if (!name) return "Full name is required.";
    if (name.length < 2) return "Full name must be at least 2 characters.";
    if (name.length > 100) return "Full name cannot exceed 100 characters.";

    const email = form.email.trim();
    if (!email) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email address.";

    const rollNo = form.rollNo.trim();
    if (!rollNo) return "College ID is required.";
    if (!/^\d+$/.test(rollNo)) return "College ID must contain only numbers.";

    const selectedCourse =
      form.course === "Other" ? form.customCourse.trim() : form.course;
    if (!selectedCourse) {
      return form.course === "Other"
        ? "Please specify your course name."
        : "Please select your course.";
    }

    return null;
  };

  // ── Clipboard Copy ─────────────────────────────────────────
  const copyToClipboard = (text: string, type: "id" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      toast.success("Certificate ID copied to clipboard");
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success("Verification link copied to clipboard");
    }
  };

  // ── Submit Attendance ──────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErr = validate();
    if (validationErr) {
      setErrorMsg(validationErr);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setDuplicateCertId(null);

    const effectiveCourse =
      form.course === "Other" ? form.customCourse.trim() : form.course;

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: cleanFullName(form.name),
          email: form.email.trim().toLowerCase(),
          course: effectiveCourse,
          rollNo: form.rollNo.trim(),
        }),
      });

      const json = await response.json();

      if (response.status === 409) {
        // Duplicate attendance already recorded for this event + email
        const existingId =
          json.data?.certificateId || json.data?.certificate_id || null;
        setDuplicateCertId(existingId);
        setErrorMsg(
          json.error ||
            "You have already submitted attendance for this event. Your certificate is already available."
        );
        return;
      }

      if (!response.ok || !json.success) {
        throw new Error(
          json.error || `Attendance submission failed (${response.status})`
        );
      }

      // Successful attendance submission & certificate generated!
      if (json.data) {
        setSubmittedData(json.data);
        toast.success("Attendance marked! Certificate generated successfully.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 1. LOADING STATE ───────────────────────────────────────
  if (configLoading) {
    return (
      <AttendanceShell>
        <div className="mx-auto max-w-md py-16 text-center" role="status">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-sbg-lilac-200 border-t-sbg-lilac-600" />
          <p className="mb-1 text-sm font-medium text-sbg-ink">Loading Attendance Portal</p>
          <p className="font-lt-mono text-xs text-sbg-ink-3">Connecting to active session…</p>
        </div>
      </AttendanceShell>
    );
  }

  // ── 2. CLOSED / NO EVENT STATE ─────────────────────────────
  if (configError || !portalConfig?.event || !portalConfig.attendanceEnabled) {
    return (
      <AttendanceShell>
        <div className="surface mx-auto max-w-lg rounded-[28px] p-7 text-center sm:p-10" style={{ background: WASH.lilac }}>
          <p className="t-eyebrow mb-5 inline-flex max-w-full items-center justify-center gap-2">
            <Award className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>AWS Student Builder Group • Tulas University</span>
          </p>

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sbg-lilac-100 text-sbg-lilac-700">
            <Clock className="h-8 w-8" aria-hidden="true" />
          </div>

          <h1 className="t-display mb-4 text-[clamp(34px,6vw,52px)] text-sbg-ink">
            Portal <span className="t-serif">closed</span>
          </h1>

          <p className="mb-8 text-sm leading-relaxed text-sbg-ink-2">
            {configError
              ? configError
              : !portalConfig?.event
              ? "No session is currently configured for attendance collection. Please check back when your session convenor opens the portal."
              : `Attendance submissions for "${portalConfig.event.name}" are currently closed. If you attended this session, reach out to your session organizer.`}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={fetchConfig} className={`${FOCUS} btn btn-ghost w-full cursor-pointer sm:w-auto`}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Check Again
            </button>

            <Link href="/verify" className={`${FOCUS} btn btn-primary w-full sm:w-auto`}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Verify a Certificate
            </Link>
          </div>

          <div className="mt-8 border-t border-sbg-ink/10 pt-6 text-xs">
            <Link href="/" className={`${FOCUS} rounded text-sbg-ink-2 transition-colors hover:text-sbg-ink`}>
              ← Return to AWS SBG Homepage
            </Link>
          </div>
        </div>
      </AttendanceShell>
    );
  }

  const event = portalConfig.event;

  // Format event date: a single day or a collapsed range (29 Oct - 05 Nov 2026),
  // matching what the certificate shows (lib/certificates/event-date.ts).
  const formattedDate = formatEventDate(event.eventDate, event.eventEndDate) || "To be announced";

  // ── 3. SUCCESS / CONFIRMATION STATE (PHASE 6) ──────────────
  if (submittedData) {
    return (
      <AttendanceShell>
        <div className="mx-auto w-full max-w-xl">
          {/* Header */}
          <header className="mb-8 text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Attendance Verified &amp; Confirmed</span>
            </p>
            <h1 className="t-display mb-3 text-[clamp(38px,7vw,64px)] text-sbg-ink">
              Attendance <span className="t-serif">confirmed</span>
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-sbg-ink-2">
              Thank you, <strong className="text-sbg-ink">{submittedData.participantName}</strong>! Your participation in{" "}
              <strong className="text-sbg-ink">{submittedData.eventName}</strong> has been recorded and your official certificate has been generated.
            </p>
          </header>

          <div className="surface rounded-[28px] p-6 text-center sm:p-9" style={{ background: WASH.mint }}>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-200">
              <Award className="h-8 w-8" aria-hidden="true" />
            </div>

            <h2 className="t-display mb-2 text-2xl text-sbg-ink sm:text-3xl">Official Credential Issued</h2>
            <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-sbg-ink-2">
              Your credential has been permanently signed and registered with AWS Student Builder Group at Tulas University.
            </p>

            {/* Certificate ID Card */}
            <div className="mx-auto mb-6 max-w-md rounded-2xl border border-sbg-ink/10 bg-white p-4 text-left sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="t-eyebrow">Official Certificate ID</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 font-lt-mono text-[10px] uppercase text-emerald-800 ring-1 ring-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Verified
                </span>
              </div>
              <div className="break-all font-lt-mono text-lg font-semibold tracking-wide text-sbg-lilac-700 sm:text-xl">
                {submittedData.certificateId}
              </div>
            </div>

            {/* Action Buttons: Download Certificate & Verify Online */}
            <div className="mx-auto grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={submittedData.pdfDownloadUrl || `/api/certificates/${submittedData.certificateId}`}
                download={`${submittedData.certificateId}.pdf`}
                className={`${FOCUS} btn btn-primary cursor-pointer whitespace-nowrap`}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download Certificate</span>
              </a>

              <Link
                href={`/verify/${submittedData.certificateId}`}
                target="_blank"
                className={`${FOCUS} btn btn-ghost cursor-pointer whitespace-nowrap`}
              >
                <ExternalLink className="h-4 w-4 text-sbg-lilac-700" aria-hidden="true" />
                <span>Verify Online</span>
              </Link>
            </div>

            {/* Secondary Utility Actions (Copy ID & Copy Link) */}
            <div className="mx-auto mt-4 flex max-w-md flex-wrap items-center justify-center gap-2.5 border-t border-sbg-ink/10 pt-4">
              <button
                type="button"
                onClick={() => copyToClipboard(submittedData.certificateId, "id")}
                className={`${FOCUS} flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-sbg-ink/15 bg-white px-3.5 text-xs font-medium text-sbg-ink-2 transition-colors hover:text-sbg-ink`}
              >
                {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                <span>{copiedId ? "ID Copied" : "Copy ID"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/verify/${submittedData.certificateId}`;
                  copyToClipboard(url, "link");
                }}
                className={`${FOCUS} flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-sbg-ink/15 bg-white px-3.5 text-xs font-medium text-sbg-ink-2 transition-colors hover:text-sbg-ink`}
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                <span>{copiedLink ? "Link Copied" : "Copy Verification Link"}</span>
              </button>
            </div>
          </div>
        </div>
      </AttendanceShell>
    );
  }

  // ── 4. ATTENDANCE ENTRY FORM SCREEN ─────────────────────────
  return (
    <AttendanceShell>
      <div className="mx-auto w-full max-w-xl">
        {/* Header */}
        <header className="mb-8 text-center sm:mb-10">
          <p className="t-eyebrow mb-4">Event Attendance</p>
          <h1 className="t-display mb-4 text-[clamp(38px,7vw,64px)] text-sbg-ink">
            Mark your <span className="t-serif text-sbg-lilac-700">attendance</span>
          </h1>
          <p className="t-lead mx-auto max-w-md">
            Fill in your details below. Your attendance will be recorded and you can receive your official certificate.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── CARD 1: Event Details (Dynamic from DB) ───────── */}
          <div className="surface mb-6 rounded-[28px] p-5 sm:p-7" style={{ background: WASH.lilac }}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sbg-lilac-700">
                <Calendar className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 className="t-eyebrow">Current Active Session</h2>
            </div>

            {/* Event Name */}
            <div className="mb-3 rounded-2xl border border-sbg-ink/10 bg-white/80 p-4">
              <div className="t-eyebrow mb-1">Event Title</div>
              <div className="t-display text-xl text-sbg-ink">{event.name}</div>
              {event.description && (
                <p className="mt-1.5 text-xs leading-relaxed text-sbg-ink-2">{event.description}</p>
              )}
            </div>

            {/* Date & Timing Grid */}
            <div className={event.eventTiming ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2" : "grid grid-cols-1 gap-2.5"}>
              <div className="flex items-center gap-3 rounded-2xl border border-sbg-ink/10 bg-white/80 p-3.5">
                <Calendar className="h-4 w-4 flex-shrink-0 text-sbg-ink-3" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="t-eyebrow">Date</div>
                  <div className="truncate text-xs font-medium text-sbg-ink">{formattedDate}</div>
                </div>
              </div>

              {event.eventTiming && (
                <div className="flex items-center gap-3 rounded-2xl border border-sbg-ink/10 bg-white/80 p-3.5">
                  <Clock className="h-4 w-4 flex-shrink-0 text-sbg-ink-3" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="t-eyebrow">Timing</div>
                    <div className="truncate text-xs font-medium text-sbg-ink">{event.eventTiming}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Speaker if available */}
            {event.speakerName && (
              <div className="mt-2.5 flex items-center gap-3 rounded-2xl border border-sbg-ink/10 bg-white/80 p-3.5">
                <User className="h-4 w-4 flex-shrink-0 text-sbg-ink-3" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="t-eyebrow">Keynote Speaker / Lead</div>
                  <div className="truncate text-xs font-medium text-sbg-ink">{event.speakerName}</div>
                </div>
              </div>
            )}
          </div>

          {/* ── CARD 2: Student Details ───────────────────────── */}
          <div className="surface mb-6 rounded-[28px] p-5 sm:p-7" style={{ background: WASH.peach }}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sbg-lilac-700">
                <User className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="t-eyebrow">Participant Details</h2>
                <p className="text-[11px] text-sbg-ink-2">Your official identity on the certificate</p>
              </div>
            </div>

            {/* Field 1: Full Name */}
            <div className="mb-5">
              <label className={LABEL} htmlFor="name">
                Full Name <span className="text-sbg-lilac-700">*</span>
              </label>
              <div className="relative">
                <User className={ICON} aria-hidden="true" />
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  autoCapitalize="words"
                  value={form.name}
                  onChange={(e) => updateField("name", toTitleCase(e.target.value))}
                  placeholder="e.g. Piyush Rawat"
                  className={`${INPUT} pl-11`}
                />
              </div>
              {/* Mandatory helper text from Requirment.md line 473 */}
              <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-sbg-lilac-700">
                <Sparkles className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                Enter your name exactly as you want it to appear on your certificate.
              </p>
            </div>

            {/* Field 2: Email */}
            <div className="mb-5">
              <label className={LABEL} htmlFor="email">
                Email <span className="text-sbg-lilac-700">*</span>
              </label>
              <div className="relative">
                <Mail className={ICON} aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="e.g. piyush@tulas.edu.in"
                  className={`${INPUT} pl-11`}
                />
              </div>
            </div>

            {/* Field 3: College ID */}
            <div>
              <label className={LABEL} htmlFor="rollNo">
                College ID <span className="text-sbg-lilac-700">*</span>
              </label>
              <div className="relative">
                <Hash className={ICON} aria-hidden="true" />
                <input
                  id="rollNo"
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.rollNo}
                  onChange={(e) => updateField("rollNo", e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 202609018"
                  className={`${INPUT} pl-11 font-lt-mono`}
                />
              </div>
            </div>
          </div>

          {/* ── CARD 3: Academic Program / Course ─────────────── */}
          <div className="surface mb-6 rounded-[28px] p-5 sm:p-7" style={{ background: WASH.sky }}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sbg-lilac-700">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 className="t-eyebrow">Course</h2>
            </div>

            {/* Course Selection Pills */}
            <div className="mb-3 flex flex-wrap gap-2.5" role="radiogroup" aria-label="Course">
              {COURSE_OPTIONS.map((c) => (
                <label key={c} className="relative inline-block cursor-pointer select-none">
                  <input
                    type="radio"
                    name="course"
                    value={c}
                    checked={form.course === c}
                    onChange={() => updateField("course", c)}
                    required
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-11 items-center justify-center rounded-full border border-sbg-ink/15 bg-white px-5 text-sm font-medium text-sbg-ink-2 transition-colors hover:text-sbg-ink peer-checked:border-sbg-lilac-600 peer-checked:bg-sbg-lilac-100 peer-checked:text-sbg-lilac-700 peer-focus-visible:ring-2 peer-focus-visible:ring-sbg-lilac-600 peer-focus-visible:ring-offset-2">
                    {c}
                  </span>
                </label>
              ))}
            </div>

            {/* Custom Course Input if 'Other' */}
            {form.course === "Other" && (
              <div className="mt-3 border-t border-sbg-ink/10 pt-3">
                <label className={LABEL} htmlFor="customCourse">
                  Specify Your Course <span className="text-sbg-lilac-700">*</span>
                </label>
                <input
                  id="customCourse"
                  type="text"
                  required
                  value={form.customCourse}
                  onChange={(e) => updateField("customCourse", e.target.value)}
                  placeholder="e.g. Diploma in Mechanical Engineering"
                  className={`${INPUT} px-4`}
                />
              </div>
            )}
          </div>

          {/* ── Error Banner ─────────────────────────────────── */}
          {errorMsg && (
            <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-700" aria-hidden="true" />
                <div className="text-sm text-red-700">
                  <p className="mb-1 font-semibold">{errorMsg}</p>
                  {duplicateCertId && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 border-t border-red-200 pt-2">
                      <span className="font-lt-mono text-xs text-sbg-ink">ID: {duplicateCertId}</span>
                      <Link
                        href={`/verify/${duplicateCertId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-800 underline hover:no-underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        View your existing certificate →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Submit Button ────────────────────────────────── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${FOCUS} btn btn-primary w-full cursor-pointer disabled:cursor-default disabled:opacity-60`}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Validating &amp; Generating Certificate…</span>
              </>
            ) : (
              <span>Submit Attendance &amp; Get Certificate</span>
            )}
          </button>
        </form>

        {/* Verification Link in Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/verify"
            className={`${FOCUS} inline-flex items-center gap-1.5 rounded text-xs text-sbg-ink-2 transition-colors hover:text-sbg-ink`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            Already have a certificate? Verify authenticity here →
          </Link>
        </div>
      </div>
    </AttendanceShell>
  );
}