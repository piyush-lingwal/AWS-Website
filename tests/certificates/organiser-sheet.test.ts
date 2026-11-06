import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ORGANISER_TEMPLATE_HEADERS,
  ORGANISER_TEMPLATE_NOTES,
  organiserRowsFromMatrix,
  organiserRowsFromText,
} from "../../lib/certificates/organiser-sheet.ts";
import { ORGANISER_WINGS } from "../../lib/certificates/organiser.ts";

test("the template has the columns Name, Email, Role and Wing, in that order", () => {
  assert.deepEqual([...ORGANISER_TEMPLATE_HEADERS], ["Name", "Email", "Role", "Wing"]);
});

test("the template notes explain the Wing column and list every wing", () => {
  const wingRow = ORGANISER_TEMPLATE_NOTES.find((r) => r[0] === "Wing");
  assert.ok(wingRow, "no Wing row in the notes");
  for (const wing of ORGANISER_WINGS) assert.ok(wingRow.join(" ").includes(wing), `notes do not mention ${wing}`);
});

test("a sheet with a header is matched by column name, in any order", () => {
  const rows = organiserRowsFromMatrix([
    ["Wing", "Email", "Name", "Role"],
    ["Tech", "v@x.in", "Vivek Dharmwan", "Technical Co-Lead"],
    ["Media", "a@x.in", "Aarav Sharma", ""],
  ]);
  assert.deepEqual(rows, [
    { fullName: "Vivek Dharmwan", email: "v@x.in", role: "Technical Co-Lead", wing: "Tech" },
    { fullName: "Aarav Sharma", email: "a@x.in", role: "", wing: "Media" },
  ]);
});

test("header aliases: Position / Designation for role, Team / Department for wing", () => {
  const rows = organiserRowsFromMatrix([
    ["Full Name", "E-mail", "Designation", "Team"],
    ["Aarav Sharma", "a@x.in", "Lead", "PR"],
  ]);
  assert.deepEqual(rows, [{ fullName: "Aarav Sharma", email: "a@x.in", role: "Lead", wing: "PR" }]);
});

test("an old Name, Email, Role sheet (no Wing column) still reads, with an empty wing", () => {
  const rows = organiserRowsFromMatrix([
    ["Name", "Email", "Role"],
    ["Aarav Sharma", "a@x.in", "Lead"],
  ]);
  assert.deepEqual(rows, [{ fullName: "Aarav Sharma", email: "a@x.in", role: "Lead", wing: "" }]);
});

test("without a header the order is Name, Email, Role, Wing", () => {
  const rows = organiserRowsFromMatrix([
    ["Aarav Sharma", "a@x.in", "", "Media"],
    ["Vivek Dharmwan", "v@x.in", "Technical Co-Lead", "Tech"],
  ]);
  assert.deepEqual(rows, [
    { fullName: "Aarav Sharma", email: "a@x.in", role: "", wing: "Media" },
    { fullName: "Vivek Dharmwan", email: "v@x.in", role: "Technical Co-Lead", wing: "Tech" },
  ]);
});

test("cells are trimmed and non-text cells become text", () => {
  const rows = organiserRowsFromMatrix([["  Aarav  ", " a@x.in ", 12, null]]);
  assert.deepEqual(rows, [{ fullName: "Aarav", email: "a@x.in", role: "12", wing: "" }]);
});

test("pasted text: tab or comma separated, empty role kept, header skipped, CRLF tolerated", () => {
  const tabbed = organiserRowsFromText("Name\tEmail\tRole\tWing\r\nAarav Sharma\ta@x.in\t\tMedia\r\n\r\nVivek\tv@x.in\tLead\tTech\r\n");
  assert.deepEqual(tabbed, [
    { fullName: "Aarav Sharma", email: "a@x.in", role: "", wing: "Media" },
    { fullName: "Vivek", email: "v@x.in", role: "Lead", wing: "Tech" },
  ]);
  const commas = organiserRowsFromText("Aarav Sharma,a@x.in,,PR");
  assert.deepEqual(commas, [{ fullName: "Aarav Sharma", email: "a@x.in", role: "", wing: "PR" }]);
});

test("pasted text with no rows gives no rows", () => {
  assert.deepEqual(organiserRowsFromText(""), []);
  assert.deepEqual(organiserRowsFromText("  \n \r\n"), []);
});
