"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FileText, ClipboardCheck, Rocket, ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STEPS = [
  {
    number: "01",
    icon: FileText,
    color: "text-primary-light",
    glowColor: "rgba(124,58,237,0.6)",
    bg: "from-primary/20 via-primary/5 to-transparent",
    border: "border-primary/30",
    title: "Pick Your Wing",
    description:
      "Browse the 6 Builder Wings, understand what each does, and identify the one that resonates with your interests.",
    detail: "No prerequisites · All branches welcome",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    color: "text-accent",
    glowColor: "rgba(192,132,252,0.6)",
    bg: "from-accent/20 via-accent/5 to-transparent",
    border: "border-accent/30",
    title: "Submit Application",
    description:
      "Fill out a fast registration form in under 2 minutes. Select your wings and tell us your academic year.",
    detail: "Takes under 2 minutes",
  },
  {
    number: "03",
    icon: Rocket,
    color: "text-emerald-400",
    glowColor: "rgba(52,211,153,0.6)",
    bg: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    border: "border-emerald-500/30",
    title: "Join the Reveal",
    description:
      "Shortlisted candidates receive interview slots and are officially announced as part of the 2026 Core Team.",
    detail: "Official badge & induction",
  },
];

export function TeamSelectionRoadmap() {
  const sectionRef = useRef<HTMLDivElement>(null);
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
    <section ref={sectionRef} className="py-16 sm:py-20 px-3.5 sm:px-6 lg:px-8 max-w-content mx-auto overflow-hidden">
      
      {/* Header */}
      <div ref={headerRef} className="text-center max-w-xl mx-auto mb-10 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] uppercase tracking-[0.2em] text-primary-light font-mono mb-3">
          <Sparkles className="w-3 h-3 text-primary-light" />
          <span>How Selection Works</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-display text-text-primary tracking-tight">
          3 Steps to Secure Your Wing
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-2">
          From application submission to official cohort induction
        </p>
      </div>

      {/* Desktop horizontal timeline */}
      <div className="hidden md:block relative">
        {/* Animated connecting line */}
        <div className="absolute top-[52px] left-[calc(100%/6)] right-[calc(100%/6)] h-px bg-border overflow-hidden">
          <motion.div
            style={{ width: lineWidth }}
            className="h-full bg-gradient-to-r from-primary via-accent to-emerald-400"
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
                className="relative group"
              >
                {/* Step circle */}
                <div className="relative flex justify-center mb-8">
                  <div
                    className={`relative w-[104px] h-[104px] rounded-3xl bg-bg-card border ${step.border} flex flex-col items-center justify-center gap-1 group-hover:scale-105 transition-transform duration-300`}
                    style={{ boxShadow: `0 0 0 0 ${step.glowColor}` }}
                  >
                    <div
                      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ boxShadow: `0 0 30px -5px ${step.glowColor}` }}
                    />
                    <Icon className={`w-6 h-6 ${step.color} relative z-10`} />
                    <span className={`text-xs font-mono font-bold ${step.color} relative z-10`}>
                      {step.number}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-border opacity-0 group-hover:opacity-60 transition-opacity" />
                  )}
                </div>

                {/* Card */}
                <div className={`relative rounded-2xl bg-gradient-to-br ${step.bg} border ${step.border} p-6 overflow-hidden shadow-lg`}>
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${step.bg}`} />
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold font-display text-text-primary mb-2">{step.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">{step.description}</p>
                    <span className={`inline-block text-[10px] font-mono ${step.color} bg-bg-surface/50 border ${step.border} px-3 py-1 rounded-full`}>
                      {step.detail}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mobile vertical timeline (GSAP on-view stagger) */}
      <div ref={mobileListRef} className="md:hidden space-y-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className={`gsap-mobile-step relative rounded-2xl bg-gradient-to-br ${step.bg} border ${step.border} p-4 sm:p-5 shadow-lg overflow-hidden`}
            >
              {/* Header inside card */}
              <div className="flex items-center gap-3 mb-2.5">
                <div className={`w-9 h-9 rounded-xl bg-bg-card/90 border ${step.border} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${step.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] font-mono font-bold ${step.color}`}>STEP {step.number}</span>
                  <h3 className="text-base font-bold font-display text-text-primary leading-tight">{step.title}</h3>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                {step.description}
              </p>

              <span className={`inline-block text-[9px] font-mono ${step.color} bg-bg-surface/60 border ${step.border} px-2.5 py-0.5 rounded-full`}>
                {step.detail}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
