"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const ECOSYSTEM_NODES = [
  {
    name: "Artificial Intelligence",
    svgX: 400,
    svgY: 38,
    pctX: 50,
    pctY: 7.6,
    link: "https://aws.amazon.com/ai/",
  },
  {
    name: "Skill Builder",
    svgX: 610,
    svgY: 95,
    pctX: 76.25,
    pctY: 19.0,
    link: "https://explore.skillbuilder.aws/",
  },
  {
    name: "AWS Educate",
    svgX: 650,
    svgY: 250,
    pctX: 81.25,
    pctY: 50,
    link: "https://aws.amazon.com/education/awseducate/",
  },
  {
    name: "Community Builders",
    svgX: 610,
    svgY: 405,
    pctX: 76.25,
    pctY: 81.0,
    link: "https://aws.amazon.com/developer/community/community-builders/",
  },
  {
    name: "Student Builder Groups",
    svgX: 400,
    svgY: 462,
    pctX: 50,
    pctY: 92.4,
    link: "https://builder.aws.com/content/3C075iQJeEx03mnzHwmXO9zdgEG/aws-student-builder-groups",
  },
  {
    name: "AWS Events",
    svgX: 190,
    svgY: 405,
    pctX: 23.75,
    pctY: 81.0,
    link: "https://aws.amazon.com/events/",
  },
  {
    name: "Certification",
    svgX: 150,
    svgY: 250,
    pctX: 18.75,
    pctY: 50,
    link: "https://aws.amazon.com/certification/",
  },
  {
    name: "Cloud",
    svgX: 190,
    svgY: 95,
    pctX: 23.75,
    pctY: 19.0,
    link: "https://aws.amazon.com/what-is-aws/",
  },
];

export function AboutEcosystem() {
  return (
    <section
      id="about-ecosystem"
      className="h-screen min-h-[660px] max-h-screen relative overflow-hidden bg-[#0B0A09] flex flex-col justify-center select-none"
    >
      {/* ── BACKGROUND AMBIENT GLOWS ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 w-[480px] h-[360px] -translate-x-1/2 rounded-full bg-[#FF9900]/10 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 -right-16 w-[450px] h-[450px] rounded-full bg-[#FF9900]/8 blur-[150px]"
      />

      {/* ── MAIN CONTENT CONTAINER (Fits normal laptop height) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 h-full flex flex-col justify-center py-2 sm:py-3 lg:py-4">
        {/* ── HEADER ROW: Left-Aligned Heading/Subheading + Top-Right Tilted Badge ── */}
        <div className="flex items-start justify-between gap-4 mb-2 sm:mb-3 lg:mb-4">
          <div className="flex flex-col space-y-1">
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
                THE ECOSYSTEM
              </span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[38px] xl:text-[42px] leading-[1.08] tracking-tight text-white mt-0.5"
            >
              <span>Part of the AWS </span>
              <span className="text-[#FF9900]">ecosystem.</span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              className="text-white/65 text-xs sm:text-sm md:text-[13.5px] max-w-xl font-normal leading-relaxed mt-0.5"
            >
              We&apos;re connected to a vast network of AWS programs, resources, and communities.
            </motion.p>
          </div>

          {/* Top-Right Tilted Badge ("Connected worldwide!") */}
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
            className="relative group cursor-pointer px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl bg-[#120F0C]/90 backdrop-blur-md border-[2px] border-[#FF9900] shadow-[0_0_25px_rgba(255,153,0,0.35)] flex items-center justify-center transition-all select-none shrink-0"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF9900]/12 via-transparent to-[#FF9900]/8 opacity-80 pointer-events-none" />
            <span className="relative z-10 font-bold text-sm sm:text-base md:text-[17px] text-white tracking-tight whitespace-nowrap">
              Connected worldwide!
            </span>
          </motion.div>
        </div>

        {/* ── RADIAL NETWORK DIAGRAM CONTAINER (Increased Y-axis height) ── */}
        <div className="relative w-full max-w-[760px] sm:max-w-[800px] lg:max-w-[820px] h-[380px] sm:h-[440px] lg:h-[480px] mx-auto flex items-center justify-center">
          {/* SVG Connecting Lines (Clean 800x500 coordinate space) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 800 500"
          >
            {ECOSYSTEM_NODES.map((node, i) => (
              <motion.line
                key={`line-${node.name}`}
                x1="400"
                y1="250"
                x2={node.svgX}
                y2={node.svgY}
                stroke="#FF9900"
                strokeWidth="1.8"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.95 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.65,
                  delay: 0.15 + i * 0.04,
                  ease: "easeOut",
                }}
                className="drop-shadow-[0_0_6px_rgba(255,153,0,0.45)]"
              />
            ))}
          </svg>

          {/* Center AWS Node (Isolated wrapper prevents Tailwind translate override) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                type: "spring",
                stiffness: 240,
                damping: 18,
              }}
              whileHover={{
                scale: 1.08,
                boxShadow: "0 0 45px rgba(255, 153, 0, 0.6)",
                transition: { duration: 0.2 },
              }}
              className="flex h-20 w-20 sm:h-22 sm:w-22 md:h-24 md:w-24 items-center justify-center rounded-full border-[2.2px] border-[#FF9900] bg-[#120F0C] shadow-[0_0_35px_rgba(255,153,0,0.38)] p-3 cursor-pointer select-none group"
            >
              {/* Ambient inner pulse ring */}
              <div className="pointer-events-none absolute inset-0 rounded-full border border-[#FF9900]/30 animate-ping opacity-25" />
              <Image
                src="/logos/AWS_logo.svg"
                alt="AWS Logo"
                width={72}
                height={46}
                className="h-7 sm:h-8 md:h-9 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform"
              />
            </motion.div>
          </div>

          {/* 8 Outer Pill Nodes (Isolated wrapper ensures 100% accurate node-to-line alignment) */}
          {ECOSYSTEM_NODES.map((node, i) => (
            <div
              key={node.name}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
              style={{
                left: `${node.pctX}%`,
                top: `${node.pctY}%`,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: 0.3 + i * 0.05,
                  type: "spring",
                  stiffness: 220,
                  damping: 18,
                }}
                whileHover={{
                  scale: 1.08,
                  transition: { duration: 0.2 },
                }}
                className="group cursor-pointer select-none"
              >
                <a
                  href={node.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-full border-[1.8px] border-[#FF9900] bg-[#120F0C] px-3.5 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 shadow-[0_0_16px_rgba(255,153,0,0.25)] transition-all group-hover:border-[#FFB84D] group-hover:shadow-[0_0_28px_rgba(255,153,0,0.55)] group-hover:bg-[#1A1612]"
                >
                  <span className="text-[11.5px] sm:text-[12.5px] md:text-[13px] font-semibold text-white group-hover:text-[#FFB84D] whitespace-nowrap transition-colors tracking-tight">
                    {node.name}
                  </span>
                </a>
              </motion.div>
            </div>
          ))}
        </div>

        {/* ── BOTTOM-RIGHT MASCOT: 05.png (Welcoming Open Arms) ── */}
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 right-4 sm:right-6 md:right-8 lg:right-12 xl:right-16 z-20 flex flex-col items-center pointer-events-none">
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

          {/* Welcoming Mascot Animation */}
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
            className="pointer-events-auto relative z-10 cursor-pointer select-none origin-bottom"
          >
            <Image
              src="/site-elements/about/05.png"
              alt="AWS Student Builder Group Cloud Mascot - Welcoming"
              width={280}
              height={310}
              priority
              className="w-auto h-36 sm:h-40 md:h-44 lg:h-50 xl:h-54 object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
