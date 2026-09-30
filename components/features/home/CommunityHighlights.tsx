"use client";

import * as React from "react";
import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion";
import type { Variants } from "framer-motion";

const STATS = [
  { value: 500, suffix: "+", label: "Students Connected" },
  { value: 35, suffix: "+", label: "Events Organized" },
  { value: 20, suffix: "+", label: "Projects Built" },
  { value: 1000, suffix: "+", label: "Learning Hours Shared" },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });

  React.useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, target, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString();
      },
    });
    return controls.stop;
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      0
    </span>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export function CommunityHighlights() {
  const ref = React.useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section ref={ref} id="community-highlights" className="bg-grid bg-noise relative overflow-hidden bg-bg border-t border-border">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-primary/6 blur-[160px]" />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Community Impact</p>
          <h2 className="mt-4 font-display text-[28px] sm:text-[34px] md:text-[42px] font-semibold leading-[1.1] tracking-tight text-text-primary">
            Growing{" "}
            <span className="text-gradient">Together</span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={item}
              className="relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-bg-card/60 p-6 sm:p-8 text-center"
            >
              {/* Subtle vertical divider between cols on large screens */}
              {i > 0 && (
                <div className="hidden lg:block absolute left-0 top-1/4 h-1/2 w-px bg-border" />
              )}
              <div className="font-display text-[36px] sm:text-[48px] font-bold tracking-tight text-gradient leading-none">
                <CountUp target={stat.value} suffix={stat.suffix} />
                <span>{stat.suffix}</span>
              </div>
              <p className="text-[13px] sm:text-[14px] font-medium text-text-secondary mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
