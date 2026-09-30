"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Award,
  ArrowRight,
  Clipboard,
  X,
  Database,
  Lock,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { isValidCertificateIdFormat } from "@/lib/certificates/id-generator";

// Helper to clean & auto-extract Certificate ID from text or full URL
function cleanAndExtractCertId(input: string): string {
  const trimmed = input.trim();
  // Check if user pasted a full URL or text containing the pattern
  const match = trimmed.match(/AWS-SBG-\d{4}-[A-Za-z0-9]{6}/i);
  if (match) {
    return match[0].toUpperCase();
  }
  return trimmed.toUpperCase();
}

export default function CertificateSearchPage() {
  const router = useRouter();
  const [certId, setCertId] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const cleanId = cleanAndExtractCertId(certId);
  const isFormatValid = cleanId.length > 0 && isValidCertificateIdFormat(cleanId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cleanId) {
      setError("Please enter a Certificate ID.");
      return;
    }

    if (!isValidCertificateIdFormat(cleanId)) {
      setError("Expected format: AWS-SBG-YYYY-XXXXXX (e.g. AWS-SBG-2026-UK95ZP)");
      return;
    }

    setIsSearching(true);
    router.push(`/verify/${cleanId}`);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const extracted = cleanAndExtractCertId(text);
        setCertId(extracted);
        setError("");
      }
    } catch {
      // Clipboard API unavailable or permission denied
    }
  };

  const handleSampleClick = (sampleId: string) => {
    setCertId(sampleId);
    setError("");
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div
      className="min-h-screen text-[#F4F4F6] selection:bg-[#6C63FF]/30 pt-32 sm:pt-36 pb-24 px-4 sm:px-6 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(900px 480px at 50% 12%, rgba(108,99,255,0.14), transparent 70%),
          radial-gradient(600px 320px at 85% 25%, rgba(255,153,0,0.05), transparent 70%),
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px) 0 0/48px 48px,
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px) 0 0/48px 48px,
          #08080B
        `,
      }}
    >
      <main className="max-w-3xl mx-auto w-full space-y-12 relative z-10">
        {/* ── Page Header ───────────────────────────────────────── */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#6C63FF]/15 to-[#FF9900]/10 border border-[#6C63FF]/30 text-xs font-mono text-[#A78BFA] shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#6C63FF]" />
            <span>Institutional Registry • Official Verification</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Verify Certificate Authenticity
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[#8B8B96] max-w-xl mx-auto leading-relaxed">
            Authenticate official credentials issued by the AWS Student Builder Group at
            Tula&apos;s University. All records are cryptographically indexed against verified
            attendance rosters.
          </p>
        </header>

        {/* ── Doppelrand Verification Input Cockpit ─────────────── */}
        <div className="p-1 sm:p-1.5 rounded-[2.25rem] bg-white/[0.04] border border-white/10 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.8)]">
          <div className="p-6 sm:p-10 rounded-[calc(2.25rem-6px)] bg-[#0C0C11] border border-white/[0.04] space-y-6">
            <form onSubmit={handleSearch} noValidate className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="certId"
                    className="block font-mono text-[11px] uppercase tracking-wider text-[#A1A1AA] font-semibold"
                  >
                    Certificate Identifier <span className="text-[#6C63FF]">*</span>
                  </label>

                  {/* Real-time Format Pill */}
                  {certId && (
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isFormatValid
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isFormatValid ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      {isFormatValid ? "Valid Format" : "Invalid Format"}
                    </span>
                  )}
                </div>

                {/* Input Container */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none">
                    <Search className="w-4 h-4 text-[#A78BFA]" />
                  </div>

                  <input
                    id="certId"
                    type="text"
                    required
                    autoFocus
                    autoCapitalize="characters"
                    value={certId}
                    onChange={(e) => {
                      setCertId(cleanAndExtractCertId(e.target.value));
                      setError("");
                    }}
                    placeholder="e.g. AWS-SBG-2026-UK95ZP"
                    className="w-full h-14 pl-12 pr-28 rounded-2xl text-base sm:text-lg font-mono font-medium tracking-wider bg-[#14141A] border border-white/[0.08] text-white placeholder-[#52525B] focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-all"
                  />

                  {/* Input Utilities (Paste & Clear) */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {certId ? (
                      <button
                        type="button"
                        onClick={() => {
                          setCertId("");
                          setError("");
                        }}
                        className="h-8 w-8 rounded-xl flex items-center justify-center text-[#71717A] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="Clear input"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePaste}
                        className="h-8 px-2.5 rounded-xl text-[11px] font-mono text-[#A1A1AA] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Paste from clipboard"
                      >
                        <Clipboard className="w-3 h-3" />
                        <span>Paste</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-[#71717A] font-mono mt-2">
                  Expected pattern: <span className="text-[#A1A1AA]">AWS-SBG-YYYY-XXXXXX</span>
                </p>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit CTA Button with Button-in-Button */}
              <button
                type="submit"
                disabled={isSearching}
                className="group relative w-full h-13 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:brightness-110 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg shadow-[#6C63FF]/25 disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Querying Institutional Registry…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Credential Record</span>
                    <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Sample Verified IDs */}
            <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#71717A] text-[11px] font-mono">
                Sample Verified ID:
              </span>
              <button
                type="button"
                onClick={() => handleSampleClick("AWS-SBG-2026-UK95ZP")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-[#A78BFA] hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
              >
                AWS-SBG-2026-UK95ZP
              </button>
              <button
                type="button"
                onClick={() => handleSampleClick("AWS-SBG-2026-FUW35U")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-[#A78BFA] hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
              >
                AWS-SBG-2026-FUW35U
              </button>
            </div>
          </div>
        </div>

        {/* ── Trust & Architecture Bento (3 Pillars) ───────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1 */}
          <div className="p-1 rounded-[1.75rem] bg-white/[0.03] border border-white/[0.08]">
            <div className="p-5 sm:p-6 rounded-[calc(1.75rem-4px)] bg-[#0C0C11] h-full flex flex-col justify-between space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Database Verified
                </h2>
                <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                  Real-time lookup against live session check-ins, rendering counterfeit certificates impossible.
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-1 rounded-[1.75rem] bg-white/[0.03] border border-white/[0.08]">
            <div className="p-5 sm:p-6 rounded-[calc(1.75rem-4px)] bg-[#0C0C11] h-full flex flex-col justify-between space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-[#A78BFA] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Immutable Snapshot
                </h2>
                <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                  Recipient name, roll number, and workshop schedule are permanently sealed upon credential creation.
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-1 rounded-[1.75rem] bg-white/[0.03] border border-white/[0.08]">
            <div className="p-5 sm:p-6 rounded-[calc(1.75rem-4px)] bg-[#0C0C11] h-full flex flex-col justify-between space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] flex items-center justify-center shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Global Portability
                </h2>
                <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                  Download high-resolution vector PDFs or share persistent verification URLs on LinkedIn and resumes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Verification FAQ / Guidance ──────────────────────── */}
        <section className="p-1 rounded-[2rem] bg-white/[0.03] border border-white/[0.08]">
          <div className="p-6 sm:p-8 rounded-[calc(2rem-4px)] bg-[#0C0C11] space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-[#A78BFA]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Verification Guidelines
              </h2>
            </div>

            <div className="space-y-2.5">
              {/* FAQ Item 1 */}
              <div className="rounded-xl bg-[#14141A] border border-white/[0.06] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFaq(1)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-medium text-white hover:text-[#A78BFA] transition-colors cursor-pointer"
                >
                  <span>Where do I find my unique Certificate ID?</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#71717A] transition-transform duration-200 ${
                      openFaq === 1 ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>
                {openFaq === 1 && (
                  <div className="px-4 pb-4 text-xs text-[#8B8B96] leading-relaxed border-t border-white/[0.04] pt-2">
                    Your Certificate ID is printed on the bottom-right corner of your official PDF credential and was also sent to your registered email address upon attendance submission.
                  </div>
                )}
              </div>

              {/* FAQ Item 2 */}
              <div className="rounded-xl bg-[#14141A] border border-white/[0.06] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFaq(2)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-medium text-white hover:text-[#A78BFA] transition-colors cursor-pointer"
                >
                  <span>Is this verification link permanent for resumes and LinkedIn?</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#71717A] transition-transform duration-200 ${
                      openFaq === 2 ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>
                {openFaq === 2 && (
                  <div className="px-4 pb-4 text-xs text-[#8B8B96] leading-relaxed border-t border-white/[0.04] pt-2">
                    Yes. The direct verification URL (<span className="text-white font-mono">awstulas.org/verify/[ID]</span>) is immutable and can be added as a credential verification link on LinkedIn, GitHub portfolios, and professional resumes.
                  </div>
                )}
              </div>

              {/* FAQ Item 3 */}
              <div className="rounded-xl bg-[#14141A] border border-white/[0.06] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFaq(3)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-medium text-white hover:text-[#A78BFA] transition-colors cursor-pointer"
                >
                  <span>What should I do if my certificate cannot be found?</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#71717A] transition-transform duration-200 ${
                      openFaq === 3 ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>
                {openFaq === 3 && (
                  <div className="px-4 pb-4 text-xs text-[#8B8B96] leading-relaxed border-t border-white/[0.04] pt-2">
                    Verify that the ID has no typos. If you recently attended a session, please confirm your attendance was submitted before the portal closed. For unresolved records, contact the AWS Student Builder Group organizing team at Tula&apos;s University.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer Navigation ─────────────────────────────────── */}
        <footer className="text-center text-xs text-[#71717A] space-y-2 pt-4">
          <p>
            <Link
              href="/"
              className="text-[#A1A1AA] hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              ← Return to AWS SBG Homepage
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
