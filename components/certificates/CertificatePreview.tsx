"use client";

import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import {
  getAwardTitle,
  getCertificateAwardLayout,
} from "@/lib/certificates/award-title";
import { generateQRCodeDataUrl } from "@/lib/certificates/qr-generator";
import { ZOOM_STEPS, fitWidth, stepZoom } from "@/lib/certificates/fit-size";
import {
  CERTIFICATE_THEME_INFO,
  DEFAULT_CERTIFICATE_THEME,
  resolveCertificateKind,
  templateFileName,
  type CertificateKind,
  type CertificateTheme,
} from "@/lib/certificates/theme";
import {
  CERT_TEXT,
  MONO_ADVANCE_EM,
  ORGANISER_COPY,
  ORGANISER_TEXT,
  ORGANISER_Y,
  RECOGNITION_LINE,
  VOLUNTEER_COPY,
  VOLUNTEER_TEXT,
  VOLUNTEER_Y,
  fitMonoSize,
  organiserDateText,
  organiserEventLine,
  organiserLines,
  type TextSpec,
} from "@/lib/certificates/text-layout";

interface CertificatePreviewProps {
  participantName: string;
  eventTitle: string;
  eventDate: string;
  signerName?: string;
  signerTitle?: string;
  certificateId?: string;
  verificationUrl?: string;
  awardTitle?: string;
  /** Colour theme of the event. Must match what the PDF uses (lib/certificates/svg-generator.ts). */
  theme?: CertificateTheme;
  /** "organiser" shows the Certificate of Appreciation, "volunteer" the Certificate of Volunteering. Ignored when awardTitle is set. */
  kind?: CertificateKind;
  /** Organiser's specific role (e.g. "Technical Co-Lead"). When set it is printed as the role. */
  role?: string;
  /** Organiser's wing (Media, Event, PR or Tech). Used when there is no role. */
  wing?: string;
}

function escapeXml(unsafe: string): string {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function CertificatePreview({
  participantName,
  eventTitle,
  eventDate,
  signerName,
  signerTitle,
  certificateId,
  verificationUrl,
  awardTitle,
  theme = DEFAULT_CERTIFICATE_THEME,
  kind,
  role,
  wing,
}: CertificatePreviewProps) {
  const normalizedAwardTitle = getAwardTitle(awardTitle);
  const resolvedKind = resolveCertificateKind(Boolean(normalizedAwardTitle), kind);
  const accent = CERTIFICATE_THEME_INFO[theme].accent;
  const [baseSvg, setBaseSvg] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [qr, setQr] = useState<{ certificateId: string; dataUrl: string } | null>(null);
  const certId = certificateId?.trim() || "AWS-SBG-2026-PREVIEW";
  const qrDataUrl = qr?.certificateId === certId ? qr.dataUrl : "";

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    const templateName = templateFileName(theme, resolvedKind);

    fetch(`/templates/${templateName}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${templateName}: ${res.status}`);
        return res.text();
      })
      .then((svgText) => {
        if (isCurrent) {
          setBaseSvg(svgText);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(`Failed to load ${templateName}:`, err);
        if (isCurrent) {
          setBaseSvg("");
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [resolvedKind, theme]);

  useEffect(() => {
    let isCurrent = true;

    generateQRCodeDataUrl(certId)
      .then((dataUrl) => {
        if (isCurrent) setQr({ certificateId: certId, dataUrl });
      })
      .catch((err) => {
        console.error("Failed to generate certificate QR code:", err);
      });

    return () => {
      isCurrent = false;
    };
  }, [certId]);

  const renderedSvg = useMemo(() => {
    if (!baseSvg) return "";

    const name = participantName.trim() || "Participant Name";
    const event = eventTitle.trim() || "AWS Cloud Kickstart 2026";
    const date = eventDate.trim() || "30 September 2026";
    const signer = signerName?.trim() || "Piyush Lingwal";
    const title = signerTitle?.trim() || "Community Program Manager";
    const certIdText = `Certificate ID: ${certId}`;
    const verifyUrlText = `Verify Certificate: ${verificationUrl || `https://awstulas.org/verify/${certId}`}`;
    // ── Right panel center X ────────────────────────────────────
    const cx = 2475;

    // Font sizes: the same table and fitting rule the PDF uses (lib/certificates/text-layout.ts).
    // Fixed wording (e.g. "conducted by ...") always fits at full size, which the tests assert.
    const nameSize = fitMonoSize(name.length, CERT_TEXT.name);
    const eventSize = fitMonoSize(event.length, CERT_TEXT.eventName);
    const line5Size = CERT_TEXT.conductedBy.size;
    const line6Size = fitMonoSize(`on ${date}`.length, CERT_TEXT.date);
    const signerTitleSize = fitMonoSize(title.length, CERT_TEXT.signer);
    const signerOrgSize = CERT_TEXT.signer.size;
    const certIdSize = fitMonoSize(certIdText.length, CERT_TEXT.certId);
    const verifyUrlSize = fitMonoSize(verifyUrlText.length, CERT_TEXT.verifyUrl);

    // ── Line 1: "This certificate is proudly presented to" ─────
    const line1Xml = `<text x="${cx}" y="1295" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="${CERT_TEXT.presentedTo.size}" font-weight="400" fill="#555555">This certificate is proudly presented to</text>`;

    // ── Line 2: Participant Name ─────────────────────────────────
    const nameXml = `<text x="${cx}" y="1460" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="${nameSize}" font-weight="700" fill="#161D26">${escapeXml(name)}</text>`;

    // ── Line 3: "in recognition of their participation in" ──────
    const line3Xml = `<text x="${cx}" y="1568" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="${CERT_TEXT.recognition.size}" font-weight="400" fill="#555555">${escapeXml(RECOGNITION_LINE.participation)}</text>`;

    // ── Line 4: Event Name ───────────────────────────────────────
    const eventXml = `<text x="${cx}" y="1668" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="${eventSize}" font-weight="700" fill="${accent}">${escapeXml(event)}</text>`;

    // ── Line 5: "conducted by..." ────────────────────────────────
    const line5aXml = `<text x="${cx}" y="1762" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="${line5Size}" font-weight="400" fill="#444444">conducted by AWS Student Builder Group at Tulas University</text>`;

    // ── Line 6: "on DATE" ────────────────────────────────────────
    const line6Xml = `<text x="${cx}" y="1840" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="${line6Size}" font-weight="700" fill="#444444">${escapeXml(`on ${date}`)}</text>`;

    // ── QR & Certificate ID block (Certificate ID below QR) ────
    const qrAndMetaXml = `
      <g id="dynamic-verification-meta">
        ${qrDataUrl
          ? `<image href="${qrDataUrl}" x="220" y="2010" width="230" height="230" preserveAspectRatio="xMidYMid meet"/>`
          : `<rect x="220" y="2010" width="230" height="230" fill="#F4F4F6" stroke="#DEDEE3" stroke-width="2" rx="8"/><text x="335" y="2135" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="24" fill="#888888">[QR CODE]</text>`}
        <text x="220" y="2285" font-family="'IBM Plex Mono', monospace" font-size="${certIdSize}" font-weight="400" fill="#444444">${escapeXml(certIdText)}</text>
        <text x="220" y="2330" font-family="'IBM Plex Mono', monospace" font-size="${verifyUrlSize}" font-weight="400" fill="#444444">${escapeXml(verifyUrlText)}</text>
      </g>
    `;

    // ── Signer block: signature centered, name removed, titles centered ──
    const signerSigXml = `<image href="/Lingwal_Sign.png" x="2295" y="2005" width="360" height="130" preserveAspectRatio="xMidYMid meet" />`;
    const signerTitlesXml = `<text x="${cx}" y="2210" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="${signerTitleSize}" font-weight="400" fill="#555555">${escapeXml(title)}</text><text x="${cx}" y="2258" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="${signerOrgSize}" font-weight="400" fill="#555555">AWS Student Builder Group</text>`;

    const fontStyle = `
      <style>
        @font-face {
          font-family: 'IBM Plex Mono';
          font-weight: 400;
          font-style: normal;
          src: url('/fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf') format('truetype');
        }
        @font-face {
          font-family: 'IBM Plex Mono';
          font-weight: 700;
          font-style: normal;
          src: url('/fonts/IBM_Plex_Mono/IBMPlexMono-Bold.ttf') format('truetype');
        }
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400;1,700&amp;display=swap');
        text { font-family: 'IBM Plex Mono', monospace; font-smooth: always; -webkit-font-smoothing: antialiased; }
      </style>
    `;

    if (normalizedAwardTitle) {
      const { rankText, contextText, isRunnerUp } =
        getCertificateAwardLayout(normalizedAwardTitle);
      const nameSize = fitMonoSize(name.length, CERT_TEXT.name);
      const rankSize = fitMonoSize(rankText.length, CERT_TEXT.award.rank);
      const rankWidth = rankText.length * rankSize * MONO_ADVANCE_EM;
      const eventSize = fitMonoSize(event.length, CERT_TEXT.award.eventName);
      const dateLine = `on ${date}`;
      const dateSize = fitMonoSize(dateLine.length, CERT_TEXT.date);
      const rankBaseline = isRunnerUp ? 1660 : 1682;
      const rankLineY = rankBaseline - rankSize * 0.38;
      const eventPrefixBaseline = isRunnerUp ? 1738 : 1760;
      const eventBaseline = isRunnerUp ? 1818 : 1840;
      const detailsBaseline = eventBaseline + 80;
      const detailsXml = `<text x="${cx}" y="${detailsBaseline}" text-anchor="middle" font-size="${CERT_TEXT.award.conductedBy.size}" font-weight="400" fill="#444444">conducted by AWS Student Builder Group at Tulas University</text><text x="${cx}" y="${detailsBaseline + 60}" text-anchor="middle" font-size="${dateSize}" font-weight="700" fill="#444444">${escapeXml(dateLine)}</text>`;
      const excellenceTextXml = `
        <text x="${cx}" y="1347" text-anchor="middle" font-size="${CERT_TEXT.presentedTo.size}" font-weight="400" fill="#555555">This certificate is proudly presented to</text>
        <text x="${cx}" y="1497" text-anchor="middle" font-size="${nameSize}" font-weight="700" fill="#161D26">${escapeXml(name)}</text>
        <text x="${cx}" y="1562" text-anchor="middle" font-size="${CERT_TEXT.award.securing.size}" font-weight="400" fill="#555555">for securing</text>
        <rect x="${cx - rankWidth / 2 - 195}" y="${rankLineY}" width="140" height="5" fill="${accent}"/>
        <rect x="${cx + rankWidth / 2 + 55}" y="${rankLineY}" width="140" height="5" fill="${accent}"/>
        <text x="${cx}" y="${rankBaseline}" text-anchor="middle" font-size="${rankSize}" font-weight="700" fill="${accent}">${escapeXml(rankText)}</text>
        <text x="${cx}" y="${eventPrefixBaseline}" text-anchor="middle" font-size="${CERT_TEXT.award.context.size}" font-weight="400" fill="#555555">${escapeXml(contextText)}</text>
        <text x="${cx}" y="${eventBaseline}" text-anchor="middle" font-size="${eventSize}" font-weight="700" fill="${accent}">${escapeXml(event)}</text>
      `;
      const qrAndMetaXml = `
        <g id="dynamic-verification-meta">
          ${qrDataUrl
            ? `<image href="${qrDataUrl}" x="220" y="2010" width="230" height="230" preserveAspectRatio="xMidYMid meet"/>`
            : `<rect x="220" y="2010" width="230" height="230" fill="#F4F4F6" stroke="#DEDEE3" stroke-width="2" rx="8"/><text x="335" y="2135" text-anchor="middle" font-size="24" fill="#888888">[QR CODE]</text>`}
        <text x="220" y="2285" font-size="${certIdSize}" font-weight="400" fill="#444444">${escapeXml(certIdText)}</text>
        <text x="220" y="2330" font-size="${verifyUrlSize}" font-weight="400" fill="#444444">${escapeXml(verifyUrlText)}</text>
        </g>
      `;
      const signerSigXml = `${detailsXml}<image href="/Lingwal_Sign.png" x="2295" y="2077" width="360" height="130" preserveAspectRatio="xMidYMid meet" />`;
      const signerTitlesXml = `<text x="${cx}" y="2282" text-anchor="middle" font-size="${signerTitleSize}" font-weight="400" fill="#555555">${escapeXml(title)}</text><text x="${cx}" y="2330" text-anchor="middle" font-size="${signerOrgSize}" font-weight="400" fill="#555555">AWS Student Builder Group</text>`;

      return baseSvg
        .replace('width="3300" height="2550"', 'width="100%" height="100%"')
        .replace(
          '<rect x="2175" y="2148" width="600" height="2" fill="#161d26"/>',
          '<rect x="2175" y="2220" width="600" height="2" fill="#161d26"/>'
        )
        .replace("<!-- PROUDLY_PRESENT_PLACEHOLDER -->", excellenceTextXml)
        .replace("<!-- PARTICIPANT_NAME_PLACEHOLDER -->", "")
        .replace("<!-- ACHIEVEMENT_TEXT_PLACEHOLDER -->", "")
        .replace("<!-- EVENT_DETAILS_PLACEHOLDER -->", "")
        .replace("<!-- SIGNER_NAME_PLACEHOLDER -->", signerSigXml)
        .replace("<!-- SIGNER_TITLE_PLACEHOLDER -->", signerTitlesXml)
        .replace("<!-- QR_AND_META_PLACEHOLDER -->", qrAndMetaXml)
        .replace("<defs>", `<defs>${fontStyle}`);
    }

    // ── Certificate of Appreciation (organising team) ─────────────
    // Same wording, sizes and baselines as the PDF (ORGANISER_* in text-layout.ts).
    if (resolvedKind === "organiser" || resolvedKind === "volunteer") {
      const volunteer = resolvedKind === "volunteer";
      const lines = organiserLines(role, wing);
      const y = lines.roleLine ? ORGANISER_Y.withRole : ORGANISER_Y.withoutRole;
      const line = (baseline: number, str: string, spec: TextSpec, weight: 400 | 700, fill: string) =>
        `<text x="${cx}" y="${baseline}" text-anchor="middle" font-size="${fitMonoSize(str.length, spec)}" font-weight="${weight}" fill="${fill}">${escapeXml(str)}</text>`;
      const T = ORGANISER_TEXT;
      const V = VOLUNTEER_TEXT;

      const presentedXml = volunteer
        ? line(VOLUNTEER_Y.presentedTo, VOLUNTEER_COPY.presentedTo, V.presentedTo, 400, "#555555")
        : line(ORGANISER_Y.presentedTo, ORGANISER_COPY.presentedTo, T.presentedTo, 400, "#555555");
      const nameXml = volunteer
        ? line(VOLUNTEER_Y.name, name, V.name, 700, "#161D26")
        : line(ORGANISER_Y.name, name, T.name, 700, "#161D26");
      const recognitionXml = volunteer
        ? VOLUNTEER_COPY.recognition
            .map((text, i) => line(VOLUNTEER_Y.recognition[i], text, V.recognition, 400, "#555555"))
            .join("")
        : line(ORGANISER_Y.recognition, ORGANISER_COPY.recognition, T.recognition, 400, "#555555") +
          (lines.roleLine ? line(ORGANISER_Y.withRole.role, lines.roleLine, T.role, 700, accent) : "") +
          line(y.team, lines.teamLine, T.team, 400, "#555555");
      const eventLineXml = volunteer
        ? line(VOLUNTEER_Y.event, organiserEventLine(event), V.event, 700, accent)
        : line(y.event, organiserEventLine(event), T.event, 700, accent);
      // Below y=1870 the template has a white box, so these two go in the signer layer.
      const lowerXml =
        (volunteer
          ? line(VOLUNTEER_Y.organisedBy, VOLUNTEER_COPY.organisedBy, V.organisedBy, 400, "#444444") +
            line(VOLUNTEER_Y.date, organiserDateText(date), V.date, 700, "#444444")
          : line(ORGANISER_Y.organisedBy, ORGANISER_COPY.organisedBy, T.organisedBy, 400, "#444444") +
            line(ORGANISER_Y.date, organiserDateText(date), T.date, 700, "#444444")) +
        `<image href="/Lingwal_Sign.png" x="2295" y="2077" width="360" height="130" preserveAspectRatio="xMidYMid meet" />`;
      const signerLinesXml =
        `<text x="${cx}" y="2282" text-anchor="middle" font-size="${signerTitleSize}" font-weight="400" fill="#555555">${escapeXml(title)}</text>` +
        `<text x="${cx}" y="2330" text-anchor="middle" font-size="${signerOrgSize}" font-weight="400" fill="#555555">AWS Student Builder Group</text>`;

      return baseSvg
        .replace('width="3300" height="2550"', 'width="100%" height="100%"')
        .replace(
          '<rect x="2175" y="2148" width="600" height="2" fill="#161d26"/>',
          '<rect x="2175" y="2220" width="600" height="2" fill="#161d26"/>'
        )
        .replace("<!-- PROUDLY_PRESENT_PLACEHOLDER -->", presentedXml)
        .replace("<!-- PARTICIPANT_NAME_PLACEHOLDER -->", nameXml)
        .replace("<!-- ACHIEVEMENT_TEXT_PLACEHOLDER -->", recognitionXml)
        .replace("<!-- EVENT_DETAILS_PLACEHOLDER -->", eventLineXml)
        .replace("<!-- SIGNER_NAME_PLACEHOLDER -->", lowerXml)
        .replace("<!-- SIGNER_TITLE_PLACEHOLDER -->", signerLinesXml)
        .replace("<!-- QR_AND_META_PLACEHOLDER -->", qrAndMetaXml)
        .replace("<defs>", `<defs>${fontStyle}`);
    }

    let res = baseSvg
      .replace('width="3300" height="2550"', 'width="100%" height="100%"')
      .replace(/<rect x="2029" y="2148" width="882" height="2" fill="#161d26"\/>/, '<rect x="2175" y="2148" width="600" height="2" fill="#161d26"/>')
      .replace("<!-- PROUDLY_PRESENT_PLACEHOLDER -->", line1Xml)
      .replace("<!-- PARTICIPANT_NAME_PLACEHOLDER -->", nameXml)
      .replace("<!-- ACHIEVEMENT_TEXT_PLACEHOLDER -->", line3Xml)
      .replace("<!-- EVENT_DETAILS_PLACEHOLDER -->", `${eventXml}${line5aXml}${line6Xml}`)
      .replace("<!-- SIGNER_NAME_PLACEHOLDER -->", signerSigXml)
      .replace("<!-- SIGNER_TITLE_PLACEHOLDER -->", signerTitlesXml)
      .replace("<!-- QR_AND_META_PLACEHOLDER -->", qrAndMetaXml);

    res = res.replace("<defs>", `<defs>${fontStyle}`);
    return res;
  }, [
    baseSvg,
    participantName,
    eventTitle,
    eventDate,
    signerName,
    signerTitle,
    certId,
    verificationUrl,
    qrDataUrl,
    normalizedAwardTitle,
    accent,
    resolvedKind,
    role,
    wing,
  ]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState<number>(1);
  const [fit, setFit] = useState(0);

  const viewerRef = useRef<HTMLDivElement>(null);

  // Size the full-size view from the space the viewer really has (so the whole certificate
  // is in view at 100%), and follow window resizes and rotation.
  useLayoutEffect(() => {
    if (!isFullscreen) return;
    setZoom(1);
    const el = viewerRef.current;
    if (!el) return;
    const measure = () => {
      const css = getComputedStyle(el);
      const w = el.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
      const h = el.clientHeight - parseFloat(css.paddingTop) - parseFloat(css.paddingBottom);
      setFit(fitWidth(w, h));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [isFullscreen]);

  if (isLoading) {
    return (
      <div className="w-full aspect-[3300/2550] bg-slate-900/60 rounded-xl flex flex-col items-center justify-center border border-slate-800/80 animate-pulse gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono tracking-wide">Loading Vector SVG Template...</p>
      </div>
    );
  }

  if (!renderedSvg) {
    return (
      <div className="w-full aspect-[3300/2550] bg-slate-900 rounded-xl flex items-center justify-center border border-red-500/30">
        <p className="text-xs text-red-400 font-medium">Failed to render template SVG</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* The whole certificate is the button: tap or click to open it full size. */}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          aria-label="Open the certificate full size"
          className="group/preview relative block w-full cursor-zoom-in overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl shadow-black/60 transition-shadow duration-300 hover:shadow-[0_25px_80px_-20px_rgba(108,99,255,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] sm:rounded-xl"
        >
          <span
            className={`block aspect-[3300/2550] w-full select-none [&_svg]:block [&_svg]:h-full [&_svg]:w-full ${renderedSvg ? "" : "animate-pulse bg-slate-200"}`}
            dangerouslySetInnerHTML={{ __html: renderedSvg }}
          />
          <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950/85 px-2.5 py-1.5 text-[11px] font-medium text-slate-100 shadow-lg backdrop-blur-md sm:bottom-3 sm:right-3 sm:text-xs">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            Tap to enlarge
          </span>
        </button>
      </div>

      {/* Full-size view. It opens fitted to the screen so the whole certificate is
          visible; the buttons zoom in, and a finger (or the scroll bars) moves around. */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Certificate, full size"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-3 sm:px-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5" role="group" aria-label="Zoom">
              <button
                type="button"
                onClick={() => setZoom((z) => stepZoom(z, -1))}
                disabled={zoom <= ZOOM_STEPS[0]}
                aria-label="Zoom out"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-800/90 text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14" /></svg>
              </button>
              <span className="min-w-[3.25rem] text-center font-mono text-xs text-slate-300" aria-live="polite">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => stepZoom(z, 1))}
                disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
                aria-label="Zoom in"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-800/90 text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              autoFocus
              className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-slate-800/90 px-5 text-sm font-semibold text-white shadow-xl transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>
          <div
            ref={viewerRef}
            className="flex min-h-0 flex-1 overflow-auto overscroll-contain p-4 sm:px-8"
            style={{ touchAction: "pan-x pan-y pinch-zoom", WebkitOverflowScrolling: "touch" }}
            data-lenis-prevent
            onClick={() => setIsFullscreen(false)}
          >
            <div
              className="m-auto aspect-[3300/2550] shrink-0 overflow-hidden rounded-lg border border-white/20 bg-white shadow-2xl [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
              style={{ width: fit ? `${Math.round(fit * zoom)}px` : "100%" }}
              onClick={(e) => e.stopPropagation()}
              dangerouslySetInnerHTML={{ __html: renderedSvg }}
            />
          </div>
          <p className="shrink-0 px-4 pb-3 text-center text-[11px] text-slate-400" onClick={(e) => e.stopPropagation()}>
            {zoom > 1 ? "Drag to move around" : "Use + to zoom in"} · Esc or tap outside to close
          </p>
        </div>
      )}
    </>
  );
}
