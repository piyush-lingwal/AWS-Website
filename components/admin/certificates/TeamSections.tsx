"use client";

// ============================================================
// The Organising Team and Volunteers lists of the Certificates tab
// ============================================================
//
// Both are TeamCertificateSection with their own columns, search fields, export
// and add dialog. Each is specific to the event passed in.
// ============================================================

import { OrganiserIssueDialog } from "@/components/features/OrganiserIssueDialog";
import { VolunteerIssueDialog } from "@/components/features/VolunteerIssueDialog";
import { organiserExportRows, volunteerExportRows } from "@/lib/admin/export-rows";
import { TeamCertificateSection, type ConfirmOptions, type TeamColumn } from "./TeamCertificateSection";

export interface OrganiserCertRow {
  certificateId: string;
  fullName: string;
  email: string;
  role: string;
  wing?: string;
  issueDate: string;
}

export interface VolunteerCertRow {
  certificateId: string;
  fullName: string;
  collegeId: string;
  email: string;
  course: string;
  issueDate: string;
}

interface SectionProps {
  eventId: string;
  eventName: string;
  eventHasDate: boolean;
  confirm: (options: ConfirmOptions) => void;
  onCountChange?: (count: number | null) => void;
}

const roleLabel = (o: OrganiserCertRow) => o.role || (o.wing ? `${o.wing} Wing` : "Organising Team");

const ORGANISER_COLUMNS: TeamColumn<OrganiserCertRow>[] = [
  {
    header: "Role / Wing",
    cell: (o) => (
      <span className="inline-block rounded-lg border border-sbg-lilac-300 bg-sbg-lilac-100 px-2.5 py-1 text-[11px] font-medium text-sbg-lilac-700">
        {roleLabel(o)}
      </span>
    ),
  },
];

const organiserSearch = (o: OrganiserCertRow) => [o.fullName, o.email, o.role, o.wing, o.wing ? `${o.wing} wing` : "", o.certificateId];

export function OrganiserSection({ eventId, eventName, eventHasDate, confirm, onCountChange }: SectionProps) {
  return (
    <TeamCertificateSection<OrganiserCertRow>
      eventId={eventId}
      eventName={eventName}
      title="Organising Team"
      description={
        <>
          Certificates of Appreciation for the organising team of <span className="text-sbg-lilac-700">{eventName}</span>.
        </>
      }
      listUrl={`/api/admin/events/${eventId}/organisers`}
      listKey="organisers"
      deleteUrl={(id) => `/api/admin/events/${eventId}/organisers?certificateId=${encodeURIComponent(id)}`}
      bulkSection="organisers"
      noun="members"
      renderAdd={(reload) => (
        <OrganiserIssueDialog key={`org-${eventId}`} eventId={eventId} eventName={eventName} eventHasDate={eventHasDate} onIssued={() => void reload()} />
      )}
      columns={ORGANISER_COLUMNS}
      mobileDetail={(o) => (
        <span className="inline-block rounded-md border border-sbg-lilac-300 bg-sbg-lilac-100 px-2 py-0.5 font-medium text-sbg-lilac-700">{roleLabel(o)}</span>
      )}
      searchFields={organiserSearch}
      searchPlaceholder="Search name, email, role, wing or certificate…"
      exportRows={organiserExportRows}
      exportKind="Appreciation"
      emptyText="No organising team members added for this event yet."
      linkClass="text-sbg-lilac-700"
      confirm={confirm}
      onCountChange={onCountChange}
    />
  );
}

const VOLUNTEER_COLUMNS: TeamColumn<VolunteerCertRow>[] = [
  { header: "College ID", cell: (v) => <span className="font-mono text-[11px] text-sbg-ink-2">{v.collegeId || "—"}</span> },
  { header: "Course", cell: (v) => <span className="text-sbg-ink">{v.course || "—"}</span> },
];

const volunteerSearch = (v: VolunteerCertRow) => [v.fullName, v.email, v.collegeId, v.course, v.certificateId];

export function VolunteerSection({ eventId, eventName, eventHasDate, confirm, onCountChange }: SectionProps) {
  return (
    <TeamCertificateSection<VolunteerCertRow>
      eventId={eventId}
      eventName={eventName}
      title="Volunteers"
      description={
        <>
          Certificates of Volunteering for <span className="text-[#047857]">{eventName}</span>. Each certificate is for this event only.
        </>
      }
      listUrl={`/api/admin/events/${eventId}/volunteers`}
      listKey="volunteers"
      deleteUrl={(id) => `/api/admin/events/${eventId}/volunteers?certificateId=${encodeURIComponent(id)}`}
      bulkSection="volunteers"
      noun="volunteers"
      renderAdd={(reload) => (
        <VolunteerIssueDialog key={`vol-${eventId}`} eventId={eventId} eventName={eventName} eventHasDate={eventHasDate} onIssued={() => void reload()} />
      )}
      columns={VOLUNTEER_COLUMNS}
      mobileDetail={(v) => [v.collegeId && `ID ${v.collegeId}`, v.course].filter(Boolean).join(" · ")}
      searchFields={volunteerSearch}
      searchPlaceholder="Search name, email, college ID, course or certificate…"
      exportRows={volunteerExportRows}
      exportKind="Volunteers"
      emptyText="No volunteers added for this event yet."
      linkClass="text-[#047857]"
      confirm={confirm}
      onCountChange={onCountChange}
    />
  );
}
