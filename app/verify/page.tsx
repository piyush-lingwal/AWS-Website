"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ShieldCheck,
  Search,
  Award,
  CheckCircle,
  ArrowRight,
  Clipboard,
  Check,
  Sparkles,
  Lock,
  Building,
  ExternalLink,
  FileText,
  HelpCircle,
  Fingerprint,
  Database,
  Calendar,
} from "lucide-react";
import { isValidCertificateIdFormat } from "@/lib/certificates/id-generator";

// Known verified demo IDs for rapid evaluation
const DEMO_CERTIFICATES = [
  {
    id: "AWS-SBG-2026-UK95ZP",
    name: "Piyush Rawat",
    role: "B.Tech CSE",
    event: "Cloud Kickstart 2026",
  },
  {
    id: "AWS-SBG-2026-FUW35U",
    name: "Ananya Sharma",
    role: "B.Tech AI/ML",
    event: "Cloud Kickstart 2026",
  },
  {
    id: "AWS-SBG-2026-PTD76X",
    name: "Arjun Saxena",
    role: "B.Tech CSE",
    event: "Cloud Kickstart 2026",
  },
];

export default function CertificateSearchPage() {
  const router = useRouter();
  const [certId, setCertId] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasCopiedDemo, setHasCopiedDemo] = useState<string | null>(null);

  // Live input validation status
  const cleanId = certId.trim().toUpperCase();
  const isValidFormat = isValidCertificateIdFormat(cleanId);
  const isPartiallyFilled = cleanId.length > 0 && !isValidFormat;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cleanId) {
      setError("Please enter a Certificate ID to verify.");
      return;
    }

    if (!isValidCertificateIdFormat(cleanId)) {
      setError("Expected format: AWS-SBG-YYYY-XXXXXX (e.g. AWS-SBG-2026-UK95ZP)");
      return;
    }

    setIsSearching(true);
    router.push(`/verify/${cleanId}`);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim().toUpperCase();
      if (trimmed) {
        setCertId(trimmed);
        setError("");
        toast.success("Pasted from clipboard");
      }
    } catch {
      toast.error("Clipboard access was blocked by browser permissions.");
    }
  };

  const handleSelectDemo = (id: string) => {
    setCertId(id);
    setError("");
    setHasCopiedDemo(id);
    setTimeout(() => setHasCopiedDemo(null), 2000);
  };

  return (
    <div
      className="min-h-screen text-[#F4F4F6] selection:bg-[#6C63FF]/30 pt-28 sm:pt-36 pb-24 px-4 sm:px-6"
      style={{
        background: `
          radial-gradient(1100px 520px at 50% 8%, rgba(108,99,255,0.15), transparent 70%),
          radial-gradient(700px 380px at 85% 18%, rgba(255,153,0,0.06), transparent 70%),
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px) 0 0/48px 48px,
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px) 0 0/48px 48px,
          #08080B
        `,
      }}
    >
      <div className="max-w-4xl mx-auto w-full space-y-12">
        {/* ── Header Section ────────────────────────────────────────── */}
        <header className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/25 text-xs text-[#A78BFA] font-medium tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-[#6C63FF]" />
            <span>AWS Student Builder Group • Official Credential Registry</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Verify Certificate Authenticity
          </h1>

          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-xl mx-auto">
            Cross-reference workshop and session credentials against official
            Tula&apos;s University attendance snapshot records. All certificates
            are cryptographically sealed and tamper-evident.
          </p>
        </header>

        {/* ── Primary Search Card (Doppelrand Architecture) ─────────── */}
        <div className="p-1 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)]">
          <div className="p-7 sm:p-11 rounded-[calc(2.5rem-4px)] bg-[#0C0C12] space-y-7">
            <form onSubmit={handleSearch} noValidate className="space-y-5">
              {/* Field Label & Live Validation Badge */}
              <div className="flex items-center justify-between">
                <label
                  htmlFor="certId"
                  className="font-mono text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold flex items-center gap-1.5"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-[#6C63FF]" />
                  <span>Credential Identifier</span>
                  <span className="text-[#6C63FF]">*</span>
                </label>

                {/* Real-time Status Indicator */}
                {isValidFormat ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <Check className="w-3 h-3" />
                    <span>Valid Registry Format</span>
                  </span>
                ) : isPartiallyFilled ? (
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
                    Needs AWS-SBG-YYYY-XXXXXX
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-[#71717A]">
                    Format: AWS-SBG-YYYY-XXXXXX
                  </span>
                )}
              </div>

              {/* Input Enclosure */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none">
                  <Search className="w-4 h-4" />
                </div>

                <input
                  id="certId"
                  type="text"
                  required
                  autoFocus
                  autoCapitalize="characters"
                  value={certId}
                  onChange={(e) => {
                    setCertId(e.target.value.toUpperCase());
                    setError("");
                  }}
                  placeholder="e.g. AWS-SBG-2026-UK95ZP"
                  className="w-full h-14 pl-12 pr-28 rounded-2xl text-base font-mono tracking-wider bg-[#14141A] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/40 transition-all"
                />

                {/* Paste from Clipboard Button */}
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-medium text-[#A1A1AA] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3 h-3" />
                  <span>Paste</span>
                </button>
              </div>

              {/* Error Callout */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit CTA (Button-in-Button Pattern) */}
              <button
                type="submit"
                disabled={isSearching}
                className="w-full h-13 rounded-2xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:brightness-110 text-white flex items-center justify-between px-6 transition-all cursor-pointer shadow-lg shadow-[#6C63FF]/25 active:scale-[0.99] disabled:opacity-50"
              >
                {isSearching ? (
                  <div className="flex items-center justify-center gap-3 w-full py-1">
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Validating Against Institutional Registry…</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Inspect Credential Authenticity</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  </>
                )}
              </button>
            </form>

            {/* ── Demo Quick-Test Pills ─────────────────────────── */}
            <div className="pt-5 border-t border-white/[0.06] space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] block">
                Quick Test with Officially Registered Credentials:
              </span>
              <div className="flex flex-wrap gap-2">
                {DEMO_CERTIFICATES.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleSelectDemo(demo.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer border ${
                      certId === demo.id
                        ? "bg-[#6C63FF]/20 border-[#6C63FF]/50 text-white"
                        : "bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.06] text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    <span className="text-white font-medium">{demo.id}</span>
                    <span className="text-[10px] text-[#71717A]">• {demo.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Micro Trust Highlights ────────────────────────── */}
            <div className="pt-4 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#A1A1AA]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant Database Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tamper-Evident Snapshots</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official PDF &amp; QR Signatures</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3-Column Trust Pillars (Bento Grid) ────────────────────── */}
        <section className="space-y-4">
          <div className="text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#71717A] block">
              Security Architecture
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              How Credential Verification Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1 */}
            <div className="p-1 rounded-[2rem] bg-white/[0.03] border border-white/[0.08]">
              <div className="p-6 rounded-[calc(2rem-4px)] bg-[#0C0C12] h-full space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 text-[#A78BFA] flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  1. Immutable Snapshot
                </h3>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  Recipient name, university roll number, course, and event date
                  are snapshotted at attendance submission time, preventing retroactive alterations.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-1 rounded-[2rem] bg-white/[0.03] border border-white/[0.08]">
              <div className="p-6 rounded-[calc(2rem-4px)] bg-[#0C0C12] h-full space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  2. Institutional Registry
                </h3>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  Directly cross-referenced with Tula&apos;s University
                  Department of Computer Science and official AWS Student
                  Builder Group session logs.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-1 rounded-[2rem] bg-white/[0.03] border border-white/[0.08]">
              <div className="p-6 rounded-[calc(2rem-4px)] bg-[#0C0C12] h-full space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF9900]/15 border border-[#FF9900]/30 text-[#FF9900] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  3. Vector PDF &amp; QR Code
                </h3>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  Every certificate PDF carries a scannable high-resolution QR
                  code resolving directly to its live public verification record.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer Navigation ─────────────────────────────────────── */}
        <div className="text-center pt-6 border-t border-white/[0.06] text-xs text-[#71717A] flex flex-wrap items-center justify-center gap-6">
          <Link href="/" className="hover:text-white transition-colors">
            ← AWS SBG Homepage
          </Link>
          <span>•</span>
          <Link href="/events" className="hover:text-white transition-colors">
            Upcoming Workshops &amp; Events
          </Link>
          <span>•</span>
          <Link href="/attendance" className="hover:text-white transition-colors">
            Student Attendance Gateway
          </Link>
        </div>
      </div>
    </div>
  );
}
