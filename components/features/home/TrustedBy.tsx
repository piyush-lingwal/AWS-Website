"use client";

import * as React from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

/* ─── Marquee logos ──────────────────────────────────────────────────────── */
const ROW_1 = [
  { name: "Meetup", src: "/logos/logo-meetup.svg", height: 26 },
  { name: "Slack",  src: "/logos/logo-slack.svg",  height: 22 },
  { name: "Credly", src: "/logos/logo-credly.svg", height: 42 },
  { name: "Box",    src: "/logos/logo-box.svg",    height: 24 },
];
const ROW_2 = [...ROW_1].reverse();

/* ─── Stats ──────────────────────────────────────────────────────────────── */
const STATS = [
  { value: 50, suffix: "+", label: "Members" },
  { value: 20, suffix: "+", label: "Events held" },
  { value: 6,  suffix: "",  label: "Active wings" },
];

/* ─── Animated counter ───────────────────────────────────────────────────── */
function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (inView) motionVal.set(to);
  }, [inView, to, motionVal]);

  React.useEffect(() =>
    spring.on("change", (v) => setDisplay(Math.round(v))),
    [spring]
  );

  return (
    <span ref={ref} className="tabular-nums">
      {display}{suffix}
    </span>
  );
}

/* ─── Logo pill ──────────────────────────────────────────────────────────── */
function LogoPill({ logo }: { logo: (typeof ROW_1)[number] }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <li
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="shrink-0 mx-3 flex items-center justify-center rounded-2xl border px-7 py-4 transition-all duration-300 cursor-default"
      style={{
        borderColor: hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
        background: hovered ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.018)",
        boxShadow: hovered
          ? "0 4px 24px -4px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <img
        src={logo.src}
        alt={logo.name}
        style={{
          height: `${logo.height}px`,
          width: "auto",
          objectFit: "contain",
          filter: hovered ? "none" : "brightness(0) invert(1)",
          opacity: hovered ? 1 : 0.4,
          transition: "all 0.3s ease",
        }}
      />
    </li>
  );
}

function MarqueeRow({ items, reverse = false }: { items: typeof ROW_1; reverse?: boolean }) {
  const track = [...items, ...items, ...items, ...items];
  return (
    <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      <ul
        className="flex shrink-0 list-none m-0 p-0 items-center"
        style={{ animation: `${reverse ? "marquee-reverse" : "marquee"} 32s linear infinite` }}
      >
        {track.map((logo, i) => (
          <LogoPill key={i} logo={logo} />
        ))}
      </ul>
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────────────────────── */
export function TrustedBy() {
  return (
    <section id="ecosystem" className="relative overflow-hidden bg-bg py-14 sm:py-20">

      {/* Hairlines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* Deep ambient glow */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.05] blur-[130px]" />

      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 mb-10 px-4">
        <div className="flex items-center gap-4 w-full max-w-[280px]">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/15" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-primary-light/60">
            <span className="h-1 w-1 rounded-full bg-primary-light/80 animate-pulse" />
            Ecosystem
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/15" />
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-center leading-snug">
          <span className="text-white/50">Powered by platforms</span>{" "}
          <span className="bg-gradient-to-r from-primary-light via-accent to-purple-300 bg-clip-text text-transparent">
            built for builders
          </span>
        </h2>
      </div>

      {/* ── Dual marquee ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-16 sm:mb-24">
        <MarqueeRow items={ROW_1} />
        <MarqueeRow items={ROW_2} reverse />
      </div>

      {/* ── Meetup Spotlight ────────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-center">

          {/* Left — Visual centerpiece */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">

              {/* Outer slow ring */}
              <div
                className="absolute inset-0 rounded-full border border-dashed border-[#F64060]/20"
                style={{ animation: "spin 20s linear infinite" }}
              />

              {/* Mid ring with dots */}
              <div
                className="absolute inset-[20px] rounded-full border border-[#F64060]/10"
                style={{ animation: "spin 14s linear infinite reverse" }}
              >
                {/* Orbital dot */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[#F64060]" style={{ boxShadow: "0 0 10px 4px rgba(246,64,96,0.5)" }} />
              </div>

              {/* Inner glow ring */}
              <div className="absolute inset-[44px] rounded-full border border-[#F64060]/20"
                style={{ animation: "spin 8s linear infinite" }}
              >
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-purple-400" style={{ boxShadow: "0 0 8px 3px rgba(192,132,252,0.6)" }} />
              </div>

              {/* Core glow */}
              <div
                aria-hidden
                className="absolute inset-[56px] rounded-full"
                style={{ background: "radial-gradient(circle, rgba(246,64,96,0.18) 0%, rgba(246,64,96,0.04) 60%, transparent 100%)" }}
              />

              {/* Logo — no box, just the mark */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                <img
                  src="/logos/logo-meetup.svg"
                  alt="Meetup"
                  style={{ height: "44px", width: "auto", objectFit: "contain" }}
                />
              </motion.div>

            </div>
          </div>

          {/* Right — Copy + stats + CTA */}
          <div className="flex flex-col gap-6">

            {/* Headline staggered reveal */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              {["Every event.", "Every announcement.", "One place."].map((line, i) => (
                <motion.p
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  className={
                    i === 2
                      ? "font-display text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-[#F64060]"
                      : "font-display text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white"
                  }
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-[14px] sm:text-[15px] leading-relaxed text-white/45 max-w-sm"
            >
              Our official Meetup group is the single source of truth — workshops, hackathons, speaker sessions, and community updates all flow through here. RSVP and get reminders.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex gap-8"
            >
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-white">
                    <Counter to={s.value} suffix={s.suffix} />
                  </span>
                  <span className="text-[11px] text-muted uppercase tracking-wider">{s.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-[#F64060]/20 via-white/5 to-transparent" />

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.55 }}
              className="flex flex-wrap items-center gap-4"
            >
              <a
                href="https://www.meetup.com/tulas-university-dehradun/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#F64060] px-6 py-3 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-[#e03050] hover:shadow-[0_0_28px_-4px_rgba(246,64,96,0.7)] active:scale-[0.97]"
              >
                Join our Meetup group
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </a>

              {/* Subtle tag pills */}
              <div className="flex flex-wrap gap-1.5">
                {["Workshops", "Hackathons", "Talks"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/35"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
