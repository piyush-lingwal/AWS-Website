import { ScrollReveal } from "@/components/lightswind/scroll-reveal";

export function ScrollRevealSection() {
  return (
    <section className="bg-grid bg-noise relative min-h-[50vh] sm:min-h-screen py-20 sm:py-32 flex items-center justify-center bg-[#0A0A0F] overflow-hidden select-none">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[100px] sm:blur-[150px]"
      />
      <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-5 sm:px-6 relative z-10 gap-2 sm:gap-4">
        <ScrollReveal
          size="2xl"
          align="center"
          variant="primary"
          enableBlur
          baseOpacity={0.05}
          baseRotation={2}
          staggerDelay={0.05}
          duration={0.6}
          threshold={0.2}
          containerClassName="my-0 transform-gpu"
        >
          Learn cloud, build projects, and grow together
        </ScrollReveal>
        <ScrollReveal
          size="sm"
          align="center"
          variant="muted"
          enableBlur
          baseOpacity={0.05}
          baseRotation={1}
          staggerDelay={0.05}
          duration={0.6}
          threshold={0.2}
          containerClassName="my-0 transform-gpu opacity-90"
        >
          — powered by AWS
        </ScrollReveal>
      </div>
    </section>
  );
}
