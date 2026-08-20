"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@/components/ui/animate-ui/icons/arrow-right";
import { PixelHeading } from "@/components/ui/pixel-heading-character";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const COMPARISONS = [
  { traditional: "Theory", sbg: "Hands-on Projects" },
  { traditional: "Classroom Assignments", sbg: "Production Applications" },
  { traditional: "Individual Learning", sbg: "Community Building" },
  { traditional: "Exams", sbg: "Certifications" },
  { traditional: "Local Network", sbg: "Global AWS Network" },
  { traditional: "Tutorials", sbg: "Real Deployments" },
];

export function AboutComparison() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".comparison-header-el", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".comparison-header",
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });

    gsap.set(".comparison-row", { opacity: 0, x: -20 });
    ScrollTrigger.batch(".comparison-row", {
      onEnter: (elements) => {
        gsap.to(elements, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          overwrite: true,
        });
      },
      onEnterBack: (elements) => {
        gsap.to(elements, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          overwrite: true,
        });
      },
      onLeaveBack: (elements) => {
        gsap.to(elements, {
          opacity: 0,
          x: -20,
          duration: 0.3,
          overwrite: true,
        });
      },
      start: "center bottom",
    });

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => clearTimeout(refreshTimer);
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-noise relative overflow-hidden bg-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 top-0 h-[350px] w-[350px] translate-x-1/2 rounded-full bg-secondary/8 blur-[120px]"
      />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 py-20 md:py-28">
        <div className="comparison-header max-w-2xl">
          <p className="comparison-header-el text-[11px] uppercase tracking-[0.16em] text-muted">
            Why SBG?
          </p>
          <h2 className="comparison-header-el mt-4 font-display text-[28px] sm:text-[32px] md:text-[40px] font-semibold leading-[1.1] tracking-tight text-text-primary">
            What makes us{" "}
            <PixelHeading mode="uniform" className="text-gradient">different.</PixelHeading>
          </h2>
        </div>

        <div className="mt-12 max-w-3xl mx-auto overflow-hidden rounded-xl border border-border">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 border-b border-border bg-white/[0.02] px-3.5 py-3.5 sm:px-8">
            <span className="text-[11px] sm:text-[13px] font-medium uppercase tracking-wider text-muted">
              Traditional Learning
            </span>
            <span className="text-muted/40">
              <ArrowRight size={14} animateOnView />
            </span>
            <span className="text-[11px] sm:text-[13px] font-medium uppercase tracking-wider text-primary-light text-right">
              AWS Student Builder Group
            </span>
          </div>

          {/* Comparison rows */}
          {COMPARISONS.map((row, i) => (
            <div
              key={i}
              className="comparison-row grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 border-b border-border/60 px-3.5 py-3.5 sm:px-8 transition-colors hover:bg-white/[0.015] last:border-b-0"
            >
              <span className="text-[12.5px] sm:text-[15px] text-text-secondary line-through decoration-muted/40">
                {row.traditional}
              </span>
              <span className="text-primary/60">
                <ArrowRight size={13} animateOnHover />
              </span>
              <span className="text-[12.5px] sm:text-[15px] font-medium text-text-primary text-right">
                {row.sbg}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
