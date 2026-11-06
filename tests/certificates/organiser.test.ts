import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ORGANISER_ROLE_MAX,
  ORGANISER_WINGS,
  WING_MIGRATION_HINT,
  parseWing,
  validateOrganiser,
} from "../../lib/certificates/organiser.ts";
import {
  ORGANISER_COPY,
  organiserDateText,
  organiserEventLine,
  organiserLines,
} from "../../lib/certificates/text-layout.ts";

test("the wings are exactly Media, Event, PR and Tech", () => {
  assert.deepEqual([...ORGANISER_WINGS], ["Media", "Event", "PR", "Tech"]);
});

test("parseWing maps each wing and common spellings, ignoring case and a trailing 'wing'", () => {
  assert.equal(parseWing("Media"), "Media");
  assert.equal(parseWing("  media  "), "Media");
  assert.equal(parseWing("EVENT"), "Event");
  assert.equal(parseWing("events"), "Event");
  assert.equal(parseWing("pr"), "PR");
  assert.equal(parseWing("Public Relations"), "PR");
  assert.equal(parseWing("tech"), "Tech");
  assert.equal(parseWing("Technical"), "Tech");
  assert.equal(parseWing("Technology"), "Tech");
  assert.equal(parseWing("Media Wing"), "Media");
  assert.equal(parseWing("tech   wing"), "Tech");
});

test("parseWing returns null for anything else", () => {
  assert.equal(parseWing(""), null);
  assert.equal(parseWing("   "), null);
  assert.equal(parseWing("Design"), null);
  assert.equal(parseWing("Media Tech"), null);
  assert.equal(parseWing(undefined), null);
  assert.equal(parseWing(null), null);
  assert.equal(parseWing(7), null);
});

test("validateOrganiser accepts a row with a role and cleans the name", () => {
  const v = validateOrganiser({ fullName: "  piyush   rawat ", email: "P@Tulas.EDU.in ", role: " Technical   Co-Lead " });
  assert.equal(v.ok, true);
  if (v.ok) assert.deepEqual(v.value, { fullName: "Piyush Rawat", email: "p@tulas.edu.in", role: "Technical Co-Lead", wing: null });
});

test("validateOrganiser accepts a wing with no role, and normalises the wing", () => {
  const v = validateOrganiser({ fullName: "Vivek Dharmwan", email: "v@x.in", wing: "media wing" });
  assert.equal(v.ok, true);
  if (v.ok) assert.deepEqual(v.value, { fullName: "Vivek Dharmwan", email: "v@x.in", role: "", wing: "Media" });
});

test("validateOrganiser keeps the wing when a role is given too", () => {
  const v = validateOrganiser({ fullName: "Vivek Dharmwan", email: "v@x.in", role: "Lead", wing: "Tech" });
  assert.equal(v.ok, true);
  if (v.ok) assert.deepEqual(v.value, { fullName: "Vivek Dharmwan", email: "v@x.in", role: "Lead", wing: "Tech" });
});

test("validateOrganiser needs a role or a wing", () => {
  const none = validateOrganiser({ fullName: "Aa", email: "a@b.in" });
  assert.equal(none.ok, false);
  if (!none.ok) assert.match(none.error, /wing/i);
  assert.equal(validateOrganiser({ fullName: "Aa", email: "a@b.in", role: "  ", wing: "" }).ok, false);
});

test("validateOrganiser rejects a wing that is filled in but not one of the four, even with a role", () => {
  const bad = validateOrganiser({ fullName: "Aa", email: "a@b.in", wing: "Design" });
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.match(bad.error, /Media, Event, PR, Tech/);
  assert.equal(validateOrganiser({ fullName: "Aa", email: "a@b.in", role: "Lead", wing: "Design" }).ok, false);
});

test("validateOrganiser rejects missing or bad fields", () => {
  assert.equal(validateOrganiser({ email: "a@b.in", role: "Lead" }).ok, false); // no name
  assert.equal(validateOrganiser({ fullName: "A", email: "a@b.in", role: "Lead" }).ok, false); // name too short
  assert.equal(validateOrganiser({ fullName: "Aa", email: "nope", role: "Lead" }).ok, false); // bad email
  assert.equal(validateOrganiser({ fullName: "Aa", role: "Lead" }).ok, false); // no email
  assert.equal(validateOrganiser({ fullName: "Aa", email: "a@b.in", role: "x".repeat(ORGANISER_ROLE_MAX + 1) }).ok, false);
  assert.equal(validateOrganiser({ fullName: "Aa", email: "a@b.in", role: "x".repeat(ORGANISER_ROLE_MAX) }).ok, true);
  assert.equal(validateOrganiser(null).ok, false);
});

test("the wing migration hint names the migration file", () => {
  assert.match(WING_MIGRATION_HINT, /20261106000001_organiser_wing\.sql/);
});

test("organiserLines with a role: UPPERCASE role line, then 'of the Organising Team for'", () => {
  assert.deepEqual(organiserLines("Technical Co-Lead", null), {
    roleLine: "TECHNICAL CO-LEAD",
    teamLine: "of the Organising Team for",
  });
  assert.deepEqual(organiserLines("  Design   Lead  ", "Media"), {
    roleLine: "DESIGN LEAD",
    teamLine: "of the Organising Team for",
  });
});

test("organiserLines without a role: '<Wing> member of the Organising Team for'", () => {
  assert.deepEqual(organiserLines("", "Media"), { roleLine: null, teamLine: "Media member of the Organising Team for" });
  assert.deepEqual(organiserLines(undefined, "PR"), { roleLine: null, teamLine: "PR member of the Organising Team for" });
  assert.deepEqual(organiserLines("   ", " Tech "), { roleLine: null, teamLine: "Tech member of the Organising Team for" });
  assert.deepEqual(organiserLines(null, "Event"), { roleLine: null, teamLine: "Event member of the Organising Team for" });
});

test("organiserLines with neither role nor wing falls back to 'a member'", () => {
  assert.deepEqual(organiserLines("", ""), { roleLine: null, teamLine: "a member of the Organising Team for" });
  assert.deepEqual(organiserLines(), { roleLine: null, teamLine: "a member of the Organising Team for" });
});

test("organiserEventLine upper-cases and trims the event name", () => {
  assert.equal(organiserEventLine(" Build-Verse 2026 "), "BUILD-VERSE 2026");
});

test("organiserDateText uses an en dash for ranges and leaves a single day alone", () => {
  assert.equal(organiserDateText("29-30 October 2026"), "29\u201330 October 2026");
  assert.equal(organiserDateText("29 October 2026"), "29 October 2026");
  assert.equal(organiserDateText("29 Oct - 05 Nov 2026"), "29 Oct \u2013 05 Nov 2026");
  assert.equal(organiserDateText("  30 September 2026 "), "30 September 2026");
});

test("the fixed organiser wording matches the approved certificate text", () => {
  assert.equal(ORGANISER_COPY.presentedTo, "This certificate is proudly presented to");
  assert.equal(ORGANISER_COPY.recognition, "In recognition of your valuable contribution as");
  assert.equal(ORGANISER_COPY.teamAfterRole, "of the Organising Team for");
  assert.equal(ORGANISER_COPY.organisedBy, "Organised by AWS Student Builder Group at Tulas University");
});
