"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/design/Reveal";
import { cssVars, useScrollVar } from "@/components/design/use-scroll-var";
import { CirclePlus } from "@/components/ui/animate-ui/icons/circle-plus";
import { Layers } from "@/components/ui/animate-ui/icons/layers";
import { Hammer } from "@/components/ui/animate-ui/icons/hammer";
import { Blocks } from "@/components/ui/animate-ui/icons/blocks";
import { PartyPopper } from "@/components/ui/animate-ui/icons/party-popper";
import { BadgeCheck } from "@/components/ui/animate-ui/icons/badge-check";
import { Star } from "@/components/ui/animate-ui/icons/star";
import { LayoutDashboard } from "@/components/ui/animate-ui/icons/layout-dashboard";
import { pixelWave } from "@/lib/design/pixel-cloud";

const STEPS = [
  { icon: CirclePlus, title: "Join SBG", description: "Become part of the builder community.", phase: "01", tint: "var(--card-lilac)" },
  { icon: Layers, title: "AWS Fundamentals", description: "Core services, IAM, cloud concepts.", phase: "02", tint: "var(--card-sky)" },
  { icon: Hammer, title: "Hands-on Workshops", description: "Build in live sandbox environments.", phase: "03", tint: "var(--card-mint)" },
  { icon: Blocks, title: "Cloud Projects", description: "Deploy real applications on AWS.", phase: "04", tint: "var(--card-peach)" },
  { icon: PartyPopper, title: "Hackathons", description: "Compete, build fast, win prizes.", phase: "05", tint: "var(--card-rose)" },
  { icon: BadgeCheck, title: "AWS Certifications", description: "Earn industry-recognized credentials.", phase: "06", tint: "var(--card-blush)" },
  { icon: Star, title: "Leadership", description: "Mentor, organize, and lead initiatives.", phase: "07", tint: "var(--card-lilac)" },
  { icon: LayoutDashboard, title: "Internships & Careers", description: "Launch your cloud career.", phase: "08", tint: "var(--card-peach)" },
] as const;

/** Section 05. The path: a spine that fills as the reader scrolls, with eight phase cards along it. */
export function AboutTimeline() {
  const ref = useRef<HTMLElement>(null);
  useScrollVar(ref, ["start 75%", "end 55%"]);

  // The mobile spine must stop exactly at the last dot, which sits 32px (top-8) inside the
  // final <li>, not at the bottom of that <li> (the finale card continues well past its dot).
  // Measured because the finale card's height — and so the trailing gap to trim — varies with
  // content/viewport and can't be hardcoded as a Tailwind utility.
  const listRef = useRef<HTMLOListElement>(null);
  const [spineTail, setSpineTail] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const lastItem = list.lastElementChild as HTMLElement | null;
      if (!lastItem) return;
      // Height of the finale <li> below its dot (dot is top-8 = 32px from the <li>'s own top).
      setSpineTail(Math.max(0, lastItem.offsetHeight - 32));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      data-tone="violet"
      className="scene relative py-24 sm:py-32"
      style={cssVars({ "--t": 0, "--spine-tail": `${spineTail}px` })}
    >
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <Reveal className="mb-14 max-w-2xl">
          <p className="t-eyebrow mb-4 flex items-center gap-3">
            <span className="t-pixel text-sbg-accent">05</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Your Journey
          </p>
          <h2 className="t-display text-[clamp(34px,5.4vw,76px)] text-sbg-ink">
            The builder <span className="t-serif text-sbg-accent">journey.</span>
          </h2>
          <p className="t-lead mt-5 max-w-lg">
            From day one to career launch — here&apos;s the path every builder walks.
          </p>
        </Reveal>

        <div className="relative">
          {/* The spine must stop exactly at the last dot (top-8 inside its <li>), not at the
              container's bottom edge, which sits lower once the finale card's own padding is
              added. calc() reaches that point without a JS measurement. */}
          <span
            aria-hidden="true"
            className="absolute left-[19px] top-0 w-[3px] rounded-full bg-sbg-lilac-200 lg:bottom-0 lg:left-1/2 lg:h-auto lg:-translate-x-1/2"
            style={{ height: "calc(100% - var(--spine-tail, 0px))" }}
          />
          <span
            aria-hidden="true"
            className="absolute left-[19px] top-0 w-[3px] origin-top rounded-full bg-gradient-to-b from-sbg-lilac-600 to-sbg-lilac-400 lg:bottom-0 lg:left-1/2 lg:h-auto lg:-translate-x-1/2"
            style={{ height: "calc(100% - var(--spine-tail, 0px))", transform: "scaleY(var(--t))" }}
          />

          <ol ref={listRef} className="relative grid gap-5 pl-12 lg:grid-cols-2 lg:gap-x-24 lg:gap-y-8 lg:pl-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const finale = i === STEPS.length - 1;
              const right = i % 2 === 1;
              const at = ((i + 0.4) / STEPS.length).toFixed(3);
              return (
                <Reveal
                  as="li"
                  key={s.title}
                  className={`relative ${
                    finale
                      ? "lg:col-span-2 lg:mx-auto lg:mt-6 lg:w-full lg:max-w-[560px]"
                      : right
                        ? "lg:col-start-2 lg:mt-20"
                        : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-8 z-10 h-4 w-4 rounded-full border-2 ${
                      finale ? "border-[#EA8A00] lg:-top-6 lg:left-1/2 lg:-translate-x-1/2" : "border-sbg-lilac-600"
                    } -left-[36px] ${
                      finale ? "" : right ? "lg:-left-[56px]" : "lg:-right-[56px] lg:left-auto"
                    }`}
                    style={{
                      background: finale
                        ? `color-mix(in srgb, #EA8A00 calc(clamp(0, (var(--t) - 0.9) * 14, 1) * 100%), var(--dot-off))`
                        : `color-mix(in srgb, var(--lilac-600) calc(clamp(0, (var(--t) - ${at}) * 14, 1) * 100%), var(--dot-off))`,
                    }}
                  />
                  <article
                    className={`surface lift relative overflow-hidden rounded-[28px] ${
                      finale ? "p-8 sm:p-10" : "p-6 sm:p-7"
                    }`}
                    style={{ backgroundImage: `linear-gradient(155deg, ${s.tint} 0%, var(--wash-80) 58%)` }}
                  >
                    {finale && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-6 right-6 grid grid-cols-4 gap-1.5 opacity-70"
                      >
                        {Array.from({ length: 16 }, (_, k) => (
                          <span
                            key={k}
                            data-hot={[0, 5, 6, 10, 15].includes(k) || undefined}
                            className="px-tile h-3 w-3 rounded-[3px]"
                            style={{ background: [0, 5, 6, 10, 15].includes(k) ? "#FF9900" : "rgba(234,138,0,0.14)", ...pixelWave(k, 4) }}
                          />
                        ))}
                      </span>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <span className="t-pixel rounded-full bg-sbg-lilac-100 px-2.5 py-0.5 text-[11px] text-sbg-accent-strong">
                        Phase {s.phase}
                      </span>
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tile-bg)] text-sbg-accent-strong">
                        <Icon size={24} strokeWidth={1.75} animateOnHover />
                      </span>
                    </div>
                    <h3
                      className={`t-display mt-6 text-sbg-ink ${
                        finale ? "text-[30px] sm:text-[38px]" : "text-[24px] sm:text-[28px]"
                      }`}
                    >
                      {s.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-sbg-ink-2">{s.description}</p>
                  </article>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
