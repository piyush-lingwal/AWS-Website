"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const COMPARISONS = [
  { traditional: "Theory", sbg: "Hands-on Projects" },
  { traditional: "Classroom Assignments", sbg: "Production Applications" },
  { traditional: "Individual Learning", sbg: "Community Building" },
  { traditional: "Exams", sbg: "Certifications" },
  { traditional: "Local Network", sbg: "Global AWS Network" },
  { traditional: "Tutorials", sbg: "Real Deployments" },
];

export function AboutComparison() {
  return (
    <section
      id="about-comparison"
      className="relative w-full h-screen min-h-[660px] max-h-screen bg-[#0B0A09] text-white overflow-hidden flex items-center select-none"
    >
      {/* ── AMBIENT WARM GLOWS ── */}
      {/* Top Ambient Glow */}
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

      {/* Top-Right Ambient Glow behind badge */}
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
        className="pointer-events-none absolute top-10 right-16 lg:right-36 w-[360px] sm:w-[460px] h-[360px] sm:h-[460px] rounded-full bg-gradient-to-br from-[#FF9900]/24 via-[#FFB84D]/10 to-transparent blur-[110px] z-0"
      />

      {/* Subtle depth vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)] z-0"
      />

      {/* ── MAIN CONTENT CONTAINER (Fits normal laptop height) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 h-full flex flex-col justify-center lg:pt-4 pb-6 lg:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-10 items-center w-full">
          {/* ═════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: Header + Comparison Card                   */}
          {/* ═════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3.5 sm:space-y-4 max-w-xl lg:max-w-[540px]">
            {/* Category / Eyebrow */}
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
                WHY SBG?
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[50px] leading-[1.08] tracking-tight text-white"
            >
              <span>What makes us </span>
              <span className="text-[#FF9900]">different.</span>
            </motion.h2>

            {/* Comparison Glass Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              className="w-full rounded-2xl border border-[#FF9900]/30 bg-[#120F0C]/85 backdrop-blur-md shadow-[0_0_35px_rgba(255,153,0,0.07)] overflow-hidden"
            >
              {/* Header row */}
              <div className="grid grid-cols-[1fr_auto_1.2fr] items-center gap-3 sm:gap-4 border-b border-white/[0.08] bg-white/[0.015] px-5 py-3 sm:px-7 sm:py-3.5">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white/50">
                  TRADITIONAL LEARNING
                </span>
                <span className="text-[#FF9900]/60 text-xs sm:text-sm">→</span>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#FF9900] text-right">
                  AWS STUDENT BUILDER GROUP
                </span>
              </div>

              {/* Comparison Rows */}
              <div className="divide-y divide-white/[0.06]">
                {COMPARISONS.map((row, i) => (
                  <motion.div
                    key={row.traditional}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.3 + i * 0.06 }}
                    className="grid grid-cols-[1fr_auto_1.2fr] items-center gap-3 sm:gap-4 px-5 py-2.5 sm:px-7 sm:py-3 transition-colors hover:bg-white/[0.025]"
                  >
                    {/* Traditional side */}
                    <span className="text-[13px] sm:text-[14.5px] text-white/60 font-medium">
                      {row.traditional}
                    </span>

                    {/* Arrow */}
                    <span className="text-[#FF9900]/70 text-xs sm:text-sm font-light select-none">
                      →
                    </span>

                    {/* SBG side */}
                    <span className="text-[13px] sm:text-[14.5px] font-bold text-white text-right">
                      {row.sbg}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: Spacing alignment                          */}
          {/* ═════════════════════════════════════════════════════════ */}
          <div className="hidden lg:block lg:col-span-5" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BOTTOM-RIGHT CLUSTER: Mascot (02.png) + "Hands-on wins!" Badge */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute bottom-0 right-6 sm:right-10 md:right-14 lg:right-16 xl:right-24 z-20 flex items-end gap-4 sm:gap-6 pointer-events-none">
        {/* "Hands-on wins!" Tilted Pill Badge (Aligned to top of cluster with spacing on left) */}
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
          className="pointer-events-auto self-start relative group cursor-pointer mt-2 sm:mt-4 ml-6 sm:ml-8 lg:ml-10 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#120F0C]/90 backdrop-blur-md border-[1.8px] border-[#FF9900] shadow-[0_0_24px_rgba(255,153,0,0.32)] flex items-center justify-center transition-all select-none"
        >
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#FF9900]/12 via-transparent to-[#FF9900]/8 opacity-70 pointer-events-none" />
          <span className="relative z-10 font-bold text-sm sm:text-base md:text-lg text-white tracking-tight whitespace-nowrap">
            Hands-on wins!
          </span>
        </motion.div>

        {/* AWS Builder Cloud Mascot (02.png - Clasped Hands) */}
        <div className="pointer-events-auto relative flex flex-col items-center">
          {/* Ground Floor Shadow */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.75, 0.45, 0.75],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 w-32 sm:w-40 md:w-44 lg:w-48 h-3.5 sm:h-4 rounded-full bg-black/90 blur-md pointer-events-none"
          />

          {/* Mascot with Floating / Breathing Animation */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{
              opacity: 1,
              y: [0, -8, 0],
              scale: 1,
              rotate: [-0.6, 0.6, -0.6],
            }}
            viewport={{ once: true }}
            transition={{
              opacity: { duration: 0.7, delay: 0.3 },
              scale: { duration: 0.7, delay: 0.3 },
              y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
            }}
            whileHover={{
              scale: 1.05,
              rotate: 0,
              transition: { duration: 0.25 },
            }}
            className="relative z-10 cursor-pointer select-none origin-bottom"
          >
            <Image
              src="/site-elements/about/02.png"
              alt="AWS Student Builder Group Cloud Mascot - Hands Clapped"
              width={400}
              height={430}
              priority
              className="w-auto h-44 sm:h-52 md:h-56 lg:h-64 xl:h-72 object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
