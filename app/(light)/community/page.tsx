import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight } from "@/components/ui/animate-ui/icons/arrow-right";
import { Users } from "@/components/ui/animate-ui/icons/users";
import { Mail, Instagram, MessageCircle, Calendar } from "lucide-react";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
import { Reveal } from "@/components/design/Reveal";

export const metadata: Metadata = {
  title: "Join Community | AWS Student Builder Group",
  description: "Connect with 50+ student builder at Tulas University, attend workshops, hackathons, and build real-world cloud projects.",
};

const COMMUNITY_CHANNELS = [
  {
    name: "Meetup Group",
    desc: "Join our official Meetup page to RSVP for upcoming in-person workshops, cloud bootcamps, and hackathons.",
    link: "https://www.meetup.com/aws-sbg-at-tulas-university/",
    icon: Calendar,
    cta: "Join on Meetup",
    tile: "#FFE1E6",
    brand: "#F64060",
  },
  {
    name: "WhatsApp Community",
    desc: "Get instant announcements, tech discussions, AWS credit updates, and peer networking in our WhatsApp group.",
    link: "https://whatsapp.com/channel/0029VbDJ4jD6WaKnCQZRWF2Z",
    icon: MessageCircle,
    cta: "Join WhatsApp Channel",
    tile: "#DDF3E6",
    brand: "#16A34A",
  },
  {
    name: "Instagram",
    desc: "Follow us for event highlights, builder spotlights, project showcases, and live updates.",
    link: "https://www.instagram.com/aws.sbgtulas",
    icon: Instagram,
    cta: "Follow on Instagram",
    tile: "#FFE7F1",
    brand: "#DB2777",
  },
  {
    name: "Email Newsletter",
    desc: "Receive monthly digests on upcoming cloud challenges, learning resources, and career opportunities.",
    link: "mailto:awssbg@tulas.edu.in",
    icon: Mail,
    cta: "Contact Team",
    tile: "#FFEBD3",
    brand: "#EA8A00",
  },
];

export default function CommunityPage() {
  return (
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <section data-tone="dawn" className="relative px-[var(--gutter)] pb-12 pt-36 sm:pb-16">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="t-eyebrow mb-5 flex items-center gap-2">
              <Users size={14} className="text-sbg-lilac-600" />
              <span>AWS SBG Builder Community</span>
            </p>
            <h1 className="t-display text-[clamp(40px,7vw,88px)] text-sbg-ink">
              Connect with <span className="t-serif">Student Builder</span>
            </h1>
            <p className="t-lead mt-5 max-w-2xl">
              Whether registrations are currently open or closed, our community is always active. Join our channels to participate in open sessions, collaborate on projects, and level up your cloud skills.
            </p>
          </Reveal>
        </section>

        <section data-tone="violet" className="relative px-[var(--gutter)] pb-24 sm:pb-32">
          <div className="mx-auto grid w-full max-w-4xl gap-6 sm:grid-cols-2">
            {COMMUNITY_CHANNELS.map((channel, i) => {
              const Icon = channel.icon;
              return (
                <Reveal key={channel.name} index={i} className="h-full">
                  <div className="surface lift group flex h-full flex-col justify-between rounded-[28px] p-7">
                    <div>
                      <div
                        className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: channel.tile, color: channel.brand }}
                      >
                        <Icon size={22} />
                      </div>
                      <h3 className="font-lt-display text-xl font-semibold text-sbg-ink">{channel.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-sbg-ink-2">{channel.desc}</p>
                    </div>

                    <div className="mt-6 border-t border-sbg-lilac-100 pt-4">
                      <a
                        href={channel.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-sbg-ink"
                      >
                        <span>{channel.cta}</span>
                        <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <Link href="/" className="btn btn-ghost">
              ← Back to Main Website
            </Link>
          </div>
        </section>

        <DesignFooter />
      </div>
    </>
  );
}
