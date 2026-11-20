"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { SocialLinks } from "./SocialLinks";
import { pixelWave } from "@/lib/design/pixel-cloud";

const STATS = [
  { to: 20, suffix: "+", label: "Builders" },
  { to: 4, suffix: "", label: "Active wings" },
  { to: 250, suffix: "+", label: "Members on Meetup" },
] as const;

/** Counts up the first time it is seen. With reduced motion it simply shows the number. */
function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setValue(to);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const run = (now: number) => {
          const t = Math.min(1, (now - start) / 1400);
          setValue(Math.round(to * (1 - Math.pow(1 - t, 4))));
          if (t < 1) raf = requestAnimationFrame(run);
          else setDone(true);
        };
        raf = requestAnimationFrame(run);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref} className="counter tabular-nums" data-done={done || undefined}>
      {value}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section data-tone="bloom" className="relative py-20 sm:py-28" aria-label="The community in numbers">
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <ul className="grid divide-y divide-[var(--line)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STATS.map((s, i) => (
            <Reveal as="li" key={s.label} index={i} className="py-8 text-center sm:px-8 sm:py-4">
              <p className="t-display text-[clamp(72px,12vw,168px)] leading-[0.9] text-sbg-ink">
                <Counter to={s.to} suffix={s.suffix} />
              </p>
              <p className="t-eyebrow mt-4">{s.label}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="connect" data-tone="violet" className="relative px-[var(--gutter)] py-24 sm:py-32">
      <Reveal className="relative mx-auto max-w-[1100px]">
        <div
          className="cta-card relative overflow-hidden rounded-[36px] px-7 py-14 text-white sm:px-14 sm:py-20"
          style={{ backgroundImage: "linear-gradient(135deg, #2E1170 0%, #4A1D9E 52%, #6428D4 100%)", boxShadow: "0 50px 100px -40px rgba(46,17,112,0.7)" }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#AF8CFF]/35 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-[#FF9900]/20 blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-8 right-8 grid grid-cols-4 gap-1.5 opacity-60">
            {Array.from({ length: 16 }, (_, k) => (
              <span key={k} data-hot={[0, 5, 6, 10, 15].includes(k) || undefined} className="px-tile h-3 w-3 rounded-[3px]" style={{ background: [0, 5, 6, 10, 15].includes(k) ? "#FF9900" : "rgba(255,255,255,0.14)", ...pixelWave(k, 4) }} />
            ))}
          </span>

          <div className="relative max-w-2xl">
            <p className="t-eyebrow mb-5 !text-white/70">Stay connected</p>
            <h2 className="t-display text-[clamp(34px,5.2vw,64px)]">
              Find us <span className="t-serif text-[#D9C8FF]">wherever you scroll.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/80">
              Event updates, builder showcases and AWS tips land on our channels first. Follow along, say hello and keep learning with the community.
            </p>
            <SocialLinks />
            <Link href="/events" className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-white/90 underline-offset-4 hover:underline">
              See what we do <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
