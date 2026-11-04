import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CERT_TEXT, MONO_ADVANCE_EM, RECOGNITION_LINE, fitMonoSize } from "../../lib/certificates/text-layout.ts";

test("fitMonoSize keeps the base size when the line fits and shrinks it when it does not", () => {
  const spec = { size: 40, maxWidth: 600 };
  assert.equal(fitMonoSize(25, spec), 40); // 25 * 0.6 * 40 = 600, exactly fits
  assert.equal(fitMonoSize(10, spec), 40);
  const shrunk = fitMonoSize(50, spec);
  assert.ok(shrunk < 40);
  assert.ok(50 * MONO_ADVANCE_EM * shrunk <= 600, "shrunk line must fit");
  assert.ok(50 * MONO_ADVANCE_EM * (shrunk + 1) > 600, "and be the largest size that does");
});

test("fitMonoSize never returns less than 1, even for absurd input", () => {
  assert.equal(fitMonoSize(100000, { size: 40, maxWidth: 10 }), 1);
  assert.equal(fitMonoSize(0, { size: 40, maxWidth: 600 }), 40);
});

test("the fixed wording on every certificate fits at its full size", () => {
  const fixed: [string, string, { size: number; maxWidth: number }][] = [
    ["presented to", "This certificate is proudly presented to", CERT_TEXT.presentedTo],
    ["recognition", RECOGNITION_LINE.participation, CERT_TEXT.recognition],
    ["organiser recognition", RECOGNITION_LINE.organiser, CERT_TEXT.recognition],
    ["conducted by", "conducted by AWS Student Builder Group at Tulas University", CERT_TEXT.conductedBy],
    ["award conducted by", "conducted by AWS Student Builder Group at Tulas University", CERT_TEXT.award.conductedBy],
    ["securing", "for securing", CERT_TEXT.award.securing],
    ["context", "Position in", CERT_TEXT.award.context],
    ["signer title", "Community Program Manager", CERT_TEXT.signer],
    ["signer org", "AWS Student Builder Group", CERT_TEXT.signer],
  ];
  for (const [label, text, spec] of fixed) {
    assert.equal(fitMonoSize(text.length, spec), spec.size, `${label} would be shrunk below ${spec.size}`);
  }
});

test("a long date and the standard wording stay inside the 1320-wide text panel", () => {
  const widestDate = "on 30 September 2026";
  assert.equal(fitMonoSize(widestDate.length, CERT_TEXT.date), CERT_TEXT.date.size);
  const specs = [
    CERT_TEXT.presentedTo, CERT_TEXT.name, CERT_TEXT.recognition, CERT_TEXT.eventName,
    CERT_TEXT.conductedBy, CERT_TEXT.date, CERT_TEXT.award.securing, CERT_TEXT.award.rank,
    CERT_TEXT.award.context, CERT_TEXT.award.eventName, CERT_TEXT.award.conductedBy,
  ];
  for (const spec of specs) assert.ok(spec.maxWidth <= 1240, `maxWidth ${spec.maxWidth} leaves too little margin`);
});

test("sizes only ever grew from the original design, and the name stays the largest line", () => {
  assert.ok(CERT_TEXT.presentedTo.size > 34);
  assert.ok(CERT_TEXT.conductedBy.size > 28);
  assert.ok(CERT_TEXT.date.size > 32);
  assert.ok(CERT_TEXT.signer.size > 28);
  assert.ok(CERT_TEXT.certId.size > 26 && CERT_TEXT.verifyUrl.size > 24);
  assert.ok(CERT_TEXT.name.size > CERT_TEXT.eventName.size);
  assert.ok(CERT_TEXT.award.rank.size > CERT_TEXT.award.eventName.size);
});

// The PDF and the /verify preview must not drift apart again: neither may keep its own
// hard-coded copy of a size that lives in text-layout.ts.
test("both renderers read their sizes from text-layout.ts", () => {
  for (const file of ["components/certificates/CertificatePreview.tsx", "lib/certificates/svg-generator.ts"]) {
    const source = readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
    assert.ok(/from "(@\/lib\/certificates|\.)\/text-layout"/.test(source), `${file} does not import text-layout`);
    assert.ok(/CERT_TEXT\./.test(source), `${file} does not use CERT_TEXT`);
  }
  const preview = readFileSync(new URL("../../components/certificates/CertificatePreview.tsx", import.meta.url), "utf8");
  // The old preview-only size literals (26/24 meta, 34 lines, 28 details) must be gone.
  assert.ok(!/font-size="(34|32|28)"/.test(preview), "CertificatePreview still hard-codes a font-size");
});
