"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/animate-ui/icons/arrow-right";
import { Sparkles } from "@/components/ui/animate-ui/icons/sparkles";

export function ClosedRegistrations() {
  return (
    <div className="relative min-h-[80vh] w-full text-sbg-ink flex flex-col items-center justify-center px-[var(--gutter)] pt-36 pb-20 overflow-hidden">
      {/* Background ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sbg-lilac-200/40 blur-[140px]"
      />

      <div className="relative z-10 max-w-xl text-center flex flex-col items-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-lt-mono uppercase tracking-widest text-red-600 mb-6">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span>Registrations Closed</span>
        </div>

        {/* Heading */}
        <h1 className="t-display text-[clamp(32px,5vw,56px)] text-sbg-ink mb-4">
          Applications for this cycle are <span className="t-serif text-sbg-lilac-600">now closed.</span>
        </h1>

        {/* Subtext */}
        <p className="t-lead mb-8 max-w-lg">
          Thank you for your interest in joining the AWS Student Builder Group! Registration is currently locked for this cohort, but you can still join our vibrant community to attend public workshops, hackathons, and study sessions.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/register"
            className="btn btn-primary group"
          >
            <span>Join Group</span>
            <ArrowRight size={16} animateOnHover />
          </Link>

          <Link
            href="/"
            className="btn btn-ghost"
          >
            Return to Home
          </Link>
        </div>

        {/* Note */}
        <div className="mt-12 flex items-center gap-2 text-xs text-sbg-ink-3 font-lt-mono">
          <Sparkles size={14} className="text-sbg-spark" />
          <span>Stay tuned on our channels for the next recruitment announcement!</span>
        </div>
      </div>
    </div>
  );
}
