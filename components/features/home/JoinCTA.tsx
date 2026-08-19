"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { PixelHeading } from "@/components/ui/pixel-heading-character";

import { useRecruitment } from "@/hooks/useRecruitment";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function JoinCTA() {
  const { isOpen } = useRecruitment();
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".cta-header-el", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".cta-header",
        start: "top 85%",
        toggleActions: "play reverse play reverse",
      },
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="join-cta" className="bg-grid bg-noise relative overflow-hidden bg-[#0a0712] border border-white/10 mt-16 mb-16 sm:mt-24 sm:mb-24 py-10 sm:py-14 px-6 rounded-2xl max-w-4xl mx-4 sm:mx-6 lg:mx-auto shadow-[0_0_30px_rgba(124,58,237,0.12)]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#120d20] to-[#090610]" />
      {/* Subtle purple heading glow */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[360px] rounded-full bg-gradient-to-r from-primary/12 via-purple-600/10 to-primary/12 blur-[90px]" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />

      <div className="relative mx-auto max-w-2xl text-center z-10">
        <div className="cta-header">
          <p className="cta-header-el text-[11px] uppercase tracking-[0.16em] text-muted">
            Start Your Journey
          </p>

          <h2 className="cta-header-el mt-3 font-display text-[24px] sm:text-[32px] md:text-[38px] font-semibold leading-[1.1] tracking-tight text-text-primary">
            Ready to Start Your{" "}
            <PixelHeading mode="uniform" className="text-gradient">Cloud Journey?</PixelHeading>
          </h2>

          <p className="cta-header-el mt-3.5 text-[14px] sm:text-[15px] leading-relaxed text-text-secondary">
            Join a community where curiosity turns into innovation. Learn modern cloud technologies, build meaningful projects, and grow alongside an ambitious team.
          </p>

          <div className="cta-header-el mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="https://bit.ly/4cfwwZQ"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-[13px] font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.4)] transition-all duration-300 hover:bg-primary-hover hover:scale-105 hover:shadow-[0_0_35px_rgba(124,58,237,0.65)]"
            >
              Become a Builder
            </a>
            <a
              href="https://www.meetup.com/tulas-university-dehradun/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#F64060]/30 bg-[#F64060]/10 px-6 py-3 text-[13px] font-semibold text-[#F64060] transition-all duration-200 hover:bg-[#F64060]/20 hover:border-[#F64060]/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.16 11.23c-1.35-1.92-3.13-2.61-4.81-2.07-1 .31-1.74 1.07-2.18 1.96a4.29 4.29 0 0 0-4.04-1.96c-1.63.15-2.85 1.15-3.4 2.45-.19-.4-.44-.76-.78-1.07-1.12-1.07-2.6-1.11-3.6-.1-1.03 1.03-1.07 2.62.1 3.73.54.51 1.25.75 1.95.73-1.03 1.05-1 2.7.07 3.76 1.05 1.03 2.72 1.02 3.78-.05.57-.57.88-1.32.93-2.1.84.58 1.83.74 2.7.53 1.1-.28 2.05-1 2.62-1.94 1.16 1.54 3.03 1.95 4.67 1.06 1.7-.93 2.37-3.04 1.99-4.93z"/>
              </svg>
              Join on Meetup
            </a>
          </div>

          <p className="cta-header-el mt-6 text-[12px] text-muted">
            50+ students have already joined the builders community
          </p>
        </div>
      </div>
    </section>
  );
}
