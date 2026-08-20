import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ArrowRight } from "@/components/ui/animate-ui/icons/arrow-right";
import { Users } from "@/components/ui/animate-ui/icons/users";
import { Sparkles } from "@/components/ui/animate-ui/icons/sparkles";
import { Mail, Instagram, MessageCircle, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Join Community | AWS Student Builder Group",
  description: "Connect with 50+ student builders at Tulas University, attend workshops, hackathons, and build real-world cloud projects.",
};

const COMMUNITY_CHANNELS = [
  {
    name: "Meetup Group",
    desc: "Join our official Meetup page to RSVP for upcoming in-person workshops, cloud bootcamps, and hackathons.",
    link: "https://www.meetup.com/aws-sbg-at-tulas-university/",
    icon: Calendar,
    cta: "Join on Meetup",
    cardBorder: "border border-[#F64060]/25 hover:border-[#F64060]/60 hover:shadow-[0_12px_35px_-8px_rgba(246,64,96,0.35)]",
    hoverTitle: "group-hover:text-[#F64060]",
    hoverCta: "group-hover:text-[#F64060]",
    iconColor: "group-hover:text-[#F64060]",
    iconBoxBg: "bg-[#F64060]/10 text-[#F64060]",
  },
  {
    name: "WhatsApp Community",
    desc: "Get instant announcements, tech discussions, AWS credit updates, and peer networking in our WhatsApp group.",
    link: "https://whatsapp.com/channel/0029VbDJ4jD6WaKnCQZRWF2Z",
    icon: MessageCircle,
    cta: "Join WhatsApp Channel",
    cardBorder: "border border-[#25D366]/25 hover:border-[#25D366]/60 hover:shadow-[0_12px_35px_-8px_rgba(37,211,102,0.35)]",
    hoverTitle: "group-hover:text-[#25D366]",
    hoverCta: "group-hover:text-[#25D366]",
    iconColor: "group-hover:text-[#25D366]",
    iconBoxBg: "bg-[#25D366]/10 text-[#25D366]",
  },
  {
    name: "Instagram",
    desc: "Follow us for event highlights, builder spotlights, project showcases, and live updates.",
    link: "https://www.instagram.com/aws.sbgtulas",
    icon: Instagram,
    cta: "Follow on Instagram",
    cardBorder: "border border-[#E4405F]/25 hover:border-[#E4405F]/60 hover:shadow-[0_12px_35px_-8px_rgba(228,64,95,0.35)] hover:bg-gradient-to-br hover:from-[#f09433]/5 hover:via-[#dc2743]/5 hover:to-[#bc1888]/5",
    hoverTitle: "group-hover:bg-gradient-to-r group-hover:from-[#f09433] group-hover:via-[#dc2743] group-hover:to-[#bc1888] group-hover:bg-clip-text group-hover:text-transparent",
    hoverCta: "group-hover:bg-gradient-to-r group-hover:from-[#f09433] group-hover:via-[#dc2743] group-hover:to-[#bc1888] group-hover:bg-clip-text group-hover:text-transparent",
    arrowColor: "group-hover:text-[#E4405F]",
    iconColor: "group-hover:text-[#E4405F]",
    iconBoxBg: "bg-gradient-to-tr from-[#f09433]/15 via-[#dc2743]/15 to-[#bc1888]/15 text-[#E4405F]",
  },
  {
    name: "Email Newsletter",
    desc: "Receive monthly digests on upcoming cloud challenges, learning resources, and career opportunities.",
    link: "mailto:awssbg@tulas.edu.in",
    icon: Mail,
    cta: "Contact Team",
    cardBorder: "border border-[#FF9900]/25 hover:border-[#FF9900]/60 hover:shadow-[0_12px_35px_-8px_rgba(255,153,0,0.35)]",
    hoverTitle: "group-hover:text-[#FF9900]",
    hoverCta: "group-hover:text-[#FF9900]",
    iconColor: "group-hover:text-[#FF9900]",
    iconBoxBg: "bg-[#FF9900]/10 text-[#FF9900]",
  },
];

export default function CommunityPage() {
  return (
    <main className="relative min-h-screen bg-black text-white pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Background Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]"
      />
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-content mx-auto flex flex-col items-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-primary-light mb-6">
          <Users size={14} className="text-accent" />
          <span>AWS SBG Builder Community</span>
        </div>

        {/* Page Title */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-center tracking-tight max-w-3xl leading-tight">
          Connect with <span className="text-gradient">Student Builders</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-text-secondary text-center max-w-2xl leading-relaxed">
          Whether registrations are currently open or closed, our community is always active. Join our channels to participate in open sessions, collaborate on projects, and level up your cloud skills.
        </p>

        {/* Community Channel Cards Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 w-full max-w-4xl">
          {COMMUNITY_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <div
                key={channel.name}
                className={`group relative overflow-hidden rounded-2xl bg-white/[0.02] p-6 backdrop-blur-xl transition-all duration-300 ${channel.cardBorder} hover:bg-white/[0.05] hover:-translate-y-1.5 flex flex-col justify-between`}
              >
                <div>
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${channel.iconBoxBg} ${channel.iconColor}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className={`font-display text-xl font-bold text-white transition-colors duration-300 ${channel.hoverTitle}`}>
                    {channel.name}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    {channel.desc}
                  </p>
                </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <a
                  href={channel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-light transition-colors duration-300"
                >
                  <span className={`transition-colors duration-300 ${channel.hoverCta}`}>{channel.cta}</span>
                  <ArrowRight size={15} className={`transition-all duration-300 group-hover:translate-x-1 ${channel.arrowColor || "group-hover:text-white"}`} />
                </a>
              </div>
            </div>
          );
        })}
        </div>

        {/* Back to Home CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-text-primary hover:bg-white/10 transition-colors"
          >
            ← Back to Main Website
          </Link>
        </div>
      </div>
    </main>
  );
}
