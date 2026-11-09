import { test } from "node:test";
import assert from "node:assert/strict";
import { certificateTypeDetail, certificateTypeLabel, extractCertificateId } from "../../lib/certificates/verify-view.ts";

test("every kind has its own title on the verify page", () => {
  assert.equal(certificateTypeLabel(null), "Certificate of Participation");
  assert.equal(certificateTypeLabel(undefined, null), "Certificate of Participation");
  assert.equal(certificateTypeLabel("organiser"), "Certificate of Appreciation");
  assert.equal(certificateTypeLabel("volunteer"), "Certificate of Volunteering");
  // An award always wins, as in the PDF.
  assert.equal(certificateTypeLabel("volunteer", "1st Position"), "Certificate of Excellence");
});

test("the type detail is the award, the role or wing, or empty", () => {
  assert.equal(certificateTypeDetail({ kind: null, awardTitle: "1st Position" }), "1st Position");
  assert.equal(certificateTypeDetail({ kind: "organiser", role: "Technical Co-Lead", wing: "Tech" }), "Technical Co-Lead");
  assert.equal(certificateTypeDetail({ kind: "organiser", wing: "Media" }), "Media Wing");
  assert.equal(certificateTypeDetail({ kind: "organiser" }), "Organising Team");
  assert.equal(certificateTypeDetail({ kind: "volunteer" }), "Event Volunteer");
  assert.equal(certificateTypeDetail({ kind: null }), "");
});

test("extractCertificateId finds the ID in typed or pasted text", () => {
  assert.equal(extractCertificateId("AWS-SBG-2026-GKTZ4W"), "AWS-SBG-2026-GKTZ4W");
  assert.equal(extractCertificateId("  aws-sbg-2026-gktz4w  "), "AWS-SBG-2026-GKTZ4W");
  assert.equal(extractCertificateId("AWS-SBG-2026-GKT Z4W"), "AWS-SBG-2026-GKTZ4W");
  assert.equal(extractCertificateId("https://awstulas.org/verify/AWS-SBG-2026-GKTZ4W"), "AWS-SBG-2026-GKTZ4W");
  assert.equal(extractCertificateId("Verify Certificate: https://awstulas.org/verify/aws-sbg-2026-gktz4w?x=1"), "AWS-SBG-2026-GKTZ4W");
});

test("extractCertificateId rejects anything that is not a certificate ID", () => {
  for (const bad of ["", "   ", "hello", "AWS-SBG-26-GKTZ4W", "AWS-SBG-2026-GKTZ4", "AWS-SBG-2026-GKTZ01"]) {
    assert.equal(extractCertificateId(bad), null, JSON.stringify(bad));
  }
});
