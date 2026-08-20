"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { Sparkles } from "@/components/animate-ui/icons/sparkles";

export function ClosedRegistrations() {
  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      {/* Background ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]"
      />

      <div className="relative z-10 max-w-xl text-center flex flex-col items-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-red-400 mb-6">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          <span>Registrations Closed</span>
        </div>

        {/* Heading */}
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
          Applications for this cycle are <span className="text-gradient">now closed.</span>
        </h1>

        {/* Subtext */}
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-8 max-w-lg">
          Thank you for your interest in joining the AWS Student Builder Group! Registration is currently locked for this cohort, but you can still join our vibrant community to attend public workshops, hackathons, and study sessions.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.4)] transition-all duration-300 hover:bg-primary-hover hover:scale-105"
          >
            <span>Join Group</span>
            <ArrowRight size={16} animateOnHover />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-medium text-text-secondary hover:text-white hover:bg-white/10 transition-all"
          >
            Return to Home
          </Link>
        </div>

        {/* Note */}
        <div className="mt-12 flex items-center gap-2 text-xs text-muted font-mono">
          <Sparkles size={14} className="text-accent" />
          <span>Stay tuned on our channels for the next recruitment announcement!</span>
        </div>
      </div>
    </div>
  );
}
