"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { buildCloud } from "@/lib/design/pixel-cloud";
import { cssVars, useScrollVar } from "./use-scroll-var";

const icon = (path: string) => encodeURI(`/assets/AWS services icons/${path}`);

const SERVICE_CHIPS = [
  { name: "EC2", note: "Compute", src: icon("Compute/EC2.png"), x: "0%", y: "16%", at: 0.4, bob: "0s" },
  { name: "Lambda", note: "Serverless", src: icon("Compute/Lambda.png"), x: "70%", y: "36%", at: 0.5, bob: "-2s" },
  { name: "S3", note: "Storage", src: icon("Storage/Simple-Storage-Service.png"), x: "2%", y: "66%", at: 0.6, bob: "-4s" },
] as const;

const FACTS = [
  { value: "2026", label: "Launch year" },
  { value: "6", label: "Wings" },
  { value: "AWS", label: "Community" },
] as const;

/**
 * Scene 1. The headline arrives on load; the cloud is then BUILT by scrolling:
 * pixels fall into place bottom-up, Kio rises out of it, service chips float in.
 * The scene is 230svh tall and pinned, so the build plays while the screen stays put.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  useScrollVar(ref);
  const cells = useMemo(() => buildCloud(), []);

  return (
    <section id="top" ref={ref} data-tone="dawn" className="scene relative h-[230svh]" style={cssVars({ "--t": 0 })}>
      <div className="pin flex items-center">
        <div className="mx-auto grid w-full max-w-[1240px] items-center gap-4 px-[var(--gutter)] pt-24 sm:pt-28 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:pt-20">
          {/* ── copy ── */}
          <div className="hero-copy relative z-10 text-center lg:text-left">
            <p
              className="rise inline-flex items-center gap-2.5 rounded-full border border-[var(--line)] bg-white/70 py-1.5 pl-3 pr-4 backdrop-blur"
              style={cssVars({ "--d": 0 })}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="t-eyebrow !text-[10.5px] !text-sbg-ink-2">Official AWS Student Community</span>
            </p>

            <h1
              className="t-display rise mt-5 text-[clamp(38px,5.3vw,80px)] text-sbg-ink sm:mt-6"
              style={cssVars({ "--d": 120 })}
            >
              <span className="block whitespace-nowrap">Where student</span>
              <span className="block whitespace-nowrap">
                <span className="t-serif text-sbg-lilac-600">builders</span> shape
              </span>
              <span className="block whitespace-nowrap">the cloud.</span>
            </h1>

            <p className="t-lead rise mx-auto mt-5 hidden max-w-[34rem] sm:block lg:mx-0 sm:mt-7" style={cssVars({ "--d": 260 })}>
              Join a community where students learn by building, through{" "}
              <strong className="font-semibold text-sbg-ink">hands-on workshops, hackathons, mentorship and real projects</strong> that
              prepare you for what comes next.
            </p>

            <div className="rise mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start" style={cssVars({ "--d": 380 })}>
              <Link href="/register" className="btn btn-primary w-full sm:w-auto">
                Become a Builder <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#events" className="btn btn-ghost w-full sm:w-auto">
                Explore events
              </a>
            </div>

            <dl className="hero-facts mx-auto mt-8 hidden max-w-md grid-cols-3 divide-x divide-[var(--line)] sm:grid lg:mx-0">
              {FACTS.map((f) => (
                <div key={f.label} className="px-4 first:pl-0">
                  <dt className="sr-only">{f.label}</dt>
                  <dd className="t-display text-[28px] text-sbg-ink">{f.value}</dd>
                  <dd className="t-eyebrow mt-1 !text-[10px]">{f.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ── the build ── */}
          <div className="hero-stage" aria-hidden="true">
            <div className="cloud">
              {cells.map((c) => (
                <span
                  key={`${c.x}-${c.y}`}
                  className="cloud-cell"
                  style={{
                    gridColumn: c.x + 1,
                    gridRow: c.y + 1,
                    ...cssVars({ "--d": c.delay, "--dx": c.dx, "--dy": c.dy, "--col": c.color }),
                  }}
                />
              ))}
            </div>

            {SERVICE_CHIPS.map((chip) => (
              <div key={chip.name} className="chip-float" style={cssVars({ "--x": chip.x, "--y": chip.y, "--at": chip.at })}>
                <div className="surface flex items-center gap-2.5 rounded-2xl py-2 pl-2 pr-4" style={cssVars({ "--bob": chip.bob })}>
                  <Image src={chip.src} alt="" width={36} height={36} className="h-8 w-8 sm:h-9 sm:w-9" />
                  <span className="leading-tight">
                    <span className="block text-[13px] font-semibold text-sbg-ink">{chip.name}</span>
                    <span className="t-eyebrow block !text-[9px]">{chip.note}</span>
                  </span>
                </div>
              </div>
            ))}

            <div className="kio">
              <div>
                <Image src="/chatbotmascot.webp" alt="" width={480} height={576} priority className="h-auto w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-cue absolute inset-x-0 bottom-5 flex flex-col items-center gap-2" aria-hidden="true">
          <span className="t-eyebrow !text-[10px]">Scroll to build</span>
          <span className="relative h-9 w-px overflow-hidden bg-sbg-lilac-200">
            <span className="absolute inset-x-0 h-1/2 bg-sbg-lilac-600" style={{ animation: "sbg-cue 1.8s var(--ease-soft) infinite" }} />
          </span>
        </div>
      </div>
    </section>
  );
}
