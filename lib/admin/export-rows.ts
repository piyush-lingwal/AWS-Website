// ============================================================
// Rows for the admin "Export CSV" buttons — PURE (no framework imports)
// ============================================================
//
// Turns the lists the dashboard already holds into plain CSV rows, with the
// verification link for every issued certificate. Text cells that a
// spreadsheet would run as a formula (they start with = + - @) get a leading
// apostrophe, so a name like "=HYPERLINK(...)" opens as text.
// ============================================================

export interface ParticipantExportInput {
  name: string;
  email: string;
  course: string;
  rollNo: string;
  submittedAt: string;
  certificateId: string | null;
}

export function participantExportRows(items: readonly ParticipantExportInput[], origin: string): Record<string, string>[] {
  return items.map((p) => ({
    "Full Name": safeCell(p.name),
    "Email Address": safeCell(p.email),
    "Course / Branch": safeCell(p.course),
    "Roll Number": safeCell(p.rollNo),
    "Submitted At": p.submittedAt,
    "Certificate ID": p.certificateId || "N/A",
    "Verification Link": verifyLink(origin, p.certificateId),
  }));
}

export interface OrganiserExportInput {
  certificateId: string;
  fullName: string;
  email: string;
  role: string;
  wing?: string;
  issueDate: string;
}

export interface VolunteerExportInput {
  certificateId: string;
  fullName: string;
  collegeId: string;
  email: string;
  course: string;
  issueDate: string;
}

export interface TopPerformerExportInput {
  rank: number;
  fullName: string;
  email: string;
  course: string;
  rollNo: string;
  certificateId: string | null;
}

/** Stops spreadsheet apps from treating a text cell as a formula. */
export function safeCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function verifyLink(origin: string, certificateId: string | null): string {
  return certificateId ? `${origin}/verify/${certificateId}` : "N/A";
}

export function organiserExportRows(items: readonly OrganiserExportInput[], origin: string): Record<string, string>[] {
  return items.map((o) => ({
    "Full Name": safeCell(o.fullName),
    "Email Address": safeCell(o.email),
    Role: safeCell(o.role),
    Wing: safeCell(o.wing),
    "Issue Date": o.issueDate,
    "Certificate ID": o.certificateId,
    "Verification Link": verifyLink(origin, o.certificateId),
  }));
}

export function volunteerExportRows(items: readonly VolunteerExportInput[], origin: string): Record<string, string>[] {
  return items.map((v) => ({
    Name: safeCell(v.fullName),
    "College ID": safeCell(v.collegeId),
    "Email Address": safeCell(v.email),
    Course: safeCell(v.course),
    "Issue Date": v.issueDate,
    "Certificate ID": v.certificateId,
    "Verification Link": verifyLink(origin, v.certificateId),
  }));
}

export function topPerformerExportRows(items: readonly TopPerformerExportInput[], origin: string): Record<string, string>[] {
  return [...items]
    .sort((a, b) => a.rank - b.rank)
    .map((p) => ({
      Rank: String(p.rank),
      "Full Name": safeCell(p.fullName),
      "Email Address": safeCell(p.email),
      "Course / Branch": safeCell(p.course),
      "Roll Number": safeCell(p.rollNo),
      "Certificate ID": p.certificateId || "Not issued",
      "Verification Link": verifyLink(origin, p.certificateId),
    }));
}

/** "Build-Verse 2026" + "Top_Performers" -> "Build-Verse_2026_Top_Performers_2026-11-03.csv" */
export function exportFileName(eventName: string, kind: string, date: Date = new Date()): string {
  const base = (eventName.trim() || "AWS_SBG_Event").replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${base}_${kind}_${date.toISOString().split("T")[0]}.csv`;
}
