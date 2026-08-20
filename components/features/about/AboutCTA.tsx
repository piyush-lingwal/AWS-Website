"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/animate-ui/icons/arrow-right";
import { CirclePlus } from "@/components/ui/animate-ui/icons/circle-plus";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PixelHeading } from "@/components/ui/pixel-heading-character";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { RecruitmentCTA } from "@/components/recruitment/RecruitmentCTA";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function AboutCTA() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".cta-el",
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".cta-container",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      }
    );

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => clearTimeout(refreshTimer);
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-grid bg-noise relative overflow-hidden bg-bg py-16 md:py-24">
      <div className="relative mx-auto max-w-content px-4 sm:px-6">
        {/* Ambient glow behind the card */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px] z-0"
        />

        <div className="cta-container relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.01] backdrop-blur-xl px-4 py-10 sm:px-12 sm:py-20 md:py-24 text-center max-w-4xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
          {/* Subtle inside grid overlay */}
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-100" />
          {/* Subtle inside gradient highlight */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
          
          <h2 className="cta-el font-display text-[32px] sm:text-[40px] md:text-[52px] font-semibold leading-[1.05] tracking-tight text-text-primary relative z-10">
            Ready to{" "}
            <PixelHeading mode="uniform" className="text-gradient">Build?</PixelHeading>
          </h2>
          <p className="cta-el mt-6 text-[15px] sm:text-[17px] leading-relaxed text-text-secondary max-w-lg mx-auto relative z-10">
            Join a community where ideas become projects,
            <br className="hidden sm:block" />
            projects become portfolios,
            <br className="hidden sm:block" />
            and portfolios become careers.
          </p>

          {/* Register / Join Community Button */}
          <div className="cta-el mt-10 relative z-10 flex justify-center">
            <RecruitmentCTA
              variant="border-gradient"
              openText="Register Now"
              closedText="Join Community"
              className="font-display text-[15px] font-bold px-8 py-3.5"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
