import type { CSSProperties } from "react";
import { pixelWave } from "@/lib/design/pixel-cloud";

const delay = (ms: number) => ({ "--d": ms }) as CSSProperties;

/* the brand's pixel motif, as a quiet accent */
function PixelCluster({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute grid grid-cols-4 gap-1.5 ${className}`}>
      {Array.from({ length: 16 }, (_, k) => (
        <span
          key={k}
          data-hot={k === 10 || undefined}
          className="px-tile h-3 w-3 rounded-[3px]"
          style={{ background: [0, 5, 6, 10, 15].includes(k) ? (k === 10 ? "#FF9900" : "#AF8CFF") : "rgba(175,140,255,0.2)", ...pixelWave(k, 4) }}
        />
      ))}
    </span>
  );
}

export function TeamHero({ memberCount, wingCount }: { memberCount: number; wingCount: number }) {
  const facts = [
    { value: "3", label: "Faculty mentors" },
    ...(memberCount > 0 ? [{ value: String(memberCount), label: "Student builders" }] : []),
    ...(wingCount > 0 ? [{ value: String(wingCount), label: "Wings" }] : []),
  ];

  return (
    <section
      data-tone="dawn"
      className="relative flex min-h-[78vh] items-center justify-center overflow-hidden px-[var(--gutter)] pb-20 pt-36 sm:pb-24 sm:pt-40"
    >
      <PixelCluster className="left-[6%] top-[24%] hidden opacity-70 md:grid" />
      <PixelCluster className="bottom-[18%] right-[7%] hidden opacity-70 md:grid" />

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <p className="rise t-eyebrow flex items-center justify-center gap-3" style={delay(0)}>
          <span className="t-pixel text-sbg-accent">01</span>
          <span className="h-px w-10 bg-sbg-lilac-300" />
          Our Team
        </p>

        <h1
          className="rise t-display mt-6 text-[clamp(44px,8vw,108px)] text-sbg-ink"
          style={delay(120)}
        >
          The people behind
          <br />
          <span className="t-serif text-sbg-accent">the builds.</span>
        </h1>

        <p className="rise t-lead mx-auto mt-6 max-w-xl sm:mt-8" style={delay(240)}>
          The faculty, student leaders, and wing members who organise, teach, and run the AWS Student
          Builder Group at Tulas University.
        </p>

        <dl
          className="rise mx-auto mt-10 flex max-w-xl flex-wrap items-stretch justify-center gap-3 sm:mt-12"
          style={delay(360)}
        >
          {facts.map((f) => (
            <div key={f.label} className="surface min-w-[132px] flex-1 rounded-[22px] px-5 py-4">
              <dt className="t-eyebrow">{f.label}</dt>
              <dd className="t-display mt-1 text-[32px] text-sbg-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
