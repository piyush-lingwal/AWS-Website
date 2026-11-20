"use client";

import { useRef } from "react";
import { Reveal } from "@/components/design/Reveal";
import { cssVars, useScrollVar } from "@/components/design/use-scroll-var";

const STATEMENT =
  "Instead of only attending sessions, members create real-world applications, deploy production-ready projects on AWS, contribute to open-source, prepare for certifications, participate in hackathons, and collaborate with builders across the global AWS community.";

const WORDS = STATEMENT.split(/\s+/).filter(Boolean);

const TAGLINE = [
  { word: "Learn.", serif: true },
  { word: "Build.", serif: false },
  { word: "Share.", serif: true },
  { word: "Grow.", serif: false },
] as const;

/** Section 02. What we do: the second paragraph lights up word by word, then the four-word promise. */
export function AboutMission() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollVar(ref, ["start 85%", "end 45%"]);

  return (
    <section data-tone="bloom" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <p className="t-eyebrow mb-6 flex items-center gap-3 sm:mb-8">
          <span className="t-pixel text-sbg-accent">02</span>
          <span className="h-px w-10 bg-sbg-lilac-300" />
          Our mission
        </p>

        <div ref={ref} className="scene" style={cssVars({ "--t": 0 })}>
          <p
            className="t-display manifesto max-w-[30ch] !text-[clamp(24px,3.4vw,46px)]"
            style={cssVars({ "--n": WORDS.length })}
          >
            {WORDS.map((w, i) => (
              <span key={i} className="word" style={cssVars({ "--i": i })}>
                {w}{" "}
              </span>
            ))}
          </p>
        </div>

        <Reveal className="mt-12 sm:mt-16">
          <p className="t-lead max-w-xl">
            Supported by{" "}
            <a
              href="https://builder.aws.com/content/3C075iQJeEx03mnzHwmXO9zdgEG/aws-student-builder-groups"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sbg-accent-strong underline decoration-sbg-lilac-300 underline-offset-2"
            >
              AWS Builder Center
            </a>
            , our mission is simple:
          </p>
        </Reveal>

        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 sm:gap-y-4">
          {TAGLINE.map((t, i) => (
            <Reveal
              as="li"
              key={t.word}
              index={i}
              className="t-display min-w-0 text-[clamp(46px,13vw,150px)] leading-[0.9] text-sbg-ink"
            >
              {t.serif ? <span className="t-serif text-sbg-accent">{t.word}</span> : t.word}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
