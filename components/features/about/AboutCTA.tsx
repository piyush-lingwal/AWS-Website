"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function AboutCTA() {
  return (
    <section
      id="about-cta"
      className="h-screen min-h-[660px] max-h-screen relative overflow-hidden bg-[#0B0A09] flex flex-col justify-center select-none"
    >
      {/* ── BACKGROUND AMBIENT GLOWS ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] rounded-full bg-[#FF9900]/12 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 -right-16 w-[420px] h-[420px] rounded-full bg-[#FF9900]/6 blur-[150px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 -left-16 w-[400px] h-[400px] rounded-full bg-[#FF9900]/8 blur-[140px]"
      />

      {/* ── MAIN CONTENT CONTAINER (Fits normal laptop height) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 h-full flex flex-col justify-center py-4 lg:py-6">
        {/* ── CENTERED CTA CARD WITH TOP-LEFT BADGE ── */}
        <div className="relative w-full max-w-xl sm:max-w-[640px] md:max-w-[700px] lg:max-w-[740px] mx-auto">
          {/* Top-Left Tilted Badge ("Let's build together!") */}
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.9, rotate: -5 }}
            whileInView={{
              opacity: 1,
              y: [-2, 2, -2],
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
            className="absolute -top-4 sm:-top-5 md:-top-6 -left-3 sm:-left-6 md:-left-8 z-30 group cursor-pointer px-4.5 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-2xl bg-[#120F0C]/95 backdrop-blur-md border-[2px] border-[#FF9900] shadow-[0_0_25px_rgba(255,153,0,0.35)] flex items-center justify-center transition-all select-none"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF9900]/12 via-transparent to-[#FF9900]/8 opacity-80 pointer-events-none" />
            <span className="relative z-10 font-bold text-xs sm:text-sm md:text-base text-white tracking-tight whitespace-nowrap">
              Let&apos;s build together!
            </span>
          </motion.div>

          {/* Card Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative rounded-[28px] sm:rounded-[32px] border border-[#FF9900]/35 bg-[#120F0C]/90 backdrop-blur-xl px-6 py-10 sm:px-12 sm:py-14 md:px-16 md:py-16 text-center shadow-[0_0_50px_rgba(255,153,0,0.12)] overflow-hidden"
          >
            {/* Top inner warm highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#FF9900]/10 via-[#FF9900]/4 to-transparent" />

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="relative z-10 font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[52px] leading-[1.06] tracking-tight text-white"
            >
              <span>Ready to </span>
              <span className="text-[#FF9900]">Build?</span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              className="relative z-10 text-white/70 text-xs sm:text-sm md:text-[15px] max-w-md sm:max-w-lg mx-auto font-normal leading-relaxed mt-3.5 sm:mt-4 md:mt-5"
            >
              Join a community where ideas become projects,
              <br className="hidden sm:inline" /> projects become portfolios, and
              portfolios become careers.
            </motion.p>

            {/* Register Button */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
              className="relative z-10 mt-7 sm:mt-8 md:mt-10 flex justify-center"
            >
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-[#FF9900] hover:bg-[#FFB84D] text-black font-extrabold text-xs sm:text-[13px] md:text-sm tracking-wider uppercase px-7 py-3 sm:px-8 sm:py-3.5 md:px-9 md:py-4 shadow-[0_0_30px_rgba(255,153,0,0.35)] hover:shadow-[0_0_45px_rgba(255,153,0,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer select-none"
              >
                <span>REGISTER NOW</span>
                <ArrowRight
                  size={16}
                  strokeWidth={2.5}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* ── BOTTOM-LEFT MASCOT: 07.png (Cheering with raised fists) ── */}
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-4 sm:left-8 md:left-14 lg:left-20 xl:left-28 z-20 flex flex-col items-center pointer-events-none">
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
            className="absolute -bottom-1 w-28 sm:w-32 md:w-36 lg:w-42 h-2.5 sm:h-3 rounded-full bg-black/90 blur-md pointer-events-none"
          />

          {/* Mascot 07.png animation */}
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
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
              src="/site-elements/about/07.png"
              alt="AWS Student Builder Group Cloud Mascot - Cheering Celebration"
              width={300}
              height={330}
              priority
              className="w-auto h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
