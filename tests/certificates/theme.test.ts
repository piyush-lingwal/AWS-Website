import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  CERTIFICATE_THEMES,
  CERTIFICATE_THEME_INFO,
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

test("templateFileName picks the pair for the theme", () => {
  assert.equal(templateFileName("orange", false), "Certificate-Template.svg");
  assert.equal(templateFileName("orange", true), "Certificate-of-Excellence-Template.svg");
  assert.equal(templateFileName("purple", false), "Certificate-Template-Purple.svg");
  assert.equal(templateFileName("purple", true), "Certificate-of-Excellence-Template-Purple.svg");
});

test("every theme has both template files on disk, using its own accent colour", () => {
  for (const theme of CERTIFICATE_THEMES) {
    const info = CERTIFICATE_THEME_INFO[theme];
    for (const file of [info.participationTemplate, info.excellenceTemplate]) {
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
