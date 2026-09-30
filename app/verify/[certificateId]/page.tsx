import { Metadata } from "next";
import Link from "next/link";
import { isValidCertificateIdFormat } from "@/lib/certificates/id-generator";
import { getAdminClient } from "@/lib/supabase/admin";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import {
  ShieldCheck,
  Award,
  Calendar,
  User,
  GraduationCap,
  Hash,
  Download,
  Eye,
  ExternalLink,
  Search,
  AlertTriangle,
  Building,
} from "lucide-react";

interface PageProps {
  params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { certificateId } = await params;
  const cleanId = (certificateId || "").trim().toUpperCase();

  return {
    title: `Verify ${cleanId} — AWS Student Builder Group`,
    description: `Official verification record for certificate ${cleanId} issued by AWS Student Builder Group at Tula's University.`,
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
          verificationUrl: data.verification_url,
        };
      }
    }
  }

  return (
    <div
      className="min-h-screen text-[#F4F4F6] selection:bg-[#6C63FF]/30 pt-32 sm:pt-36 pb-24 px-4 sm:px-6"
      style={{
        background: `
          radial-gradient(850px 420px at 50% 10%, rgba(108,99,255,0.16), transparent 70%),
          radial-gradient(500px 300px at 85% 20%, rgba(255,153,0,0.05), transparent 70%),
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px) 0 0/48px 48px,
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px) 0 0/48px 48px,
          #08080B
        `,
      }}
    >
      <main className="max-w-4xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between text-xs text-[#8B8B96]">
          <Link
            href="/verify"
            className="hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            ← Verify another certificate
          </Link>
          <span className="font-mono text-[11px] text-[#A78BFA]">
            Official Registry Lookup
          </span>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CASE 1: VALID CERTIFICATE                                     */}
        {/* ───────────────────────────────────────────────────────────── */}
        {cert ? (
          <div className="space-y-8">
            {/* Status Hero Card */}
            <div className="p-1 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/30 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.25)]">
              <div className="p-6 sm:p-8 rounded-[calc(2rem-4px)] bg-[#0C1412] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold tracking-wider uppercase font-mono mb-1">
                      VERIFIED
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Official AWS SBG Certificate
                    </h1>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                      This certificate is authentic, verified against university records, and officially registered.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <a
                    href={`/api/certificates/${cert.certificateId}`}
                    download={`${cert.certificateId}.pdf`}
                    className="h-10 px-4 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-2 transition-all cursor-pointer font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                  <a
                    href={`/api/certificates/${cert.certificateId}?inline=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    View PDF
                  </a>
                </div>
              </div>
            </div>

            {/* Certificate Details Breakdown */}
            <div className="p-1 rounded-[2rem] bg-white/[0.04] border border-white/10 shadow-2xl">
              <div className="p-6 sm:p-8 rounded-[calc(2rem-4px)] bg-[#0F0F13] space-y-6">
                {/* Recipient */}
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#F59E0B] font-mono font-medium">
                    Recipient
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 tracking-tight">
                    {cert.recipientName}
                  </h2>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#26262D]">
                  {/* Course */}
                  <div className="p-4 rounded-xl bg-[#17171C] border border-[#26262D] flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-[#22D3EE] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-[#8B8B96] font-mono">
                        Course / Program
                      </div>
                      <div className="text-sm font-semibold text-white truncate">
                        {cert.course}
                      </div>
                    </div>
                  </div>

                  {/* Roll Number */}
                  <div className="p-4 rounded-xl bg-[#17171C] border border-[#26262D] flex items-center gap-3">
                    <Hash className="w-5 h-5 text-[#A78BFA] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-[#8B8B96] font-mono">
                        University Roll Number
                      </div>
                      <div className="text-sm font-semibold text-white font-mono truncate">
                        {cert.rollNo}
                      </div>
                    </div>
                  </div>

                  {/* Event Name */}
                  <div className="p-4 rounded-xl bg-[#17171C] border border-[#26262D] flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#F59E0B] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-[#8B8B96] font-mono">
                        Event / Workshop
                      </div>
                      <div className="text-sm font-semibold text-white truncate">
                        {cert.eventName}
                      </div>
                    </div>
                  </div>

                  {/* Event Date */}
                  <div className="p-4 rounded-xl bg-[#17171C] border border-[#26262D] flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#34D399] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-[#8B8B96] font-mono">
                        Event Date
                      </div>
                      <div className="text-sm font-semibold text-white truncate">
                        {formatDate(cert.eventDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registry Metadata Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#26262D] text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8B8B96] font-mono block mb-1">
                      Certificate ID
                    </span>
                    <span className="font-mono font-bold text-[#6C63FF]">
                      {cert.certificateId}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8B8B96] font-mono block mb-1">
                      Issue Date
                    </span>
                    <span className="text-[#D4D4D8] font-mono">
                      {formatDate(cert.issueDate)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8B8B96] font-mono block mb-1">
                      Issued By
                    </span>
                    <span className="text-white font-medium">
                      {cert.issuedBy}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Preview Card */}
            <div className="p-1 rounded-[2rem] bg-white/[0.04] border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 sm:p-8 rounded-[calc(2rem-4px)] bg-[#0F0F13]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                    Official Certificate Preview
                  </h3>
                  <span className="text-[11px] text-[#8B8B96] font-mono">
                    High Resolution (Vector)
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#26262D] bg-[#17171C]">
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
          /* CASE 2: NOT FOUND / INVALID CERTIFICATE                       */
          /* ───────────────────────────────────────────────────────────── */
          <div className="p-1 rounded-[2rem] bg-white/[0.04] border border-white/10 shadow-2xl">
            <div className="p-8 sm:p-12 rounded-[calc(2rem-4px)] bg-[#0F0F13] text-center max-w-lg mx-auto">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-mono font-medium mb-3">
                NOT FOUND
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Certificate Record Not Found
              </h2>

              <p className="text-sm text-[#8B8B96] leading-relaxed mb-6">
                No authentic certificate was found matching the ID:{" "}
                <span className="font-mono text-white font-semibold">{cleanId}</span>.
                Please ensure the Certificate ID was entered correctly without typos.
              </p>

              <div className="p-4 rounded-xl bg-[#17171C] border border-[#26262D] text-left text-xs space-y-2 mb-6">
                <p className="font-semibold text-white">Possible Reasons:</p>
                <ul className="list-disc list-inside text-[#8B8B96] space-y-1">
                  <li>The Certificate ID was mistyped or incomplete.</li>
                  <li>The session certificate has not yet been approved or issued.</li>
                  <li>The credential was issued by an unofficial or unauthorized source.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/verify"
                  className="w-full sm:w-auto h-11 px-5 rounded-xl text-xs font-semibold bg-[#6C63FF] hover:brightness-110 text-white flex items-center justify-center gap-2 transition-all"
                >
                  <Search className="w-4 h-4" />
                  Search Again
                </Link>
                <Link
                  href="/attendance"
                  className="w-full sm:w-auto h-11 px-5 rounded-xl text-xs font-semibold bg-[#17171C] hover:bg-[#1f1f26] text-[#F4F4F6] border border-[#26262D] flex items-center justify-center gap-2 transition-all"
                >
                  Go to Attendance Portal
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
