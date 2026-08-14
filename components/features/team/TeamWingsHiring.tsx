"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Code2, Cloud, Palette, Calendar, Video, Megaphone, ArrowUpRight, ArrowRight, Sparkles,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const WINGS = [
  {
    id: "technology",
    num: "01",
    name: "Technology",
    suffix: "Wing",
    icon: Code2,
    accent: "#A78BFA",
    accentRgb: "167,139,250",
    label: "Dev · Web · Bots · AI",
    desc: "Architect full-stack platforms, Telegram bots, AI workflows, and cloud-native web apps.",
    tags: ["Next.js", "Python", "APIs", "AI/ML"],
  },
  {
    id: "cloud",
    num: "02",
    name: "Cloud",
    suffix: "Wing",
    icon: Cloud,
    accent: "#FCD34D",
    accentRgb: "252,211,77",
    label: "AWS · Labs · Serverless",
    desc: "Deploy AWS architectures, IAM security policies, serverless Lambdas, and CDK pipelines.",
    tags: ["EC2/S3", "Lambda", "CDK", "CloudOps"],
  },
  {
    id: "design",
    num: "03",
    name: "Design",
    suffix: "Wing",
    icon: Palette,
    accent: "#F472B6",
    accentRgb: "244,114,182",
    label: "UI/UX · Brand · Visuals",
    desc: "Craft high-conversion web interfaces, Figma design systems, motion graphics, and 3D brand assets.",
    tags: ["Figma", "UI/UX", "3D Motion", "Branding"],
  },
  {
    id: "events",
    num: "04",
    name: "Events",
    suffix: "& Ops Wing",
    icon: Calendar,
    accent: "#38BDF8",
    accentRgb: "56,189,248",
    label: "Hackathons · Jams · Logistics",
    desc: "Organize high-energy hackathons, offline cloud workshops, technical jams, and speaker sessions.",
    tags: ["Hackathons", "Workshops", "Operations"],
  },
  {
    id: "media",
    num: "05",
    name: "Media",
    suffix: "Wing",
    icon: Video,
    accent: "#34D399",
    accentRgb: "52,211,153",
    label: "Film · Photo · Content",
    desc: "Produce cinematic event recaps, developer reels, podcast episodes, and social tech content.",
    tags: ["Video Prod", "Reels", "Podcasts", "Photos"],
  },
  {
    id: "outreach",
    num: "06",
    name: "Outreach",
    suffix: "Wing",
    icon: Megaphone,
    accent: "#FB923C",
    accentRgb: "251,146,60",
    label: "PR · Sponsorships · Network",
    desc: "Lead industry outreach, secure campus sponsorships, forge AWS community partnerships, and drive growth.",
    tags: ["PR & Media", "Sponsors", "Community"],
  },
];

/* ─── Desktop Wing Row ─────────────────────────────────── */
function DesktopWingRow({ wing, index }: { wing: typeof WINGS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = wing.icon;

  return (
    <div className="gsap-desktop-wing-row hidden md:block">
      <Link
        href={`/register?wing=${encodeURIComponent(wing.name + " " + wing.suffix)}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative flex items-center gap-6 lg:gap-10 py-7 border-b border-white/[0.06] overflow-hidden transition-colors duration-300"
      >
        {/* Background sweep on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: `linear-gradient(to right, rgba(${wing.accentRgb},0.07) 0%, rgba(${wing.accentRgb},0.03) 60%, transparent 100%)`,
          }}
        />

        {/* Left border accent */}
        <motion.div
          className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0, scaleY: hovered ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
          style={{ background: wing.accent }}
        />

        {/* Number */}
        <motion.span
          animate={{ color: hovered ? wing.accent : "rgba(255,255,255,0.15)" }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-sm font-mono font-bold w-8 text-right select-none"
        >
          {wing.num}
        </motion.span>

        {/* Wing name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <motion.span
              animate={{ color: hovered ? "#FAFAFA" : "rgba(255,255,255,0.75)" }}
              transition={{ duration: 0.25 }}
              className="text-3xl lg:text-5xl font-bold font-display tracking-tight leading-none"
            >
              {wing.name}
            </motion.span>
            <motion.span
              animate={{ color: hovered ? `rgba(${wing.accentRgb},0.85)` : "rgba(255,255,255,0.20)" }}
              transition={{ duration: 0.25 }}
              className="text-3xl lg:text-5xl font-bold font-display tracking-tight leading-none"
            >
              {wing.suffix}
            </motion.span>
          </div>
          <motion.p
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
            transition={{ duration: 0.25 }}
            className="text-xs font-mono mt-1.5"
            style={{ color: `rgba(${wing.accentRgb},0.65)` }}
          >
            {wing.label}
          </motion.p>
        </div>

        {/* Right — Icon + Apply */}
        <div className="shrink-0 flex items-center gap-3">
          <motion.span
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Apply Now
          </motion.span>

          <motion.div
            animate={{
              background: hovered ? `rgba(${wing.accentRgb},0.15)` : "rgba(255,255,255,0.04)",
              borderColor: hovered ? `rgba(${wing.accentRgb},0.35)` : "rgba(255,255,255,0.08)",
            }}
            transition={{ duration: 0.3 }}
            className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl border flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: hovered ? 10 : 0, scale: hovered ? 1.1 : 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Icon
                className="w-5 h-5 lg:w-6 lg:h-6 transition-colors duration-300"
                style={{ color: hovered ? wing.accent : "rgba(255,255,255,0.35)" }}
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
            <ArrowUpRight className="w-5 h-5" style={{ color: wing.accent }} />
          </motion.div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Mobile Interactive Wing Card (GSAP Stagger) ─────── */
function MobileWingCard({ wing, index }: { wing: typeof WINGS[0]; index: number }) {
  const Icon = wing.icon;

  return (
    <div className="gsap-mobile-wing-card md:hidden relative">
      <Link
        href={`/register?wing=${encodeURIComponent(wing.name + " " + wing.suffix)}`}
        className="block relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4 sm:p-5 active:scale-[0.98] transition-all overflow-hidden shadow-lg group"
      >
        {/* Ambient colored corner glow */}
        <div
          className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20"
          style={{ background: wing.accent }}
        />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                background: `rgba(${wing.accentRgb},0.12)`,
                borderColor: `rgba(${wing.accentRgb},0.3)`,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: wing.accent }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-bold" style={{ color: wing.accent }}>
                  {wing.num}
                </span>
                <span className="text-[10px] font-mono text-muted uppercase">· {wing.suffix}</span>
              </div>
              <h3 className="text-lg font-bold font-display text-text-primary tracking-tight leading-snug">
                {wing.name} {wing.suffix !== "Wing" && wing.suffix}
              </h3>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Hiring
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          {wing.desc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {wing.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom CTA Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <span className="text-[10px] font-mono text-muted">
            {wing.label}
          </span>
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold font-mono"
            style={{ color: wing.accent }}
          >
            <span>Apply</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}

/* ─── Main Section ─────────────────────────────────────── */
export function TeamWingsHiring() {
  const sectionRef = useRef<HTMLDivElement>(null);
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
    <section ref={sectionRef} id="wings" className="py-16 sm:py-20 px-3.5 sm:px-6 lg:px-8 max-w-content mx-auto">

      {/* ── Section header ──────────────────────────── */}
      <div ref={headerRef} className="mb-10 sm:mb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3 sm:mb-5">
              <div className="h-px w-6 sm:w-8 bg-primary/60" />
              <span className="text-[10px] font-mono tracking-[0.25em] text-muted uppercase">
                Cohort 2026
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display text-text-primary tracking-tight leading-[1.05] sm:leading-[1.0]">
              Choose Your
              <br />
              <span className="bg-gradient-to-r from-primary-light via-accent to-purple-300 bg-clip-text text-transparent">
                Builder Wing.
              </span>
            </h2>
          </div>

          <div className="sm:text-right space-y-1.5 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] sm:text-xs font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Applications Open · 2026</span>
            </div>
            <p className="text-[11px] sm:text-xs text-muted font-mono block">
              6 wings · Limited slots · All branches welcome
            </p>
          </div>
        </div>
      </div>

      {/* ── Desktop Wing Rows ────────────────────────── */}
      <div ref={desktopRowsRef} className="hidden md:block border-t border-white/[0.08]">
        {WINGS.map((wing, idx) => (
          <DesktopWingRow key={wing.id} wing={wing} index={idx} />
        ))}
      </div>

      {/* ── Mobile Wing Cards Grid ────────────────────── */}
      <div ref={mobileCardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
        {WINGS.map((wing, idx) => (
          <MobileWingCard key={wing.id} wing={wing} index={idx} />
        ))}
      </div>

      {/* ── Footer ─────────────────────────────────── */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-[11px] sm:text-xs text-muted font-mono">
          Tap a wing above to apply or{" "}
          <Link
            href="/register"
            className="text-text-secondary hover:text-text-primary underline underline-offset-4 transition-colors"
          >
            submit general application
          </Link>
        </p>

        {/* Mini wing dots */}
        <div className="flex items-center gap-2 self-center sm:self-auto">
          {WINGS.map(w => (
            <div
              key={w.id}
              className="w-2 h-2 rounded-full"
              style={{ background: w.accent, opacity: 0.6 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
