"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PixelHeading } from "@/components/ui/pixel-heading-character";
import { SpotlightCard } from "@/components/ui/spotlight-card";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const VALUES = [
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6M10 22h4" />
      </svg>
    ),
    label: "Learn by Building",
    accent: "text-primary-light bg-primary/10",
    border: "border-primary/30 hover:border-primary/60 hover:shadow-[0_10px_22px_-6px_rgba(124,58,237,0.18)]",
    spotlightColor: "rgba(124, 58, 237, 0.12)",
  },
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: "Grow Together",
    accent: "text-accent bg-accent/10",
    border: "border-accent/30 hover:border-accent/60 hover:shadow-[0_10px_22px_-6px_rgba(6,182,212,0.18)]",
    spotlightColor: "rgba(6, 182, 212, 0.12)",
  },
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
    label: "Create Real Projects",
    accent: "text-success bg-success/10",
    border: "border-success/30 hover:border-success/60 hover:shadow-[0_10px_22px_-6px_rgba(34,197,94,0.18)]",
    spotlightColor: "rgba(34, 197, 94, 0.12)",
  },
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 14.14 14.14" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
      </svg>
    ),
    label: "Share Knowledge",
    accent: "text-info bg-info/10",
    border: "border-info/30 hover:border-info/60 hover:shadow-[0_10px_22px_-6px_rgba(14,165,233,0.18)]",
    spotlightColor: "rgba(14, 165, 233, 0.12)",
  },
];

export function OurMission() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const batchStart = isMobile ? "top bottom" : "center bottom";
    const initialY = isMobile ? 20 : 25;

    gsap.from(".mission-header-el", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".mission-header",
        start: isMobile ? "top 95%" : "top 85%",
        toggleActions: "play reverse play reverse",
      },
    });

    gsap.set(".mission-value-card", { opacity: 0, y: initialY, scale: 0.96 });
    ScrollTrigger.batch(".mission-value-card", {
      onEnter: (elements) => {
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: "power3.out",
          overwrite: true,
        });
      },
      onEnterBack: (elements) => {
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: "power3.out",
          overwrite: true,
        });
      },
      onLeaveBack: (elements) => {
        gsap.to(elements, {
          opacity: 0,
          y: initialY,
          scale: 0.96,
          duration: 0.3,
          overwrite: true,
        });
      },
      start: batchStart,
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="mission" className="bg-grid bg-noise relative overflow-hidden bg-bg border-t border-border">
      {/* Subtle purple heading glow */}
      <div aria-hidden className="pointer-events-none absolute left-1/4 top-8 h-[200px] w-[340px] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/10 via-purple-600/8 to-primary/10 blur-[90px]" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left text */}
          <div className="mission-header">
            <p className="mission-header-el text-[11px] uppercase tracking-[0.16em] text-muted">
              Who We Are
            </p>
            <h2 className="mission-header-el mt-4 font-display text-[28px] sm:text-[34px] md:text-[42px] font-semibold leading-[1.1] tracking-tight text-text-primary">
              Empowering Students to{" "}
              <PixelHeading mode="uniform" className="text-gradient">Build with Cloud</PixelHeading>
            </h2>
            <p className="mission-header-el mt-5 text-[15px] sm:text-[16px] leading-relaxed text-text-secondary">
              AWS Student Builder Group at Tulas University is a student-led technical community focused on making cloud computing accessible, practical, and exciting for everyone.
            </p>
            <p className="mission-header-el mt-3 text-[15px] sm:text-[16px] leading-relaxed text-text-secondary">
              We believe the best way to learn is by building. Through workshops, collaborative projects, technical sessions, and hackathons — we help students gain real-world skills while growing alongside an ambitious community.
            </p>
          </div>

          {/* Right values */}
          <div className="grid grid-cols-2 gap-4">
            {VALUES.map((v) => (
              <SpotlightCard
                key={v.label}
                spotlightColor={v.spotlightColor}
                className={`mission-value-card group flex flex-col gap-3 p-5 ${v.border}`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${v.accent} transition-transform duration-300 group-hover:scale-110`}>
                  {v.icon}
                </div>
                <span className="font-display text-[14px] sm:text-[15px] font-semibold text-text-primary">
                  {v.label}
                </span>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
