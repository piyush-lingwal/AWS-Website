import { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { isValidCertificateIdFormat } from "@/lib/certificates/id-generator";
import { getAwardTitle } from "@/lib/certificates/award-title";
import { getAdminClient } from "@/lib/supabase/admin";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { getEventCertificateTheme } from "@/lib/certificates/event-theme";
import { certificateKindFromColumn } from "@/lib/certificates/theme";
import { CERTIFICATE_OPTIONAL_COLUMNS, selectWithOptionalColumns } from "@/lib/certificates/optional-columns";
import { certificateDisplayDate } from "@/lib/certificates/issue-date";
import { certificateTypeDetail, certificateTypeLabel } from "@/lib/certificates/verify-view";
import { VerifyActions, CopyId } from "@/components/verify/VerifyActions";
import { VerifyIdForm } from "@/components/verify/VerifyIdForm";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
import {
  ShieldCheck,
  Award,
  BadgeCheck,
  Building2,
  CalendarDays,
  CalendarCheck,
  ArrowLeft,
  AlertTriangle,
  GraduationCap,
  Hash,
  HandHeart,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

interface PageProps {
  params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { certificateId } = await params;
  const cleanId = (certificateId || "").trim().toUpperCase();

  const meta = buildPageMetadata({
    path: `/verify/${cleanId}`,
    title: `Verify ${cleanId}`,
    description: `Official verification record for certificate ${cleanId} issued by AWS Student Builder Group at Tulas University.`,
    noindex: true,
  });
  // The /verify layout sets a canonical; clear it so a noindex record page has none.
  return { ...meta, alternates: { canonical: null } };
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
      const baseColumns = `
          certificate_id,
          recipient_name_snapshot,
          event_name_snapshot,
          event_date_snapshot,
          issue_date,
          event_id,
          participant_id,
          award_title,
          verification_url,
          pdf_url,
          participant:participants (
            course,
            roll_no
          )`;
      // The display date, kind, role and wing columns come from separate
      // migrations that may be applied out of order; drop only the ones this
      // database is missing rather than falling back to bare columns.
      const { data } = await selectWithOptionalColumns<Record<string, any>>(
        baseColumns,
        CERTIFICATE_OPTIONAL_COLUMNS,
        (select) => supabase.from("certificates").select(select).eq("certificate_id", cleanId).maybeSingle()
      );

      if (data) {
        const part = Array.isArray(data.participant)
          ? data.participant[0]
          : data.participant;
        let course = part?.course || "Student";
        let rollNo = part?.roll_no || "N/A";

        if (data.award_title) {
          const { data: topPerformer, error: topPerformerError } = await supabase
            .from("top_performers")
            .select("course, roll_no")
            .eq("event_id", data.event_id)
            .eq("participant_id", data.participant_id)
            .maybeSingle();

          if (topPerformerError) {
            console.error("[VerifyPage] Top performer lookup failed:", topPerformerError);
          }
          course = topPerformer?.course || "N/A";
          rollNo = topPerformer?.roll_no || "N/A";
        }

        cert = {
          certificateId: data.certificate_id,
          recipientName: data.recipient_name_snapshot,
          course,
          rollNo,
          eventName: data.event_name_snapshot,
          eventDate: data.event_date_snapshot,
          awardTitle: getAwardTitle(data.award_title) || null,
          issueDate: data.issue_date,
          issuedBy: "AWS Student Builder Group\nTulas University",
          pdfUrl: data.pdf_url || `/api/certificates/${data.certificate_id}`,
          verificationUrl: data.verification_url,
          // Same lookup the PDF uses, so the preview and the download always match.
          theme: await getEventCertificateTheme(supabase, data.event_id),
          // Stored display string (single day or range), or the start date for old certificates.
          eventDateDisplay: certificateDisplayDate(data),
          kind: certificateKindFromColumn(data.certificate_kind) ?? null,
          role: data.role_snapshot ?? null,
          wing: data.wing_snapshot ?? null,
        };
      }
    }
  }

  const typeLabel = cert ? certificateTypeLabel(cert.kind, cert.awardTitle) : "";
  const typeDetail = cert ? certificateTypeDetail({ kind: cert.kind, awardTitle: cert.awardTitle, role: cert.role, wing: cert.wing }) : "";
  const TypeIcon: LucideIcon = cert?.awardTitle ? Trophy : cert?.kind === "volunteer" ? HandHeart : cert?.kind === "organiser" ? Users : Award;
  // Excellence = amber, volunteer = green, everything else = the site's lilac.
  const tone = cert?.awardTitle
    ? "border-amber-300 bg-amber-100 text-amber-800"
    : cert?.kind === "volunteer"
      ? "border-emerald-300 bg-emerald-100 text-emerald-800"
      : "border-sbg-lilac-300 bg-sbg-lilac-100 text-sbg-lilac-800";

  return (
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <main data-tone="dawn" className="px-[var(--gutter)] pb-20 pt-36 lg:pb-24">
          <div className="mx-auto w-full max-w-6xl">
            {cert ? (
              <div className="space-y-6 sm:space-y-8">
                {/* ── Status ─────────────────────────────────────────── */}
                <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-100 text-emerald-700 shadow-[0_10px_30px_-10px_rgba(5,150,105,0.45)] sm:h-16 sm:w-16">
                    <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1.5 font-lt-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Verified credential
                    </p>
                    <h1 className="mt-1 font-lt-display text-2xl font-bold tracking-tight text-sbg-ink sm:text-3xl lg:text-4xl">
                      This certificate is authentic
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-sbg-ink-2">
                      Issued by AWS Student Builder Group at Tulas University and found in the official registry.
                    </p>
                  </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[25rem_minmax(0,1fr)]">
                  {/* ── Details ──────────────────────────────────────── */}
                  <section
                    aria-labelledby="recipient-name"
                    className="surface rounded-[28px] p-5 sm:p-7 lg:sticky lg:top-28 lg:col-start-1 lg:row-start-1"
                  >
                    <span className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${tone}`}>
                      <TypeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{typeLabel}</span>
                    </span>

                    <p className="mt-5 font-lt-mono text-[11px] font-medium uppercase tracking-wider text-amber-700">Awarded to</p>
                    <h2 id="recipient-name" className="mt-1 break-words font-lt-display text-2xl font-bold leading-tight tracking-tight text-sbg-ink sm:text-3xl">
                      {cert.recipientName}
                    </h2>
                    {typeDetail && <p className="mt-1.5 break-words text-sm font-medium text-sbg-lilac-700">{typeDetail}</p>}

                    <dl className="mt-6 divide-y divide-[var(--line)] border-t border-[var(--line)]">
                      <DetailRow icon={Award} iconClass="text-amber-700" label="Event / Workshop" value={cert.eventName} />
                      <DetailRow icon={CalendarDays} iconClass="text-emerald-700" label="Event date" value={cert.eventDateDisplay} />
                      {cert.awardTitle && (
                        <DetailRow icon={GraduationCap} iconClass="text-sbg-lilac-700" label="Course" value={`${cert.course}${cert.rollNo && cert.rollNo !== "N/A" ? ` · ${cert.rollNo}` : ""}`} />
                      )}
                      <DetailRow icon={CalendarCheck} iconClass="text-blue-700" label="Issued on" value={formatDate(cert.issueDate)} />
                      <DetailRow icon={Building2} iconClass="text-sbg-ink-2" label="Issued by" value={cert.issuedBy} />
                      <div className="flex items-start gap-3 py-3.5">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sbg-lilac-100 text-sbg-lilac-700">
                          <Hash className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <dt className="font-lt-mono text-[10px] uppercase tracking-wider text-sbg-ink-3">Certificate ID</dt>
                          <dd className="mt-1">
                            <CopyId value={cert.certificateId} />
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </section>

                  {/* ── Certificate ──────────────────────────────────── */}
                  <section
                    aria-label="Certificate"
                    className="surface min-w-0 space-y-5 rounded-[28px] p-3 sm:p-6 lg:col-start-2 lg:row-start-1"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
                      <h2 className="font-lt-mono text-xs font-semibold uppercase tracking-wider text-sbg-ink sm:text-sm">Official certificate</h2>
                      <p className="text-[11px] text-sbg-ink-3">Tap the certificate to see it full size</p>
                    </div>

                    <div className="rounded-xl border border-[var(--line)] bg-sbg-lilac-50 p-1.5 sm:p-2.5">
                      <CertificatePreview
                        participantName={cert.recipientName}
                        eventTitle={cert.eventName}
                        eventDate={cert.eventDateDisplay}
                        certificateId={cert.certificateId}
                        verificationUrl={cert.verificationUrl || undefined}
                        awardTitle={cert.awardTitle || undefined}
                        theme={cert.theme}
                        kind={cert.kind || undefined}
                        role={cert.role || undefined}
                        wing={cert.wing || undefined}
                      />
                    </div>

                    <VerifyActions certificateId={cert.certificateId} eventName={cert.eventName} />
                  </section>
                </div>

                <footer className="flex flex-col items-center justify-between gap-3 border-t border-[var(--line)] pt-6 text-center text-xs text-sbg-ink-2 sm:flex-row sm:text-left">
                  <p>Does something look wrong? Compare this page with the certificate you were given.</p>
                  <Link href="/verify" className="btn btn-ghost">
                    Verify another certificate
                  </Link>
                </footer>
              </div>
            ) : (
              /* ── Not found / invalid ─────────────────────────────── */
              <div className="surface mx-auto max-w-xl rounded-[32px] p-6 text-center sm:p-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-300 bg-red-100 text-red-700">
                  <AlertTriangle className="h-8 w-8" aria-hidden="true" />
                </div>
                <p className="mb-3 inline-flex items-center rounded-full bg-red-100 px-3 py-1 font-lt-mono text-xs font-medium text-red-700">
                  {isFormatValid ? "NOT FOUND" : "INVALID ID"}
                </p>
                <h1 className="mb-2 font-lt-display text-2xl font-bold tracking-tight text-sbg-ink sm:text-3xl">
                  {isFormatValid ? "No certificate found" : "That is not a certificate ID"}
                </h1>
                <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-sbg-ink-2">
                  {isFormatValid ? "Nothing in the registry matches " : "We could not read "}
                  <span className="break-all font-lt-mono font-semibold text-sbg-ink">{cleanId || "an empty ID"}</span>.{" "}
                  {isFormatValid ? "Check the ID against your certificate and try again." : "Certificate IDs look like AWS-SBG-2026-GKTZ4W."}
                </p>

                <div className="mb-6 text-left">
                  <VerifyIdForm initialValue={cleanId} submitLabel="Try again" />
                </div>

                <div className="mb-6 rounded-xl border border-[var(--line)] bg-sbg-lilac-50 p-4 text-left text-xs">
                  <p className="mb-2 font-semibold text-sbg-ink">Common reasons</p>
                  <ul className="list-inside list-disc space-y-1 text-sbg-ink-2">
                    <li>The ID was mistyped (letters and numbers can look alike).</li>
                    <li>The certificate has not been issued yet.</li>
                    <li>The certificate was withdrawn by the organisers.</li>
                    <li>The credential did not come from AWS Student Builder Group.</li>
                  </ul>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/attendance" className="btn btn-ghost w-full sm:w-auto">
                    Go to Attendance Portal
                  </Link>
                  <Link href="/" className="btn btn-ghost w-full gap-2 sm:w-auto">
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to home
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
        <DesignFooter />
      </div>
    </>
  );
}

function DetailRow({ icon: Icon, iconClass, label, value }: { icon: LucideIcon; iconClass: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sbg-lilac-100">
        <Icon className={`h-4 w-4 ${iconClass}`} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="font-lt-mono text-[10px] uppercase tracking-wider text-sbg-ink-3">{label}</dt>
        <dd className="mt-1 whitespace-pre-line break-words text-sm font-semibold text-sbg-ink">{value}</dd>
      </div>
    </div>
  );
}
