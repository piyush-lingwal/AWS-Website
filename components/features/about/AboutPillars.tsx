"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FileText,
  CloudUpload,
  Users,
  FlaskConical,
  CheckCircle2,
  Compass,
} from "lucide-react";

const PILLARS = [
  {
    title: "Cloud Learning",
    description:
      "Hands-on workshops using real AWS services like EC2, Lambda, S3, DynamoDB, API Gateway, Amplify and Bedrock.",
    icon: FileText,
  },
  {
    title: "Build Projects",
    description:
      "Every member is encouraged to deploy actual cloud applications instead of only watching tutorials.",
    icon: CloudUpload,
  },
  {
    title: "Community",
    description:
      "Peer learning, mentorship, code reviews, study groups and collaborative building.",
    icon: Users,
  },
  {
    title: "Hackathons",
    description:
      "Participate in AWS GameDays, hackathons, build sprints and innovation challenges.",
    icon: FlaskConical,
  },
  {
    title: "Certifications",
    description:
      "Preparation sessions, study plans, practice exams, AWS Skill Builder resources and certification guidance.",
    icon: CheckCircle2,
  },
  {
    title: "Career Growth",
    description:
      "Networking with AWS professionals, industry mentors, alumni and student builders from around the world.",
    icon: Compass,
  },
];

export function AboutPillars() {
  // Reusable Pill Badge component ("Six pillars, one goal!")
  const BadgeComponent = (
    <motion.div
      initial={{ opacity: 0, y: -15, scale: 0.9, rotate: -5 }}
      whileInView={{
        opacity: 1,
        y: [-3, 3, -3],
        scale: 1,
        rotate: -5,
      }}
      viewport={{ once: true }}
      transition={{
        opacity: { duration: 0.6, delay: 0.35 },
        scale: { duration: 0.6, delay: 0.35 },
        rotate: { duration: 0.6, delay: 0.35 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{
        scale: 1.06,
        rotate: -3,
        boxShadow: "0 0 35px rgba(255, 153, 0, 0.55)",
        borderColor: "#FFB84D",
        transition: { duration: 0.2 },
      }}
      className="relative group cursor-pointer px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl bg-[#120F0C]/90 backdrop-blur-md border-[2px] border-[#FF9900] shadow-[0_0_25px_rgba(255,153,0,0.35)] flex items-center justify-center transition-all select-none"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF9900]/12 via-transparent to-[#FF9900]/8 opacity-80 pointer-events-none" />
      <span className="relative z-10 font-bold text-sm sm:text-base md:text-[17px] text-white tracking-tight whitespace-nowrap">
        Six pillars, one goal!
      </span>
    </motion.div>
  );

  // Reusable Mascot component (04.png clapping hands)
  const MascotComponent = (
    <div className="relative flex flex-col items-center">
      {/* Ground Shadow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.8, 0.45, 0.8],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-1 w-24 sm:w-28 md:w-32 lg:w-36 h-2.5 sm:h-3 rounded-full bg-black/90 blur-md pointer-events-none"
      />

      {/* Clapping Mascot Animation */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{
          opacity: 1,
          y: [0, -8, 0],
          scale: 1,
        }}
        viewport={{ once: true }}
        transition={{
          opacity: { duration: 0.7, delay: 0.3 },
          scale: { duration: 0.7, delay: 0.3 },
          y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
        }}
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.25 },
        }}
        className="relative z-10 cursor-pointer select-none origin-bottom"
      >
        <Image
          src="/site-elements/about/04.png"
          alt="AWS Student Builder Group Cloud Mascot - Clapping"
          width={280}
          height={310}
          priority
          className="w-auto h-36 sm:h-40 md:h-44 lg:h-52 xl:h-56 object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
        />
      </motion.div>
    </div>
  );

  return (
    <section
      id="about-pillars"
      className="h-screen min-h-[660px] max-h-screen relative overflow-hidden bg-[#0B0A09] flex flex-col justify-center select-none"
    >
      {/* ── BACKGROUND AMBIENT GLOWS ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 w-[480px] h-[360px] -translate-x-1/2 rounded-full bg-[#FF9900]/10 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-20 w-[420px] h-[420px] rounded-full bg-[#FF9900]/8 blur-[150px]"
      />

      {/* ── MAIN CONTENT CONTAINER (Fits normal laptop height) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 h-full flex flex-col justify-center py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 lg:gap-8 xl:gap-10">
          {/* ── LEFT COLUMN: Header + 3x2 Grid of Cards ── */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3.5 sm:mb-4 lg:mb-5">
              <div className="flex flex-col space-y-1 sm:space-y-1.5">
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
                    OUR PILLARS
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                  className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[40px] xl:text-[44px] leading-[1.08] tracking-tight text-white mt-0.5"
                >
                  <span>Built on six </span>
                  <span className="text-[#FF9900]">pillars.</span>
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
                  className="text-white/65 text-xs sm:text-sm md:text-[14px] max-w-xl font-normal leading-relaxed mt-1"
                >
                  Everything we do maps to these core areas — aligned with the official
                  AWS Student Builder Group program.
                </motion.p>
              </div>

              {/* Mobile / Tablet Pill Badge (on desktop, sits in right column) */}
              <div className="lg:hidden shrink-0 pt-1">
                {BadgeComponent}
              </div>
            </div>

            {/* 3x2 Grid of Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 lg:gap-4 items-stretch">
              {PILLARS.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.15 + idx * 0.05 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="group relative p-3.5 sm:p-4 lg:p-4.5 rounded-2xl bg-[#120F0C]/85 backdrop-blur-md border border-[#26201A] hover:border-[#FF9900]/50 hover:bg-[#1A1612]/95 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.35)] hover:shadow-[0_0_30px_rgba(255,153,0,0.14)] flex flex-col justify-start"
                  >
                    {/* Top inner subtle glow on hover */}
                    <div className="absolute inset-x-0 top-0 h-10 rounded-t-2xl bg-gradient-to-b from-[#FF9900]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Icon container */}
                    <div className="relative z-10 w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-[#171612] border border-[#FF9900]/30 text-[#FF9900] group-hover:border-[#FF9900]/60 group-hover:scale-105 transition-all">
                      <Icon size={18} strokeWidth={2} />
                    </div>

                    {/* Title */}
                    <h3 className="relative z-10 font-display font-bold text-white text-[15px] sm:text-[16px] lg:text-[17px] tracking-tight group-hover:text-[#FFB84D] transition-colors mt-2.5 mb-1">
                      {pillar.title}
                    </h3>

                    {/* Description */}
                    <p className="relative z-10 text-white/60 text-[11.5px] sm:text-[12px] lg:text-[12.5px] leading-relaxed font-normal">
                      {pillar.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Badge on Top, Mascot on Bottom (Desktop) ── */}
          <div className="hidden lg:flex w-60 xl:w-68 flex-col justify-between items-center shrink-0 pt-1 pb-1 pr-3 xl:pr-6">
            {/* Top: Pill Badge ("Six pillars, one goal!") */}
            <div className="w-full flex justify-center">
              {BadgeComponent}
            </div>

            {/* Bottom: Mascot 04.png clapping */}
            <div className="w-full flex justify-center">
              {MascotComponent}
            </div>
          </div>
        </div>

        {/* Mascot on mobile / tablet */}
        <div className="lg:hidden mt-4 flex justify-center">
          {MascotComponent}
        </div>
      </div>
    </section>
  );
}
