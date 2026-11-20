"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Route, Terminal, Trophy, Users, type LucideIcon } from "lucide-react";
import { cssVars } from "./use-scroll-var";

const ITEMS: ReadonlyArray<{ icon: LucideIcon; title: string; text: string; tint: string }> = [
  { icon: Terminal, title: "Hands-on learning", text: "Gain practical experience through interactive sessions and real-world projects on AWS.", tint: "var(--card-lilac)" },
  { icon: Route, title: "Career growth", text: "Develop skills that strengthen your portfolio, internship applications and campus placements.", tint: "var(--card-peach)" },
  { icon: Trophy, title: "Hackathons & challenges", text: "Collaborate, compete and solve real-world problems in exciting innovation challenges.", tint: "var(--card-rose)" },
  { icon: Users, title: "Industry exposure", text: "Connect with mentors, industry professionals and builders across the AWS community.", tint: "var(--card-sky)" },
  { icon: BadgeCheck, title: "Cloud certifications", text: "Get guidance on AWS learning paths, digital badges and certification preparation.", tint: "var(--card-mint)" },
];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Scene 4. A sticky heading and counter on the left; five reasons scroll past on the right.
 * Whichever reason is in the middle of the screen is lit and drives the big counter.
 */
export function WhyJoin() {
  const [active, setActive] = useState(0);
  const rows = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-42% 0px -42% 0px" }
    );
    rows.current.forEach((row) => row && io.observe(row));
    return () => io.disconnect();
  }, []);

  return (
    <section id="why" data-tone="dusk" className="relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-[var(--gutter)] lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="self-start lg:sticky lg:top-28">
          <p className="t-eyebrow mb-4 flex items-center gap-3">
            <span className="t-pixel text-sbg-accent">04</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Why join
          </p>
          <h2 className="t-display text-[clamp(34px,5.4vw,76px)] text-sbg-ink">
            Everything a builder needs to <span className="t-serif text-sbg-accent">grow.</span>
          </h2>

          <div className="mt-8 hidden items-end gap-5 lg:flex" aria-hidden="true">
            <span key={active} className="t-pixel text-[clamp(72px,9vw,128px)] leading-none text-sbg-accent [animation:sbg-rise_0.6s_var(--ease-out)]">
              {pad(active + 1)}
            </span>
            <span className="t-pixel mb-3 text-[20px] text-sbg-ink-3">/ {pad(ITEMS.length)}</span>
          </div>
        </div>

        <ol className="relative">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            const on = i === active;
            return (
              <li
                key={item.title}
                ref={(el) => {
                  rows.current[i] = el;
                }}
                data-index={i}
                className="flex min-h-[44vh] items-center py-4 lg:min-h-[58vh]"
              >
                <div
                  className={`surface w-full rounded-[28px] p-6 transition-all duration-500 sm:p-8 ${on ? "scale-100 opacity-100" : "scale-[0.97] opacity-40"}`}
                  style={{ backgroundImage: `linear-gradient(150deg, ${item.tint} 0%, var(--wash-78) 55%)` }}
                >
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl tile">
                      <Icon className="h-6 w-6 text-sbg-accent" aria-hidden="true" />
                    </span>
                    <span className="t-pixel text-[15px] text-sbg-ink-3">{pad(i + 1)}</span>
                  </div>
                  <h3 className="t-display mt-6 text-[clamp(26px,3.4vw,44px)] text-sbg-ink">{item.title}</h3>
                  <p className="mt-3 max-w-md text-[16px] leading-relaxed text-sbg-ink-2">{item.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
