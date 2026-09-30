"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import type { Variants } from "framer-motion";

const CLOUD_SERVICES = [
  { label: "AI" },
  { label: "Web Apps" },
  { label: "Storage" },
  { label: "Databases" },
  { label: "Serverless" },
  { label: "Analytics" },
  { label: "Security" },
];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

// Calculate positions for nodes in a circle matching ecosystem graph layout
const getNodePosition = (index: number, total: number) => {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const radius = 38; // % from center for perfect breathing room
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);
  return { x, y };
};

export function WhyCloudMatters() {
  const ref = React.useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      ref={ref}
      id="why-cloud"
      className="bg-grid bg-noise relative overflow-hidden bg-bg border-t border-border"
    >
      {/* Background ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]"
      />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 py-20 md:py-28 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left Column — Content ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
          >
            <motion.p variants={itemVariants} className="text-[11px] uppercase tracking-[0.16em] text-muted">
              Future of Technology
            </motion.p>
            <motion.h2
              variants={itemVariants}
              className="mt-4 font-display text-[28px] sm:text-[34px] md:text-[42px] font-semibold leading-[1.1] tracking-tight text-text-primary"
            >
              Every Great Idea Needs a{" "}
              <span className="text-gradient">Powerful Cloud</span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-5 text-[15px] sm:text-[16px] leading-relaxed text-text-secondary max-w-md"
            >
              Behind every modern app, AI assistant, streaming platform, and global business is cloud technology. AWS powers millions of applications worldwide — making it easier to build, deploy, and scale ideas of any size.
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-text-secondary max-w-md"
            >
              Whether you&apos;re creating your first portfolio website or developing the next big startup, learning cloud opens doors to endless possibilities.
            </motion.p>
          </motion.div>

          {/* ── Right Column — Ecosystem Graph Structure ── */}
          <div className="relative flex items-center justify-center w-full">
            <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[460px] lg:max-w-[500px] aspect-square">
              {/* SVG gradient lines connecting center to nodes */}
              <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100">
                {CLOUD_SERVICES.map((_, i) => {
                  const pos = getNodePosition(i, CLOUD_SERVICES.length);
                  return (
                    <line
                      key={`line-${i}`}
                      x1="50"
                      y1="50"
                      x2={pos.x}
                      y2={pos.y}
                      stroke="url(#cloudLineGrad)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
                <defs>
                  <linearGradient id="cloudLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#C084FC" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center AWS node with glowing border and ping ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, ease: "backOut" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-full border-2 border-primary/60 bg-surface/90 shadow-[0_0_50px_rgba(124,58,237,0.5)] p-3 backdrop-blur-xl"
              >
                <div className="pointer-events-none absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-25" />
                <Image
                  src="/logos/AWS_logo.svg"
                  alt="AWS Logo"
                  width={80}
                  height={50}
                  className="h-8 sm:h-12 w-auto object-contain text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                />
              </motion.div>

              {/* Outer Service Nodes */}
              {CLOUD_SERVICES.map((svc, i) => {
                const pos = getNodePosition(i, CLOUD_SERVICES.length);
                return (
                  <motion.div
                    key={svc.label}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: i * 0.08 + 0.3, duration: 0.5, ease: "backOut" }}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                    }}
                  >
                    <div className="flex items-center justify-center rounded-full border border-white/10 bg-surface/90 px-3.5 py-1.5 sm:px-4.5 sm:py-2.5 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:border-primary/60 group-hover:bg-primary/10 group-hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] group-hover:scale-105 cursor-pointer">
                      <span className="text-[11px] sm:text-[13px] font-semibold text-text-secondary group-hover:text-text-primary whitespace-nowrap transition-colors">
                        {svc.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
