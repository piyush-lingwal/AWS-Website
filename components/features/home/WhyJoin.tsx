"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PixelHeading } from "@/components/ui/pixel-heading-character";

import { Terminal } from "@/components/ui/animate-ui/icons/terminal";
import { Route } from "@/components/ui/animate-ui/icons/route";
import { PartyPopper } from "@/components/ui/animate-ui/icons/party-popper";
import { Users } from "@/components/ui/animate-ui/icons/users";
import { BadgeCheck } from "@/components/ui/animate-ui/icons/badge-check";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const WHY_JOIN_ITEMS = [
  {
    icon: Terminal,
    title: "Hands-on Learning",
    desc: "Gain practical experience through interactive sessions and real-world projects on AWS.",
    gradient: "bg-gradient-to-br from-[#ff5b7c] via-[#f43f5e] to-[#e11d48]",
    shadow: "shadow-[0_12px_24px_-6px_rgba(244,63,94,0.35)]",
    curveOffset: "md:ml-0",
  },
  {
    icon: Route,
    title: "Career Growth",
    desc: "Develop skills that strengthen your portfolio, internship applications, and campus placements.",
    gradient: "bg-gradient-to-br from-[#ff8522] via-[#f97316] to-[#ea580c]",
    shadow: "shadow-[0_12px_24px_-6px_rgba(249,115,22,0.35)]",
    curveOffset: "md:ml-10 lg:ml-16",
  },
  {
    icon: PartyPopper,
    title: "Hackathons & Challenges",
    desc: "Collaborate, compete, and solve real-world problems in exciting innovation challenges.",
    gradient: "bg-gradient-to-br from-[#ff486e] via-[#fb7185] to-[#e11d48]",
    shadow: "shadow-[0_12px_24px_-6px_rgba(251,113,133,0.35)]",
    curveOffset: "md:ml-20 lg:ml-32",
  },
  {
    icon: Users,
    title: "Industry Exposure",
    desc: "Connect with mentors, industry professionals, and builder across the AWS community.",
    gradient: "bg-gradient-to-br from-[#ffaa17] via-[#f59e0b] to-[#d97706]",
    shadow: "shadow-[0_12px_24px_-6px_rgba(245,158,11,0.35)]",
    curveOffset: "md:ml-10 lg:ml-16",
  },
  {
    icon: BadgeCheck,
    title: "Cloud Certifications",
    desc: "Get guidance on AWS learning paths, digital badges, and certification preparation.",
    gradient: "bg-gradient-to-br from-[#ff5252] via-[#e11d48] to-[#be123c]",
    shadow: "shadow-[0_12px_24px_-6px_rgba(225,29,72,0.35)]",
    curveOffset: "md:ml-0",
  },
];

export function WhyJoin() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const batchStart = isMobile ? "top bottom" : "center bottom";
      const initialX = isMobile ? 30 : 60;

      // Heading slide-up animation
      gsap.from(".whyjoin-header-el", {
        opacity: 0,
        y: 25,
        stagger: 0.12,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".whyjoin-header",
          start: isMobile ? "top 95%" : "top 85%",
          toggleActions: "play reverse play reverse",
        },
      });

      // Cards batch animation with responsive x offset for mobile
      gsap.set(".whyjoin-item", { opacity: 0, x: initialX });

      ScrollTrigger.batch(".whyjoin-item", {
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
            x: initialX,
            duration: 0.4,
            stagger: 0.06,
            ease: "power2.inOut",
            overwrite: true,
          });
        },
        start: batchStart,
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="why-join"
      className="bg-grid bg-noise relative overflow-hidden bg-bg border-t border-border/40 py-16 sm:py-24 md:py-32"
    >
      {/* Background radial glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-10 top-1/3 h-[300px] sm:h-[400px] w-[300px] sm:w-[400px] -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-10 bottom-10 h-[250px] sm:h-[350px] w-[250px] sm:w-[350px] rounded-full bg-rose-500/10 blur-[130px]"
      />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Column: Heading (Vertically Centered) */}
          <div className="md:col-span-5 flex flex-col justify-center my-auto whyjoin-header">
            <div>
              <p className="whyjoin-header-el text-[11px] uppercase tracking-[0.16em] text-muted">
                Why Join Us
              </p>
              <h2 className="whyjoin-header-el mt-3 font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-[1.08]">
                More Than{" "}
                <span className="block sm:inline md:block">
                  <PixelHeading mode="uniform" className="text-gradient">
                    Just Workshops
                  </PixelHeading>
                </span>
              </h2>
            </div>
          </div>

          {/* Right Column: Vertical List of Items in curve */}
          <div className="md:col-span-7 whyjoin-list flex flex-col space-y-6 sm:space-y-9 lg:space-y-12">
            {WHY_JOIN_ITEMS.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className={`whyjoin-item-wrapper ${item.curveOffset}`}
                >
                  <div className="whyjoin-item group flex items-start space-x-4 sm:space-x-6 lg:space-x-7">
                    {/* Gradient Icon Box */}
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 shrink-0 rounded-[18px] sm:rounded-[22px] lg:rounded-[26px] ${item.gradient} ${item.shadow} flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1`}
                    >
                      <IconComponent
                        strokeWidth={1.75}
                        animateOnView
                        animateOnHover
                        initialOnAnimateEnd
                        className="text-white w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9"
                      />
                    </div>

                    {/* Content */}
                    <div className="pt-0.5 sm:pt-1 max-w-xl">
                      <h3 className="font-display text-base sm:text-xl md:text-[22px] font-bold text-text-primary tracking-tight leading-snug group-hover:text-primary-light transition-colors duration-200">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-base text-text-secondary leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
