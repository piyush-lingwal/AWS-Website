"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CirclePlus } from "@/components/ui/animate-ui/icons/circle-plus";
import { Layers } from "@/components/ui/animate-ui/icons/layers";
import { Hammer } from "@/components/ui/animate-ui/icons/hammer";
import { Blocks } from "@/components/ui/animate-ui/icons/blocks";
import { PartyPopper } from "@/components/ui/animate-ui/icons/party-popper";
import { BadgeCheck } from "@/components/ui/animate-ui/icons/badge-check";
import { Star } from "@/components/ui/animate-ui/icons/star";
import { LayoutDashboard } from "@/components/ui/animate-ui/icons/layout-dashboard";
import { ArrowRight } from "@/components/ui/animate-ui/icons/arrow-right";
import { ArrowLeft } from "@/components/ui/animate-ui/icons/arrow-left";
import { ArrowDown } from "@/components/ui/animate-ui/icons/arrow-down";
import { PixelHeading } from "@/components/ui/pixel-heading-character";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STEPS = [
  { icon: CirclePlus, title: "Join SBG", description: "Become part of the builder community.", phase: "01", direction: "right" },
  { icon: Layers, title: "AWS Fundamentals", description: "Core services, IAM, cloud concepts.", phase: "02", direction: "right" },
  { icon: Hammer, title: "Hands-on Workshops", description: "Build in live sandbox environments.", phase: "03", direction: "down" },
  { icon: Blocks, title: "Cloud Projects", description: "Deploy real applications on AWS.", phase: "04", direction: "left" },
  { icon: PartyPopper, title: "Hackathons", description: "Compete, build fast, win prizes.", phase: "05", direction: "left" },
  { icon: BadgeCheck, title: "AWS Certifications", description: "Earn industry-recognized credentials.", phase: "06", direction: "down" },
  { icon: Star, title: "Leadership", description: "Mentor, organize, and lead initiatives.", phase: "07", direction: "right" },
  { icon: LayoutDashboard, title: "Internships & Careers", description: "Launch your cloud career.", phase: "08", direction: "end" },
];

const GRID_POSITIONS = [
  "lg:col-start-1 lg:row-start-1", // 01
  "lg:col-start-2 lg:row-start-1", // 02
  "lg:col-start-3 lg:row-start-1", // 03
  "lg:col-start-3 lg:row-start-2", // 04
  "lg:col-start-2 lg:row-start-2", // 05
  "lg:col-start-1 lg:row-start-2", // 06
  "lg:col-start-1 lg:row-start-3", // 07
  "lg:col-start-2 lg:row-start-3", // 08
];

export function AboutTimeline() {
  const containerRef = React.useRef<HTMLElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);

  useGSAP(() => {
    gsap.from(".timeline-header-el", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".timeline-header",
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });

    const cards = gsap.utils.toArray<HTMLElement>(".s-timeline-card");
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

    if (isDesktop) {
      gsap.set(cards, { opacity: 0, y: 35, scale: 0.92 });

      // Animate SVG Flipped-S track stroke draw when heading reaches just below navbar (80px)
      if (pathRef.current && headingRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80px",
            end: "+=2600",
            scrub: 0.8,
          },
        });
      }

      // Pin section on desktop when the h2 heading reaches just below the navbar (80px)
      if (headingRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 140px",
            end: "+=2600",
            pin: containerRef.current,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        cards.forEach((card, index) => {
          tl.to(
            card,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: "power2.out",
            },
            index * 0.9
          );
        });
      }
    } else {
      // Mobile view: NO PINNING! Cards reveal smoothly as user scrolls naturally
      gsap.set(cards, { opacity: 0, y: 30, scale: 0.95 });
      ScrollTrigger.batch(cards, {
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            overwrite: true,
          });
        },
        onLeaveBack: (batch) => {
          gsap.to(batch, {
            opacity: 0,
            y: 30,
            scale: 0.95,
            duration: 0.3,
            overwrite: true,
          });
        },
        start: "top 88%",
      });
    }

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => clearTimeout(refreshTimer);
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-grid bg-noise relative overflow-hidden bg-bg min-h-screen flex flex-col justify-center py-6 lg:py-10">
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-10 bottom-10 h-[400px] w-[400px] rounded-full bg-secondary/8 blur-[140px]"
      />

      <div className="relative mx-auto max-w-content w-full px-4 sm:px-6">
        {/* Header */}
        <div className="timeline-header max-w-2xl text-center md:text-left mx-auto md:mx-0 mb-6 lg:mb-7">
          <p className="timeline-header-el text-[11px] uppercase tracking-[0.16em] text-muted">
            Your Journey
          </p>
          <h2
            ref={headingRef}
            className="timeline-header-el mt-2 font-display text-[26px] sm:text-[30px] md:text-[34px] font-semibold leading-[1.1] tracking-tight text-text-primary"
          >
            The builder{" "}
            <PixelHeading mode="uniform" className="text-gradient">journey.</PixelHeading>
          </h2>
          <p className="timeline-header-el mt-2 max-w-lg text-[13.5px] sm:text-[14.5px] leading-relaxed text-text-secondary">
            From day one to career launch — here&apos;s the path every builder walks in a serpentine flow.
          </p>
        </div>

        {/* Desktop Flipped-S Serpentine Layout */}
        <div className="relative mt-2">
          {/* Connector Track SVG Overlay for Desktop */}
          <div className="hidden lg:block pointer-events-none absolute -inset-x-6 -inset-y-4 z-0">
            <svg className="w-full h-full" viewBox="0 0 1000 500" fill="none">
              {/* Background guide path */}
              <path
                d="M 166 80 L 833 80 C 960 80 960 250 833 250 L 166 250 C 40 250 40 420 166 420 L 500 420"
                stroke="rgba(255, 255, 255, 0.07)"
                strokeWidth="3"
                strokeDasharray="6 6"
              />
              {/* Animated glowing serpentine stroke path with shimmer */}
              <path
                ref={pathRef}
                d="M 166 80 L 833 80 C 960 80 960 250 833 250 L 166 250 C 40 250 40 420 166 420 L 500 420"
                stroke="url(#flipped-s-shimmer-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                className="drop-shadow-[0_0_14px_rgba(192,132,252,0.7)]"
              />
              <defs>
                <linearGradient id="flipped-s-shimmer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="35%" stopColor="#C084FC" />
                  <stop offset="50%" stopColor="#FFFFFF" />
                  <stop offset="65%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Cards Grid: 3 columns on lg+, vertical on mobile */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const positionClass = GRID_POSITIONS[i];

              return (
                <div
                  key={i}
                  className={`s-timeline-card group relative overflow-hidden flex flex-col justify-between rounded-xl border border-border/80 bg-bg-card/90 backdrop-blur-xl p-4 sm:p-4.5 transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.3)] hover:-translate-y-1 ${positionClass}`}
                >
                  {/* Shimmer light beam pass effect on card reveal / hover */}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/15 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  </div>

                  {/* Top row: Phase Badge & Step Direction Indicator */}
                  <div className="relative z-10 flex items-center justify-between mb-2">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[10.5px] font-mono font-medium uppercase tracking-wider text-primary-light/70 bg-primary/5 rounded-full border border-primary/15 opacity-70 group-hover:opacity-100 transition-opacity">
                      Phase {step.phase}
                    </span>

                    {/* Flow arrow indicators */}
                    <div className="hidden lg:flex items-center text-muted/60 group-hover:text-primary-light transition-colors">
                      {step.direction === "right" && <ArrowRight size={16} animateOnHover loop />}
                      {step.direction === "left" && <ArrowLeft size={16} animateOnHover loop />}
                      {step.direction === "down" && <ArrowDown size={16} animateOnHover loop />}
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="relative z-10 flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 via-accent/15 to-info/10 border border-primary/30 text-primary-light group-hover:scale-110 group-hover:border-primary shadow-[0_0_15px_-3px_rgba(124,58,237,0.3)] transition-all">
                      <Icon size={17} strokeWidth={2} animateOnHover />
                    </div>
                    <h3 className="font-display text-[16px] font-semibold text-text-primary group-hover:text-primary-light transition-colors">
                      {step.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="relative z-10 text-[13px] leading-relaxed text-text-secondary">
                    {step.description}
                  </p>

                  {/* Mobile direction arrow */}
                  {i < STEPS.length - 1 && (
                    <div className="relative z-10 lg:hidden mt-3 pt-2 border-t border-border/50 flex items-center justify-end text-[10.5px] text-muted font-mono">
                      <ArrowDown size={13} className="text-primary/60" animateOnView />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
