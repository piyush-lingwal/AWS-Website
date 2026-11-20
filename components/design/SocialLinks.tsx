import Image from "next/image";

const SOCIALS = [
  { label: "Meetup", hint: "RSVP to upcoming events", href: "https://www.meetup.com/tulas-university-dehradun/", icon: "/logos/meetup-seeklogo.svg" },
  { label: "WhatsApp", hint: "Chat with fellow builders", href: "https://chat.whatsapp.com/Dy6s9Lo9rFpLNbrMkgUgQ6?s=cl&p=a&mlu=4&ilr=4", icon: "/logos/logo-whatsapp-icon.svg" },
  { label: "LinkedIn", hint: "News and highlights", href: "https://www.linkedin.com/company/aws-tulas/", icon: "/logos/logo-linkedin-icon.svg" },
  { label: "Instagram", hint: "Behind the scenes", href: "https://www.instagram.com/aws.sbgtulas", icon: "/logos/logo-instagram-icon.svg" },
] as const;

/** Pill row linking to the community channels. Meant to sit on the purple CTA card. */
export function SocialLinks() {
  return (
    <ul className="mt-7 flex flex-wrap gap-2.5">
      {SOCIALS.map((s) => (
        <li key={s.label}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.label} (opens in a new tab)`}
            title={s.hint}
            className="group flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pl-1.5 pr-4 text-[15px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white">
              <Image src={s.icon} alt="" width={22} height={22} className="h-[22px] w-[22px]" />
            </span>
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  );
}