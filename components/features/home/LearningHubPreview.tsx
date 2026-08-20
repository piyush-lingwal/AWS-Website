"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@/components/ui/animate-ui/icons/arrow-right";
import { PixelHeading } from "@/components/ui/pixel-heading-character";
import { SpotlightCard } from "@/components/ui/spotlight-card";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HUB_TOPICS = [
  { label: "AWS Fundamentals", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  ), accent: "text-primary-light bg-primary/10", border: "border-primary/30 hover:border-primary/60 hover:shadow-[0_6px_20px_-6px_rgba(124,58,237,0.15)]", spotlightColor: "rgba(124, 58, 237, 0.12)" },
  { label: "Cloud Roadmaps", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17h3.5a3.5 3.5 0 0 0 7 0H17a2 2 0 0 0 2-2v-4l-3-4H5a2 2 0 0 0-2 2v8z"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>
    </svg>
  ), accent: "text-accent bg-accent/10", border: "border-accent/30 hover:border-accent/60 hover:shadow-[0_6px_20px_-6px_rgba(6,182,212,0.15)]", spotlightColor: "rgba(6, 182, 212, 0.12)" },
  { label: "Hands-on Labs", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ), accent: "text-success bg-success/10", border: "border-success/30 hover:border-success/60 hover:shadow-[0_6px_20px_-6px_rgba(34,197,94,0.15)]", spotlightColor: "rgba(34, 197, 94, 0.12)" },
  { label: "Certification Guides", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ), accent: "text-warning bg-warning/10", border: "border-warning/30 hover:border-warning/60 hover:shadow-[0_6px_20px_-6px_rgba(245,158,11,0.15)]", spotlightColor: "rgba(245, 158, 11, 0.12)" },
  { label: "Project Tutorials", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/>
    </svg>
  ), accent: "text-info bg-info/10", border: "border-info/30 hover:border-info/60 hover:shadow-[0_6px_20px_-6px_rgba(14,165,233,0.15)]", spotlightColor: "rgba(14, 165, 233, 0.12)" },
  { label: "Interview Prep", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
    </svg>
  ), accent: "text-error bg-error/10", border: "border-error/30 hover:border-error/60 hover:shadow-[0_6px_20px_-6px_rgba(239,68,68,0.15)]", spotlightColor: "rgba(239, 68, 68, 0.12)" },
];

export function LearningHubPreview() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const batchStart = isMobile ? "top bottom" : "center bottom";
    const initialY = isMobile ? 20 : 25;

    gsap.from(".hub-header-el", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".hub-header",
        start: isMobile ? "top 95%" : "top 85%",
        toggleActions: "play reverse play reverse",
      },
    });

    gsap.set(".hub-topic-card", { opacity: 0, y: initialY, scale: 0.96 });
    ScrollTrigger.batch(".hub-topic-card", {
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
    <section ref={containerRef} id="learning-hub-preview" className="bg-grid bg-noise relative overflow-hidden bg-bg border-t border-border">
      {/* Subtle purple heading glow */}
      <div aria-hidden className="pointer-events-none absolute left-1/4 top-8 h-[200px] w-[340px] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/10 via-purple-600/8 to-primary/10 blur-[90px]" />
      <div aria-hidden className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-primary/8 blur-[130px]" />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Text */}
          <div className="hub-header">
            <p className="hub-header-el text-[11px] uppercase tracking-[0.16em] text-muted">
              Learning Hub
            </p>
            <h2 className="hub-header-el mt-4 font-display text-[28px] sm:text-[34px] md:text-[42px] font-semibold leading-[1.1] tracking-tight text-text-primary">
              Learn at{" "}
              <PixelHeading mode="uniform" className="text-gradient">Your Own Pace</PixelHeading>
            </h2>
            <p className="hub-header-el mt-5 text-[15px] sm:text-[16px] leading-relaxed text-text-secondary max-w-md">
              Whether you&apos;re taking your first step into cloud computing or preparing for AWS certifications, our Learning Hub brings together carefully curated resources to help you learn with confidence.
            </p>
            <div className="hub-header-el mt-8">
              <Link
                href="/learning-hub"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-primary-hover shadow-[0_0_24px_rgba(124,58,237,0.4)] hover:shadow-[0_0_32px_rgba(124,58,237,0.6)] cursor-pointer"
              >
                Open Learning Hub
                <ArrowRight size={14} animateOnHover />
              </Link>
            </div>
          </div>

          {/* Right topics grid */}
          <div className="grid grid-cols-2 gap-3">
            {HUB_TOPICS.map((t) => (
              <SpotlightCard
                key={t.label}
                spotlightColor={t.spotlightColor}
                className={`hub-topic-card group flex items-center gap-3 !rounded-xl p-4 ${t.border}`}
              >
                <div className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg ${t.accent} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  {t.icon}
                </div>
                <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                  {t.label}
                </span>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
