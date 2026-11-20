import { Reveal } from "@/components/design/Reveal";
import { SocialLinks } from "@/components/design/SocialLinks";
import { pixelWave } from "@/lib/design/pixel-cloud";

/** Section 08. What to do next: a deep gradient card. */
export function AboutCTA() {
  return (
    <section data-tone="violet" className="relative px-[var(--gutter)] pb-24 pt-32 sm:pb-32 sm:pt-44">
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
            <p className="t-eyebrow mb-5 !text-white/70">What&apos;s next</p>
            <h2 className="t-display text-[clamp(34px,5.2vw,64px)]">
              Keep the <span className="t-serif text-[#D9C8FF]">momentum going.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/80">
              Now that you know who we are, come hang out. Join the chat, catch an upcoming event and see what the community is building.
            </p>
            <SocialLinks />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
