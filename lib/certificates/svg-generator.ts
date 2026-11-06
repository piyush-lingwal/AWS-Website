// ============================================================
// SVG Certificate Template Generator (Vector IBM Plex Mono)
// ============================================================
//
// Converts all certificate text into pure vector SVG <path> elements
// using the local IBM Plex Mono TTF font files.
//
// WHY VECTOR PATHS:
// - Eliminates system font dependency completely (no Times New Roman fallback)
// - 100% identical in browser, PDF, mobile, print, and librsvg/sharp
// - Perfectly sharp vector rendering at any scale or DPI
//
// ============================================================

import fs from "fs/promises";
import path from "path";
import { parse, type Font } from "opentype.js";
import {
  getAwardTitle,
  getCertificateAwardLayout,
} from "./award-title";
import {
  CERTIFICATE_THEME_INFO,
  DEFAULT_CERTIFICATE_THEME,
  resolveCertificateKind,
  templateFileName,
  type CertificateKind,
  type CertificateTheme,
} from "./theme";
import {
  CERT_TEXT,
  ORGANISER_COPY,
  ORGANISER_TEXT,
  ORGANISER_Y,
  RECOGNITION_LINE,
  organiserDateText,
  organiserEventLine,
  organiserLines,
} from "./text-layout";

export interface SvgCertificateInput {
  participantName: string;
  eventTitle: string;
  eventDate: string;
  awardTitle?: string;
  /** Colour theme (template pair + accent). Defaults to orange. */
  theme?: CertificateTheme;
  /**
   * "organiser" draws the Certificate of Appreciation for organising team members.
   * Ignored when awardTitle is set (that is always a Certificate of Excellence).
   */
  kind?: CertificateKind;
  /** Organiser's specific role (e.g. "Technical Co-Lead"). When set it is printed as the role. */
  role?: string | null;
  /** Organiser's wing (Media, Event, PR or Tech). Used when there is no role. */
  wing?: string | null;
  verificationUrl?: string;
  signerName?: string;
  signerTitle?: string;
  certificateId: string;
  qrDataUri?: string;
  signatureDataUri?: string;
}

/**
 * SVG canvas dimensions (from the Certificate-Template.svg viewBox).
 * Used for coordinate mapping between SVG space and PDF page space.
 */
export const SVG_CANVAS = { width: 3300, height: 2550 } as const;

/**
 * The raw SVG-space position of the Certificate ID text line.
 * x=220 (left-aligned), y=2285 (baseline).
 */
export const CERT_ID_SVG_POSITION = { x: 220, y: 2285 } as const;
export const CERT_ID_FONT_SIZE: number = CERT_TEXT.certId.size;

/**
 * The raw SVG-space position of the verification URL text line.
 * x=220 (left-aligned, same as certId block), y=2330 (baseline).
 */
export const VERIFY_URL_SVG_POSITION = { x: 220, y: 2330 } as const;
export const VERIFY_URL_FONT_SIZE: number = CERT_TEXT.verifyUrl.size;
export const CERTIFICATE_META_MAX_WIDTH: number = CERT_TEXT.certId.maxWidth;

/** Returns the Certificate ID text as it appears on the certificate. */
export function buildCertIdText(certificateId: string): string {
  return `Certificate ID: ${certificateId}`;
}

/** Returns the full verification URL text as it appears on the certificate. */
export function buildVerifyUrlText(
  certificateId: string,
  verificationUrl?: string
): string {
  return `Verify Certificate: ${
    verificationUrl || `https://awstulas.org/verify/${certificateId}`
  }`;
}

let cachedBoldFont: Font | null = null;
let cachedRegFont: Font | null = null;
let cachedSignatureDataUri: string | null = null;

/**
 * Loads the selected SVG template from disk for each generation.
 * An award title selects the Certificate of Excellence design, `kind`
 * "organiser" the Certificate of Appreciation, and `theme` the colour variant.
 */
export async function getBaseSvgTemplate(
  awardTitle?: string,
  theme: CertificateTheme = DEFAULT_CERTIFICATE_THEME,
  kind?: CertificateKind
): Promise<string> {
  const templateName = templateFileName(
    theme,
    resolveCertificateKind(Boolean(getAwardTitle(awardTitle)), kind)
  );
  const templatePath = path.join(
    process.cwd(),
    "public",
    "templates",
    templateName
  );

  try {
    return await fs.readFile(templatePath, "utf8");
  } catch (err) {
    console.error(`[SvgGenerator] Failed to read ${templateName}:`, err);
    throw new Error(`SVG template not found at ${templatePath}`);
  }
}

/**
 * Loads and caches local IBM Plex Mono fonts for vector path generation.
 */
async function getFonts(): Promise<{ boldFont: Font; regFont: Font }> {
  if (cachedBoldFont && cachedRegFont) {
    return { boldFont: cachedBoldFont, regFont: cachedRegFont };
  }

  const boldPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "IBM_Plex_Mono",
    "IBMPlexMono-Bold.ttf"
  );
  const regPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "IBM_Plex_Mono",
    "IBMPlexMono-Regular.ttf"
  );

  const [boldBuf, regBuf] = await Promise.all([
    fs.readFile(boldPath),
    fs.readFile(regPath),
  ]);

  cachedBoldFont = parse(
    boldBuf.buffer.slice(boldBuf.byteOffset, boldBuf.byteOffset + boldBuf.byteLength)
  );
  cachedRegFont = parse(
    regBuf.buffer.slice(regBuf.byteOffset, regBuf.byteOffset + regBuf.byteLength)
  );

  return { boldFont: cachedBoldFont, regFont: cachedRegFont };
}

/**
 * Loads and returns the signature image as a base64 data URI.
 */
async function getSignatureDataUri(): Promise<string | null> {
  if (cachedSignatureDataUri) return cachedSignatureDataUri;

  const sigPath = path.join(process.cwd(), "public", "Lingwal_Sign.png");
  try {
    const buf = await fs.readFile(sigPath);
    cachedSignatureDataUri = `data:image/png;base64,${buf.toString("base64")}`;
    return cachedSignatureDataUri;
  } catch {
    console.warn("[SvgGenerator] Signature image not found, skipping.");
    return null;
  }
}

/**
 * Serializes an opentype.js Path into a valid, bulletproof SVG path data string.
 *
 * CRITICAL FIX:
 * opentype.js built-in `path.toPathData()` has a known bug in `roundDecimal` where
 * numbers in exponential notation (e.g. 2.84e-14) produce "2.84e-14e+2", which
 * evaluates to NaN (e.g. "QNaN 85.69"). SVG rasterizers (sharp, librsvg, browsers)
 * immediately abort rendering the path at NaN, causing text to vanish!
 * This custom serializer safely rounds numbers and guarantees zero NaNs.
 */
function pathToSvgPathData(path: any, precision: number = 2): string {
  const factor = Math.pow(10, precision);
  const round = (val: number): string => {
    if (!Number.isFinite(val)) return "0";
    const rounded = Math.round(val * factor) / factor;
    return rounded.toString();
  };

  let d = "";
  for (let i = 0; i < path.commands.length; i++) {
    const cmd = path.commands[i];
    switch (cmd.type) {
      case "M":
        d += `M${round(cmd.x)} ${round(cmd.y)}`;
        break;
      case "L":
        d += `L${round(cmd.x)} ${round(cmd.y)}`;
        break;
      case "Q":
        d += `Q${round(cmd.x1)} ${round(cmd.y1)} ${round(cmd.x)} ${round(cmd.y)}`;
        break;
      case "C":
        d += `C${round(cmd.x1)} ${round(cmd.y1)} ${round(cmd.x2)} ${round(cmd.y2)} ${round(cmd.x)} ${round(cmd.y)}`;
        break;
      case "Z":
        d += "Z";
        break;
    }
  }
  return d;
}

/**
 * Converts a text string into a centered SVG <path> element.
 */
function textToSvgPath(
  font: Font,
  text: string,
  centerX: number,
  y: number,
  fontSize: number,
  fill: string
): string {
  const width = font.getAdvanceWidth(text, fontSize);
  const x = centerX - width / 2;
  const path = font.getPath(text, x, y, fontSize);
  const pathData = pathToSvgPathData(path, 2);
  return `<path d="${pathData}" fill="${fill}" />`;
}

/**
 * Converts a text string into a left-aligned SVG <path> element.
 */
function textToSvgPathLeft(
  font: Font,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fill: string
): string {
  const path = font.getPath(text, x, y, fontSize);
  const pathData = pathToSvgPathData(path, 2);
  return `<path d="${pathData}" fill="${fill}" />`;
}

/**
 * Calculates optimal font size for participant name to ensure it fits within maxWidth.
 */
function getFittingFontSize(
  font: Font,
  text: string,
  baseFontSize: number,
  maxWidth: number
): number {
  const w = font.getAdvanceWidth(text, baseFontSize);
  if (w <= maxWidth) return baseFontSize;
  return Math.floor((maxWidth / w) * baseFontSize);
}

/**
 * Generates the full dynamic SVG string with 100% vector IBM Plex Mono glyphs.
 *
 * Certificate layout (right panel, centered at x=2475):
 *   y=1280  "This certificate is proudly presented to"
 *   y=1430  {{PARTICIPANT_NAME}}  (bold, large)
 *   y=1540  "in recognition of their participation in"
 *   y=1650  {{EVENT_NAME}}  (bold, amber)
 *   y=1750  "conducted by AWS Student Builder Group at Tulas University"
 *   y=1830  "on {{DATE}}"
 *
 *   y=1980  Certificate ID: {{ID}}
 *   y=2050  [QR CODE]  (left panel, x=220)
 *   y=2100  Verify Certificate  (label)
 *   y=2150  {{VERIFICATION_URL}}
 *
 *   y=2100  Signature image (left bottom)
 *   y=2148  Signature line
 *   y=2195  Signer Name
 *   y=2250  Signer Title
 */
export async function generateCertificateSvg(
  input: SvgCertificateInput
): Promise<string> {
  const awardTitle = getAwardTitle(input.awardTitle);
  const theme = input.theme ?? DEFAULT_CERTIFICATE_THEME;
  // Dynamic accent text (event name, rank lines) matches the template's coloured panel.
  const accent = CERTIFICATE_THEME_INFO[theme].accent;
  const [{ boldFont, regFont }, baseSvg, signatureDataUri] = await Promise.all([
    getFonts(),
    getBaseSvgTemplate(awardTitle, theme, input.kind),
    input.signatureDataUri ? Promise.resolve(input.signatureDataUri) : getSignatureDataUri(),
  ]);

  const participantName = input.participantName.trim();
  const eventTitle = input.eventTitle.trim();
  const eventDate = input.eventDate.trim();
  const signerName = input.signerName?.trim() || "Piyush Lingwal";
  const signerTitle = input.signerTitle?.trim() || "Community Program Manager";
  const signerOrg = "AWS Student Builder Group";
  const certificateId = input.certificateId.trim();
  const certIdText = buildCertIdText(certificateId);
  const verifyUrlText = buildVerifyUrlText(certificateId, input.verificationUrl);
  const certIdPath = textToSvgPathLeft(
    regFont,
    certIdText,
    CERT_ID_SVG_POSITION.x,
    CERT_ID_SVG_POSITION.y,
    getFittingFontSize(regFont, certIdText, CERT_ID_FONT_SIZE, CERTIFICATE_META_MAX_WIDTH),
    "#444444"
  );
  const verifyUrlPath = textToSvgPathLeft(
    regFont,
    verifyUrlText,
    VERIFY_URL_SVG_POSITION.x,
    VERIFY_URL_SVG_POSITION.y,
    getFittingFontSize(regFont, verifyUrlText, VERIFY_URL_FONT_SIZE, CERTIFICATE_META_MAX_WIDTH),
    "#444444"
  );

  // ── Right panel center X ──────────────────────────────────────
  const cx = 2475;

  if (awardTitle) {
    const { rankText, contextText, isRunnerUp } =
      getCertificateAwardLayout(awardTitle);
    const line1 = "This certificate is proudly presented to";
    const line1Size = getFittingFontSize(regFont, line1, CERT_TEXT.presentedTo.size, CERT_TEXT.presentedTo.maxWidth);
    const line1Path = textToSvgPath(regFont, line1, cx, 1347, line1Size, "#555555");

    const nameSize = getFittingFontSize(boldFont, participantName, CERT_TEXT.name.size, CERT_TEXT.name.maxWidth);
    const namePath = textToSvgPath(boldFont, participantName, cx, 1497, nameSize, "#161D26");

    const securingText = "for securing";
    const securingSize = getFittingFontSize(regFont, securingText, CERT_TEXT.award.securing.size, CERT_TEXT.award.securing.maxWidth);
    const securingPath = textToSvgPath(
      regFont,
      securingText,
      cx,
      1562,
      securingSize,
      "#555555"
    );

    const rankSize = getFittingFontSize(boldFont, rankText, CERT_TEXT.award.rank.size, CERT_TEXT.award.rank.maxWidth);
    const rankWidth = boldFont.getAdvanceWidth(rankText, rankSize);
    const rankBaseline = isRunnerUp ? 1660 : 1682;
    const rankPath = textToSvgPath(
      boldFont,
      rankText,
      cx,
      rankBaseline,
      rankSize,
      accent
    );
    const rankLineY = rankBaseline - rankSize * 0.38;
    const rankDecorations = `
      <rect x="${cx - rankWidth / 2 - 195}" y="${rankLineY}" width="140" height="5" fill="${accent}"/>
      <rect x="${cx + rankWidth / 2 + 55}" y="${rankLineY}" width="140" height="5" fill="${accent}"/>
    `;

    const eventPrefix = contextText;
    const eventPrefixBaseline = isRunnerUp ? 1738 : 1760;
    const eventPrefixPath = textToSvgPath(
      regFont,
      eventPrefix,
      cx,
      eventPrefixBaseline,
      getFittingFontSize(regFont, eventPrefix, CERT_TEXT.award.context.size, CERT_TEXT.award.context.maxWidth),
      "#555555"
    );
    const eventSize = getFittingFontSize(boldFont, eventTitle, CERT_TEXT.award.eventName.size, CERT_TEXT.award.eventName.maxWidth);
    const eventBaseline = isRunnerUp ? 1818 : 1840;
    const eventNamePath = textToSvgPath(
      boldFont,
      eventTitle,
      cx,
      eventBaseline,
      eventSize,
      accent
    );

    const details = "conducted by AWS Student Builder Group at Tulas University";
    const detailsSize = getFittingFontSize(regFont, details, CERT_TEXT.award.conductedBy.size, CERT_TEXT.award.conductedBy.maxWidth);
    const detailsBaseline = eventBaseline + 80;
    const detailsPath = textToSvgPath(
      regFont,
      details,
      cx,
      detailsBaseline,
      detailsSize,
      "#444444"
    );
    const dateText = `on ${eventDate}`;
    const datePath = textToSvgPath(
      boldFont,
      dateText,
      cx,
      detailsBaseline + 60,
      getFittingFontSize(boldFont, dateText, CERT_TEXT.date.size, CERT_TEXT.date.maxWidth),
      "#444444"
    );

    const qrImageXml = input.qrDataUri
      ? `<image href="${input.qrDataUri}" x="220" y="2010" width="230" height="230" />`
      : `<rect x="220" y="2010" width="230" height="230" fill="#F4F4F6" stroke="#DEDEE3" stroke-width="2" rx="8"/><text x="335" y="2135" text-anchor="middle" font-family="monospace" font-size="24" fill="#888">[QR]</text>`;
    const qrAndMetaXml = `
      <g id="dynamic-verification-meta">
        ${qrImageXml}
        ${certIdPath}
        ${verifyUrlPath}
      </g>
    `;

    const sigImgXml = signatureDataUri
      ? `<image href="${signatureDataUri}" x="2295" y="2077" width="360" height="130" preserveAspectRatio="xMidYMid meet" />`
      : "";
    const signerTitleSize = getFittingFontSize(regFont, signerTitle, CERT_TEXT.signer.size, CERT_TEXT.signer.maxWidth);
    const signerTitlePath = textToSvgPath(regFont, signerTitle, cx, 2282, signerTitleSize, "#555555");
    const signerOrgSize = getFittingFontSize(regFont, signerOrg, CERT_TEXT.signer.size, CERT_TEXT.signer.maxWidth);
    const signerOrgPath = textToSvgPath(regFont, signerOrg, cx, 2330, signerOrgSize, "#555555");

    return baseSvg
      .replace(
        '<rect x="2175" y="2148" width="600" height="2" fill="#161d26"/>',
        '<rect x="2175" y="2220" width="600" height="2" fill="#161d26"/>'
      )
      .replace("<!-- PROUDLY_PRESENT_PLACEHOLDER -->", line1Path)
      .replace("<!-- PARTICIPANT_NAME_PLACEHOLDER -->", namePath)
      .replace(
        "<!-- ACHIEVEMENT_TEXT_PLACEHOLDER -->",
        `${securingPath}${rankDecorations}${rankPath}`
      )
      .replace(
        "<!-- EVENT_DETAILS_PLACEHOLDER -->",
        `${eventPrefixPath}${eventNamePath}`
      )
      .replace(
        "<!-- SIGNER_NAME_PLACEHOLDER -->",
        `${detailsPath}${datePath}${sigImgXml}`
      )
      .replace("<!-- SIGNER_TITLE_PLACEHOLDER -->", `${signerTitlePath}${signerOrgPath}`)
      .replace("<!-- QR_AND_META_PLACEHOLDER -->", qrAndMetaXml);
  }

  // ── Certificate of Appreciation (organising team) ─────────────
  // Own wording and layout; see ORGANISER_COPY / ORGANISER_Y in text-layout.ts.
  if (resolveCertificateKind(false, input.kind) === "organiser") {
    const T = ORGANISER_TEXT;
    const lines = organiserLines(input.role, input.wing);
    const y = lines.roleLine ? ORGANISER_Y.withRole : ORGANISER_Y.withoutRole;
    const fit = (font: Font, text: string, spec: { size: number; maxWidth: number }) =>
      getFittingFontSize(font, text, spec.size, spec.maxWidth);
    const centred = (font: Font, text: string, baseline: number, spec: { size: number; maxWidth: number }, fill: string) =>
      textToSvgPath(font, text, cx, baseline, fit(font, text, spec), fill);

    const presentedPath = centred(regFont, ORGANISER_COPY.presentedTo, ORGANISER_Y.presentedTo, T.presentedTo, "#555555");
    const namePath = centred(boldFont, participantName, ORGANISER_Y.name, T.name, "#161D26");
    const recognitionPath = centred(regFont, ORGANISER_COPY.recognition, ORGANISER_Y.recognition, T.recognition, "#555555");
    const rolePath = lines.roleLine
      ? centred(boldFont, lines.roleLine, ORGANISER_Y.withRole.role, T.role, accent)
      : "";
    const teamPath = centred(regFont, lines.teamLine, y.team, T.team, "#555555");
    const eventPath = centred(boldFont, organiserEventLine(eventTitle), y.event, T.event, accent);

    // These two sit below y=1870, so they go in the signer layer (above the lower white box).
    const organisedByPath = centred(regFont, ORGANISER_COPY.organisedBy, ORGANISER_Y.organisedBy, T.organisedBy, "#444444");
    const datePath = centred(boldFont, organiserDateText(eventDate), ORGANISER_Y.date, T.date, "#444444");

    const qrImage = input.qrDataUri
      ? `<image href="${input.qrDataUri}" x="220" y="2010" width="230" height="230" />`
      : `<rect x="220" y="2010" width="230" height="230" fill="#F4F4F6" stroke="#DEDEE3" stroke-width="2" rx="8"/><text x="335" y="2135" text-anchor="middle" font-family="monospace" font-size="24" fill="#888">[QR]</text>`;
    const qrMeta = `
      <g id="dynamic-verification-meta">
        ${qrImage}
        ${certIdPath}
        ${verifyUrlPath}
      </g>
    `;

    const sigImg = signatureDataUri
      ? `<image href="${signatureDataUri}" x="2295" y="2077" width="360" height="130" preserveAspectRatio="xMidYMid meet" />`
      : "";
    const signerTitlePath = centred(regFont, signerTitle, 2282, CERT_TEXT.signer, "#555555");
    const signerOrgPath = centred(regFont, signerOrg, 2330, CERT_TEXT.signer, "#555555");

    return baseSvg
      .replace(
        '<rect x="2175" y="2148" width="600" height="2" fill="#161d26"/>',
        '<rect x="2175" y="2220" width="600" height="2" fill="#161d26"/>'
      )
      .replace("<!-- PROUDLY_PRESENT_PLACEHOLDER -->", presentedPath)
      .replace("<!-- PARTICIPANT_NAME_PLACEHOLDER -->", namePath)
      .replace("<!-- ACHIEVEMENT_TEXT_PLACEHOLDER -->", `${recognitionPath}${rolePath}${teamPath}`)
      .replace("<!-- EVENT_DETAILS_PLACEHOLDER -->", eventPath)
      .replace("<!-- SIGNER_NAME_PLACEHOLDER -->", `${organisedByPath}${datePath}${sigImg}`)
      .replace("<!-- SIGNER_TITLE_PLACEHOLDER -->", `${signerTitlePath}${signerOrgPath}`)
      .replace("<!-- QR_AND_META_PLACEHOLDER -->", qrMeta);
  }

  // 1. "This certificate is proudly presented to"
  const line1 = "This certificate is proudly presented to";
  const line1Size = getFittingFontSize(regFont, line1, CERT_TEXT.presentedTo.size, CERT_TEXT.presentedTo.maxWidth);
  const line1Path = textToSvgPath(regFont, line1, cx, 1295, line1Size, "#555555");

  // 2. Participant Name (bold, large)
  const nameSize = getFittingFontSize(boldFont, participantName, CERT_TEXT.name.size, CERT_TEXT.name.maxWidth);
  const namePath = textToSvgPath(boldFont, participantName, cx, 1460, nameSize, "#161D26");

  // 3. "in recognition of their participation in"
  const line3 = RECOGNITION_LINE.participation;
  const line3Size = getFittingFontSize(regFont, line3, CERT_TEXT.recognition.size, CERT_TEXT.recognition.maxWidth);
  const line3Path = textToSvgPath(regFont, line3, cx, 1568, line3Size, "#555555");

  // 4. Event Name (bold, theme accent)
  const eventSize = getFittingFontSize(boldFont, eventTitle, CERT_TEXT.eventName.size, CERT_TEXT.eventName.maxWidth);
  const eventPath = textToSvgPath(boldFont, eventTitle, cx, 1668, eventSize, accent);

  // 5. "conducted by AWS Student Builder Group at Tulas University"
  const line5 = "conducted by AWS Student Builder Group at Tulas University";
  const line5Size = getFittingFontSize(regFont, line5, CERT_TEXT.conductedBy.size, CERT_TEXT.conductedBy.maxWidth);
  const line5Path = textToSvgPath(regFont, line5, cx, 1762, line5Size, "#444444");

  // 6. "on {{DATE}}"
  const line6 = `on ${eventDate}`;
  const line6Size = getFittingFontSize(boldFont, line6, CERT_TEXT.date.size, CERT_TEXT.date.maxWidth);
  const line6Path = textToSvgPath(boldFont, line6, cx, 1840, line6Size, "#444444");

  // ── Bottom-left: QR code + Certificate ID + Verify block ────────
  // QR image placed at x=220, y=2010. Certificate ID placed directly below QR.
  const qrImageXml = input.qrDataUri
    ? `<image href="${input.qrDataUri}" x="220" y="2010" width="230" height="230" />`
    : `<rect x="220" y="2010" width="230" height="230" fill="#F4F4F6" stroke="#DEDEE3" stroke-width="2" rx="8"/><text x="335" y="2135" text-anchor="middle" font-family="monospace" font-size="24" fill="#888">[QR]</text>`;

  const qrAndMetaXml = `
    <g id="dynamic-verification-meta">
      ${qrImageXml}
      ${certIdPath}
      ${verifyUrlPath}
    </g>
  `;

  // ── Signer block ───────────────────────────────────────────────
  // Signature image centered above the line at cx = 2475
  const sigImgXml = signatureDataUri
    ? `<image href="${signatureDataUri}" x="2295" y="2005" width="360" height="130" preserveAspectRatio="xMidYMid meet" />`
    : "";

  // Signer name removed per user request: "Remove the name Piyush Lingwal from there only keep the signature."
  const signerTitleSize = getFittingFontSize(regFont, signerTitle, CERT_TEXT.signer.size, CERT_TEXT.signer.maxWidth);
  const signerTitlePath = textToSvgPath(regFont, signerTitle, cx, 2210, signerTitleSize, "#555555");

  const signerOrgSize = getFittingFontSize(regFont, signerOrg, CERT_TEXT.signer.size, CERT_TEXT.signer.maxWidth);
  const signerOrgPath = textToSvgPath(regFont, signerOrg, cx, 2258, signerOrgSize, "#555555");

  // Replace placeholders in baseSvg with pure vector glyph paths
  const resultSvg = baseSvg
    .replace(/<rect x="2029" y="2148" width="882" height="2" fill="#161d26"\/>/, '<rect x="2175" y="2148" width="600" height="2" fill="#161d26"/>')
    .replace("<!-- PROUDLY_PRESENT_PLACEHOLDER -->", line1Path)
    .replace("<!-- PARTICIPANT_NAME_PLACEHOLDER -->", namePath)
    .replace("<!-- ACHIEVEMENT_TEXT_PLACEHOLDER -->", `${line3Path}`)
    .replace("<!-- EVENT_DETAILS_PLACEHOLDER -->", `${eventPath}${line5Path}${line6Path}`)
    .replace("<!-- SIGNER_NAME_PLACEHOLDER -->", sigImgXml)
    .replace("<!-- SIGNER_TITLE_PLACEHOLDER -->", `${signerTitlePath}${signerOrgPath}`)
    .replace("<!-- QR_AND_META_PLACEHOLDER -->", qrAndMetaXml);

  return resultSvg;
}
