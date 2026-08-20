"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CircuitBoard } from "@/components/ui/animate-ui/icons/circuit-board";
import { CloudUpload } from "@/components/ui/animate-ui/icons/cloud-upload";
import { Users } from "@/components/ui/animate-ui/icons/users";
import { PartyPopper } from "@/components/ui/animate-ui/icons/party-popper";
import { BadgeCheck } from "@/components/ui/animate-ui/icons/badge-check";
import { Compass } from "@/components/ui/animate-ui/icons/compass";
import { PixelHeading } from "@/components/ui/pixel-heading-character";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const PILLARS = [
  {
    icon: CircuitBoard,
    title: "Cloud Learning",
    description:
      "Hands-on workshops using real AWS services like EC2, Lambda, S3, DynamoDB, API Gateway, Amplify and Bedrock.",
    accent: "bg-primary/10 text-primary-light",
  },
  {
    icon: CloudUpload,
    title: "Build Projects",
    description:
      "Every member is encouraged to deploy actual cloud applications instead of only watching tutorials.",
    accent: "bg-accent/10 text-accent",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Peer learning, mentorship, code reviews, study groups and collaborative building.",
    accent: "bg-info/10 text-info",
  },
  {
    icon: PartyPopper,
    title: "Hackathons",
    description:
      "Participate in AWS GameDays, hackathons, build sprints and innovation challenges.",
    accent: "bg-warning/10 text-warning",
  },
  {
    icon: BadgeCheck,
    title: "Certifications",
    description:
      "Preparation sessions, study plans, practice exams, AWS Skill Builder resources and certification guidance.",
    accent: "bg-success/10 text-success",
  },
  {
    icon: Compass,
    title: "Career Growth",
    description:
      "Networking with AWS professionals, industry mentors, alumni and student builders from around the world.",
    accent: "bg-secondary/10 text-secondary",
  },
];

export function AboutPillars() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".pillars-header-el", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".pillars-header",
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });

    gsap.set(".pillar-card", { opacity: 0, y: 30, scale: 0.97 });
    ScrollTrigger.batch(".pillar-card", {
      onEnter: (elements) => {
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          overwrite: true,
        });
      },
      onLeaveBack: (elements) => {
        gsap.to(elements, {
          opacity: 0,
          y: 30,
          scale: 0.97,
          duration: 0.3,
          overwrite: true,
        });
      },
      start: "top 88%",
    });

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => clearTimeout(refreshTimer);
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-noise relative overflow-hidden bg-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/4 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-1/4 h-[350px] w-[350px] translate-x-1/4 rounded-full bg-accent/6 blur-[130px]"
      />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 py-20 md:py-28">
        <div className="pillars-header max-w-2xl">
          <p className="pillars-header-el text-[11px] uppercase tracking-[0.16em] text-muted">
            Our Pillars
          </p>
          <h2 className="pillars-header-el mt-4 font-display text-[28px] sm:text-[32px] md:text-[40px] font-semibold leading-[1.1] tracking-tight text-text-primary">
            Built on six{" "}
            <PixelHeading mode="uniform" className="text-gradient">pillars.</PixelHeading>
          </h2>
          <p className="pillars-header-el mt-4 max-w-lg text-[15px] sm:text-[16px] leading-relaxed text-text-secondary">
            Everything we do maps to these core areas — aligned with the official
            AWS Student Builder Group program.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="pillar-card group relative flex flex-col gap-4 rounded-xl border border-border bg-bg p-6 sm:p-7 transition-all duration-300 hover:border-primary/25 hover:bg-white/[0.02] hover:shadow-[0_0_30px_-8px_rgba(124,58,237,0.15)]"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${pillar.accent} transition-colors duration-200`}
                >
                  <Icon size={22} strokeWidth={1.75} animateOnHover />
                </span>
                <h3 className="font-display text-[17px] font-semibold tracking-tight text-text-primary">
                  {pillar.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-text-secondary">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
