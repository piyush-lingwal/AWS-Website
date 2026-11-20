import Image from "next/image";
import Link from "next/link";

const EXPLORE = [
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Team", href: "/team" },
  { label: "Gallery", href: "/gallery" },
  { label: "Learning Hub", href: "/learning-hub" },
] as const;

const RESOURCES = [
  { label: "AWS Console", href: "https://console.aws.amazon.com/" },
  { label: "AWS Skill Builder", href: "https://skillbuilder.aws" },
  { label: "AWS Educate", href: "https://aws.amazon.com/education/awseducate/" },
] as const;

const CONNECT = [
  { label: "Meetup", href: "https://www.meetup.com/tulas-university-dehradun/" },
  { label: "WhatsApp Community", href: "https://chat.whatsapp.com/Dy6s9Lo9rFpLNbrMkgUgQ6?s=cl&p=a&mlu=4&ilr=4" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/aws-tulas/" },
  { label: "Instagram", href: "https://www.instagram.com/aws.sbgtulas" },
  { label: "Email us", href: "mailto:awssbg@tulas.edu.in" },
] as const;

const isExternal = (href: string) => href.startsWith("http");

function ExternalList({ links }: { links: ReadonlyArray<{ label: string; href: string }> }) {
  return (
    <ul className="space-y-2.5">
      {links.map((l) => (
        <li key={l.href}>
          <a
            href={l.href}
            target={isExternal(l.href) ? "_blank" : undefined}
            rel={isExternal(l.href) ? "noopener noreferrer" : undefined}
            className="text-[15px] text-sbg-ink-2 transition-colors hover:text-sbg-accent"
          >
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function DesignFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--line)] bg-[var(--footer-bg)] backdrop-blur-sm">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-[var(--gutter)] pb-10 pt-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sbg-on-ink">
              <Image src="/logos/SBG_logo.png" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
            </span>
            <p className="font-lt-display text-[17px] font-semibold leading-tight tracking-tight text-sbg-ink">
              AWS Student Builder Group
              <span className="block text-[12.5px] font-normal tracking-normal text-sbg-ink-3">at Tulas University, Dehradun</span>
            </p>
          </div>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-sbg-ink-2">
            A student-led community at Tulas University, Dehradun dedicated to building, learning and growing on the AWS cloud.
          </p>
        </div>

        <nav aria-label="Explore">
          <p className="t-eyebrow mb-4">Explore</p>
          <ul className="space-y-2.5">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[15px] text-sbg-ink-2 transition-colors hover:text-sbg-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Resources">
          <p className="t-eyebrow mb-4">Resources</p>
          <ExternalList links={RESOURCES} />
        </nav>

        <nav aria-label="Connect">
          <p className="t-eyebrow mb-4">Connect</p>
          <ExternalList links={CONNECT} />
        </nav>
      </div>

      {/* Oversized wordmark: decorative */}
      <p
        aria-hidden="true"
        className="t-display pointer-events-none select-none whitespace-nowrap text-center text-[clamp(64px,17vw,260px)] leading-[0.8] text-transparent"
        style={{ backgroundImage: "linear-gradient(180deg, var(--lilac-300) 0%, transparent 85%)", WebkitBackgroundClip: "text", backgroundClip: "text" }}
      >
        Build on cloud
      </p>

      <div className="relative mx-auto flex max-w-[1240px] flex-col gap-2 border-t border-[var(--line)] px-[var(--gutter)] py-6 text-[13px] text-sbg-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} AWS SBG, Tulas University. All rights reserved.</p>
        <p className="text-[11px] text-sbg-ink-3/80">Created and crafted by AWS SBG Tech Lead</p>
      </div>
    </footer>
  );
}
