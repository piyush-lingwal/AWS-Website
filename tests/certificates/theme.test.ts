import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  CERTIFICATE_KINDS,
  CERTIFICATE_THEMES,
  CERTIFICATE_THEME_INFO,
  resolveCertificateKind,
  DEFAULT_CERTIFICATE_THEME,
  isCertificateTheme,
  parseCertificateTheme,
  templateFileName,
  validateCertificateTheme,
} from "../../lib/certificates/theme.ts";

test("orange stays the default theme", () => {
  assert.equal(DEFAULT_CERTIFICATE_THEME, "orange");
});

test("parseCertificateTheme falls back to the default for anything unknown", () => {
  assert.equal(parseCertificateTheme("purple"), "purple");
  assert.equal(parseCertificateTheme("orange"), "orange");
  for (const bad of ["Purple", "green", "", null, undefined, 7, {}, ["purple"]]) {
    assert.equal(parseCertificateTheme(bad), "orange", `value: ${JSON.stringify(bad)}`);
  }
});

test("isCertificateTheme is exact", () => {
  assert.equal(isCertificateTheme("purple"), true);
  assert.equal(isCertificateTheme("PURPLE"), false);
  assert.equal(isCertificateTheme(" purple"), false);
  assert.equal(isCertificateTheme(undefined), false);
});

test("validateCertificateTheme rejects what parse would silently accept", () => {
  assert.deepEqual(validateCertificateTheme("purple"), { ok: true, value: "purple" });
  const bad = validateCertificateTheme("green");
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.match(bad.error, /orange, purple/);
  assert.equal(validateCertificateTheme(undefined).ok, false);
});

test("templateFileName picks the template for the theme and kind", () => {
  assert.equal(templateFileName("orange", "participation"), "Certificate-Template.svg");
  assert.equal(templateFileName("orange", "excellence"), "Certificate-of-Excellence-Template.svg");
  assert.equal(templateFileName("orange", "organiser"), "Certificate-of-Appreciation-Template.svg");
  assert.equal(templateFileName("purple", "participation"), "Certificate-Template-Purple.svg");
  assert.equal(templateFileName("purple", "excellence"), "Certificate-of-Excellence-Template-Purple.svg");
  assert.equal(templateFileName("purple", "organiser"), "Certificate-of-Appreciation-Template-Purple.svg");
});

test("resolveCertificateKind: an award title always wins, otherwise organiser or participation", () => {
  assert.equal(resolveCertificateKind(true, "organiser"), "excellence");
  assert.equal(resolveCertificateKind(true), "excellence");
  assert.equal(resolveCertificateKind(false, "organiser"), "organiser");
  assert.equal(resolveCertificateKind(false), "participation");
  assert.equal(resolveCertificateKind(false, "participation"), "participation");
  // A caller cannot ask for an Excellence design without an award title.
  assert.equal(resolveCertificateKind(false, "excellence"), "participation");
});

test("every kind has a template for every theme, and no two share a file", () => {
  const files = CERTIFICATE_THEMES.flatMap((t) => CERTIFICATE_KINDS.map((k) => templateFileName(t, k)));
  assert.equal(new Set(files).size, CERTIFICATE_THEMES.length * CERTIFICATE_KINDS.length);
});

test("the Appreciation templates are titled for organisers and keep every placeholder", () => {
  const placeholders = ["PROUDLY_PRESENT", "PARTICIPANT_NAME", "ACHIEVEMENT_TEXT", "EVENT_DETAILS", "SIGNER_NAME", "SIGNER_TITLE", "QR_AND_META"];
  for (const theme of CERTIFICATE_THEMES) {
    const file = templateFileName(theme, "organiser");
    const svg = readFileSync(new URL(`../../public/templates/${file}`, import.meta.url), "utf8");
    assert.ok(svg.includes('id="certificate-of-appreciation-title"'), `${file} has no Appreciation title`);
    assert.ok(!svg.includes('id="certificate-of-participation-title"'), `${file} still has the Participation title`);
    for (const p of placeholders) assert.ok(svg.includes(`<!-- ${p}_PLACEHOLDER -->`), `${file} lost ${p}`);
  }
});

// The /verify page draws its own copy of the certificate (CertificatePreview) and the PDF is drawn
// by svg-generator. A hard-coded accent in either one shows the wrong colour for a purple event.
test("certificate renderers take their accent from the theme, never a hard-coded colour", () => {
  for (const file of ["components/certificates/CertificatePreview.tsx", "lib/certificates/svg-generator.ts"]) {
    const source = readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
    for (const theme of CERTIFICATE_THEMES) {
      const accent = CERTIFICATE_THEME_INFO[theme].accent;
      assert.ok(!source.toLowerCase().includes(accent.toLowerCase()), `${file} hard-codes ${accent}`);
    }
    assert.ok(/CERTIFICATE_THEME_INFO\[theme\]\.accent/.test(source), `${file} does not use the theme accent`);
    assert.ok(/templateFileName\(/.test(source) , `${file} does not pick its template via the theme`);
  }
});

test("every theme has both template files on disk, using its own accent colour", () => {
  for (const theme of CERTIFICATE_THEMES) {
    const info = CERTIFICATE_THEME_INFO[theme];
    for (const file of Object.values(info.templates)) {
      const path = new URL(`../../public/templates/${file}`, import.meta.url);
      assert.ok(existsSync(path), `${file} is missing`);
      const svg = readFileSync(path, "utf8").toLowerCase();
      assert.ok(svg.includes(info.accent.toLowerCase()), `${file} does not use ${info.accent}`);
      // A purple template must not still contain the orange brand colour (and vice versa).
      for (const other of CERTIFICATE_THEMES) {
        if (other === theme) continue;
        assert.ok(
          !svg.includes(CERTIFICATE_THEME_INFO[other].accent.toLowerCase()),
          `${file} still contains the ${other} accent ${CERTIFICATE_THEME_INFO[other].accent}`
        );
      }
    }
  }
});
