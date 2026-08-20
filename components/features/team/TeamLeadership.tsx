"use client";

import React from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Github, Linkedin, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { PixelHeading } from "@/components/ui/pixel-heading-character";
import { LEADERSHIP_TEAM, LeadershipMember } from "./data";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function TeamLeadership() {
  const sectionRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const items = gsap.utils.toArray<HTMLElement>(".gsap-reveal-lead");
    items.forEach((item, idx) => {
      gsap.fromTo(
        item,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: idx * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            end: "bottom 12%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="leadership" className="relative py-16 sm:py-24 px-3.5 sm:px-6 lg:px-8 max-w-content mx-auto">
      {/* Section Header */}
      <div className="relative max-w-3xl mx-auto text-center mb-10 sm:mb-16">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-20 bg-[#7C3AED]/20 blur-3xl rounded-full pointer-events-none z-0" />
        
        <div className="gsap-reveal-lead inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] uppercase tracking-[0.2em] text-primary-light font-mono mb-3">
          <Sparkles className="w-3 h-3 text-primary-light" />
          <span>Leadership & Advisory</span>
        </div>

        <h2 className="gsap-reveal-lead relative z-10 font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-text-primary">
          Community{" "}
          <PixelHeading mode="uniform" className="text-gradient">
            Leadership.
          </PixelHeading>
        </h2>
        <p className="gsap-reveal-lead relative z-10 text-xs sm:text-sm text-text-secondary mt-2 max-w-md mx-auto">
          Guiding the next generation of cloud architects and software builders
        </p>
      </div>

      {/* 2-Column Grid Layout for Faculty Coordinator & SBG Leader */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 items-stretch">
        {LEADERSHIP_TEAM.map((leader: LeadershipMember, idx: number) => {
          const isFaculty = leader.id === "faculty-coordinator";

          return (
            <div
              key={leader.id}
              className="gsap-reveal-lead relative rounded-2xl sm:rounded-3xl bg-bg-card border border-border p-5 sm:p-8 flex flex-col justify-between overflow-hidden group hover:border-primary/40 transition-all duration-300 shadow-xl"
            >
              {/* Top Accent Glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-light/40 to-transparent" />
              
              <div className="absolute top-3.5 sm:top-4 right-4 sm:right-6 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted">
                0{idx + 1} // LEADERSHIP
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Header Profile Row */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                  {/* Photo */}
                  <div className="relative group/photo flex-shrink-0">
                    <div className="absolute -inset-1.5 sm:-inset-2 rounded-full bg-primary/25 blur-md opacity-50 group-hover/photo:opacity-90 transition-opacity" />
                    <div
                      className={`relative overflow-hidden bg-bg-surface border border-primary/30 shadow-lg transition-transform duration-300 group-hover/photo:scale-105 ${
                        isFaculty
                          ? "w-24 h-24 sm:w-32 sm:h-32 rounded-full"
                          : "w-24 h-32 sm:w-32 sm:h-40 rounded-2xl"
                      }`}
                    >
                      <Image
                        src={leader.avatar}
                        alt={leader.name}
                        fill
                        className={isFaculty ? "object-cover object-center scale-[1.38]" : "object-cover object-center"}
                      />
                    </div>
                  </div>

                  {/* Leader Metadata */}
                  <div className="space-y-1.5 sm:space-y-2 pt-0 sm:pt-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[11px] sm:text-xs font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary-light shrink-0" />
                      <span>{leader.titleBadge}</span>
                    </div>

                    <h3 className="text-xl sm:text-3xl font-semibold text-text-primary font-display tracking-tight">
                      {leader.name}
                    </h3>

                    {leader.bio && (
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans max-w-md">
                        {leader.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Action Footer */}
              {(leader.socials.github || leader.socials.linkedin || leader.socials.email) ? (
                <div className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-border/80">
                  {leader.socials.github && (
                    leader.socials.github === "#" ? (
                      <span
                        className="p-2.5 sm:p-3 rounded-xl bg-bg-surface border border-border text-muted opacity-75 cursor-default"
                        aria-label="GitHub"
                      >
                        <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                    ) : (
                      <a
                        href={leader.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 sm:p-3 rounded-xl bg-bg-surface border border-border text-muted hover:text-text-primary hover:border-primary/40 active:scale-95 transition-all"
                        aria-label="GitHub"
                      >
                        <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                      </a>
                    )
                  )}

                  {leader.socials.linkedin && (
                    leader.socials.linkedin === "#" ? (
                      <span
                        className="p-2.5 sm:p-3 rounded-xl bg-bg-surface border border-border text-muted opacity-75 cursor-default"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                    ) : (
                      <a
                        href={leader.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 sm:p-3 rounded-xl bg-bg-surface border border-border text-muted hover:text-[#0A66C2] hover:border-[#0A66C2]/40 active:scale-95 transition-all"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                      </a>
                    )
                  )}

                  {leader.socials.email && (
                    leader.socials.email === "#" ? (
                      <span
                        className="p-2.5 sm:p-3 rounded-xl bg-bg-surface border border-border text-muted opacity-75 cursor-default"
                        aria-label="Email"
                      >
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                    ) : (
                      <a
                        href={`mailto:${leader.socials.email}`}
                        className="p-2.5 sm:p-3 rounded-xl bg-bg-surface border border-border text-muted hover:text-accent hover:border-accent/40 active:scale-95 transition-all"
                        aria-label="Email"
                      >
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                      </a>
                    )
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
