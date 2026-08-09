"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { useRecruitment } from "@/hooks/useRecruitment";
import { ClosedRegistrations } from "@/components/recruitment/ClosedRegistrations";
import LightRays from "@/components/ui/light-rays";
import CursorGrid from "@/components/ui/cursor-grid";
import { ThemeStyles } from "@/components/features/register/ThemeStyles";
import { SuccessScreen } from "@/components/features/register/SuccessScreen";
import { ArrowRight, ArrowLeft, User, Sparkles, CheckCircle2, ChevronDown } from "lucide-react";

/* ─── Config ─────────────────────────────────────────────── */
const LOADING_STATES = [
  { text: "Validating your application details..." },
  { text: "Securely submitting to AWS SBG..." },
  { text: "Application deployed successfully!" },
];

const WINGS = [
  { id: "technology", label: "Technology", emoji: "💻" },
  { id: "cloud",      label: "Cloud",      emoji: "☁️" },
  { id: "design",    label: "Design",     emoji: "🎨" },
  { id: "events",    label: "Events & Ops",emoji: "📅" },
  { id: "media",     label: "Media",      emoji: "🎬" },
  { id: "outreach",  label: "Outreach",   emoji: "📣" },
];

const COURSES = ["B.Tech", "B.Sc", "BCA", "MCA", "BBA", "MBA", "Other"];
const BRANCHES = ["CSE", "AI/ML", "Data Science", "Cyber Security", "ECE", "ME", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

// Balanced across all 6 wings — tech, creative, ops, media, social
const INTERESTS = [
  "AWS & Cloud",      "Web / App Development", "AI & Machine Learning",
  "UI/UX Design",     "Graphic Design",         "Photography",
  "Video Editing",    "Content & Copywriting",  "Social Media",
  "Event Planning",   "Public Relations",       "Sponsorships & Outreach",
  "DevOps & Linux",   "Cyber Security",         "Teaching & Mentoring",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+91 \d{10}$/;

interface Form {
  fullName: string;
  universityEmail: string;
  phoneNumber: string;
  rollNumber: string;
  course: string;
  branch: string;
  year: string;
  wings: string[];    // up to 2
  interests: string[];
  whyJoin: string;
  contribution: string;
  socialLink: string;
}

const INIT: Form = {
  fullName: "", universityEmail: "", phoneNumber: "",
  rollNumber: "", course: "", branch: "", year: "",
  wings: [], interests: [], whyJoin: "", contribution: "", socialLink: "",
};

/* ─── Helpers ────────────────────────────────────────────── */
function Field({
  label, hint, error, required, children,
}: {
  label: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono uppercase tracking-[0.15em] text-white/50">
          {label}{required && <span className="text-primary-light ml-1">*</span>}
        </label>
        {hint && <span className="text-[10px] font-mono text-white/30">{hint}</span>}
      </div>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-mono text-red-400"
        >
          ✕ {error}
        </motion.p>
      )}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-white/[0.04] border border-white/[0.10] hover:border-white/[0.18] focus:border-primary/50 focus:bg-white/[0.06] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-white/25 outline-none transition-all duration-200 font-sans"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full bg-white/[0.04] border border-white/[0.10] hover:border-white/[0.18] focus:border-primary/50 focus:bg-white/[0.06] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-white/25 outline-none transition-all duration-200 font-sans resize-none"
    />
  );
}

function Select({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-white/[0.04] border border-white/[0.10] hover:border-white/[0.18] rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 text-left"
      >
        <span className={value ? "text-text-primary" : "text-white/25"}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 bg-[#1a1a1f] border border-white/[0.10] rounded-xl overflow-hidden shadow-xl max-h-52 overflow-y-auto"
          >
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.06] ${value === opt ? "text-primary-light" : "text-text-secondary"}`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Progress Bar ───────────────────────────────────────── */
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      {[1, 2].map(s => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-all duration-400 ${
                s < step
                  ? "bg-primary text-white"
                  : s === step
                  ? "bg-primary/20 border border-primary/50 text-primary-light"
                  : "bg-white/[0.05] border border-white/[0.08] text-white/30"
              }`}
            >
              {s < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
            </div>
            <span className={`text-xs font-mono hidden sm:block transition-colors ${s === step ? "text-text-secondary" : "text-white/25"}`}>
              {s === 1 ? "Your Info" : "Your Vibe"}
            </span>
          </div>
          {s < 2 && (
            <div className="flex-1 h-px bg-white/[0.06] relative overflow-hidden">
              <motion.div
                animate={{ scaleX: step > s ? 1 : 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 bg-gradient-to-r from-primary to-accent origin-left"
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
import { Suspense } from "react";

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const { mounted, isOpen } = useRecruitment();
  const [step, setStep] = useState(1);

  // Pre-select wing from URL param (e.g. ?wing=Design)
  const preWing = searchParams.get("wing") ?? "";
  const matchedWing = WINGS.find(w =>
    preWing.toLowerCase().includes(w.label.toLowerCase())
  );
  const [form, setForm] = useState<Form>({
    ...INIT,
    wings: matchedWing ? [matchedWing.label] : [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<any>(null);

  const update = (key: keyof Form, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const toggleInterest = (area: string) => {
    setForm(f => {
      const has = f.interests.includes(area);
      return { ...f, interests: has ? f.interests.filter(a => a !== area) : [...f.interests, area] };
    });
    setErrors(e => { const n = { ...e }; delete n.interests; return n; });
  };

  const toggleWing = (label: string) => {
    setForm(f => {
      if (f.wings.includes(label)) {
        return { ...f, wings: f.wings.filter(w => w !== label) };
      }
      if (f.wings.length >= 2) return f; // max 2
      return { ...f, wings: [...f.wings, label] };
    });
    setErrors(e => { const n = { ...e }; delete n.wings; return n; });
  };

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!EMAIL_RE.test(form.universityEmail)) e.universityEmail = "Enter a valid email";
    if (!PHONE_RE.test(form.phoneNumber)) e.phoneNumber = "Format: +91 XXXXXXXXXX";
    if (!form.rollNumber.trim()) e.rollNumber = "Required";
    if (!form.course) e.course = "Required";
    if (!form.year) e.year = "Required";
    if (form.wings.length === 0) e.wings = "Select at least one wing";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (form.interests.length === 0) e.interests = "Pick at least one";
    if (!form.whyJoin.trim() || form.whyJoin.trim().length < 20)
      e.whyJoin = "Write at least a sentence or two";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const goNext = () => { if (validateStep1()) setStep(2); };
  const goBack = () => { setStep(1); };

  async function handleSubmit() {
    if (!validateStep2()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName.trim());
      fd.append("universityEmail", form.universityEmail.trim());
      fd.append("personalEmail", form.universityEmail.trim());
      fd.append("phoneNumber", form.phoneNumber.trim());
      fd.append("rollNumber", form.rollNumber.trim());
      fd.append("course", form.course);
      fd.append("branch", form.branch || "N/A");
      fd.append("year", form.year);
      fd.append("wing", form.wings.join(" + "));
      fd.append("interestAreas", JSON.stringify(form.interests));
      fd.append("whyJoin", form.whyJoin.trim());
      fd.append("githubUrl", form.contribution.trim());
      fd.append("linkedinUrl", form.socialLink.trim());
      fd.append("usedAws", "Not specified");
      fd.append("leadershipExperience", "");

      const [res] = await Promise.all([
        fetch("/api/register", { method: "POST", body: fd }),
        new Promise(r => setTimeout(r, 4000)),
      ]);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed. Please try again.");
      setResult(data);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (mounted && !isOpen) return <ClosedRegistrations />;
  if (result) return <SuccessScreen result={result} />;

  return (
    <div className="register-page-theme relative min-h-screen bg-bg w-full overflow-x-hidden text-text-primary font-sans">
      <Loader loadingStates={LOADING_STATES} loading={submitting} duration={1300} />
      <ThemeStyles />

      {/* Background effects */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px] opacity-60" />
      <div className="pointer-events-none absolute -left-[15%] top-[40%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px] opacity-40" />
      <div className="pointer-events-none absolute -right-[15%] bottom-[10%] h-[400px] w-[400px] rounded-full bg-accent/8 blur-[100px] opacity-40" />
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <CursorGrid cellSize={64} color="#A855F7" radius={150} falloff="smooth" holdTime={350}
          fadeDuration={700} lineWidth={1} maxOpacity={0.35} fillOpacity={0.06}
          gridOpacity={0.06} cellRadius={4} clickPulse={true} pulseSpeed={500} />
      </div>
      <div className="absolute inset-0 z-0 overflow-hidden opacity-25 pointer-events-none">
        <LightRays raysOrigin="top-center" raysColor="#A855F7" raysSpeed={0.6} lightSpread={0.7}
          rayLength={1.1} followMouse={false} mouseInfluence={0} noiseAmount={0.1}
          distortion={0.04} saturation={1.3} />
      </div>

      <main className="relative z-10 w-full max-w-[600px] mx-auto px-5 sm:px-8 pt-28 md:pt-36 pb-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary-light tracking-widest mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            COHORT 2026 · APPLICATIONS OPEN
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-display tracking-tight leading-[1.05] mb-3">
            Join the<br />
            <span className="bg-gradient-to-r from-primary-light via-accent to-purple-300 bg-clip-text text-transparent">
              Builder Team.
            </span>
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            2 quick steps · Under 3 minutes · All branches welcome
          </p>
        </motion.div>

        {/* Progress */}
        <ProgressBar step={step} />

        {/* Form card */}
        <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          {/* Card top accent */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">

              {/* ── Step 1 ────────────────────────── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-light" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Your Info</p>
                      <p className="text-[11px] text-muted font-mono">Step 1 of 2</p>
                    </div>
                  </div>

                  <Field label="Full Name" required error={errors.fullName}>
                    <Input
                      value={form.fullName}
                      onChange={e => update("fullName", e.target.value)}
                      placeholder="Your full name"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="University Email" required error={errors.universityEmail}>
                      <Input
                        type="email"
                        value={form.universityEmail}
                        onChange={e => update("universityEmail", e.target.value)}
                        placeholder="you@tulas.edu.in"
                      />
                    </Field>
                    <Field label="Phone Number" required error={errors.phoneNumber}>
                      <Input
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
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Roll Number" required error={errors.rollNumber}>
                      <Input
                        value={form.rollNumber}
                        onChange={e => update("rollNumber", e.target.value.replace(/\D/g, ""))}
                        placeholder="2201234567"
                      />
                    </Field>
                    <Field label="Year" required error={errors.year}>
                      <Select
                        value={form.year}
                        onChange={v => update("year", v)}
                        options={YEARS}
                        placeholder="Select year"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Course" required error={errors.course}>
                      <Select
                        value={form.course}
                        onChange={v => { update("course", v); update("branch", ""); }}
                        options={COURSES}
                        placeholder="Select course"
                      />
                    </Field>
                    {form.course === "B.Tech" && (
                      <Field label="Branch" error={errors.branch}>
                        <Select
                          value={form.branch}
                          onChange={v => update("branch", v)}
                          options={BRANCHES}
                          placeholder="Select branch"
                        />
                      </Field>
                    )}
                  </div>

                  {/* Wing chip selector — multi, max 2 */}
                  <Field
                    label="Choose Your Wing(s)"
                    hint={`${form.wings.length}/2 selected`}
                    required
                    error={errors.wings}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {WINGS.map(wing => {
                        const active = form.wings.includes(wing.label);
                        const maxed = !active && form.wings.length >= 2;
                        return (
                          <button
                            key={wing.id}
                            type="button"
                            onClick={() => toggleWing(wing.label)}
                            disabled={maxed}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                              active
                                ? "bg-primary/20 border-primary/50 text-primary-light shadow-[0_0_14px_-4px_rgba(124,58,237,0.5)]"
                                : maxed
                                ? "bg-white/[0.02] border-white/[0.05] text-white/20 cursor-not-allowed"
                                : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:border-white/[0.18] hover:text-white/80"
                            }`}
                          >
                            <span className="text-base leading-none">{wing.emoji}</span>
                            <span className="text-xs">{wing.label}</span>
                            {active && (
                              <span className="ml-auto text-primary-light text-[10px] font-mono">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {form.wings.length === 2 && (
                      <p className="text-[10px] font-mono text-muted mt-1.5">
                        Max 2 wings selected. Remove one to change.
                      </p>
                    )}
                  </Field>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">About You</p>
                      <p className="text-[11px] text-muted font-mono">Step 2 of 2</p>
                    </div>
                  </div>

                  {/* Universal interest chips */}
                  <Field label="What are you into?" hint="Pick all that apply" required error={errors.interests}>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {INTERESTS.map(area => {
                        const active = form.interests.includes(area);
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => toggleInterest(area)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all duration-200 ${
                              active
                                ? "bg-primary/20 border-primary/50 text-primary-light scale-[1.02]"
                                : "bg-white/[0.03] border-white/[0.08] text-white/45 hover:border-white/[0.18] hover:text-white/70"
                            }`}
                          >
                            {area}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  {/* Why join — universal question */}
                  <Field
                    label="What draws you to AWS SBG?"
                    hint={`${form.whyJoin.length} chars`}
                    required
                    error={errors.whyJoin}
                  >
                    <Textarea
                      rows={4}
                      value={form.whyJoin}
                      onChange={e => update("whyJoin", e.target.value)}
                      placeholder="Could be anything — a project you loved, an event you organised, a video you made, or a skill you want to grow. Tell us your story."
                    />
                  </Field>

                  {/* Contribution — works for all wings */}
                  <Field label="Something you've made or done" hint="Optional — link or describe">
                    <Input
                      value={form.contribution}
                      onChange={e => update("contribution", e.target.value)}
                      placeholder="e.g. a design, event, video, article, project link..."
                    />
                  </Field>

                  {/* Single social link — any platform */}
                  <Field label="Your best social / portfolio link" hint="Optional">
                    <Input
                      value={form.socialLink}
                      onChange={e => update("socialLink", e.target.value)}
                      placeholder="Instagram, LinkedIn, GitHub, Behance, YouTube..."
                    />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400"
              >
                ✕ {submitError}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
              {step > 1 ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white/80 text-sm font-mono transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <span />
              )}

              {step < 2 ? (
                <button
                  onClick={goNext}
                  className="group flex items-center gap-2 px-7 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-[0_0_24px_-6px_rgba(124,58,237,0.6)] hover:shadow-[0_0_36px_-4px_rgba(124,58,237,0.8)] hover:scale-[1.02] transition-all duration-300"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="group flex items-center gap-2 px-7 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-[0_0_24px_-6px_rgba(124,58,237,0.6)] hover:shadow-[0_0_36px_-4px_rgba(124,58,237,0.8)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting…" : "Submit Application"}
                  {!submitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-muted font-mono mt-6">
          We'll reach out to shortlisted applicants by email · No spam, ever.
        </p>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
