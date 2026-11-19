import Image from "next/image";
import Link from "next/link";

const EXPLORE = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Team", href: "/team" },
  { label: "Learning Hub", href: "/learning-hub" },
  { label: "Gallery", href: "/gallery" },
] as const;

const CONNECT = [
  { label: "Meetup", href: "https://www.meetup.com/tulas-university-dehradun/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/aws-tulas/" },
  { label: "Instagram", href: "https://www.instagram.com/aws.sbgtulas" },
  { label: "awssbg@tulas.edu.in", href: "mailto:awssbg@tulas.edu.in" },
] as const;

export function DesignFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--line)] bg-white/50 backdrop-blur-sm">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-[var(--gutter)] pb-10 pt-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sbg-ink">
              <Image src="/logos/SBG_logo.png" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
            </span>
            <p className="font-lt-display text-[17px] font-semibold leading-tight tracking-tight text-sbg-ink">
              AWS Student Builder Group
              <span className="block text-[12.5px] font-normal tracking-normal text-sbg-ink-3">at Tulas University, Dehradun</span>
            </p>
          </div>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-sbg-ink-2">
            A student-led community learning, building and growing on the AWS cloud.
          </p>
        </div>

        <nav aria-label="Explore">
          <p className="t-eyebrow mb-4">Explore</p>
          <ul className="space-y-2.5">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[15px] text-sbg-ink-2 transition-colors hover:text-sbg-lilac-600">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Connect">
          <p className="t-eyebrow mb-4">Connect</p>
          <ul className="space-y-2.5">
            {CONNECT.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-[15px] text-sbg-ink-2 transition-colors hover:text-sbg-lilac-600"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Oversized wordmark: decorative */}
      <p
        aria-hidden="true"
        className="t-display pointer-events-none select-none whitespace-nowrap text-center text-[clamp(64px,17vw,260px)] leading-[0.8] text-transparent"
        style={{ backgroundImage: "linear-gradient(180deg, #CBB5FF 0%, rgba(203,181,255,0) 85%)", WebkitBackgroundClip: "text", backgroundClip: "text" }}
      >
        Build on cloud
      </p>

      <div className="relative mx-auto flex max-w-[1240px] flex-col gap-2 border-t border-[var(--line)] px-[var(--gutter)] py-6 text-[13px] text-sbg-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 AWS Student Builder Group, Tulas University.</p>
        <p>Design preview: Daylight Cloud</p>
      </div>
    </footer>
  );
}
