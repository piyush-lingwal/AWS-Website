"use client";

import * as React from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PixelHeading } from "@/components/ui/pixel-heading-character";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ECOSYSTEM_NODES = [
  { name: "Artificial Intelligence", link: "https://aws.amazon.com/ai/" },
  { name: "Skill Builder", link: "https://explore.skillbuilder.aws/" },
  { name: "AWS Educate", link: "https://aws.amazon.com/education/awseducate/" },
  { name: "Community Builders", link: "https://aws.amazon.com/developer/community/community-builders/" },
  { name: "Student Builder Groups", link: "https://builder.aws.com/content/3C075iQJeEx03mnzHwmXO9zdgEG/aws-student-builder-groups" },
  { name: "AWS Events", link: "https://aws.amazon.com/events/" },
  { name: "Certification", link: "https://aws.amazon.com/certification/" },
  { name: "Cloud", link: "https://aws.amazon.com/what-is-aws/" },
];

export function AboutEcosystem() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    gsap.from(".ecosystem-header-el", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".ecosystem-header",
        start: isMobile ? "top 95%" : "top 85%",
        toggleActions: "play reverse play reverse",
      },
    });

    // Center node animation
    gsap.fromTo(".ecosystem-center",
      { opacity: 0, scale: 0.6 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".ecosystem-graph",
          start: isMobile ? "top 95%" : "top 80%",
          toggleActions: "play reverse play reverse",
        },
      }
    );

    // SVG lines fade & draw animation
    gsap.fromTo(".ecosystem-line",
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".ecosystem-graph",
          start: isMobile ? "top 95%" : "top 80%",
          toggleActions: "play reverse play reverse",
        },
      }
    );

    // Outer nodes animation
    gsap.set(".ecosystem-node", { opacity: 0, scale: 0.6 });
    ScrollTrigger.batch(".ecosystem-node", {
      onEnter: (elements) => {
        gsap.to(elements, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: "back.out(1.7)",
          overwrite: true,
        });
      },
      onEnterBack: (elements) => {
        gsap.to(elements, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: "back.out(1.7)",
          overwrite: true,
        });
      },
      onLeaveBack: (elements) => {
        gsap.to(elements, {
          opacity: 0,
          scale: 0.6,
          duration: 0.3,
          overwrite: true,
        });
      },
      start: isMobile ? "top bottom" : "center bottom",
    });

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => clearTimeout(refreshTimer);
  }, { scope: containerRef });

  // Calculate positions for 8 nodes in a circle
  const getNodePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 38; // % from center for perfect breathing room
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  };

  return (
    <section ref={containerRef} className="bg-grid bg-noise relative overflow-hidden bg-bg">
      {/* Background ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 top-0 h-[450px] w-[450px] translate-x-1/2 rounded-full bg-primary/10 blur-[130px]"
      />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 py-20 md:py-28">
        <div className="ecosystem-header text-center max-w-2xl mx-auto">
          <p className="ecosystem-header-el text-[11px] uppercase tracking-[0.16em] text-muted">
            The Ecosystem
          </p>
          <h2 className="ecosystem-header-el mt-4 font-display text-[28px] sm:text-[32px] md:text-[40px] font-semibold leading-[1.1] tracking-tight text-text-primary">
            Part of the AWS{" "}
            <PixelHeading mode="uniform" className="text-gradient">ecosystem.</PixelHeading>
          </h2>
          <p className="ecosystem-header-el mt-4 text-[15px] sm:text-[16px] leading-relaxed text-text-secondary">
            We&apos;re connected to a vast network of AWS programs, resources, and communities.
          </p>
        </div>

        {/* Graph visualization container */}
        <div className="ecosystem-graph relative mt-14 mx-auto w-full max-w-[340px] sm:max-w-[520px] lg:max-w-[640px] aspect-square">
          {/* SVG lines connecting center to nodes */}
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100">
            {ECOSYSTEM_NODES.map((_, i) => {
              const pos = getNodePosition(i, ECOSYSTEM_NODES.length);
              return (
                <line
                  key={`line-${i}`}
                  className="ecosystem-line"
                  x1="50"
                  y1="50"
                  x2={pos.x}
                  y2={pos.y}
                  stroke="url(#lineGrad)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#C084FC" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.85" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center node with multi-layered glow and AWS logo */}
          <div className="ecosystem-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-full border-2 border-primary/60 bg-surface/90 shadow-[0_0_50px_rgba(124,58,237,0.5)] p-3 backdrop-blur-xl">
            {/* Ambient inner pulse ring */}
            <div className="pointer-events-none absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-25" />
            <Image
              src="/logos/AWS_logo.svg"
              alt="AWS Logo"
              width={80}
              height={50}
              className="h-8 sm:h-12 w-auto object-contain text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
            />
          </div>

          {/* Outer nodes */}
          {ECOSYSTEM_NODES.map((node, i) => {
            const pos = getNodePosition(i, ECOSYSTEM_NODES.length);
            return (
              <div
                key={node.name}
                className="ecosystem-node absolute z-20 -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                }}
              >
                <a
                  href={node.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-full border border-white/10 bg-surface/90 px-3 py-1.5 sm:px-4.5 sm:py-2.5 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:border-primary/60 group-hover:bg-primary/10 group-hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] group-hover:scale-105 cursor-pointer"
                >
                  <span className="text-[10px] sm:text-[13px] font-semibold text-text-secondary group-hover:text-text-primary whitespace-nowrap transition-colors">
                    {node.name}
                  </span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
