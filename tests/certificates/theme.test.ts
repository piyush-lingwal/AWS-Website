import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import sharp from "sharp";
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
  THEME_CONSTRAINT_HINT,
  isThemeConstraintError,
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
  assert.equal(templateFileName("kiro", "participation"), "Certificate-Template-Kiro-Sponsored.svg");
  assert.equal(templateFileName("kiro", "excellence"), "Certificate-of-Excellence-Template-Kiro-Sponsored.svg");
  assert.equal(templateFileName("kiro", "organiser"), "Certificate-of-Appreciation-Template-Kiro-Sponsored.svg");
  assert.equal(templateFileName("kiro-purple", "participation"), "Certificate-Template-Purple-Kiro-Sponsored.svg");
  assert.equal(templateFileName("kiro-purple", "excellence"), "Certificate-of-Excellence-Template-Purple-Kiro-Sponsored.svg");
  assert.equal(templateFileName("kiro-purple", "organiser"), "Certificate-of-Appreciation-Template-Purple-Kiro-Sponsored.svg");
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
      // Themes that deliberately share an accent (orange and Kiro Sponsored) are not compared.
      for (const other of CERTIFICATE_THEMES) {
        if (other === theme) continue;
        if (CERTIFICATE_THEME_INFO[other].accent.toLowerCase() === info.accent.toLowerCase()) continue;
        assert.ok(
          !svg.includes(CERTIFICATE_THEME_INFO[other].accent.toLowerCase()),
          `${file} still contains the ${other} accent ${CERTIFICATE_THEME_INFO[other].accent}`
        );
      }
    }
  }
});

// ── Kiro Sponsored ──────────────────────────────────────────────

// Each Kiro theme is its base theme plus one logo tile.
const KIRO_BASE = { kiro: "orange", "kiro-purple": "purple" } as const;
const KIRO_MASK_RECT = '<rect x="2806" y="851" width="329" height="339" fill="black"/>';
const KIRO_TILE = /<rect data-bleed-extend="filled-logo" data-pdf-target-x="2805" data-pdf-target-y="850" data-pdf-target-width="330" data-pdf-target-height="340" x="2806" y="851" width="329" height="339" fill="#161d26"\/><image id="kiro-sponsor-logo"[^>]*\/>\n {4}/;

// Line endings depend on the checkout (core.autocrlf), so compare with LF only.
function template(file: string): string {
  return readFileSync(new URL(`../../public/templates/${file}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");
}

function cell(svg: string, attrs: RegExp): { x: number; y: number; w: number; h: number } {
  const rect = svg.match(attrs)?.[0] ?? "";
  const num = (name: string) => Number(rect.match(new RegExp(`data-pdf-target-${name}="([\\d.]+)"`))?.[1]);
  return { x: num("x"), y: num("y"), w: num("width"), h: num("height") };
}

/** Counts strongly purple, opaque pixels in the embedded Kiro logo. */
async function purplePixels(svg: string): Promise<number> {
  const b64 = svg.match(/<image id="kiro-sponsor-logo"[^>]* href="data:image\/png;base64,([A-Za-z0-9+/=]+)"/)?.[1];
  assert.ok(b64, "no embedded Kiro logo PNG");
  const { data, info } = await sharp(Buffer.from(b64, "base64")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let count = 0;
  for (let i = 0; i < info.width * info.height * 4; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a > 200 && b > 180 && g < 90 && r < 170 && b - g > 120) count += 1;
  }
  return count;
}

test("each Kiro theme keeps its base theme's accent and has its own label", () => {
  for (const [kiro, base] of Object.entries(KIRO_BASE) as [keyof typeof KIRO_BASE, "orange" | "purple"][]) {
    assert.equal(CERTIFICATE_THEME_INFO[kiro].accent, CERTIFICATE_THEME_INFO[base].accent);
    assert.equal(CERTIFICATE_THEME_INFO[kiro].kiroLogo, true);
    assert.equal(isCertificateTheme(kiro), true);
    assert.deepEqual(validateCertificateTheme(kiro), { ok: true, value: kiro });
  }
  assert.equal(CERTIFICATE_THEME_INFO.kiro.label, "Kiro Sponsored (Orange)");
  assert.equal(CERTIFICATE_THEME_INFO["kiro-purple"].label, "Kiro Sponsored (Purple)");
  assert.equal(parseCertificateTheme("Kiro"), "orange");
  assert.equal(parseCertificateTheme("kiro_purple"), "orange");
});

test("each Kiro template is its base template plus the Kiro logo tile, nothing else changed", () => {
  for (const [kiro, base] of Object.entries(KIRO_BASE) as [keyof typeof KIRO_BASE, "orange" | "purple"][]) {
    for (const kind of CERTIFICATE_KINDS) {
      const plain = template(templateFileName(base, kind));
      const withLogo = template(templateFileName(kiro, kind));
      assert.ok(KIRO_TILE.test(withLogo), `${kiro}/${kind}: the Kiro tile is missing or moved`);
      assert.ok(withLogo.includes(KIRO_MASK_RECT), `${kiro}/${kind}: grid mask does not cover the Kiro tile`);
      const stripped = withLogo.replace(KIRO_MASK_RECT, "").replace(KIRO_TILE, "");
      assert.equal(stripped, plain, `${kiro}/${kind}: differs from the ${base} template beyond the Kiro tile`);
      assert.ok(!plain.includes("kiro-sponsor-logo"), `${base}/${kind} has the Kiro logo`);
    }
  }
});

test("the Kiro tile starts on the row below the SBG tile, where the SBG tile ends, on the logo navy", () => {
  for (const kiro of Object.keys(KIRO_BASE) as (keyof typeof KIRO_BASE)[]) {
    for (const kind of CERTIFICATE_KINDS) {
      const svg = template(templateFileName(kiro, kind));
      const sbg = cell(svg, /<rect data-bleed-extend="icon-layer" data-pdf-target-x="2475" data-pdf-target-y="510"[^>]*\/>/);
      const tile = cell(svg, /<rect data-bleed-extend="filled-logo"[^>]*x="2806" y="851"[^>]*\/>/);
      assert.deepEqual({ x: tile.x, y: tile.y }, { x: sbg.x + sbg.w, y: sbg.y + sbg.h }, `${kiro}/${kind}: tile is not at the SBG tile's bottom-right corner`);
      assert.deepEqual({ w: tile.w, h: tile.h }, { w: sbg.w, h: sbg.h }, `${kiro}/${kind}: tile is not the SBG tile's size`);
      assert.ok(tile.y + tile.h <= 1190, `${kiro}/${kind}: tile runs into the text panel`);
      // The AWS tile is still where it was.
      assert.ok(svg.includes('data-pdf-target-x="2805" data-pdf-target-y="170"'), `${kiro}/${kind}: AWS tile moved`);
    }
  }
});

test("every Kiro template, orange and purple, uses the same white Kiro logo", async () => {
  const logoOf = (svg: string) => svg.match(/<image id="kiro-sponsor-logo"[^>]* href="([^"]+)"/)?.[1];
  const white = logoOf(template(templateFileName("kiro", "participation")));
  assert.ok(white, "no Kiro logo in the orange participation template");
  assert.equal(await purplePixels(template(templateFileName("kiro", "participation"))), 0, "the orange Kiro logo is not the white one");
  for (const kiro of Object.keys(KIRO_BASE) as (keyof typeof KIRO_BASE)[]) {
    for (const kind of CERTIFICATE_KINDS) {
      assert.equal(logoOf(template(templateFileName(kiro, kind))), white, `${kiro}/${kind}: not the white Kiro logo`);
    }
  }
});

test("the theme constraint helper recognises only that check violation", () => {
  assert.equal(isThemeConstraintError({ code: "23514", message: 'new row for relation "events" violates check constraint "events_certificate_theme_check"' }), true);
  assert.equal(isThemeConstraintError({ code: "23514", message: 'violates check constraint "some_other_check"' }), false);
  assert.equal(isThemeConstraintError({ code: "42703", message: "events_certificate_theme_check" }), false);
  assert.equal(isThemeConstraintError(null), false);
  assert.match(THEME_CONSTRAINT_HINT, /20261107000001_kiro_sponsored_theme\.sql/);
});
