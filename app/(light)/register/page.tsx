"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { useRecruitment } from "@/hooks/useRecruitment";
import { ClosedRegistrations } from "@/components/recruitment/ClosedRegistrations";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
import { SuccessScreen } from "@/components/features/register/SuccessScreen";
import { FileUploadCard, UploadedFile } from "@/components/ui/file-upload-card";
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  Hash,
  GraduationCap,
  CheckCircle2,
  Layers,
  ShieldCheck,
  FileText,
  X,
  UploadCloud,
  Sparkles,
} from "lucide-react";
/* ─── Config ─────────────────────────────────────────────── */
const LOADING_STATES = [
  { text: "Validating your builder details..." },
  { text: "Deploying profile to AWS SBG database..." },
  { text: "Application deployed successfully!" },
];

const WINGS = [
  {
    id: "technology",
    label: "Technology",
    emoji: "💻",
    tag: "Dev & Code",
    desc: "Full-Stack, DevOps & AI Systems",
    activeClass: "border-sbg-lilac-600 bg-sbg-lilac-100 text-sbg-lilac-700",
  },
  {
    id: "cloud",
    label: "Cloud",
    emoji: "☁️",
    tag: "Architecture",
    desc: "AWS Architecture & Cloud Labs",
    activeClass: "border-sbg-lilac-600 bg-sbg-lilac-100 text-sbg-lilac-700",
  },
  {
    id: "design",
    label: "Design",
    emoji: "🎨",
    tag: "Creative",
    desc: "UI/UX, 3D & Brand Visuals",
    activeClass: "border-sbg-lilac-600 bg-sbg-lilac-100 text-sbg-lilac-700",
  },
  {
    id: "events",
    label: "Events & Ops",
    emoji: "📅",
    tag: "Operations",
    desc: "Hackathons, Meetups & Logistics",
    activeClass: "border-sbg-lilac-600 bg-sbg-lilac-100 text-sbg-lilac-700",
  },
  {
    id: "media",
    label: "Media",
    emoji: "🎬",
    tag: "Production",
    desc: "Video, Photography & Reels",
    activeClass: "border-sbg-lilac-600 bg-sbg-lilac-100 text-sbg-lilac-700",
  },
  {
    id: "outreach",
    label: "Outreach",
    emoji: "📣",
    tag: "PR & Growth",
    desc: "PR, Sponsorships & Community",
    activeClass: "border-sbg-lilac-600 bg-sbg-lilac-100 text-sbg-lilac-700",
  },
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const COURSES = ["B.Tech", "BCA", "MCA", "B.Sc", "BBA", "MBA", "Other"];
const BRANCHES = ["CSE", "AI/ML", "Data Science", "Cyber Security", "ECE", "ME", "Other"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+91 \d{10}$/;

interface Form {
  fullName: string;
  universityEmail: string;
  phoneNumber: string;
  rollNumber: string;
  year: string;
  course: string;
  branch: string;
  customCourse: string;
  wings: string[]; // up to 2
}

const INIT: Form = {
  fullName: "",
  universityEmail: "",
  phoneNumber: "",
  rollNumber: "",
  year: "",
  course: "",
  branch: "",
  customCourse: "",
  wings: [],
};

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const { mounted, isOpen } = useRecruitment();

  // Pre-select wing from URL param (e.g. ?wing=Design)
  const preWing = searchParams.get("wing") ?? "";
  const matchedWing = WINGS.find(w =>
    preWing.toLowerCase().includes(w.label.toLowerCase())
  );

  const [form, setForm] = useState<Form>({
    ...INIT,
    wings: matchedWing ? [matchedWing.label] : [],
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleFileSelect = (file: File | undefined | null) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrors(e => ({ ...e, resume: "Only PDF files are accepted (.pdf)" }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(e => ({ ...e, resume: "PDF file size must be under 10MB" }));
      return;
    }
    setResumeFile(file);
    setErrors(e => {
      const n = { ...e };
      delete n.resume;
      return n;
    });
  };

  const update = (key: keyof Form, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => {
      const n = { ...e };
      delete n[key];
      return n;
    });
  };

  const toggleWing = (label: string) => {
    setForm(f => {
      if (f.wings.includes(label)) {
        return { ...f, wings: f.wings.filter(w => w !== label) };
      }
      if (f.wings.length >= 2) return f; // max 2
      return { ...f, wings: [...f.wings, label] };
    });
    setErrors(e => {
      const n = { ...e };
      delete n.wings;
      return n;
    });
  };

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!EMAIL_RE.test(form.universityEmail)) e.universityEmail = "Enter a valid email";
    if (!PHONE_RE.test(form.phoneNumber)) e.phoneNumber = "Format: +91 XXXXXXXXXX";
    if (!form.rollNumber.trim()) e.rollNumber = "Roll number is required";
    if (!form.year) e.year = "Select your academic year";
    if (!form.course) e.course = "Select your course";
    if (form.course === "Other" && !form.customCourse.trim()) e.customCourse = "Specify your course";
    if (form.course === "B.Tech" && !form.branch) e.branch = "Select your branch";
    if (form.wings.length === 0) e.wings = "Select at least 1 wing";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(`field-${firstErrorKey}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const finalCourse = form.course === "Other" ? (form.customCourse.trim() || "Other") : form.course;
      const fd = new FormData();
      fd.append("fullName", form.fullName.trim());
      fd.append("universityEmail", form.universityEmail.trim());
      fd.append("phoneNumber", form.phoneNumber.trim());
      fd.append("rollNumber", form.rollNumber.trim());
      if (resumeFile) {
        fd.append("resume", resumeFile);
        fd.append("resumeName", resumeFile.name);
      }
      fd.append("course", finalCourse);
      fd.append("branch", form.course === "B.Tech" ? (form.branch || "N/A") : (form.branch || "N/A"));
      fd.append("year", form.year);
      fd.append("wing", form.wings.join(" + "));
      fd.append("interestAreas", JSON.stringify(form.wings));

      const [res] = await Promise.all([
        fetch("/api/register", { method: "POST", body: fd }),
        new Promise(r => setTimeout(r, 3600)),
      ]);
      const data = await res.json();
      if (!res.ok) {
        let errMsg = data.error || data.message || "Submission failed. Please try again.";
        if (data.fieldErrors && typeof data.fieldErrors === "object") {
          const details = Object.entries(data.fieldErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");
          errMsg = `${data.error || data.message || "Validation failed"}: ${details}`;
        }
        throw new Error(errMsg);
      }
      setResult(data);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (mounted && !isOpen) return <ClosedRegistrations />;
  if (result) return <SuccessScreen result={result} formData={{ ...form, resumeName: resumeFile?.name }} />;

  return (
    <div className="relative w-full overflow-x-hidden text-sbg-ink font-lt-body">
      <Loader loadingStates={LOADING_STATES} loading={submitting} duration={1200} />

      <main className="relative z-10 w-full max-w-[680px] mx-auto px-4 sm:px-6 md:px-8 pt-32 md:pt-36 pb-24">

        {/* ── Page Title Header ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sbg-lilac-100 text-[11px] font-lt-mono text-sbg-lilac-700 tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            COHORT 2026 · APPLICATIONS OPEN
          </div>
          <h1 className="t-display text-[clamp(34px,6vw,60px)] text-sbg-ink mb-3">
            Join the{" "}
            <span className="t-serif text-sbg-lilac-600">
              Builder Team.
            </span>
          </h1>
          <p className="t-lead max-w-md mx-auto">
            Fast 1-minute application · Fill your details & select your wings to claim your spot.
          </p>
        </motion.div>

        {/* ── Main Form ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Section 1: Personal & Contact Information (First) ─────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="surface rounded-[28px] p-5 sm:p-7 relative overflow-hidden space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-sbg-lilac-100 border border-sbg-lilac-200 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-sbg-lilac-700" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-sbg-ink">
                  1. Contact & Identification
                </h2>
                <p className="text-[11px] font-mono text-sbg-ink-3">
                  How we can reach you for updates and orientation
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div id="field-fullName" className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="t-eyebrow !text-[11px] !text-sbg-lilac-700">
                  Full Name <span className="text-sbg-lilac-600">*</span>
                </label>
                {form.fullName.trim() && (
                  <span className="pop-in text-xs font-mono text-emerald-600 font-bold">
                    ✓
                  </span>
                )}
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-sbg-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => update("fullName", e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-2xl border border-[var(--line)] bg-white/90 pl-10 pr-4 py-3 text-[15px] text-sbg-ink placeholder:text-sbg-ink-3 focus:border-sbg-lilac-600 focus:outline-none focus:ring-2 focus:ring-sbg-lilac-300 transition-all"
                />
              </div>
              {errors.fullName && <p className="field-msg text-[11px] font-mono text-red-600">✕ {errors.fullName}</p>}
            </div>

            {/* 2-col Contact row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* University Email */}
              <div id="field-universityEmail" className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="t-eyebrow !text-[11px] !text-sbg-lilac-700">
                    Email Address <span className="text-sbg-lilac-600">*</span>
                  </label>
                  {EMAIL_RE.test(form.universityEmail) && (
                    <span className="pop-in text-xs font-mono text-emerald-600 font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-sbg-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={form.universityEmail}
                    onChange={e => update("universityEmail", e.target.value)}
                    placeholder="you@tulas.edu.in"
                    className="w-full rounded-2xl border border-[var(--line)] bg-white/90 pl-10 pr-4 py-3 text-[15px] text-sbg-ink placeholder:text-sbg-ink-3 focus:border-sbg-lilac-600 focus:outline-none focus:ring-2 focus:ring-sbg-lilac-300 transition-all"
                  />
                </div>
                {errors.universityEmail && <p className="field-msg text-[11px] font-mono text-red-600">✕ {errors.universityEmail}</p>}
              </div>

              {/* Phone Number */}
              <div id="field-phoneNumber" className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="t-eyebrow !text-[11px] !text-sbg-lilac-700">
                    Phone Number <span className="text-sbg-lilac-600">*</span>
                  </label>
                  {PHONE_RE.test(form.phoneNumber) && (
                    <span className="pop-in text-xs font-mono text-emerald-600 font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-sbg-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={e => {
                      let raw = e.target.value;
                      if (raw.startsWith("+91 ")) raw = raw.substring(4);
                      else if (raw.startsWith("+91")) raw = raw.substring(3);
                      const digits = raw.replace(/\D/g, "").substring(0, 10);
                      update("phoneNumber", digits.length > 0 ? "+91 " + digits : "");
                    }}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full rounded-2xl border border-[var(--line)] bg-white/90 pl-10 pr-4 py-3 text-[15px] text-sbg-ink placeholder:text-sbg-ink-3 focus:border-sbg-lilac-600 focus:outline-none focus:ring-2 focus:ring-sbg-lilac-300 transition-all font-mono"
                  />
                </div>
                {errors.phoneNumber && <p className="field-msg text-[11px] font-mono text-red-600">✕ {errors.phoneNumber}</p>}
              </div>
            </div>

            {/* Roll Number */}
            <div id="field-rollNumber" className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="t-eyebrow !text-[11px] !text-sbg-lilac-700">
                  Roll no. <span className="text-sbg-lilac-600">*</span>
                </label>
                {form.rollNumber.trim() && (
                  <span className="pop-in text-xs font-mono text-emerald-600 font-bold">
                    ✓
                  </span>
                )}
              </div>
              <div className="relative">
                <Hash className="w-4 h-4 text-sbg-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.rollNumber}
                  onChange={e => update("rollNumber", e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 2201234567"
                  className="w-full rounded-2xl border border-[var(--line)] bg-white/90 pl-10 pr-4 py-3 text-[15px] text-sbg-ink placeholder:text-sbg-ink-3 focus:border-sbg-lilac-600 focus:outline-none focus:ring-2 focus:ring-sbg-lilac-300 transition-all font-mono"
                />
              </div>
              {errors.rollNumber && <p className="field-msg text-[11px] font-mono text-red-600">✕ {errors.rollNumber}</p>}
            </div>
          </motion.div>

          {/* ── Section 2: Academic Profile (Second) ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="surface rounded-[28px] p-5 sm:p-7 relative overflow-hidden space-y-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-sbg-lilac-100 border border-sbg-lilac-200 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-sbg-lilac-700" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-sbg-ink">
                  2. Academic Details
                </h2>
                <p className="text-[11px] font-mono text-sbg-ink-3">
                  Your year and course at Tulas University
                </p>
              </div>
            </div>

            {/* Year Segmented Selector */}
            <div id="field-year" className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="t-eyebrow !text-[11px] !text-sbg-lilac-700">
                  Year of Study <span className="text-sbg-lilac-600">*</span>
                </label>
                {errors.year && <span className="field-msg text-[11px] font-mono text-red-600">✕ {errors.year}</span>}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {YEARS.map(yr => {
                  const isSelected = form.year === yr;
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => update("year", yr)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-medium transition-all text-center ${isSelected
                          ? "bg-sbg-lilac-100 border-sbg-lilac-600 text-sbg-lilac-700"
                          : "bg-white/80 border-[var(--line)] text-sbg-ink-2 hover:border-sbg-lilac-300 hover:text-sbg-ink"
                        }`}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Course Selector */}
            <div id="field-course" className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="t-eyebrow !text-[11px] !text-sbg-lilac-700">
                  Course <span className="text-sbg-lilac-600">*</span>
                </label>
                {errors.course && <span className="field-msg text-[11px] font-mono text-red-600">✕ {errors.course}</span>}
              </div>

              <div className="flex flex-wrap gap-2">
                {COURSES.map(c => {
                  const isSelected = form.course === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        update("course", c);
                        if (c !== "B.Tech") update("branch", "");
                      }}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-medium transition-all ${isSelected
                          ? "bg-sbg-lilac-100 border-sbg-lilac-600 text-sbg-lilac-700"
                          : "bg-white/80 border-[var(--line)] text-sbg-ink-2 hover:border-sbg-lilac-300 hover:text-sbg-ink"
                        }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>

              {/* Custom Course Input if 'Other' */}
              {form.course === "Other" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pt-2"
                >
                  <input
                    type="text"
                    value={form.customCourse}
                    onChange={e => update("customCourse", e.target.value)}
                    placeholder="Enter your course name (e.g. Diploma in CS, M.Sc...)"
                    className="w-full rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-2.5 text-sm text-sbg-ink placeholder:text-sbg-ink-3 focus:border-sbg-lilac-600 focus:outline-none focus:ring-2 focus:ring-sbg-lilac-300 transition-all"
                  />
                  {errors.customCourse && (
                    <p className="field-msg text-[11px] font-mono text-red-600 mt-1">✕ {errors.customCourse}</p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Branch Selector (Conditional when B.Tech) */}
            <AnimatePresence>
              {form.course === "B.Tech" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pt-1 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <label className="t-eyebrow !text-[11px] !text-sbg-lilac-700">
                      B.Tech Specialization / Branch <span className="text-sbg-lilac-600">*</span>
                    </label>
                    {errors.branch && <span className="field-msg text-[11px] font-mono text-red-600">✕ {errors.branch}</span>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {BRANCHES.map(br => {
                      const isSelected = form.branch === br;
                      return (
                        <button
                          key={br}
                          type="button"
                          onClick={() => update("branch", br)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${isSelected
                              ? "bg-sbg-lilac-100 border-sbg-lilac-600 text-sbg-lilac-700"
                              : "bg-white/80 border-[var(--line)] text-sbg-ink-2 hover:border-sbg-lilac-300 hover:text-sbg-ink"
                            }`}
                        >
                          {br}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Section 3: Wing Selection (Last) ───────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="surface rounded-[28px] p-5 sm:p-7 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sbg-lilac-100 border border-sbg-lilac-200 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-sbg-lilac-700" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-sbg-ink">
                    3. Choose Your Wing(s)
                  </h2>
                  <p className="text-[11px] font-mono text-sbg-ink-3">
                    Select 1 or 2 areas where you want to contribute
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${form.wings.length > 0 ? "border-sbg-lilac-300 bg-sbg-lilac-100 text-sbg-lilac-700" : "border-[var(--line)] text-sbg-ink-3"}`}>
                {form.wings.length}/2 selected
              </span>
            </div>

            {errors.wings && (
              <p className="field-msg text-xs font-mono text-red-600 mb-3 flex items-center gap-1">
                ✕ {errors.wings}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WINGS.map(wing => {
                const isSelected = form.wings.includes(wing.label);
                const isMaxed = !isSelected && form.wings.length >= 2;

                return (
                  <button
                    key={wing.id}
                    type="button"
                    onClick={() => toggleWing(wing.label)}
                    disabled={isMaxed}
                    className={`relative text-left p-3.5 rounded-2xl border transition-all duration-200 group flex items-start justify-between gap-3 ${isSelected
                        ? wing.activeClass
                        : isMaxed
                          ? "bg-white/50 border-[var(--line)] text-sbg-ink-3 cursor-not-allowed opacity-50"
                          : "bg-white/80 border-[var(--line)] text-sbg-ink-2 hover:border-sbg-lilac-300 hover:bg-white hover:text-sbg-ink"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 shrink-0 rounded-xl bg-sbg-lilac-50 border border-[var(--line)] flex items-center justify-center text-lg">
                        {wing.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-sbg-ink">
                            {wing.label}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-sbg-lilac-100 text-sbg-lilac-700">
                            {wing.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-sbg-ink-2 mt-0.5 leading-snug">
                          {wing.desc}
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center mt-0.5 transition-colors ${isSelected
                        ? "border-sbg-lilac-600 bg-sbg-lilac-600 text-white"
                        : "border-[var(--line)] bg-white"
                      }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ── Section 4: Resume Upload (Fourth & Final) ──────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="surface rounded-[28px] p-5 sm:p-7 relative overflow-hidden space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sbg-lilac-100 border border-sbg-lilac-200 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-sbg-lilac-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-sbg-ink">
                      4. Resume
                    </h2>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sbg-lilac-100 text-sbg-lilac-700 border border-[var(--line)]">
                      Optional
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-sbg-ink-3">
                    Attach your resume document in PDF format
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sbg-lilac-100 text-sbg-lilac-700 border border-sbg-lilac-200 font-semibold hidden sm:inline-block">
                PDF ONLY
              </span>
            </div>

            {/* Dynamic Wing Selection Tip */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-sbg-lilac-50 border border-sbg-lilac-200 text-xs">
              <Sparkles className="w-4 h-4 shrink-0 text-sbg-lilac-700 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <p className="font-semibold text-sbg-ink text-[12px] flex items-center gap-1.5 flex-wrap">
                  <span>Boost Your Selection Chances</span>
                  {form.wings.length > 0 && (
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-sbg-lilac-100 text-sbg-lilac-700 border border-sbg-lilac-200">
                      {form.wings.join(" & ")}
                    </span>
                  )}
                </p>
                <p className="text-sbg-ink-2 text-[11px] leading-relaxed">
                  {form.wings.length === 0 && (
                    "Attaching your resume/CV is optional, but strongly recommended to increase your shortlist chances across all wings."
                  )}
                  {form.wings.length === 1 && form.wings[0] === "Technology" && (
                    "Highlighting your GitHub repos, coding projects, or tech stack gives the Tech Leads direct proof of your engineering skills!"
                  )}
                  {form.wings.length === 1 && form.wings[0] === "Cloud" && (
                    "Showcasing AWS certifications, cloud architecture labs, or DevOps experience gives you a major advantage for cloud roles!"
                  )}
                  {form.wings.length === 1 && form.wings[0] === "Design" && (
                    "Including links to your portfolio, Figma files, or UI/UX case studies directly elevates your creative assessment!"
                  )}
                  {form.wings.length === 1 && form.wings[0] === "Events & Ops" && (
                    "Highlighting past event management, college fests, or team coordination experience strengthens your operational profile!"
                  )}
                  {form.wings.length === 1 && form.wings[0] === "Media" && (
                    "Sharing past videography, photo reels, or post-production editing samples accelerates your selection!"
                  )}
                  {form.wings.length === 1 && form.wings[0] === "Outreach" && (
                    "Showcasing public speaking, community building, or PR communication skills gives you a distinct edge!"
                  )}
                  {form.wings.length > 1 && (
                    `Attaching your resume helps our wing leads review your hands-on experience and fast-tracks your shortlisting for both ${form.wings.join(" and ")} roles!`
                  )}
                </p>
              </div>
            </div>

            <div id="field-resume" className="space-y-1.5 pt-1">
              <FileUploadCard
                files={
                  resumeFile
                    ? [
                        {
                          id: "resume-file",
                          file: resumeFile,
                          progress: 100,
                          status: "completed",
                        },
                      ]
                    : []
                }
                onFilesChange={(selectedFiles) => {
                  if (selectedFiles && selectedFiles.length > 0) {
                    handleFileSelect(selectedFiles[0]);
                  }
                }}
                onFileRemove={() => {
                  setResumeFile(null);
                  setErrors((e) => {
                    const n = { ...e };
                    delete n.resume;
                    return n;
                  });
                }}
                accept="application/pdf,.pdf"
                maxSizeMB={10}
                showHeader={false}
                className="bg-transparent border-none shadow-none p-0 overflow-visible"
              />
              {errors.resume && <p className="field-msg text-[11px] font-mono text-red-600 mt-1">✕ {errors.resume}</p>}
            </div>
          </motion.div>

          {/* ── Error Banner if any ────────────────────────────────────── */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs font-mono text-red-600 flex items-center gap-2"
            >
              <span>✕</span>
              <span>{submitError}</span>
            </motion.div>
          )}

          {/* ── Submit Action CTA ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="pt-2 flex flex-col items-center gap-3"
          >
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full group justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2 font-display tracking-wide">
                {submitting ? (
                  "Deploying Application..."
                ) : (
                  <>
                    <span>Submit Builder Application</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            <div className="flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto pt-2">
              <div className="inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-sbg-ink-3 leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Official AWS SBG Tulas Portal</span>
              </div>
              <p className="text-[10px] text-sbg-ink-3 font-mono mt-0.5">
                Shortlisted applicants notified via email
              </p>
            </div>
          </motion.div>

        </form>

      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <Suspense fallback={null}>
          <RegisterPageContent />
        </Suspense>
        <DesignFooter />
      </div>
    </>
  );
}
