"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, BadgeCheck, BookOpen, Cloud, Route, Terminal, Users, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";
import { cssVars, useScrollVar } from "./use-scroll-var";

const EVENTS = [
  { tag: "Workshop", title: "Cloud Bootcamp", text: "Get hands-on with AWS core services in an intensive two-day bootcamp.", tint: "#EFE8FF", dot: "#7C3AED", span: "md:col-span-7" },
  { tag: "Hands-on session", title: "Build With AWS", text: "Go from idea to deployed application in a single guided afternoon session.", tint: "#DDF3E6", dot: "#16A34A", span: "md:col-span-5" },
  { tag: "Innovation challenge", title: "Hackathon", text: "Compete in teams to solve real-world problems using cloud technologies.", tint: "#FFEBD3", dot: "#EA8A00", span: "md:col-span-5" },
  { tag: "Industry insights", title: "Expert Talk", text: "Hear from cloud practitioners and AWS experts on what it takes to build at scale.", tint: "#DCEBFF", dot: "#2563EB", span: "md:col-span-7" },
] as const;

const TOPICS: ReadonlyArray<{ label: string; icon: LucideIcon }> = [
  { label: "AWS Fundamentals", icon: Cloud },
  { label: "Cloud Roadmaps", icon: Route },
  { label: "Hands-on Labs", icon: Terminal },
  { label: "Certification Guides", icon: BadgeCheck },
  { label: "Project Tutorials", icon: BookOpen },
  { label: "Interview Prep", icon: Users },
];

export function Events() {
  return (
    <section id="events" data-tone="clear" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <Reveal className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="t-eyebrow mb-4 flex items-center gap-3">
              <span className="t-pixel text-sbg-lilac-600">04</span>
              <span className="h-px w-10 bg-sbg-lilac-300" />
              Events
            </p>
            <h2 className="t-display text-[clamp(34px,5.4vw,76px)] text-sbg-ink">
              Show up. <span className="t-serif text-sbg-lilac-600">Build something.</span>
            </h2>
          </div>
          <Link href="/events" className="btn btn-ghost self-start lg:self-auto">
            All events <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>

        <ul className="grid gap-4 md:grid-cols-12 md:gap-5">
          {EVENTS.map((e, i) => (
            <Reveal as="li" key={e.title} index={i} className={e.span}>
              <article
                className="surface lift group relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-[28px] p-7 sm:min-h-[320px] sm:p-9"
                style={{ backgroundImage: `linear-gradient(155deg, ${e.tint} 0%, rgba(255,255,255,0.8) 58%)` }}
              >
                {/* pixel corner: the brand motif, in the card's own colour */}
                <span aria-hidden="true" className="pointer-events-none absolute right-6 top-6 grid grid-cols-3 gap-1">
                  {[0, 1, 1, 1, 0, 1, 0, 1, 0].map((on, k) => (
                    <span key={k} className="h-2.5 w-2.5 rounded-[3px]" style={{ background: on ? e.dot : "transparent", opacity: on ? 0.28 + (k % 3) * 0.2 : 0 }} />
                  ))}
                </span>
                <span className="t-eyebrow inline-flex w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 px-3 py-1.5 !text-[10.5px] !text-sbg-ink-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: e.dot }} />
                  {e.tag}
                </span>
                <div>
                  <h3 className="t-display text-[clamp(30px,4vw,52px)] text-sbg-ink">{e.title}</h3>
                  <p className="mt-3 max-w-md text-[16px] leading-relaxed text-sbg-ink-2">{e.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Scene 5. Two rows of topics slide in opposite directions, driven by scroll position. */
export function Learn() {
  const ref = useRef<HTMLElement>(null);
  useScrollVar(ref, ["start end", "end start"]);
  const row = [...TOPICS, ...TOPICS, ...TOPICS];

  return (
    <section id="learn" ref={ref} data-tone="dawn" className="scene relative overflow-hidden py-24 sm:py-32" style={cssVars({ "--t": 0 })}>
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <Reveal className="mb-12 max-w-2xl sm:mb-16">
          <p className="t-eyebrow mb-4 flex items-center gap-3">
            <span className="t-pixel text-sbg-lilac-600">05</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Learning Hub
          </p>
          <h2 className="t-display text-[clamp(34px,5.4vw,76px)] text-sbg-ink">
            A path for every <span className="t-serif text-sbg-lilac-600">next step.</span>
          </h2>
          <p className="t-lead mt-5">Roadmaps, labs, guides and tutorials, curated by builders who have been where you are.</p>
        </Reveal>
      </div>

      <div className="flex flex-col gap-3.5" aria-label="Learning Hub topics" role="list">
        {(["marquee-left", "marquee-right"] as const).map((dir) => (
          <div key={dir} className={`marquee-row ${dir}`} aria-hidden={dir === "marquee-right" ? "true" : undefined}>
            {(dir === "marquee-right" ? [...row].reverse() : row).map((t, i) => {
              const Icon = t.icon;
              return (
                <span
                  key={`${t.label}-${i}`}
                  role={dir === "marquee-left" ? "listitem" : undefined}
                  className="surface inline-flex items-center gap-3 whitespace-nowrap rounded-full py-3 pl-3 pr-6 text-[16px] font-medium text-sbg-ink sm:text-[18px]"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-sbg-lilac-100 text-sbg-lilac-700">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {t.label}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-[1240px] px-[var(--gutter)]">
        <Link href="/learning-hub" className="btn btn-primary">
          Open the Learning Hub <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
