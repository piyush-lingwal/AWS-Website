"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Code2, Cloud, Palette, Calendar, Video, Megaphone, ArrowUpRight, ArrowRight,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const WINGS = [
  {
    id: "technology",
    tint: "var(--card-lilac)",
    num: "01",
    name: "Technology",
    suffix: "Wing",
    icon: Code2,
    accent: "rgb(var(--wing-tech))",
    accentRgb: "var(--wing-tech)",
    label: "Dev · Web · Bots · AI",
    desc: "Architect full-stack platforms, Telegram bots, AI workflows, and cloud-native web apps.",
    tags: ["Next.js", "Python", "APIs", "AI/ML"],
  },
  {
    id: "cloud",
    tint: "var(--card-peach)",
    num: "02",
    name: "Cloud",
    suffix: "Wing",
    icon: Cloud,
    accent: "rgb(var(--wing-cloud))",
    accentRgb: "var(--wing-cloud)",
    label: "AWS · Labs · Serverless",
    desc: "Deploy AWS architectures, IAM security policies, serverless Lambdas, and CDK pipelines.",
    tags: ["EC2/S3", "Lambda", "CDK", "CloudOps"],
  },
  {
    id: "design",
    tint: "var(--card-rose)",
    num: "03",
    name: "Design",
    suffix: "Wing",
    icon: Palette,
    accent: "rgb(var(--wing-design))",
    accentRgb: "var(--wing-design)",
    label: "UI/UX · Brand · Visuals",
    desc: "Craft high-conversion web interfaces, Figma design systems, motion graphics, and 3D brand assets.",
    tags: ["Figma", "UI/UX", "3D Motion", "Branding"],
  },
  {
    id: "events",
    tint: "var(--card-sky)",
    num: "04",
    name: "Events",
    suffix: "& Ops Wing",
    icon: Calendar,
    accent: "rgb(var(--wing-events))",
    accentRgb: "var(--wing-events)",
    label: "Hackathons · Jams · Logistics",
    desc: "Organize high-energy hackathons, offline cloud workshops, technical jams, and speaker sessions.",
    tags: ["Hackathons", "Workshops", "Operations"],
  },
  {
    id: "media",
    tint: "var(--card-mint)",
    num: "05",
    name: "Media",
    suffix: "Wing",
    icon: Video,
    accent: "rgb(var(--wing-media))",
    accentRgb: "var(--wing-media)",
    label: "Film · Photo · Content",
    desc: "Produce cinematic event recaps, developer reels, podcast episodes, and social tech content.",
    tags: ["Video Prod", "Reels", "Podcasts", "Photos"],
  },
  {
    id: "outreach",
    tint: "var(--card-blush)",
    num: "06",
    name: "Outreach",
    suffix: "Wing",
    icon: Megaphone,
    accent: "rgb(var(--wing-outreach))",
    accentRgb: "var(--wing-outreach)",
    label: "PR · Sponsorships · Network",
    desc: "Lead industry outreach, secure campus sponsorships, forge AWS community partnerships, and drive growth.",
    tags: ["PR & Media", "Sponsors", "Community"],
  },
];

/* ─── Desktop Wing Row ─────────────────────────────────── */
function DesktopWingRow({ wing }: { wing: typeof WINGS[0] }) {
  const [hovered, setHovered] = useState(false);
  const Icon = wing.icon;

  return (
    <div className="gsap-desktop-wing-row hidden md:block">
      <Link
        href={`/register?wing=${encodeURIComponent(wing.name + " " + wing.suffix)}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative flex items-center gap-6 overflow-hidden border-b border-[color:var(--line)] px-2 py-7 transition-colors duration-300 lg:gap-10"
      >
        {/* Background sweep on hover */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ backgroundImage: `linear-gradient(to right, ${wing.tint} 0%, var(--wash-40) 70%, transparent 100%)` }}
        />

        {/* Left border accent */}
        <motion.div
          className="pointer-events-none absolute bottom-4 left-0 top-4 w-[3px] rounded-full"
          animate={{ opacity: hovered ? 1 : 0, scaleY: hovered ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
          style={{ background: wing.accent }}
        />

        {/* Number */}
        <motion.span
          style={{ color: hovered ? wing.accent : "var(--wing-idle)" }}
          transition={{ duration: 0.25 }}
          className="t-pixel w-8 shrink-0 transition-colors duration-[250ms] select-none text-right text-sm"
        >
          {wing.num}
        </motion.span>

        {/* Wing name */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 text-3xl leading-none lg:text-5xl">
            <span className="t-display text-sbg-ink">
              {wing.name}
            </span>
            <motion.span
              style={{ color: hovered ? wing.accent : "var(--wing-idle)" }}
              transition={{ duration: 0.25 }}
              className="t-serif transition-colors duration-[250ms]"
            >
              {wing.suffix}
            </motion.span>
          </div>
          <motion.p
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
            transition={{ duration: 0.25 }}
            className="t-eyebrow mt-2"
            style={{ color: wing.accent }}
          >
            {wing.label}
          </motion.p>
        </div>

        {/* Right: Icon + Apply */}
        <div className="flex shrink-0 items-center gap-3">
          <motion.span
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-[color:var(--ok-text)]"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Apply Now
          </motion.span>

          <motion.div
            style={{
              backgroundColor: hovered ? wing.tint : "var(--btn-ghost-bg)",
              borderColor: hovered ? `rgb(${wing.accentRgb} / 0.35)` : "var(--line)",
            }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors duration-300 lg:h-14 lg:w-14"
          >
            <motion.div
              animate={{ rotate: hovered ? 10 : 0, scale: hovered ? 1.1 : 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Icon
                className="h-5 w-5 transition-colors duration-300 lg:h-6 lg:w-6"
                style={{ color: hovered ? wing.accent : "var(--ink-3)" }}
              />
            </motion.div>
          </motion.div>

          <motion.div
            animate={{
              x: hovered ? 0 : -6,
              y: hovered ? 0 : 6,
              opacity: hovered ? 1 : 0,
            }}
            transition={{ duration: 0.25 }}
          >
            <ArrowUpRight className="h-5 w-5" style={{ color: wing.accent }} />
          </motion.div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Mobile Interactive Wing Card (GSAP Stagger) ─────── */
function MobileWingCard({ wing }: { wing: typeof WINGS[0] }) {
  const Icon = wing.icon;

  return (
    <div className="gsap-mobile-wing-card relative md:hidden">
      <Link
        href={`/register?wing=${encodeURIComponent(wing.name + " " + wing.suffix)}`}
        className="surface group relative block overflow-hidden rounded-[24px] p-5 transition-transform active:scale-[0.98]"
        style={{ backgroundImage: `linear-gradient(155deg, ${wing.tint} 0%, var(--wash-80) 58%)` }}
      >
        {/* Top Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--chip-bg)]">
              <Icon className="h-5 w-5" style={{ color: wing.accent }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="t-pixel text-[11px]" style={{ color: wing.accent }}>
                  {wing.num}
                </span>
                <span className="t-eyebrow">· {wing.suffix}</span>
              </div>
              <h3 className="t-display text-[22px] leading-snug text-sbg-ink">
                {wing.name} {wing.suffix !== "Wing" && wing.suffix}
              </h3>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--chip-bg)] px-2.5 py-1 text-[10px] font-semibold text-[color:var(--ok-text)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Hiring
          </span>
        </div>

        {/* Description */}
        <p className="mb-4 text-[15px] leading-relaxed text-sbg-ink-2">
          {wing.desc}
        </p>

        {/* Bottom CTA Bar */}
        <div className="flex items-center justify-between border-t border-[color:var(--line)] pt-3">
          <span className="t-eyebrow">
            {wing.label}
          </span>
          <span
            className="inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: wing.accent }}
          >
            <span>Apply</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}

/* ─── Main Section ─────────────────────────────────────── */
export function TeamWingsHiring() {
  const sectionRef = useRef<HTMLElement>(null);
  const mobileCardsRef = useRef<HTMLDivElement>(null);
  const desktopRowsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Header reveal
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 88%",
            end: "bottom 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    }

    // 2. Mobile Cards Stagger
    if (mobileCardsRef.current) {
      const mobileCards = mobileCardsRef.current.querySelectorAll(".gsap-mobile-wing-card");
      gsap.fromTo(
        mobileCards,
        { y: 35, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: mobileCardsRef.current,
            start: "top 85%",
            end: "bottom 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    }

    // 3. Desktop Rows Stagger
    if (desktopRowsRef.current) {
      const desktopRows = desktopRowsRef.current.querySelectorAll(".gsap-desktop-wing-row");
      gsap.fromTo(
        desktopRows,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: desktopRowsRef.current,
            start: "top 85%",
            end: "bottom 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="wings" data-tone="dusk" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1240px] px-[var(--gutter)] py-24 md:py-32">
        {/* ── Section header ──────────────────────────── */}
        <div ref={headerRef} className="mb-12 sm:mb-16">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="t-eyebrow flex items-center gap-3">
                <span className="t-pixel text-sbg-accent">02</span>
                <span className="h-px w-10 bg-sbg-lilac-300" />
                Cohort 2026
              </p>

              <h2 className="t-display mt-5 text-[clamp(34px,5.4vw,76px)] text-sbg-ink">
                Choose Your
                <br />
                <span className="t-serif text-sbg-accent">Builder Wing.</span>
              </h2>
            </div>

            <div className="shrink-0 space-y-2 sm:text-right">
              <div className="surface inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-[color:var(--ok-text)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span>Applications Open · 2026</span>
              </div>
              <p className="t-eyebrow block">
                6 wings · Limited slots · All branches welcome
              </p>
            </div>
          </div>
        </div>

        {/* ── Desktop Wing Rows ────────────────────────── */}
        <div ref={desktopRowsRef} className="hidden border-t border-[color:var(--line)] md:block">
          {WINGS.map((wing) => (
            <DesktopWingRow key={wing.id} wing={wing} />
          ))}
        </div>

        {/* ── Mobile Wing Cards Grid ────────────────────── */}
        <div ref={mobileCardsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
          {WINGS.map((wing) => (
            <MobileWingCard key={wing.id} wing={wing} />
          ))}
        </div>

        {/* ── Footer ─────────────────────────────────── */}
        <div className="mt-10 flex flex-col items-start justify-between gap-3 text-center sm:flex-row sm:items-center sm:text-left">
          <p className="text-sm text-sbg-ink-2">
            Tap a wing above to apply or{" "}
            <Link
              href="/register"
              className="font-semibold text-sbg-accent-strong underline underline-offset-4 transition-colors hover:text-sbg-accent"
            >
              submit general application
            </Link>
          </p>

          {/* Mini wing dots */}
          <div className="flex items-center gap-2 self-center sm:self-auto">
            {WINGS.map((w) => (
              <div
                key={w.id}
                className="h-2.5 w-2.5 rounded-[3px]"
                style={{ background: w.accent, opacity: 0.7 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
