"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lock,
  Sparkles,
  UserPlus,
  Code2,
  Cloud,
  Palette,
  Calendar,
  Video,
  Megaphone,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { PixelHeading } from "@/components/ui/pixel-heading-character";
import { TextShimmer } from "@/components/ui/text-shimmer";

interface LockedRole {
  id: string;
  wing: string;
  role: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  status: string;
  progressPercent: number;
  tags: string[];
}

const LOCKED_ROLES: LockedRole[] = [
  {
    id: "role-tech",
    wing: "Technology Wing",
    role: "Tech Lead & Dev Infra",
    icon: Code2,
    color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30",
    glowColor: "rgba(168, 85, 247, 0.4)",
    status: "Finalizing Selection",
    progressPercent: 90,
    tags: ["Next.js", "AWS Lambda", "DevOps"],
  },
  {
    id: "role-cloud",
    wing: "Cloud Wing",
    role: "Cloud Architecture Lead",
    icon: Cloud,
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    glowColor: "rgba(245, 158, 11, 0.4)",
    status: "Shortlist Review",
    progressPercent: 85,
    tags: ["Serverless", "AWS IAM", "Security"],
  },
  {
    id: "role-design",
    wing: "Design Wing",
    role: "UI/UX & Brand Design Lead",
    icon: Palette,
    color: "from-pink-500/20 to-rose-500/10 border-pink-500/30",
    glowColor: "rgba(236, 72, 153, 0.4)",
    status: "Portfolio Auditions",
    progressPercent: 80,
    tags: ["Figma", "Design Systems", "3D Art"],
  },
  {
    id: "role-events",
    wing: "Events & Operations Wing",
    role: "Hackathon & Ops Lead",
    icon: Calendar,
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
    glowColor: "rgba(59, 130, 246, 0.4)",
    status: "Interview Phase",
    progressPercent: 75,
    tags: ["Hackathons", "Logistics", "AWS Jams"],
  },
  {
    id: "role-media",
    wing: "Media & Content Wing",
    role: "Media & Strategy Lead",
    icon: Video,
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    glowColor: "rgba(16, 185, 129, 0.4)",
    status: "Nominations Open",
    progressPercent: 70,
    tags: ["Video Editing", "Livestreams", "Content"],
  },
  {
    id: "role-outreach",
    wing: "Community Outreach Wing",
    role: "Partnerships & Growth Lead",
    icon: Megaphone,
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/30",
    glowColor: "rgba(139, 92, 246, 0.4)",
    status: "Applications Active",
    progressPercent: 65,
    tags: ["Sponsorships", "Cross-Campus", "Publicity"],
  },
];

export function TeamRevealingSoon() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-content mx-auto overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-primary/12 blur-[140px] z-0" />

      {/* Section Header */}
      <div className="relative z-10 max-w-3xl mx-auto text-center mb-16 space-y-4">
        {/* Hype Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-black/70 backdrop-blur-xl px-4 py-1.5 text-xs font-mono tracking-wider text-white shadow-[0_0_20px_-3px_rgba(124,58,237,0.4)]">
          <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          </span>
          <TextShimmer duration={2.5} className="uppercase tracking-[0.16em] font-semibold text-white/90">
            Cohort 2026 Core Team Selection Active
          </TextShimmer>
          <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
        </div>

        {/* Main Hype Heading */}
        <h2 className="font-display text-[32px] sm:text-[46px] font-semibold tracking-tight text-text-primary leading-tight">
          Official Team Constellation.{" "}
          <PixelHeading mode="uniform" className="text-gradient block mt-1">
            Revealing Soon.
          </PixelHeading>
        </h2>

        <p className="text-[15px] sm:text-[17px] text-text-secondary max-w-xl mx-auto leading-relaxed font-normal">
          We are currently evaluating top student builders, developers, designers, and organizers for the 2026 official AWS SBG Core Team. 
        </p>

        {/* Hype Progress Gauge */}
        <div className="pt-4 max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-muted">
            <span className="flex items-center gap-1.5 text-text-primary font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-accent" />
              Core Team Formation Gauge
            </span>
            <span className="text-accent font-bold">82% Completed</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-bg-surface border border-border overflow-hidden p-0.5 shadow-inner">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "82%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]"
            />
          </div>
        </div>
      </div>

      {/* Locked Cyber Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LOCKED_ROLES.map((role, idx) => {
          const IconComponent = role.icon;

          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`relative rounded-2xl bg-bg-card/90 border ${role.color} p-6 backdrop-blur-xl overflow-hidden shadow-xl group transition-all duration-300`}
            >
              {/* Card Top Accent Light Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-light/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

              {/* Status Pill Badge */}
              <div className="flex items-center justify-between gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-accent text-[11px] font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                  {role.status}
                </span>

                <span className="font-mono text-[10px] uppercase text-muted tracking-widest">
                  SLOT #0{idx + 1}
                </span>
              </div>

              {/* Mystery Avatar Frame */}
              <div className="relative w-24 h-24 mx-auto my-3 flex items-center justify-center">
                {/* Glowing Outer Ring */}
                <div
                  className="absolute inset-0 rounded-full blur-md opacity-40 group-hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: role.glowColor }}
                />

                {/* Cyber Avatar Box */}
                <div className="relative w-full h-full rounded-2xl bg-bg-surface border border-white/10 flex flex-col items-center justify-center text-muted group-hover:border-primary-light/60 transition-colors shadow-lg">
                  <IconComponent className="w-8 h-8 text-primary-light/80 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-bg border border-border text-[9px] font-mono text-accent flex items-center gap-1 shadow">
                    <Lock className="w-2.5 h-2.5" />
                    <span>LOCKED</span>
                  </div>
                </div>
              </div>

              {/* Role Info */}
              <div className="text-center mt-5 space-y-1.5">
                <p className="text-xs font-mono uppercase tracking-wider text-muted font-medium">
                  {role.wing}
                </p>
                <h3 className="text-lg font-bold text-text-primary font-display tracking-tight group-hover:text-primary-light transition-colors">
                  {role.role}
                </h3>
              </div>



              {/* Apply / Claim CTA Trigger on Hover */}
              <div className="mt-5 pt-3 text-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary-light hover:text-white transition-colors group/link"
                >
                  <UserPlus className="w-3.5 h-3.5 text-accent" />
                  <span>Think you fit this role? Apply Now</span>
                  <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Callout Banner */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-14 relative rounded-2xl bg-gradient-to-r from-primary/15 via-bg-card to-accent/15 border border-primary/30 p-8 text-center backdrop-blur-xl shadow-2xl space-y-4"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 text-primary-light mx-auto">
          <Sparkles className="w-6 h-6 text-accent" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-semibold text-text-primary font-display tracking-tight">
          Want to lead an AWS Builder Wing?
        </h3>
        <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Applications for core team members, wing leads, and student mentors are open. Register today and make your mark in the 2026 cohort!
        </p>
        <div className="pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_-5px_rgba(124,58,237,0.5)] hover:scale-[1.02] transition-all"
          >
            <span>Submit Core Team Application</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
