import { Metadata } from "next";
import Link from "next/link";
import { isValidCertificateIdFormat } from "@/lib/certificates/id-generator";
import { getAdminClient } from "@/lib/supabase/admin";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { VerificationActionToolbar } from "@/components/certificates/VerificationActionToolbar";
import {
  ShieldCheck,
  Award,
  Calendar,
  GraduationCap,
  Hash,
  Search,
  AlertTriangle,
  Building,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Fingerprint,
} from "lucide-react";

interface PageProps {
  params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { certificateId } = await params;
  const cleanId = (certificateId || "").trim().toUpperCase();

  return {
    title: `Verify Certificate: ${cleanId} — AWS Student Builder Group`,
    description: `Official cryptographic verification record for certificate ${cleanId} issued by AWS Student Builder Group at Tula's University.`,
    robots: { index: false, follow: true },
  };
}

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

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { certificateId } = await params;
  const cleanId = (certificateId || "").trim().toUpperCase();

  const isFormatValid = isValidCertificateIdFormat(cleanId);
  let cert: any = null;

  if (isFormatValid) {
    const supabase = getAdminClient();
    if (supabase) {
      const { data } = await supabase
        .from("certificates")
        .select(`
          certificate_id,
          recipient_name_snapshot,
          event_name_snapshot,
          event_date_snapshot,
          issue_date,
          verification_url,
          pdf_url,
          participant:participants (
            course,
            roll_no
          )
        `)
        .eq("certificate_id", cleanId)
        .maybeSingle();

      if (data) {
        const part = Array.isArray(data.participant)
          ? data.participant[0]
          : data.participant;

        cert = {
          certificateId: data.certificate_id,
          recipientName: data.recipient_name_snapshot,
          course: part?.course || "Student",
          rollNo: part?.roll_no || "N/A",
          eventName: data.event_name_snapshot,
          eventDate: data.event_date_snapshot,
          issueDate: data.issue_date,
          issuedBy: "AWS Student Builder Group • Tula's University",
          pdfUrl: data.pdf_url || `/api/certificates/${data.certificate_id}`,
          verificationUrl: data.verification_url || `https://awstulas.org/verify/${data.certificate_id}`,
        };
      }
    }
  }

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
      <main className="max-w-4xl mx-auto w-full space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-[#8B8B96]">
          <Link
            href="/verify"
            className="hover:text-white transition-colors inline-flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Search Another Credential</span>
          </Link>

          <span className="font-mono text-[11px] text-[#A78BFA] bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">
            Official Registry ID: {cleanId}
          </span>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CASE 1: VALID CERTIFICATE RECORD FOUND                        */}
        {/* ───────────────────────────────────────────────────────────── */}
        {cert ? (
          <div className="space-y-8">
            {/* Status Hero Card (Doppelrand with Emerald Ambient Aura) */}
            <div className="p-1 rounded-[2.5rem] bg-emerald-500/[0.08] border border-emerald-500/30 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.25)]">
              <div className="p-6 sm:p-9 rounded-[calc(2.5rem-4px)] bg-[#0A1310] space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Status Indicator & Title */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400 shadow-lg shadow-emerald-500/20">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase font-mono mb-1 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>OFFICIALLY VERIFIED &amp; REGISTERED</span>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        Authentic AWS SBG Credential
                      </h1>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">
                        Permanent snapshot record cross-referenced with Tula&apos;s University official session logs.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Action Toolbar */}
                  <div className="shrink-0">
                    <VerificationActionToolbar
                      certificateId={cert.certificateId}
                      eventName={cert.eventName}
                      issueDate={cert.issueDate}
                      recipientName={cert.recipientName}
                      pdfUrl={cert.pdfUrl}
                      verificationUrl={cert.verificationUrl}
                    />
                  </div>
                </div>

                {/* Recipient Spotlight Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1D18] border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block font-semibold">
                      Awarded To
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
                      {cert.recipientName}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#D4D4D8] bg-black/30 border border-white/10 px-3 py-1.5 rounded-xl">
                      {cert.course}
                    </span>
                    <span className="text-xs font-mono text-[#A1A1AA] bg-black/30 border border-white/10 px-3 py-1.5 rounded-xl">
                      Roll: {cert.rollNo}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Credential Dossier (Doppelrand Bento Grid) */}
            <div className="p-1 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-2xl">
              <div className="p-7 sm:p-9 rounded-[calc(2.5rem-4px)] bg-[#0C0C12] space-y-6">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#A78BFA] font-mono font-medium block">
                    Institutional Record
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-1">
                    Credential Snapshot Specification
                  </h3>
                </div>

                {/* Specification Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Event Name */}
                  <div className="p-4.5 rounded-2xl bg-[#14141A] border border-white/[0.06] flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-[#71717A] font-mono">
                        Workshop / Event
                      </div>
                      <div className="text-sm font-semibold text-white truncate mt-0.5">
                        {cert.eventName}
                      </div>
                    </div>
                  </div>

                  {/* Event Date */}
                  <div className="p-4.5 rounded-2xl bg-[#14141A] border border-white/[0.06] flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-[#71717A] font-mono">
                        Session Date
                      </div>
                      <div className="text-sm font-semibold text-white truncate mt-0.5">
                        {formatDate(cert.eventDate)}
                      </div>
                    </div>
                  </div>

                  {/* Course / Program */}
                  <div className="p-4.5 rounded-2xl bg-[#14141A] border border-white/[0.06] flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-[#A78BFA] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-[#71717A] font-mono">
                        Academic Program
                      </div>
                      <div className="text-sm font-semibold text-white truncate mt-0.5">
                        {cert.course}
                      </div>
                    </div>
                  </div>

                  {/* University Roll Number */}
                  <div className="p-4.5 rounded-2xl bg-[#14141A] border border-white/[0.06] flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Hash className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-[#71717A] font-mono">
                        University Roll Number
                      </div>
                      <div className="text-sm font-semibold font-mono text-white truncate mt-0.5">
                        {cert.rollNo}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Telemetry Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-white/[0.06] text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#71717A] font-mono block mb-1">
                      Certificate Identifier
                    </span>
                    <span className="font-mono font-bold text-[#A78BFA] text-sm">
                      {cert.certificateId}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#71717A] block mb-1">
                      Issuance Date
                    </span>
                    <span className="text-[#D4D4D8] font-mono">
                      {formatDate(cert.issueDate)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#71717A] block mb-1">
                      Issuing Authority
                    </span>
                    <span className="text-white font-medium flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#6C63FF]" />
                      <span>AWS SBG Tula&apos;s</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Certificate Vector Preview (Doppelrand) */}
            <div className="p-1 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 sm:p-9 rounded-[calc(2.5rem-4px)] bg-[#0C0C12] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Official Certificate Vector Preview
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#71717A]">
                    High Resolution • 300 DPI
                  </span>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#14141A] shadow-inner">
                  <CertificatePreview
                    participantName={cert.recipientName}
                    eventTitle={cert.eventName}
                    eventDate={formatDate(cert.eventDate)}
                    certificateId={cert.certificateId}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ───────────────────────────────────────────────────────────── */
          /* CASE 2: NOT FOUND / INVALID CERTIFICATE RECORD               */
          /* ───────────────────────────────────────────────────────────── */
          <div className="p-1 rounded-[2.5rem] bg-red-500/[0.08] border border-red-500/25 shadow-2xl">
            <div className="p-8 sm:p-14 rounded-[calc(2.5rem-4px)] bg-[#120B0D] text-center max-w-lg mx-auto space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-red-500/15 border border-red-500/30 text-red-400 shadow-lg shadow-red-500/20">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-mono font-semibold mb-3 border border-red-500/25">
                  RECORD NOT FOUND
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Certificate Record Not Found
                </h2>
                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mt-2">
                  No registered certificate was found in the database matching ID:{" "}
                  <strong className="font-mono text-white font-bold">{cleanId}</strong>.
                </p>
              </div>

              {/* Troubleshooting Callout */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] text-left text-xs space-y-2">
                <p className="font-semibold text-white">Possible Reasons:</p>
                <ul className="list-disc list-inside text-[#8B8B96] space-y-1.5">
                  <li>Typographical error in the Certificate ID (case-insensitive, format: <code>AWS-SBG-YYYY-XXXXXX</code>).</li>
                  <li>The session certificate has not yet been processed or minted by the administrator.</li>
                  <li>The credential was issued by an unofficial or third-party entity.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/verify"
                  className="w-full sm:w-auto h-11 px-6 rounded-xl text-xs font-semibold bg-[#6C63FF] hover:brightness-110 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#6C63FF]/20"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Another ID</span>
                </Link>

                <Link
                  href="/attendance"
                  className="w-full sm:w-auto h-11 px-6 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Student Attendance Portal</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
