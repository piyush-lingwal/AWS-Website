"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function About() {
  // Mouse parallax motion values for subtle 3D tilt on desktop/laptop
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    damping: 24,
    stiffness: 180,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    damping: 24,
    stiffness: 180,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const missionWords = [
    { text: "Learn.", isOrange: true },
    { text: "Build.", isOrange: false },
    { text: "Share.", isOrange: true },
    { text: "Grow.", isOrange: false },
  ];

  return (
    <section
      id="about"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen min-h-[660px] max-h-screen bg-[#0B0A09] text-white overflow-hidden flex items-center select-none"
    >
      {/* ── AMBIENT WARM GLOWS ── */}
      {/* Top Left Warm Amber/Orange Ambient Glow */}
      <motion.div
        aria-hidden="true"
        animate={{
          opacity: [0.35, 0.55, 0.35],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-24 -left-24 w-[420px] sm:w-[520px] h-[420px] sm:h-[520px] rounded-full bg-gradient-to-br from-[#FF9900]/22 via-[#E88B00]/10 to-transparent blur-[120px] z-0"
      />

      {/* Top Right Ambient Glow behind Circular Emblem */}
      <motion.div
        aria-hidden="true"
        animate={{
          opacity: [0.45, 0.7, 0.45],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute top-14 right-10 lg:right-32 w-[340px] sm:w-[440px] h-[340px] sm:h-[440px] rounded-full bg-gradient-to-br from-[#FF9900]/28 via-[#FFB84D]/12 to-transparent blur-[110px] z-0"
      />

      {/* Subtle depth vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)] z-0"
      />

      {/* ── MAIN CONTENT CONTAINER (Fits normal laptop height) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 h-full flex flex-col justify-center lg:pt-4 pb-6 lg:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center w-full">
          {/* ═════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: Copy & Mission                             */}
          {/* ═════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3.5 sm:space-y-4 lg:space-y-3.5 xl:space-y-4 max-w-2xl">
            {/* Category / Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center gap-3"
            >
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: 26 }}
                transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
                className="h-[2px] bg-[#FF9900] inline-block rounded-full"
              />
              <span className="text-[#FF9900] text-xs sm:text-sm font-bold tracking-[0.22em] uppercase">
                WHO WE ARE
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[42px] xl:text-[50px] leading-[1.08] tracking-tight text-white"
            >
              <span>We don&apos;t just learn the</span>
              <br />
              <span>cloud.</span>
              <br />
              <motion.span
                animate={{
                  textShadow: [
                    "0 0 20px rgba(255,153,0,0.3)",
                    "0 0 38px rgba(255,153,0,0.6)",
                    "0 0 20px rgba(255,153,0,0.3)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-[#FF9900]"
              >
                We build on it.
              </motion.span>
            </motion.h1>

            {/* Paragraphs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.3, ease: "easeOut" }}
              className="space-y-2.5 sm:space-y-3 text-white/75 text-sm sm:text-[14.5px] lg:text-[13.5px] xl:text-[15px] leading-relaxed max-w-xl font-normal"
            >
              <p>
                AWS Student Builder Group at Tulas University is a student-led community where
                aspiring developers, cloud engineers, AI enthusiasts, and builders come together
                to learn by building.
              </p>
              <p>
                Instead of only attending sessions, members create real-world applications, deploy
                production-ready projects on AWS, contribute to open-source, prepare for
                certifications, participate in hackathons, and collaborate with builders across the
                global AWS community.
              </p>
              <p>
                Supported by{" "}
                <a
                  href="https://builder.aws.com/content/3C075iQJeEx03mnzHwmXO9zdgEG/aws-student-builder-groups"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF9900] font-medium hover:underline underline-offset-4 transition-colors"
                >
                  AWS Builder Center
                </a>
                , our mission is simple:
              </p>
            </motion.div>

            {/* Punchline: Learn. Build. Share. Grow. */}
            <div className="pt-1.5 sm:pt-2">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="text-2xl sm:text-3xl lg:text-[30px] xl:text-[36px] font-black tracking-tight flex flex-wrap items-center gap-2 sm:gap-2.5"
              >
                {missionWords.map((word, idx) => (
                  <motion.span
                    key={word.text}
                    initial={{ opacity: 0, y: 12, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.55 + idx * 0.1,
                      type: "spring",
                      stiffness: 320,
                      damping: 18,
                    }}
                    whileHover={{
                      scale: 1.1,
                      y: -2,
                      transition: { duration: 0.2 },
                    }}
                    className={`inline-block cursor-default transition-all ${
                      word.isOrange
                        ? "text-[#FF9900] drop-shadow-[0_0_24px_rgba(255,153,0,0.45)]"
                        : "text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.3)]"
                    }`}
                  >
                    {word.text}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: SBG Logo (Top Area)                        */}
          {/* ═════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 relative h-full flex flex-col justify-start items-center pt-6 sm:pt-8 lg:pt-10">
            {/* ── TOP: Glowing SBG Logo (Same size as previous emblem square) ── */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative flex items-center justify-center lg:mr-4 xl:mr-8"
            >
              {/* Outer Pulsing Glow Aura */}
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 -m-6 rounded-full bg-gradient-to-tr from-[#FF9900]/35 via-[#FFB84D]/20 to-transparent blur-2xl pointer-events-none"
              />

              {/* SBG Logo Image (Same size as emblem square) */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0, rotate: -6 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotate: 0,
                  y: [0, -6, 0],
                }}
                transition={{
                  scale: { duration: 0.8, delay: 0.3, type: "spring", stiffness: 200, damping: 18 },
                  opacity: { duration: 0.6, delay: 0.3 },
                  rotate: { duration: 0.8, delay: 0.3 },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                }}
                whileHover={{
                  scale: 1.08,
                  filter: "drop-shadow(0 0 45px rgba(255,153,0,0.65))",
                  transition: { duration: 0.25 },
                }}
                className="relative z-10 w-36 h-36 sm:w-42 sm:h-42 md:w-44 md:h-44 lg:w-48 lg:h-48 xl:w-52 xl:h-52 flex items-center justify-center cursor-pointer select-none"
              >
                <Image
                  src="/logos/SBG_logo.png"
                  alt="SBG Logo"
                  width={220}
                  height={220}
                  priority
                  className="w-full h-full object-contain drop-shadow-[0_0_35px_rgba(255,153,0,0.45)]"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BOTTOM CLUSTER: Mascot (Half Height, Grounded) + Badge         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute bottom-0 right-6 sm:right-10 md:right-14 lg:right-16 xl:right-24 z-20 flex items-end gap-4 sm:gap-6 pointer-events-none">
        {/* "Learn by building!" Reverted Clean Pill Badge */}
        <motion.div
          initial={{ opacity: 0, x: -15, scale: 0.9, rotate: -5 }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            rotate: -5,
            y: [-3, 3, -3],
          }}
          transition={{
            opacity: { duration: 0.6, delay: 0.5 },
            x: { duration: 0.65, delay: 0.5, type: "spring", stiffness: 220, damping: 20 },
            scale: { duration: 0.6, delay: 0.5 },
            rotate: { duration: 0.6, delay: 0.5 },
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
            Learn by building!
          </span>
        </motion.div>

        {/* AWS Builder Cloud Mascot (01.png) - Half Height, Grounded at bottom */}
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
            animate={{
              opacity: 1,
              y: [0, -8, 0],
              scale: 1,
              rotate: [-0.6, 0.6, -0.6],
            }}
            transition={{
              opacity: { duration: 0.7, delay: 0.35 },
              scale: { duration: 0.7, delay: 0.35 },
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
              src="/site-elements/about/01.png"
              alt="AWS Student Builder Group Cloud Mascot"
              width={400}
              height={386}
              priority
              className="w-auto h-44 sm:h-52 md:h-56 lg:h-64 xl:h-72 object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
