"use client";

import { useRef } from "react";
import { cssVars, useScrollVar } from "./use-scroll-var";

// Words in the serif italic are lit lilac instead of ink: the three things a builder does.
const SEGMENTS: ReadonlyArray<{ text: string; em?: boolean }> = [
  { text: "We learn by " },
  { text: "building.", em: true },
  { text: " We grow by " },
  { text: "sharing.", em: true },
  { text: " We turn curiosity into " },
  { text: "real projects,", em: true },
  { text: " on the AWS cloud, with people who want to get better together." },
];

const WORDS = SEGMENTS.flatMap((seg) =>
  seg.text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ({ w, em: !!seg.em }))
);

const VALUES = [
  { label: "Learn by Building", at: 0.5 },
  { label: "Grow Together", at: 0.6 },
  { label: "Create Real Projects", at: 0.7 },
  { label: "Share Knowledge", at: 0.8 },
] as const;

/** Scene 2. The mission statement lights up word by word as the reader scrolls. */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  useScrollVar(ref);

  return (
    <section id="about" ref={ref} data-tone="bloom" className="scene relative h-[260svh]" style={cssVars({ "--t": 0 })}>
      <div className="pin flex items-center">
        <div className="mx-auto w-full max-w-[1240px] px-[var(--gutter)]">
          <p className="t-eyebrow mb-6 flex items-center gap-3 sm:mb-8">
            <span className="t-pixel text-sbg-lilac-600">01</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Our mission
          </p>

          <p className="t-display manifesto max-w-[22ch] sm:max-w-[26ch] lg:max-w-[30ch]" style={cssVars({ "--n": WORDS.length })}>
            {WORDS.map((word, i) => (
              <span key={i} className={`word ${word.em ? "t-serif" : ""}`} style={cssVars({ "--i": i })}>
                {word.w}{" "}
              </span>
            ))}
          </p>

          <ul className="mt-8 flex flex-wrap gap-2.5 sm:mt-12">
            {VALUES.map((v) => (
              <li
                key={v.label}
                className="value-pill rounded-full border border-[var(--line)] px-4 py-2 text-[13px] font-medium text-sbg-ink backdrop-blur"
                style={cssVars({ "--at": v.at })}
              >
                {v.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
