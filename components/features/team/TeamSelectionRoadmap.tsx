"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FileText, ClipboardCheck, Rocket, ArrowRight } from "lucide-react";

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
    detail: "No prerequisites. All branches welcome.",
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
      "Fill out a short application form in under 5 minutes. Tell us why you're excited about your chosen wing.",
    detail: "Takes less than 5 minutes.",
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
      "Shortlisted members get an orientation session and are officially unveiled as part of the 2026 Core Team.",
    detail: "The reveal is the moment.",
  },
];

export function TeamSelectionRoadmap() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "center center"] });
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 max-w-content mx-auto overflow-hidden">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-16">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted font-mono mb-3">How It Works</p>
        <h2 className="text-3xl sm:text-4xl font-bold font-display text-text-primary tracking-tight">
          3 Steps to Secure Your Wing
        </h2>
      </div>

      {/* Desktop horizontal timeline */}
      <div className="hidden md:block relative">
        {/* Animated connecting line — spans from center of col 1 to center of col 3 */}
        <div className="absolute top-[52px] left-[calc(100%/6)] right-[calc(100%/6)] h-px bg-border overflow-hidden">
          <motion.div
            style={{ width: lineWidth }}
            className="h-full bg-gradient-to-r from-primary via-accent to-emerald-400"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
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
                <div className={`relative rounded-2xl bg-gradient-to-br ${step.bg} border ${step.border} p-6 overflow-hidden`}>
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

      {/* Mobile vertical timeline */}
      <div className="md:hidden relative pl-8">
        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border">
          <motion.div
            initial={{ height: "0%" }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="w-full bg-gradient-to-b from-primary via-accent to-emerald-400"
          />
        </div>

        <div className="space-y-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.12 }}
                className="relative"
              >
                <div className={`absolute -left-8 w-7 h-7 rounded-full bg-bg-card border ${step.border} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${step.color}`} />
                </div>
                <div className={`rounded-2xl bg-gradient-to-br ${step.bg} border ${step.border} p-5`}>
                  <div className={`text-xs font-mono font-bold ${step.color} mb-2`}>{step.number}</div>
                  <h3 className="text-base font-bold font-display text-text-primary mb-1.5">{step.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
