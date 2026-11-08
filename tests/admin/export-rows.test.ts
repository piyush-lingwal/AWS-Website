import { test } from "node:test";
import assert from "node:assert/strict";
import { exportFileName, organiserExportRows, safeCell, topPerformerExportRows, volunteerExportRows } from "../../lib/admin/export-rows.ts";

const ORIGIN = "https://awstulas.org";

test("safeCell neutralises spreadsheet formulas and leaves normal text alone", () => {
  for (const v of ["=1+1", "+cmd", "-2", "@SUM(A1)", "\tx", "\rx"]) assert.equal(safeCell(v), `'${v}`);
  assert.equal(safeCell("Vivek Dharmwan"), "Vivek Dharmwan");
  assert.equal(safeCell("a=b"), "a=b");
  assert.equal(safeCell(""), "");
  assert.equal(safeCell(undefined), "");
  assert.equal(safeCell(null), "");
  assert.equal(safeCell(42), "42");
});

test("organiser rows carry role, wing, certificate id and a verification link", () => {
  const rows = organiserExportRows(
    [
      { certificateId: "AWS-SBG-2026-AAAAAA", fullName: "Vivek Dharmwan", email: "v@x.in", role: "Technical Co-Lead", wing: "Tech", issueDate: "2026-11-03" },
      { certificateId: "AWS-SBG-2026-BBBBBB", fullName: "Aarav Sharma", email: "a@x.in", role: "", issueDate: "2026-11-03" },
    ],
    ORIGIN
  );
  assert.deepEqual(Object.keys(rows[0]), ["Full Name", "Email Address", "Role", "Wing", "Issue Date", "Certificate ID", "Verification Link"]);
  assert.deepEqual(rows[0], {
    "Full Name": "Vivek Dharmwan",
    "Email Address": "v@x.in",
    Role: "Technical Co-Lead",
    Wing: "Tech",
    "Issue Date": "2026-11-03",
    "Certificate ID": "AWS-SBG-2026-AAAAAA",
    "Verification Link": "https://awstulas.org/verify/AWS-SBG-2026-AAAAAA",
  });
  assert.equal(rows[1].Role, "");
  assert.equal(rows[1].Wing, "");
});

test("top performer rows are ordered by rank; unissued ones say so", () => {
  const rows = topPerformerExportRows(
    [
      { rank: 2, fullName: "B", email: "b@x.in", course: "BCA", rollNo: "22", certificateId: null },
      { rank: 1, fullName: "A", email: "a@x.in", course: "B.Tech", rollNo: "11", certificateId: "AWS-SBG-2026-CCCCCC" },
    ],
    ORIGIN
  );
  assert.deepEqual(rows.map((r) => r.Rank), ["1", "2"]);
  assert.equal(rows[0]["Verification Link"], "https://awstulas.org/verify/AWS-SBG-2026-CCCCCC");
  assert.equal(rows[1]["Certificate ID"], "Not issued");
  assert.equal(rows[1]["Verification Link"], "N/A");
});

test("exports do not run user text as formulas", () => {
  const [o] = organiserExportRows([{ certificateId: "X", fullName: "=HYPERLINK(\"http://evil\")", email: "e@x.in", role: "@role", issueDate: "d" }], ORIGIN);
  assert.ok(o["Full Name"].startsWith("'="));
  assert.ok(o.Role.startsWith("'@"));
  const [p] = topPerformerExportRows([{ rank: 1, fullName: "+1", email: "e@x.in", course: "-c", rollNo: "=r", certificateId: null }], ORIGIN);
  assert.deepEqual([p["Full Name"], p["Course / Branch"], p["Roll Number"]], ["'+1", "'-c", "'=r"]);
});

test("export file names are safe and dated", () => {
  const d = new Date("2026-11-03T10:00:00Z");
  assert.equal(exportFileName("Build-Verse 2026", "Top_Performers", d), "Build-Verse_2026_Top_Performers_2026-11-03.csv");
  assert.equal(exportFileName("  ", "Appreciation", d), "AWS_SBG_Event_Appreciation_2026-11-03.csv");
  assert.equal(exportFileName("../a/b:c", "X", d), "___a_b_c_X_2026-11-03.csv");
});

test("volunteer rows carry the four details, the certificate id and a verification link, and are formula-safe", () => {
  const rows = volunteerExportRows(
    [
      { certificateId: "AWS-SBG-2026-DDDDDD", fullName: "Aarav Sharma", collegeId: "2201234", email: "a@x.in", course: "B.Tech", issueDate: "2026-11-03" },
      { certificateId: "AWS-SBG-2026-EEEEEE", fullName: "=cmd", collegeId: "2201235", email: "b@x.in", course: "@BCA", issueDate: "2026-11-03" },
    ],
    ORIGIN
  );
  assert.deepEqual(Object.keys(rows[0]), ["Name", "College ID", "Email Address", "Course", "Issue Date", "Certificate ID", "Verification Link"]);
  assert.equal(rows[0]["College ID"], "2201234");
  assert.equal(rows[0]["Verification Link"], "https://awstulas.org/verify/AWS-SBG-2026-DDDDDD");
  assert.equal(rows[1].Name, "'=cmd");
  assert.equal(rows[1].Course, "'@BCA");
});