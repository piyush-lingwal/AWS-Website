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

const PREVIEW_EVENTS = [
  { tag: "Workshop", title: "Cloud Bootcamp", desc: "Get hands-on with AWS core services in an intensive two-day bootcamp.", tagColor: "text-primary-light bg-primary/10 border-primary/30", border: "border-primary/30 hover:border-primary/60 hover:shadow-[0_10px_25px_-8px_rgba(124,58,237,0.18)]", spotlightColor: "rgba(124, 58, 237, 0.12)" },
  { tag: "Hands-on Session", title: "Build With AWS", desc: "Go from idea to deployed application in a single guided afternoon session.", tagColor: "text-success bg-success/10 border-success/30", border: "border-success/30 hover:border-success/60 hover:shadow-[0_10px_25px_-8px_rgba(34,197,94,0.18)]", spotlightColor: "rgba(34, 197, 94, 0.12)" },
  { tag: "Innovation Challenge", title: "Hackathon", desc: "Compete in teams to solve real-world problems using cloud technologies.", tagColor: "text-warning bg-warning/10 border-warning/30", border: "border-warning/30 hover:border-warning/60 hover:shadow-[0_10px_25px_-8px_rgba(245,158,11,0.18)]", spotlightColor: "rgba(245, 158, 11, 0.12)" },
  { tag: "Industry Insights", title: "Expert Talk", desc: "Hear from cloud practitioners and AWS experts on what it takes to build at scale.", tagColor: "text-info bg-info/10 border-info/30", border: "border-info/30 hover:border-info/60 hover:shadow-[0_10px_25px_-8px_rgba(14,165,233,0.18)]", spotlightColor: "rgba(14, 165, 233, 0.12)" },
];

export function FeaturedEvents() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const batchStart = isMobile ? "top bottom" : "center bottom";
    const initialY = isMobile ? 20 : 30;

    gsap.from(".events-header-el", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".events-header",
        start: isMobile ? "top 95%" : "top 85%",
        toggleActions: "play reverse play reverse",
      },
    });

    gsap.set(".event-card", { opacity: 0, y: initialY, scale: 0.97 });
    ScrollTrigger.batch(".event-card", {
      onEnter: (elements) => {
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
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
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          overwrite: true,
        });
      },
      onLeaveBack: (elements) => {
        gsap.to(elements, {
          opacity: 0,
          y: initialY,
          scale: 0.97,
          duration: 0.3,
          overwrite: true,
        });
      },
      start: batchStart,
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="featured-events" className="bg-grid bg-noise relative overflow-hidden bg-bg border-t border-border">
      {/* Subtle purple heading glow */}
      <div aria-hidden className="pointer-events-none absolute left-1/4 top-8 h-[200px] w-[340px] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/10 via-purple-600/8 to-primary/10 blur-[90px]" />
      <div aria-hidden className="pointer-events-none absolute left-0 bottom-0 h-[350px] w-[400px] -translate-x-1/4 translate-y-1/4 rounded-full bg-accent/8 blur-[120px]" />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 py-20 md:py-28">
        <div className="events-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="events-header-el text-[11px] uppercase tracking-[0.16em] text-muted">Events</p>
            <h2 className="events-header-el mt-3 font-display text-[28px] sm:text-[34px] md:text-[42px] font-semibold leading-[1.1] tracking-tight text-text-primary">
              Learn Through{" "}
              <PixelHeading mode="uniform" className="text-gradient">Experiences</PixelHeading>
            </h2>
            <p className="events-header-el mt-4 text-[15px] leading-relaxed text-text-secondary max-w-lg">
              Every event is designed to help students explore cloud technologies through practical learning, collaboration, and innovation.
            </p>
          </div>
          <div className="events-header-el flex-shrink-0">
            <Link
              href="/events"
              className="group inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-[13px] font-semibold text-primary-light transition-all duration-200 hover:bg-primary/20 hover:border-primary/60 cursor-pointer"
            >
              Explore All Events
              <ArrowRight size={14} animateOnHover />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PREVIEW_EVENTS.map((ev) => (
            <SpotlightCard
              key={ev.title}
              spotlightColor={ev.spotlightColor}
              className={`event-card group flex flex-col gap-3 p-5 ${ev.border}`}
            >
              <span className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-transform duration-300 group-hover:scale-105 ${ev.tagColor}`}>
                {ev.tag}
              </span>
              <h3 className="font-display text-[15px] font-semibold text-text-primary group-hover:text-primary-light transition-colors duration-200">{ev.title}</h3>
              <p className="text-[13px] leading-relaxed text-text-secondary">{ev.desc}</p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
