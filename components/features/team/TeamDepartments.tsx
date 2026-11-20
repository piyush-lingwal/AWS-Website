"use client";

import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function TeamDepartments() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    gsap.from(".team-dept-el", {
      opacity: 0,
      y: 20,
      stagger: 0.12,
      duration: 0.65,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".team-dept-header",
        start: isMobile ? "top 95%" : "top 85%",
        toggleActions: "play reverse play reverse",
      },
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="team" data-tone="bloom" className="relative w-full overflow-hidden">
      <div className="relative mx-auto max-w-[1240px] px-[var(--gutter)] py-24 sm:py-32">
        <div className="team-dept-header relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">

          {/* Eyebrow */}
          <p className="team-dept-el t-eyebrow">
            Our Team · Cohort 2026
          </p>

          {/* Main headline */}
          <h2 className="team-dept-el t-display text-[clamp(42px,7vw,88px)] text-sbg-ink">
            Team <span className="t-serif text-sbg-accent">Revealing Soon</span>
          </h2>

          {/* CTAs */}
          <div className="team-dept-el flex flex-col items-center gap-3 sm:flex-row">
            <a href="/register" className="btn btn-primary">
              Apply Now →
            </a>
            <a href="/team" className="btn btn-ghost">
              Explore Wings
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}