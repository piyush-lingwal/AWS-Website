import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  VOLUNTEER_MIGRATION_HINT,
  VOLUNTEER_TEMPLATE_HEADERS,
  VOLUNTEER_TEMPLATE_NOTES,
  validateVolunteer,
  volunteerRowsFromMatrix,
  volunteerRowsFromText,
} from "../../lib/certificates/volunteer.ts";

const GOOD = { fullName: "Aarav Sharma", collegeId: "2201234", email: "a@x.in", course: "B.Tech" };

test("validateVolunteer accepts the four details and cleans them", () => {
  const v = validateVolunteer({ fullName: "  aarav   sharma ", collegeId: " 22 01234 ", email: " Aarav@Tulas.EDU.in ", course: "btech" });
  assert.equal(v.ok, true);
  if (v.ok) assert.deepEqual(v.value, { fullName: "Aarav Sharma", collegeId: "2201234", email: "aarav@tulas.edu.in", course: "B.Tech" });
});

test("validateVolunteer needs all four: name, college id, email and course", () => {
  assert.equal(validateVolunteer(GOOD).ok, true);
  assert.equal(validateVolunteer({ ...GOOD, fullName: "" }).ok, false);
  assert.equal(validateVolunteer({ ...GOOD, fullName: "A" }).ok, false);
  assert.equal(validateVolunteer({ ...GOOD, fullName: "x".repeat(101) }).ok, false);
  assert.equal(validateVolunteer({ ...GOOD, email: "nope" }).ok, false);
  assert.equal(validateVolunteer({ ...GOOD, email: "" }).ok, false);
  const noId = validateVolunteer({ ...GOOD, collegeId: "" });
  assert.equal(noId.ok, false);
  if (!noId.ok) assert.match(noId.error, /College ID is required/);
  const letters = validateVolunteer({ ...GOOD, collegeId: "22A01" });
  assert.equal(letters.ok, false);
  if (!letters.ok) assert.match(letters.error, /only numbers/);
  const noCourse = validateVolunteer({ ...GOOD, course: "  " });
  assert.equal(noCourse.ok, false);
  if (!noCourse.ok) assert.match(noCourse.error, /Course is required/);
  assert.equal(validateVolunteer(null).ok, false);
});

test("a course outside the portal's list is kept as typed", () => {
  const v = validateVolunteer({ ...GOOD, course: "M.Sc Physics" });
  assert.equal(v.ok && v.value.course, "M.Sc Physics");
});

test("the template columns are Name, College ID, Email Address, Course, in that order", () => {
  assert.deepEqual([...VOLUNTEER_TEMPLATE_HEADERS], ["Name", "College ID", "Email Address", "Course"]);
  for (const column of VOLUNTEER_TEMPLATE_HEADERS) {
    assert.ok(VOLUNTEER_TEMPLATE_NOTES.some((r) => r[0] === column), `notes do not explain ${column}`);
  }
  assert.match(VOLUNTEER_MIGRATION_HINT, /20261108000001_volunteer_kind\.sql/);
});

test("a sheet made from the template reads back with every column", () => {
  const rows = volunteerRowsFromMatrix([
    [...VOLUNTEER_TEMPLATE_HEADERS],
    ["Aarav Sharma", 2201234, "aarav@example.com", "B.Tech"],
  ]);
  assert.deepEqual(rows, [{ fullName: "Aarav Sharma", collegeId: "2201234", email: "aarav@example.com", course: "B.Tech" }]);
});

test("sheets are matched by header in any order, with the usual aliases", () => {
  assert.deepEqual(
    volunteerRowsFromMatrix([["Course", "E-mail", "Roll No", "Full Name"], ["BCA", "a@x.in", "11", "Aarav"]]),
    [{ fullName: "Aarav", collegeId: "11", email: "a@x.in", course: "BCA" }]
  );
  // A title row above the header is skipped.
  assert.deepEqual(
    volunteerRowsFromMatrix([["Build-Verse volunteers"], ["Name", "College ID", "Email Address", "Course"], ["Aarav", "11", "a@x.in", "BCA"]]),
    [{ fullName: "Aarav", collegeId: "11", email: "a@x.in", course: "BCA" }]
  );
});

test("a missing column shows up as an empty cell, so validation names it", () => {
  const [row] = volunteerRowsFromMatrix([["Name", "Email Address"], ["Aarav", "a@x.in"]]);
  assert.deepEqual(row, { fullName: "Aarav", collegeId: "", email: "a@x.in", course: "" });
  assert.equal(validateVolunteer(row).ok, false);
});

test("without a header the order is Name, College ID, Email Address, Course", () => {
  assert.deepEqual(volunteerRowsFromMatrix([["Aarav", "11", "a@x.in", "BCA"]]), [
    { fullName: "Aarav", collegeId: "11", email: "a@x.in", course: "BCA" },
  ]);
});

test("big college ids from a spreadsheet keep every digit", () => {
  const [row] = volunteerRowsFromMatrix([["Name", "College ID", "Email Address", "Course"], ["A", 202100123456, "a@x.in", "BCA"]]);
  assert.equal(row.collegeId, "202100123456");
});

test("pasted rows: tab or comma separated, header skipped, blank lines and CRLF tolerated", () => {
  assert.deepEqual(
    volunteerRowsFromText("Name\tCollege ID\tEmail Address\tCourse\r\nAarav\t11\ta@x.in\tBCA\r\n\r\nBhavya,22,b@x.in,B.Tech\r\n"),
    [
      { fullName: "Aarav", collegeId: "11", email: "a@x.in", course: "BCA" },
      { fullName: "Bhavya", collegeId: "22", email: "b@x.in", course: "B.Tech" },
    ]
  );
  assert.deepEqual(volunteerRowsFromText(""), []);
});

// The route is the only way volunteers are read or written; every query is scoped to one event and the volunteer kind.
test("the volunteers API is admin only, scoped to one event and the volunteer kind, and saves the details", () => {
  const route = readFileSync(new URL("../../app/api/admin/events/[id]/volunteers/route.ts", import.meta.url), "utf8");
  assert.equal((route.match(/const auth = await requireAdmin\(\);\s*if \(!auth\.ok\) return auth\.response;/g) ?? []).length, 3);
  assert.equal((route.match(/\.eq\("certificate_kind", "volunteer"\)/g) ?? []).length, 3); // existing check, list, delete
  assert.match(route, /certificate_kind: "volunteer"/);
  assert.match(route, /\.eq\("event_id", id\.toLowerCase\(\)\)/);
  assert.match(route, /attendance_id: null/);
  assert.match(route, /findOrCreateParticipant\(db, fullName, email, \{ course, rollNo: collegeId \}\)/);
});
