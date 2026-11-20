"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Sparkles, Trophy, Users, Terminal } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BENEFITS = [
  { icon: Trophy, label: "Official AWS Badge & Certificate" },
  { icon: Shield, label: "Free AWS Cloud Credits" },
  { icon: Sparkles, label: "Direct Mentorship & Workshops" },
  { icon: Users, label: "Core Team Reveal Recognition" },
];

export function TeamCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const memberCardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (cardContainerRef.current) {
      gsap.fromTo(
        cardContainerRef.current,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardContainerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }

    if (pillsRef.current) {
      const pills = pillsRef.current.querySelectorAll(".gsap-cta-pill");
      gsap.fromTo(
        pills,
        { y: 20, opacity: 0, scale: 0.94 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: pillsRef.current,
            start: "top 88%",
            once: true,
          },
        }
      );
    }

    if (memberCardRef.current) {
      gsap.fromTo(
        memberCardRef.current,
        { y: 30, opacity: 0, scale: 0.94 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: 0.15,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: memberCardRef.current,
            start: "top 88%",
            once: true,
          },
        }
      );
    }

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
    return () => clearTimeout(timer);
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} data-tone="violet" className="relative overflow-hidden px-[var(--gutter)] pb-24 pt-20 sm:pb-32 sm:pt-28">
      <div className="relative mx-auto max-w-[1100px]">
        <div
          ref={cardContainerRef}
          className="relative overflow-hidden rounded-[36px] cta-card"
          style={{ backgroundImage: "linear-gradient(135deg, #2E1170 0%, #4A1D9E 52%, #6428D4 100%)", boxShadow: "0 50px 100px -40px rgba(46,17,112,0.7)" }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#AF8CFF]/35 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-[#FF9900]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center gap-10 p-7 sm:p-12 lg:flex-row lg:gap-14 lg:p-16">
            {/* Left: Text content */}
            <div className="flex-1 text-center text-white lg:text-left">
              {/* Eyebrow */}
              <p className="t-eyebrow mb-5 inline-flex items-center gap-2 !text-[#D9C8FF] sm:mb-6">
                <span className="animate-pulse text-sbg-spark">✦</span>
                <span>Limited Slots · Cohort 2026</span>
              </p>

              <h2 className="t-display mb-4 text-[clamp(32px,4.6vw,60px)] sm:mb-5">
                Your name on the{" "}
                <span className="t-serif text-[#D9C8FF]">2026 Core Team</span>{" "}
                Reveal.
              </h2>

              <p className="mx-auto mb-7 max-w-lg text-[15px] leading-relaxed text-white/80 sm:mb-8 sm:text-[17px] lg:mx-0">
                Builder Wing slots are limited. Don&apos;t wait for the reveal to wish you had applied. Claim your spot today.
              </p>

              {/* Benefit pills */}
              <div ref={pillsRef} className="mb-8 flex flex-wrap justify-center gap-2 lg:justify-start">
                {BENEFITS.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="gsap-cta-pill flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90 ring-1 ring-white/15 sm:text-xs"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[#D9C8FF]" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex w-full flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link href="/register" className="btn btn-light group w-full sm:w-auto">
                  <span>Submit Your Application</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#wings"
                  className="btn w-full text-white ring-1 ring-white/30 transition-colors hover:bg-white/10 sm:w-auto"
                >
                  <span>View Builder Wings</span>
                </a>
              </div>
            </div>

            {/* Right: Pass Card */}
            <div ref={memberCardRef} className="flex w-full shrink-0 justify-center sm:w-auto lg:w-72">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full max-w-[280px] rounded-[26px] bg-[var(--tile-bg)] p-6 shadow-[0_40px_70px_-30px_rgba(0,0,0,0.6)]"
                style={{ backgroundImage: "linear-gradient(155deg, var(--card-lilac) 0%, var(--wash-90) 58%)" }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-sbg-accent-strong" />
                    <span className="t-eyebrow !text-sbg-accent-strong">AWS SBG Tulas</span>
                  </div>
                  <span className="t-eyebrow">2026</span>
                </div>

                {/* Avatar placeholder */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sbg-lilac-100">
                  <span className="t-pixel text-xl text-sbg-accent-strong">?</span>
                </div>

                <div className="mb-2 h-2.5 w-24 rounded-full bg-sbg-lilac-200" />
                <div className="mb-5 h-2 w-16 rounded-full bg-sbg-lilac-100" />

                <div className="flex items-center gap-2 rounded-xl bg-[var(--tile-bg)] px-3 py-2 ring-1 ring-[color:var(--line)]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-sbg-accent-strong">Core Member · 2026</span>
                </div>

                <p className="t-eyebrow mt-4 text-center text-[10px]">
                  Your slot is waiting.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}