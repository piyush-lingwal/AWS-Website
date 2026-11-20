"use client";

import * as React from "react";
import { motion, useInView, animate } from "framer-motion";

type Stat = { label: string; value: number; suffix?: string };

const STATS: Stat[] = [
  { label: "Members", value: 50, suffix: "+" },
  { label: "Workshops", value: 15, suffix: "+" },
  { label: "Projects Built", value: 10, suffix: "+" },
  { label: "Hackathons", value: 5, suffix: "+" },
  { label: "Hours of Learning", value: 100, suffix: "+" },
];

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });

  React.useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        node.textContent = Math.round(latest).toString() + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix]);

  return <span ref={ref}>{`0${suffix}`}</span>;
}

export function AboutStats() {
  return (
    <section data-tone="bloom" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1240px] px-[var(--gutter)] py-24 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <p className="t-eyebrow">Community Impact</p>
          <h2 className="t-display mt-5 text-[clamp(34px,5vw,68px)] text-sbg-ink">
            Growing <span className="t-serif text-sbg-accent">together.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-[var(--line)]"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 px-4 py-8 sm:py-10"
            >
              <span className="t-display text-[clamp(40px,5vw,72px)] leading-[0.9] text-sbg-ink tabular-nums">
                <Counter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="t-eyebrow text-center">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}