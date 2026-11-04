import { test } from "node:test";
import assert from "node:assert/strict";
import { validateOrganiser, ORGANISER_ROLE_MAX } from "../../lib/certificates/organiser.ts";
import { organiserRecognitionLine, RECOGNITION_LINE } from "../../lib/certificates/text-layout.ts";

test("validateOrganiser accepts a good row and cleans the name", () => {
  const v = validateOrganiser({ fullName: "  piyush   rawat ", email: "P@Tulas.EDU.in ", role: " Technical Lead " });
  assert.equal(v.ok, true);
  if (v.ok) assert.deepEqual(v.value, { fullName: "Piyush Rawat", email: "p@tulas.edu.in", role: "Technical Lead" });
});

test("validateOrganiser rejects missing or bad fields", () => {
  assert.equal(validateOrganiser({ email: "a@b.in", role: "Lead" }).ok, false); // no name
  assert.equal(validateOrganiser({ fullName: "A", email: "a@b.in", role: "Lead" }).ok, false); // name too short
  assert.equal(validateOrganiser({ fullName: "Aa", email: "nope", role: "Lead" }).ok, false); // bad email
  assert.equal(validateOrganiser({ fullName: "Aa", email: "a@b.in" }).ok, false); // no role
  assert.equal(validateOrganiser({ fullName: "Aa", email: "a@b.in", role: "x".repeat(ORGANISER_ROLE_MAX + 1) }).ok, false);
  assert.equal(validateOrganiser(null).ok, false);
});

test("organiserRecognitionLine weaves in the role, or falls back", () => {
  assert.equal(organiserRecognitionLine("Technical Lead"), "as Technical Lead of the Organising Team of");
  assert.equal(organiserRecognitionLine("  Design  Lead  "), "as Design Lead of the Organising Team of");
  assert.equal(organiserRecognitionLine(""), RECOGNITION_LINE.organiser);
  assert.equal(organiserRecognitionLine(null), RECOGNITION_LINE.organiser);
  assert.equal(organiserRecognitionLine(undefined), RECOGNITION_LINE.organiser);
  // A very long role would overflow the panel, so fall back to the generic line.
  assert.equal(organiserRecognitionLine("Senior Vice President of Everything and Then Some More"), RECOGNITION_LINE.organiser);
});
