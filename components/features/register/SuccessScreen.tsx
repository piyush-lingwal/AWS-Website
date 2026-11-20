"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
  Zap,
  Terminal,
  Award,
  Globe,
  Users,
  Mail,
  Phone,
  User,
  GraduationCap,
  FileText,
} from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface SuccessScreenProps {
  result: {
    id?: string;
    submittedAt?: string;
  };
  formData?: {
    fullName?: string;
    universityEmail?: string;
    phoneNumber?: string;
    rollNumber?: string;
    resumeName?: string;
    resumeUrl?: string;
    year?: string;
    course?: string;
    branch?: string;
    wings?: string[];
  };
}

export function SuccessScreen({ result, formData }: SuccessScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const passCardRef = useRef<HTMLDivElement>(null);
  const gatewayRef = useRef<HTMLDivElement>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const candidateName = formData?.fullName?.trim() || "AWS Builder Candidate";
  const wingsList = formData?.wings && formData.wings.length > 0 ? formData.wings : ["Technology", "Cloud"];
  const academicDetails = [
    formData?.year || "Cohort 2026",
    formData?.course || "Engineering",
    formData?.branch && formData.branch !== "N/A" ? formData.branch : "",
  ].filter(Boolean).join(" · ");

  useGSAP(() => {
    // 1. Header Entrance
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
        }
      );
    }

    // 2. Holographic Boarding Pass Entrance
    if (passCardRef.current) {
      gsap.fromTo(
        passCardRef.current,
        { y: 40, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          delay: 0.25,
          ease: "power3.out",
        }
      );
    }

    // 3. Community Gateway ScrollTrigger Animation
    if (gatewayRef.current) {
      const gatewayCards = gatewayRef.current.querySelectorAll(".gsap-gateway-card");
      
      gsap.fromTo(
        gatewayRef.current,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gatewayRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      if (gatewayCards.length > 0) {
        gsap.fromTo(
          gatewayCards,
          { y: 25, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.65,
            stagger: 0.15,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: gatewayRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }

    // 4. Roadmap Timeline Steps ScrollTrigger Animation
    if (roadmapRef.current) {
      const stepCards = roadmapRef.current.querySelectorAll(".gsap-step-card");
      
      gsap.fromTo(
        stepCards,
        { y: 30, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: roadmapRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // 5. Explore CTA ScrollTrigger Animation
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden text-sbg-ink font-lt-body">

      <main className="relative z-10 w-full max-w-[760px] mx-auto px-3.5 sm:px-6 md:px-8 pt-24 sm:pt-28 md:pt-36 pb-16 sm:pb-24">

        {/* ── Header Celebration ───────────────────────────────────────── */}
        <div
          ref={headerRef}
          className="text-center mb-6 sm:mb-10 px-2"
        >
          <h1 className="t-display text-[clamp(34px,6vw,60px)] text-sbg-ink mb-2 sm:mb-3">
            Application{" "}
            <span className="t-serif text-sbg-lilac-600">
              Received.
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-sbg-ink-2 max-w-lg mx-auto leading-relaxed">
            Welcome to the builder pipeline. Your application profile has been submitted and queued for evaluation.
          </p>
        </div>

        {/* ── Hero Holographic Builder Boarding Pass ───────────────────── */}
        <div
          ref={passCardRef}
          className="relative mb-8 sm:mb-10 surface rounded-[28px] overflow-hidden"
        >
          {/* Top glowing accent line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-sbg-lilac-300 to-transparent" />

          {/* Ticket Header */}
          <div className="p-4 sm:p-6 md:p-8 border-b border-[var(--line)] relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl sm:rounded-2xl bg-sbg-lilac-100 border border-sbg-lilac-200 flex items-center justify-center text-sbg-lilac-700">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-sbg-lilac-700" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-display font-bold text-xs sm:text-sm tracking-wider text-sbg-ink truncate">
                    AWS STUDENT BUILDER GROUP
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-sbg-lilac-100 text-sbg-lilac-700 border border-sbg-lilac-200 shrink-0">
                    OFFICIAL PASS
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-mono text-sbg-ink-3 truncate mt-0.5">
                  Tulas University · Dehradun Cloud Community
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Body: Two-Column Data Grid */}
          <div className="p-4 sm:p-6 md:p-8 relative overflow-hidden">
            {/* Ambient inner card glow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-sbg-lilac-200/40 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

            {/* Left Column: Candidate & Academic Info */}
            <div className="space-y-3.5 sm:space-y-4">
              <div>
                <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-sbg-ink-3 flex items-center gap-1">
                  <User className="w-3 h-3 text-sbg-lilac-700" />
                  <span>Candidate Name</span>
                </p>
                <p className="text-base sm:text-lg font-bold font-display text-sbg-ink tracking-tight mt-0.5 break-words">
                  {candidateName}
                </p>
              </div>

              <div>
                <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-sbg-ink-3 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-sbg-lilac-700" />
                  <span>Academic Profile</span>
                </p>
                <p className="text-xs sm:text-sm font-mono text-sbg-ink-2 mt-0.5 break-words">
                  {academicDetails}
                </p>
              </div>

              <div>
                <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-sbg-ink-3 mb-1.5 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-sbg-lilac-700" />
                  <span>Applied Wing(s)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {wingsList.map((wing, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-sbg-lilac-100 border border-sbg-lilac-200 text-[11px] sm:text-xs font-mono text-sbg-lilac-700 font-medium"
                    >
                      <Layers className="w-3 h-3 text-sbg-lilac-700" />
                      {wing}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Email Address & Mobile Number */}
            <div className="space-y-3.5 sm:space-y-4 pt-4 md:pt-0 border-t border-[var(--line)] md:border-t-0 md:border-l md:border-[var(--line)] md:pl-6">
              <div>
                <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-sbg-ink-3 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-emerald-600" />
                  <span>Email Address</span>
                </p>
                <p className="text-xs sm:text-sm font-mono text-sbg-ink font-medium mt-0.5 break-all">
                  {formData?.universityEmail || "Registered Email"}
                </p>
              </div>

              <div>
                <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-sbg-ink-3 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-600" />
                  <span>Mobile Number</span>
                </p>
                <p className="text-xs sm:text-sm font-mono text-sbg-ink font-medium mt-0.5">
                  {formData?.phoneNumber || "Registered Mobile"}
                </p>
              </div>

              {(formData?.resumeName || formData?.resumeUrl) && (
                <div>
                  <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-sbg-ink-3 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-sbg-lilac-700" />
                    <span>Attached Resume (PDF)</span>
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sbg-lilac-100 border border-sbg-lilac-200 text-sbg-lilac-700 text-xs font-mono mt-1 font-medium truncate max-w-full">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{formData.resumeName || "Resume.pdf"}</span>
                  </span>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Ticket Footer / Barcode Banner */}
          <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 bg-sbg-lilac-50/70 text-center border-t border-[var(--line)] flex items-center justify-start overflow-hidden">
            <span className="font-mono tracking-[0.25em] sm:tracking-[0.35em] text-sbg-ink-3 text-[10px] sm:text-xs select-none truncate w-full text-left">
              |||||||| | |||||| | |||||||| |||||||| | ||||||||
            </span>
          </div>
        </div>

        {/* ── High-Impact Community Gateway ─────────────────────────────── */}
        <div
          ref={gatewayRef}
          className="mb-8 sm:mb-10 surface rounded-[28px] p-4 sm:p-6 md:p-8 relative overflow-hidden"
        >
          {/* Accent glow orb */}
          <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-br from-sbg-lilac-200/50 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Critical Notice Header */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] sm:text-[11px] font-mono text-amber-700 w-fit mb-3 sm:mb-4">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
            <span>MANDATORY NEXT STEPS FOR SHORTLISTING</span>
          </div>

          <h2 className="t-display text-xl sm:text-2xl md:text-3xl text-sbg-ink mb-2">
            Complete Your Community Onboarding
          </h2>
          <p className="text-xs sm:text-sm text-sbg-ink-2 leading-relaxed max-w-xl mb-5 sm:mb-6">
            All interview invitations, workshop seat confirmations, cloud credits, and cohort announcements are delivered directly through our official <strong className="text-sbg-ink">Meetup Group</strong> and the <strong className="text-sbg-ink">AWS Builder Center</strong>. Join both channels now:
          </p>

          {/* 2 High-Conversion Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">

            {/* Card 1: Official Meetup */}
            <div className="gsap-gateway-card p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[var(--line)] bg-white/70 hover:border-[#F64060]/50 hover:bg-[#F64060]/5 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F64060]/10 text-[#C42A47] border border-[#F64060]/25 font-semibold">
                    STEP 1 · REQUIRED
                  </span>
                  <Users className="w-4 h-4 text-[#F64060]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-sbg-ink">
                  Join Official Meetup Group
                </h3>
                <p className="text-xs text-sbg-ink-2 leading-relaxed">
                  RSVP for offline hands-on workshops, hackathons, and receive direct interview notifications.
                </p>
              </div>

              <a
                href="https://www.meetup.com/tulas-university-dehradun/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-[#F64060] hover:bg-[#e03050] text-white font-bold text-xs sm:text-sm shadow-[0_10px_24px_-10px_rgba(246,64,96,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <span>Join Meetup Group</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Card 2: AWS Builder Center */}
            <div className="gsap-gateway-card p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[var(--line)] bg-white/70 hover:border-sbg-lilac-600/50 hover:bg-sbg-lilac-50 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sbg-lilac-100 text-sbg-lilac-700 border border-sbg-lilac-200 font-semibold">
                    STEP 2 · RECOMMENDED
                  </span>
                  <Globe className="w-4 h-4 text-sbg-lilac-700" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-sbg-ink">
                  AWS Builder Center Community
                </h3>
                <p className="text-xs text-sbg-ink-2 leading-relaxed">
                  Claim your official AWS Student Builder digital badge, access free AWS Cloud credits & global skill labs.
                </p>
              </div>

              <a
                href="https://builder.aws.com/content/3C075iQJeEx03mnzHwmXO9zdgEG/aws-student-builder-groups"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-sbg-lilac-600 hover:bg-sbg-lilac-700 text-white font-bold text-xs sm:text-sm shadow-[0_10px_24px_-10px_rgba(124,58,237,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <span>Join on AWS Builder Center</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* Social Proof Badges */}
          <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-center sm:justify-around gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-sbg-ink-3">
            <span className="flex items-center gap-1.5">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sbg-lilac-700" />
              Official Badges & Swag
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
              Free AWS Cloud Credits
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
              Direct AWS Mentorship
            </span>
          </div>
        </div>

        {/* ── Interactive Next Steps Timeline ──────────────────────────── */}
        <div
          ref={roadmapRef}
          className="mb-8 sm:mb-10 space-y-3 sm:space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-sbg-lilac-700" />
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-sbg-ink font-mono">
              Selection & Onboarding Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* Step 1 */}
            <div className="gsap-step-card p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[var(--line)] bg-white/70 relative group hover:border-sbg-lilac-300 hover:bg-white transition-all">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sbg-lilac-100 border border-sbg-lilac-200 flex items-center justify-center text-[11px] sm:text-xs font-mono font-bold text-sbg-lilac-700 mb-2 sm:mb-3">
                01
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-sbg-ink mb-1">
                Profile Review
              </h3>
              <p className="text-[11px] sm:text-xs text-sbg-ink-2 leading-relaxed">
                Core leads review candidate credentials and branch alignment for Cohort 2026.
              </p>
            </div>

            {/* Step 2 */}
            <div className="gsap-step-card p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[var(--line)] bg-white/70 relative group hover:border-sbg-lilac-300 hover:bg-white transition-all">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sbg-lilac-100 border border-sbg-lilac-200 flex items-center justify-center text-[11px] sm:text-xs font-mono font-bold text-sbg-lilac-700 mb-2 sm:mb-3">
                02
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-sbg-ink mb-1">
                Builder Interview
              </h3>
              <p className="text-[11px] sm:text-xs text-sbg-ink-2 leading-relaxed">
                Shortlisted applicants receive an interview slot via registered email & Meetup announcements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="gsap-step-card p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[var(--line)] bg-white/70 relative group hover:border-sbg-lilac-300 hover:bg-white transition-all">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sbg-lilac-100 border border-sbg-lilac-200 flex items-center justify-center text-[11px] sm:text-xs font-mono font-bold text-sbg-lilac-700 mb-2 sm:mb-3">
                03
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-sbg-ink mb-1">
                Cohort Induction
              </h3>
              <p className="text-[11px] sm:text-xs text-sbg-ink-2 leading-relaxed">
                Official induction into the AWS SBG Dehradun team, cloud workshops & projects.
              </p>
            </div>
          </div>
        </div>

        {/* ── Return Navigation Button ─────────────────────────────────── */}
        <div ref={ctaRef} className="flex items-center justify-center gap-3">
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 btn btn-ghost font-semibold text-xs sm:text-sm"
          >
            <span>Explore Our Site</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* ── Footer Security Badge ────────────────────────────────────── */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto">
          <div className="inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-sbg-ink-3 font-mono leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Official AWS Student Builder Group at Tulas University</span>
          </div>
          <p className="text-[10px] text-sbg-ink-3 font-mono mt-0.5">
            No spam, ever.
          </p>
        </div>

      </main>
    </div>
  );
}
