"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CirclePlus } from "@/components/ui/animate-ui/icons/circle-plus";
import { Layers } from "@/components/ui/animate-ui/icons/layers";
import { Hammer } from "@/components/ui/animate-ui/icons/hammer";
import { Blocks } from "@/components/ui/animate-ui/icons/blocks";
import { PartyPopper } from "@/components/ui/animate-ui/icons/party-popper";
import { BadgeCheck } from "@/components/ui/animate-ui/icons/badge-check";
import { Star } from "@/components/ui/animate-ui/icons/star";
import { LayoutDashboard } from "@/components/ui/animate-ui/icons/layout-dashboard";

const PHASES = [
  {
    phase: "PHASE 01",
    title: "Join SBG",
    description: "Become part of the builder community.",
    icon: CirclePlus,
    gridClass: "lg:col-start-1 lg:row-start-1",
  },
  {
    phase: "PHASE 02",
    title: "AWS Fundamentals",
    description: "Core services, IAM, cloud concepts.",
    icon: Layers,
    gridClass: "lg:col-start-2 lg:row-start-1",
  },
  {
    phase: "PHASE 03",
    title: "Hands-on Workshops",
    description: "Build in live sandbox environments.",
    icon: Hammer,
    gridClass: "lg:col-start-3 lg:row-start-1",
  },
  {
    phase: "PHASE 04",
    title: "Cloud Projects",
    description: "Deploy real applications on AWS.",
    icon: Blocks,
    gridClass: "lg:col-start-3 lg:row-start-2",
  },
  {
    phase: "PHASE 05",
    title: "Hackathons",
    description: "Compete, build fast, win prizes.",
    icon: PartyPopper,
    gridClass: "lg:col-start-2 lg:row-start-2",
  },
  {
    phase: "PHASE 06",
    title: "AWS Certifications",
    description: "Earn industry-recognized credentials.",
    icon: BadgeCheck,
    gridClass: "lg:col-start-1 lg:row-start-2",
  },
  {
    phase: "PHASE 07",
    title: "Leadership",
    description: "Mentor, organize, and lead initiatives.",
    icon: Star,
    gridClass: "lg:col-start-1 lg:row-start-3",
  },
  {
    phase: "PHASE 08",
    title: "Internships & Careers",
    description: "Launch your cloud career.",
    icon: LayoutDashboard,
    gridClass: "lg:col-start-2 lg:row-start-3",
  },
];

export function AboutTimeline() {
  return (
    <section
      id="about-journey"
      className="relative w-full h-screen min-h-[660px] max-h-screen bg-[#0B0A09] text-white overflow-hidden flex items-center select-none"
    >
      {/* ── AMBIENT WARM GLOWS ── */}
      <motion.div
        aria-hidden="true"
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-24 left-1/4 w-[480px] sm:w-[580px] h-[480px] sm:h-[580px] rounded-full bg-gradient-to-br from-[#FF9900]/20 via-[#E88B00]/8 to-transparent blur-[130px] z-0"
      />

      <motion.div
        aria-hidden="true"
        animate={{
          opacity: [0.35, 0.6, 0.35],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute bottom-10 right-10 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] rounded-full bg-gradient-to-br from-[#FF9900]/24 via-[#FFB84D]/10 to-transparent blur-[110px] z-0"
      />

      {/* Subtle depth vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)] z-0"
      />

      {/* ── MAIN CONTENT CONTAINER (Fits normal laptop height) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 h-full flex flex-col justify-center lg:pt-4 pb-6 lg:pb-0">
        {/* ── HEADER ── */}
        <div className="flex flex-col space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: 26 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
              className="h-[2px] bg-[#FF9900] inline-block rounded-full"
            />
            <span className="text-[#FF9900] text-xs sm:text-sm font-bold tracking-[0.22em] uppercase">
              YOUR JOURNEY
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[42px] xl:text-[48px] leading-[1.08] tracking-tight text-white"
          >
            <span>The builder </span>
            <span className="text-[#FF9900]">journey.</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            className="text-white/65 text-xs sm:text-sm md:text-[14.5px] max-w-2xl font-normal leading-relaxed"
          >
            From day one to career launch — here&apos;s the path every builder walks in a serpentine flow.
          </motion.p>
        </div>

        {/* ── 3-COLUMN SERPENTINE GRID (Compact, perfectly proportioned cards) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-4 items-start w-full max-w-4xl lg:max-w-[940px] xl:max-w-[960px]">
          {PHASES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.15 + idx * 0.05 }}
                className={`${item.gridClass} group relative p-3.5 sm:p-4 rounded-[18px] sm:rounded-2xl bg-[#120F0C]/85 backdrop-blur-md border border-[#FF9900]/30 hover:border-[#FF9900]/60 transition-all duration-300 shadow-[0_0_20px_rgba(255,153,0,0.03)] hover:shadow-[0_0_30px_rgba(255,153,0,0.12)] flex flex-col justify-start w-full max-w-[305px]`}
              >
                {/* Top card row: Phase Pill + Icon */}
                <div className="flex items-center justify-between">
                  <span className="border border-[#FF9900]/45 text-[#FF9900] text-[9.5px] sm:text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase">
                    {item.phase}
                  </span>
                  <span className="text-[#FF9900] opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <Icon size={16} />
                  </span>
                </div>

                {/* Card Title & Description */}
                <div className="mt-2.5 sm:mt-3">
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-white group-hover:text-[#FFB84D] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[12px] sm:text-[12.5px] text-white/60 mt-1 leading-normal font-normal">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BOTTOM-RIGHT OVERLAY: Mascot (Compact) + Badge beside 08        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 right-3 sm:right-5 md:right-7 lg:right-8 xl:right-12 z-20 flex items-center gap-2 sm:gap-3 md:gap-3.5 pointer-events-none">
        {/* "Your path starts here!" Tilted Pill Badge (Compact & Shifted Right) */}
        <motion.div
          initial={{ opacity: 0, x: -15, scale: 0.9, rotate: -5 }}
          whileInView={{
            opacity: 1,
            x: 0,
            scale: 1,
            rotate: -5,
            y: [-3, 3, -3],
          }}
          viewport={{ once: true }}
          transition={{
            opacity: { duration: 0.6, delay: 0.4 },
            x: { duration: 0.65, delay: 0.4, type: "spring", stiffness: 220, damping: 20 },
            scale: { duration: 0.6, delay: 0.4 },
            rotate: { duration: 0.6, delay: 0.4 },
            y: { duration: 3.8, repeat: Infinity, ease: "easeInOut" },
          }}
          whileHover={{
            scale: 1.06,
            rotate: -3,
            boxShadow: "0 0 35px rgba(255, 153, 0, 0.55)",
            borderColor: "#FFB84D",
            transition: { duration: 0.2 },
          }}
          className="pointer-events-auto relative group cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 md:px-4.5 md:py-2.5 rounded-xl bg-[#120F0C]/90 backdrop-blur-md border-[1.6px] border-[#FF9900] shadow-[0_0_20px_rgba(255,153,0,0.3)] flex items-center justify-center transition-all select-none"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF9900]/12 via-transparent to-[#FF9900]/8 opacity-70 pointer-events-none" />
          <span className="relative z-10 font-bold text-xs sm:text-[13px] md:text-sm text-white tracking-tight whitespace-nowrap">
            Your path starts here!
          </span>
        </motion.div>

        {/* AWS Builder Cloud Mascot (03.png - Compact size & shifted right) */}
        <div className="pointer-events-auto relative flex flex-col items-center">
          {/* Ground Shadow */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.75, 0.4, 0.75],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-1 w-24 sm:w-28 md:w-32 lg:w-36 h-2.5 sm:h-3 rounded-full bg-black/90 blur-md pointer-events-none"
          />

          {/* Jumping Mascot Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{
              opacity: 1,
              y: [0, -10, 0],
              scale: 1,
              rotate: [-1, 1.5, -1],
            }}
            viewport={{ once: true }}
            transition={{
              opacity: { duration: 0.7, delay: 0.3 },
              scale: { duration: 0.7, delay: 0.3 },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            whileHover={{
              scale: 1.05,
              rotate: 0,
              transition: { duration: 0.25 },
            }}
            className="relative z-10 cursor-pointer select-none origin-bottom"
          >
            <Image
              src="/site-elements/about/03.png"
              alt="AWS Student Builder Group Cloud Mascot - Jumping Celebration"
              width={340}
              height={340}
              priority
              className="w-auto h-36 sm:h-40 md:h-44 lg:h-52 xl:h-56 object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
