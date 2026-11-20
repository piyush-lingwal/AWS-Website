"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FileText, ClipboardCheck, Rocket } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STEPS = [
  {
    number: "01",
    icon: FileText,
    color: "text-sbg-accent-strong",
    tint: "var(--card-lilac)",
    title: "Pick Your Wing",
    description:
      "Browse the 6 Builder Wings, understand what each does, and identify the one that resonates with your interests.",
    detail: "No prerequisites · All branches welcome",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    color: "text-sbg-accent-strong",
    tint: "var(--card-peach)",
    title: "Submit Application",
    description:
      "Fill out a fast registration form in under 2 minutes. Select your wings and tell us your academic year.",
    detail: "Takes under 2 minutes",
  },
  {
    number: "03",
    icon: Rocket,
    color: "text-sbg-accent-strong",
    tint: "var(--card-mint)",
    title: "Join the Reveal",
    description:
      "Shortlisted candidates receive interview slots and are officially announced as part of the 2026 Core Team.",
    detail: "Official badge & induction",
  },
];

export function TeamSelectionRoadmap() {
  const sectionRef = useRef<HTMLElement>(null);
  const mobileListRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 0.8", "center center"] });
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const step1Opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const step1Y = useTransform(scrollYProgress, [0, 0.2], [25, 0]);
  const step1Scale = useTransform(scrollYProgress, [0, 0.2], [0.94, 1]);

  const step2Opacity = useTransform(scrollYProgress, [0.3, 0.55], [0, 1]);
  const step2Y = useTransform(scrollYProgress, [0.3, 0.55], [25, 0]);
  const step2Scale = useTransform(scrollYProgress, [0.3, 0.55], [0.94, 1]);

  const step3Opacity = useTransform(scrollYProgress, [0.7, 0.95], [0, 1]);
  const step3Y = useTransform(scrollYProgress, [0.7, 0.95], [25, 0]);
  const step3Scale = useTransform(scrollYProgress, [0.7, 0.95], [0.94, 1]);

  const stepTransforms = [
    { opacity: step1Opacity, y: step1Y, scale: step1Scale },
    { opacity: step2Opacity, y: step2Y, scale: step2Scale },
    { opacity: step3Opacity, y: step3Y, scale: step3Scale },
  ];

  // GSAP on-view animations for mobile steps & header
  useGSAP(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 88%",
            end: "bottom 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    }

    if (mobileListRef.current) {
      const mobileSteps = mobileListRef.current.querySelectorAll(".gsap-mobile-step");
      gsap.fromTo(
        mobileSteps,
        { y: 30, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: mobileListRef.current,
            start: "top 85%",
            end: "bottom 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} data-tone="bloom" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1240px] px-[var(--gutter)] py-24 md:py-32">
        {/* Header */}
        <div ref={headerRef} className="mx-auto mb-14 max-w-2xl text-center sm:mb-20">
          <p className="t-eyebrow flex items-center justify-center gap-3">
            <span className="t-pixel text-sbg-accent">01</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            How Selection Works
          </p>
          <h2 className="t-display mt-5 text-[clamp(34px,5vw,68px)] text-sbg-ink">
            3 Steps to Secure <span className="t-serif text-sbg-accent">Your Wing</span>
          </h2>
          <p className="t-lead mt-5">
            From application submission to official cohort induction
          </p>
        </div>

        {/* Desktop horizontal timeline */}
        <div className="relative hidden md:block">
          {/* Animated connecting line */}
          <div className="absolute left-[calc(100%/6)] right-[calc(100%/6)] top-[52px] h-px overflow-hidden bg-sbg-lilac-200">
            <motion.div
              style={{ width: lineWidth }}
              className="h-full bg-gradient-to-r from-sbg-lilac-400 via-sbg-lilac-600 to-sbg-spark"
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const transform = stepTransforms[idx];
              return (
                <motion.div
                  key={step.number}
                  style={{
                    opacity: transform.opacity,
                    y: transform.y,
                    scale: transform.scale,
                  }}
                  className="group relative"
                >
                  {/* Step badge */}
                  <div className="relative mb-8 flex justify-center">
                    <div className="surface relative flex h-[104px] w-[104px] flex-col items-center justify-center gap-1 rounded-[28px] transition-transform duration-300 group-hover:scale-105">
                      <Icon className={`relative z-10 h-6 w-6 ${step.color}`} />
                      <span className="t-pixel relative z-10 text-[13px] text-sbg-ink">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className="surface lift relative overflow-hidden rounded-[26px] p-7"
                    style={{ backgroundImage: `linear-gradient(155deg, ${step.tint} 0%, var(--wash-80) 58%)` }}
                  >
                    <h3 className="t-display mb-2 text-[24px] text-sbg-ink">{step.title}</h3>
                    <p className="mb-5 text-[15px] leading-relaxed text-sbg-ink-2">{step.description}</p>
                    <span className="inline-block rounded-full bg-[var(--chip-bg)] px-3.5 py-1.5 text-[11px] font-medium text-sbg-accent-strong">
                      {step.detail}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile vertical timeline (GSAP on-view stagger) */}
        <div ref={mobileListRef} className="space-y-4 md:hidden">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="gsap-mobile-step surface relative overflow-hidden rounded-[24px] p-5"
                style={{ backgroundImage: `linear-gradient(155deg, ${step.tint} 0%, var(--wash-80) 58%)` }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--chip-bg)]">
                    <Icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="t-eyebrow text-sbg-accent-strong">STEP {step.number}</span>
                    <h3 className="t-display text-[22px] leading-tight text-sbg-ink">{step.title}</h3>
                  </div>
                </div>

                <p className="mb-4 text-[15px] leading-relaxed text-sbg-ink-2">
                  {step.description}
                </p>

                <span className="inline-block rounded-full bg-[var(--chip-bg)] px-3 py-1 text-[11px] font-medium text-sbg-accent-strong">
                  {step.detail}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
