import Image from "next/image";
import { Reveal } from "@/components/design/Reveal";
import { pixelWave } from "@/lib/design/pixel-cloud";

/** Section 01. Who we are: the headline and first paragraph beside the logo medallion. */
export function About() {
  return (
    <section id="top" data-tone="dawn" className="relative overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-[var(--gutter)] lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-7">
          <p className="t-eyebrow mb-5 flex items-center gap-3">
            <span className="t-pixel text-sbg-accent">01</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            About AWS SBG
          </p>
          <h1 className="t-display text-[clamp(38px,5.3vw,80px)] text-sbg-ink">
            We don&apos;t just learn cloud.
            <br />
            <span className="t-serif text-sbg-accent">We build on it.</span>
          </h1>
          <p className="t-lead mt-6 max-w-xl">
            AWS Student Builder Group at Tulas University is a student-led community where aspiring developers, cloud
            engineers, AI enthusiasts, and builders come together to learn by building.
          </p>
        </Reveal>

        <Reveal index={2} className="flex justify-center lg:col-span-5">
          <div className="relative grid aspect-square w-full max-w-[240px] place-items-center sm:max-w-[340px] lg:max-w-[400px]">
            <span aria-hidden="true" className="absolute inset-0 rounded-full border border-sbg-lilac-300/60" />
            <span aria-hidden="true" className="absolute inset-[12%] rounded-full border border-sbg-lilac-300/60" />
            <span aria-hidden="true" className="absolute inset-[24%] rounded-full border border-sbg-lilac-300/60" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 top-6 hidden grid-cols-4 gap-1.5 opacity-80 lg:grid"
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
            <div
              className="relative grid aspect-square w-[62%] place-items-center rounded-full border-4 border-white bg-white"
              style={{ boxShadow: "0 40px 80px -30px var(--hub-shadow)" }}
            >
              <Image
                src="/logos/tulas+sbg.webp"
                alt="Tulas University and AWS SBG Logo"
                width={400}
                height={400}
                priority
                className="h-auto w-[78%] object-contain"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
