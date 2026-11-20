import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/design/Reveal";
import { pixelWave } from "@/lib/design/pixel-cloud";

const COMPARISONS = [
  { traditional: "Theory", sbg: "Hands-on Projects" },
  { traditional: "Classroom Assignments", sbg: "Production Applications" },
  { traditional: "Individual Learning", sbg: "Community Building" },
  { traditional: "Exams", sbg: "Certifications" },
  { traditional: "Local Network", sbg: "Global AWS Network" },
  { traditional: "Tutorials", sbg: "Real Deployments" },
] as const;

/** Section 04. Why SBG: large before-to-after rows; the old side gets struck through as each row arrives. */
export function AboutComparison() {
  return (
    <section data-tone="clear" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <Reveal className="mb-12 max-w-2xl sm:mb-16">
          <p className="t-eyebrow mb-4 flex items-center gap-3">
            <span className="t-pixel text-sbg-accent">04</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Why SBG?
          </p>
          <h2 className="t-display text-[clamp(34px,5.4vw,76px)] text-sbg-ink">
            What makes us <span className="t-serif text-sbg-accent">different.</span>
          </h2>
        </Reveal>

        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 top-0 hidden grid-cols-4 gap-1.5 opacity-70 xl:grid"
          >
            {Array.from({ length: 16 }, (_, k) => (
              <span
                key={k}
                data-hot={[0, 5, 6, 10, 15].includes(k) || undefined}
                className="px-tile h-3 w-3 rounded-[3px]"
                style={{ background: [0, 5, 6, 10, 15].includes(k) ? "#FF9900" : "rgba(124,58,237,0.14)", ...pixelWave(k, 4) }}
              />
            ))}
          </span>

          <div className="t-eyebrow hidden grid-cols-[1fr_auto_1.5fr] gap-8 px-4 pb-4 lg:grid">
            <span>Traditional Learning</span>
            <span aria-hidden="true" className="w-5" />
            <span className="flex items-center gap-2 !text-sbg-accent-strong">
              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-sbg-lilac-600" />
              <span>AWS Student Builder Group</span>
            </span>
          </div>

          <ol>
            {COMPARISONS.map((row, i) => (
              <Reveal
                as="li"
                key={row.traditional}
                index={0}
                className="group grid gap-3 rounded-2xl border-t border-[var(--line)] px-0 py-7 transition-colors hover:bg-[var(--row-hover)] lg:grid-cols-[1fr_auto_1.5fr] lg:items-baseline lg:gap-8 lg:px-4 lg:py-9"
              >
                <span className="relative w-fit text-[clamp(16px,2vw,26px)] text-sbg-ink-3">
                  {row.traditional}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-[2px] w-0 bg-sbg-ink-3/60 transition-[width] delay-300 duration-700 ease-out group-data-[in=true]:w-full motion-reduce:w-full motion-reduce:transition-none"
                    style={{ transitionDelay: `${300 + i * 40}ms` }}
                  />
                </span>
                <ArrowRight className="h-5 w-5 rotate-90 text-sbg-accent lg:rotate-0" aria-hidden="true" />
                <span className="t-display text-[clamp(28px,3.8vw,52px)] text-sbg-ink">{row.sbg}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
