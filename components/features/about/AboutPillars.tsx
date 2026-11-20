import { Reveal } from "@/components/design/Reveal";
import { CircuitBoard } from "@/components/ui/animate-ui/icons/circuit-board";
import { CloudUpload } from "@/components/ui/animate-ui/icons/cloud-upload";
import { Users } from "@/components/ui/animate-ui/icons/users";
import { PartyPopper } from "@/components/ui/animate-ui/icons/party-popper";
import { BadgeCheck } from "@/components/ui/animate-ui/icons/badge-check";
import { Compass } from "@/components/ui/animate-ui/icons/compass";
import { pixelWave } from "@/lib/design/pixel-cloud";

const PILLARS = [
  {
    icon: CircuitBoard,
    title: "Cloud Learning",
    description:
      "Hands-on workshops using real AWS services like EC2, Lambda, S3, DynamoDB, API Gateway, Amplify and Bedrock.",
    tint: "var(--card-lilac)",
    dot: "#7C3AED",
    span: "md:col-span-7",
    featured: true,
  },
  {
    icon: CloudUpload,
    title: "Build Projects",
    description:
      "Every member is encouraged to deploy actual cloud applications instead of only watching tutorials.",
    tint: "var(--card-peach)",
    dot: "#EA8A00",
    span: "md:col-span-5",
    featured: false,
  },
  {
    icon: Users,
    title: "Community",
    description: "Peer learning, mentorship, code reviews, study groups and collaborative building.",
    tint: "var(--card-sky)",
    dot: "#2563EB",
    span: "md:col-span-5",
    featured: false,
  },
  {
    icon: PartyPopper,
    title: "Hackathons",
    description: "Participate in AWS GameDays, hackathons, build sprints and innovation challenges.",
    tint: "var(--card-blush)",
    dot: "#7C3AED",
    span: "md:col-span-7",
    featured: true,
  },
  {
    icon: BadgeCheck,
    title: "Certifications",
    description:
      "Preparation sessions, study plans, practice exams, AWS Skill Builder resources and certification guidance.",
    tint: "var(--card-mint)",
    dot: "#16A34A",
    span: "md:col-span-6",
    featured: false,
  },
  {
    icon: Compass,
    title: "Career Growth",
    description:
      "Networking with AWS professionals, industry mentors, alumni and student builders from around the world.",
    tint: "var(--card-rose)",
    dot: "#7C3AED",
    span: "md:col-span-6",
    featured: false,
  },
] as const;

/** Section 03. What is inside the programme: a bento of six pillars, two of them featured. */
export function AboutPillars() {
  return (
    <section data-tone="dusk" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <Reveal className="mb-12 max-w-2xl sm:mb-16">
          <p className="t-eyebrow mb-4 flex items-center gap-3">
            <span className="t-pixel text-sbg-accent">03</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Our Pillars
          </p>
          <h2 className="t-display text-[clamp(34px,5.4vw,76px)] text-sbg-ink">
            Built on six <span className="t-serif text-sbg-accent">pillars.</span>
          </h2>
          <p className="t-lead mt-5 max-w-lg">
            Everything we do maps to these core areas — aligned with the official AWS Student Builder Group program.
          </p>
        </Reveal>

        <ol className="grid gap-4 md:grid-cols-12 md:gap-5">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal as="li" key={p.title} index={i % 2} className={p.span}>
                <article
                  className={`surface lift group relative flex h-full flex-col justify-between gap-10 overflow-hidden rounded-[28px] p-7 sm:p-9 ${
                    p.featured ? "md:min-h-[380px]" : "md:min-h-[260px]"
                  }`}
                  style={{ backgroundImage: `linear-gradient(155deg, ${p.tint} 0%, var(--wash-80) 58%)` }}
                >
                  <span aria-hidden="true" className="pointer-events-none absolute right-6 top-6 grid grid-cols-3 gap-1">
                    {[0, 1, 1, 1, 0, 1, 0, 1, 0].map((on, k) => (
                      <span
                        key={k}
                        className="px-tile h-2.5 w-2.5 rounded-[3px]"
                        style={{ background: on ? p.dot : "transparent", opacity: on ? 0.28 + (k % 3) * 0.2 : 0, ...pixelWave(k, 3) }}
                      />
                    ))}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--tile-bg)] text-sbg-accent-strong">
                      <Icon size={26} strokeWidth={1.75} animateOnHover />
                    </span>
                    <span className="t-pixel text-[12px] text-sbg-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <h3
                      className={`t-display text-sbg-ink ${
                        p.featured ? "text-[30px] sm:text-[clamp(30px,4vw,52px)]" : "text-[28px]"
                      }`}
                    >
                      {p.title}
                    </h3>
                    <p
                      className={`mt-3 max-w-md leading-relaxed text-sbg-ink-2 ${
                        p.featured ? "text-[16px] sm:text-[17px]" : "text-[15px]"
                      }`}
                    >
                      {p.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
