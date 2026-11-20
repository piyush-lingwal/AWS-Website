import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/design/Reveal";

const ECOSYSTEM_NODES = [
  { name: "Artificial Intelligence", link: "https://aws.amazon.com/ai/", tint: "var(--card-lilac)", pos: "lg:col-start-1 lg:row-start-1" },
  { name: "Skill Builder", link: "https://explore.skillbuilder.aws/", tint: "var(--card-sky)", pos: "lg:col-start-4 lg:row-start-1" },
  { name: "AWS Educate", link: "https://aws.amazon.com/education/awseducate/", tint: "var(--card-mint)", pos: "lg:col-start-1 lg:row-start-2" },
  { name: "Community Builders", link: "https://aws.amazon.com/developer/community/community-builders/", tint: "var(--card-peach)", pos: "lg:col-start-4 lg:row-start-2" },
  { name: "Student Builder Groups", link: "https://builder.aws.com/content/3C075iQJeEx03mnzHwmXO9zdgEG/aws-student-builder-groups", tint: "var(--card-rose)", pos: "lg:row-start-3", own: true },
  { name: "AWS Events", link: "https://aws.amazon.com/events/", tint: "var(--card-blush)", pos: "lg:row-start-3" },
  { name: "Certification", link: "https://aws.amazon.com/certification/", tint: "var(--card-lilac)", pos: "lg:row-start-3" },
  { name: "Cloud", link: "https://aws.amazon.com/what-is-aws/", tint: "var(--card-sky)", pos: "lg:row-start-3" },
] as const;

/** Section 06. Who we are connected to: the AWS logo hub tile among eight link tiles. */
export function AboutEcosystem() {
  return (
    <section data-tone="bloom" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <Reveal className="mb-12 max-w-2xl sm:mb-16">
          <p className="t-eyebrow mb-4 flex items-center gap-3">
            <span className="t-pixel text-sbg-accent">06</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            The Ecosystem
          </p>
          <h2 className="t-display text-[clamp(34px,5.4vw,76px)] text-sbg-ink">
            Part of the AWS <span className="t-serif text-sbg-accent">ecosystem.</span>
          </h2>
          <p className="t-lead mt-5 max-w-lg">
            We&apos;re connected to a vast network of AWS programs, resources, and communities.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          <Reveal className="col-span-2 lg:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div
              className="surface relative grid h-full min-h-[220px] place-items-center overflow-hidden rounded-[36px] p-8"
              style={{ backgroundImage: "linear-gradient(155deg, var(--card-lilac) 0%, var(--wash-85) 60%)" }}
            >
              <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
                <span className="aspect-square h-[82%] rounded-full border border-sbg-lilac-300/60" />
              </span>
              <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
                <span className="aspect-square h-[58%] rounded-full border border-sbg-lilac-300/60 motion-safe:animate-ping [animation-duration:3s]" />
              </span>
              <span className="relative grid h-24 w-24 place-items-center rounded-full bg-white shadow-[0_20px_40px_-20px_var(--hub-shadow-50)] sm:h-32 sm:w-32">
                <Image src="/logos/logo-aws.svg" alt="AWS Logo" width={96} height={64} className="h-12 w-auto sm:h-16" />
              </span>
            </div>
          </Reveal>

          {ECOSYSTEM_NODES.map((n, i) => {
            const host = new URL(n.link).host;
            return (
              <Reveal key={n.name} index={i % 4} className={`${n.pos} ${"own" in n ? "lg:col-start-1" : ""}`}>
                <a
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`surface lift group relative flex h-full min-h-[120px] flex-col justify-between gap-6 rounded-[24px] p-5 sm:p-6 ${
                    "own" in n ? "ring-2 ring-sbg-lilac-300" : ""
                  }`}
                  style={{ backgroundImage: `linear-gradient(155deg, ${n.tint} 0%, var(--wash-80) 58%)` }}
                >
                  <span className="flex items-start justify-between">
                    <span className="t-pixel text-[12px] text-sbg-ink-3">{String(i + 1).padStart(2, "0")}</span>
                    <ArrowUpRight className="h-5 w-5 text-sbg-accent-strong transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="t-display block text-[20px] text-sbg-ink sm:text-[24px]">{n.name}</span>
                    <span className="mt-1 block break-all font-mono text-[13px] text-sbg-ink-3">{host}</span>
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
