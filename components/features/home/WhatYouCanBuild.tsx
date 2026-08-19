"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PixelHeading } from "@/components/ui/pixel-heading-character";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ─── SVG Icons ──────────────────────────────────────────────────── */
const IconWeb = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);
const IconAI = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M12 2a4 4 0 014 4v1h1a3 3 0 010 6h-1v1a4 4 0 01-8 0v-1H7a3 3 0 010-6h1V6a4 4 0 014-4z" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
  </svg>
);
const IconAnalytics = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconMobile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <rect x="7" y="2" width="10" height="20" rx="3" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>
);
const IconSecurity = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);
const IconDevOps = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93a10 10 0 010 14.14M4.93 19.07a10 10 0 010-14.14" />
    <path d="M15.54 8.46a5 5 0 010 7.07M8.46 15.54a5 5 0 010-7.07" />
  </svg>
);

const projects = [
  {
    id: 1,
    number: "01",
    title: "Web Applications",
    description: "Build scalable full-stack applications with serverless architecture and global CDN distribution across AWS edge locations.",
    tech: ["Next.js", "Lambda", "S3", "CloudFront"],
    icon: IconWeb,
    accent: "#7C3AED",
    accentLight: "#A78BFA",
    gradient: "from-violet-900/15 via-purple-900/10 to-transparent",
    borderGlow: "rgba(124,58,237,0.3)",
    glowColor: "124,58,237",
    featured: false,
    span: "lg:col-span-2 lg:row-span-2",
    large: true,
  },
  {
    id: 2,
    number: "02",
    title: "AI & Machine Learning",
    description: "Integrate intelligent features with AWS AI services — chatbots, computer vision, and predictive analytics.",
    tech: ["SageMaker", "Bedrock", "Rekognition"],
    icon: IconAI,
    accent: "#06B6D4",
    accentLight: "#67E8F9",
    gradient: "from-cyan-900/15 via-sky-900/10 to-transparent",
    borderGlow: "rgba(6,182,212,0.3)",
    glowColor: "6,182,212",
    featured: true,
    span: "",
    large: false,
  },
  {
    id: 3,
    number: "03",
    title: "Real-Time Analytics",
    description: "Process millions of events per second with streaming data pipelines and live dashboards.",
    tech: ["Kinesis", "Athena", "QuickSight"],
    icon: IconAnalytics,
    accent: "#F59E0B",
    accentLight: "#FCD34D",
    gradient: "from-amber-900/15 via-orange-900/10 to-transparent",
    borderGlow: "rgba(245,158,11,0.3)",
    glowColor: "245,158,11",
    featured: false,
    span: "",
    large: false,
  },
  {
    id: 4,
    number: "04",
    title: "Mobile Backends",
    description: "Complete backend infrastructure for mobile apps — auth, real-time sync, and push notifications.",
    tech: ["Amplify", "Cognito", "AppSync"],
    icon: IconMobile,
    accent: "#10B981",
    accentLight: "#6EE7B7",
    gradient: "from-emerald-900/15 via-green-900/10 to-transparent",
    borderGlow: "rgba(16,185,129,0.3)",
    glowColor: "16,185,129",
    featured: false,
    span: "",
    large: false,
  },
  {
    id: 5,
    number: "05",
    title: "Cloud Security",
    description: "Enterprise-grade security with identity management, threat detection, and compliance automation.",
    tech: ["IAM", "GuardDuty", "WAF"],
    icon: IconSecurity,
    accent: "#EF4444",
    accentLight: "#FCA5A5",
    gradient: "from-red-900/15 via-rose-900/10 to-transparent",
    borderGlow: "rgba(239,68,68,0.3)",
    glowColor: "239,68,68",
    featured: false,
    span: "",
    large: false,
  },
  {
    id: 6,
    number: "06",
    title: "DevOps & Infrastructure",
    description: "Automate deployments with CI/CD pipelines, container orchestration, and infrastructure as code.",
    tech: ["CloudFormation", "CodePipeline", "ECS"],
    icon: IconDevOps,
    accent: "#8B5CF6",
    accentLight: "#C4B5FD",
    gradient: "from-violet-900/15 via-indigo-900/10 to-transparent",
    borderGlow: "rgba(139,92,246,0.3)",
    glowColor: "139,92,246",
    featured: false,
    span: "",
    large: false,
  },
];


/* ─── Card Component ─────────────────────────────────────────────── */
function BuildCard({ project, large = false }: { project: typeof projects[0]; large?: boolean }) {
  const Icon = project.icon;
  return (
    <div
      className={`build-card group relative rounded-2xl overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1.5 ${large ? "h-full min-h-[340px]" : "min-h-[200px]"}`}
      style={{
        background: "linear-gradient(135deg, rgba(15,15,25,0.95) 0%, rgba(20,15,35,0.9) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >

      {/* Animated border glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${project.borderGlow}, 0 0 24px rgba(${project.glowColor},0.08)`,
        }}
      />

      {/* Corner accent line */}
      <div
        className="absolute top-0 left-0 w-20 h-0.5 opacity-30 group-hover:opacity-60 group-hover:w-full transition-all duration-700 ease-out"
        style={{ background: `linear-gradient(90deg, ${project.accent}, transparent)` }}
      />
      <div
        className="absolute top-0 left-0 h-20 w-0.5 opacity-30 group-hover:opacity-60 group-hover:h-full transition-all duration-700 ease-out"
        style={{ background: `linear-gradient(180deg, ${project.accent}, transparent)` }}
      />

      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-70 transition-opacity duration-500`} />

      {/* Content */}
      <div className={`relative z-10 flex flex-col h-full ${large ? "p-8" : "p-6"}`}>
        {/* Top row */}
        <div className="flex items-start justify-between mb-5">
          {/* Icon */}
          <div
            className="relative flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
            style={{
              width: large ? 52 : 44,
              height: large ? 52 : 44,
              background: `linear-gradient(135deg, rgba(${project.glowColor},0.15), rgba(${project.glowColor},0.03))`,
              border: `1px solid rgba(${project.glowColor},0.2)`,
              color: project.accent,
              padding: large ? "12px" : "10px",
            }}
          >
            <Icon />
            {/* Icon glow */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
              style={{ background: `rgba(${project.glowColor},0.15)` }}
            />
          </div>

          {/* Number + badge */}
          <div className="flex flex-col items-end gap-2">
            <span className="font-mono text-xs" style={{ color: `rgba(${project.glowColor},0.5)` }}>
              {project.number}
            </span>
            {project.featured && (
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, rgba(${project.glowColor},0.25), rgba(${project.glowColor},0.1))`,
                  border: `1px solid rgba(${project.glowColor},0.4)`,
                  color: project.accentLight,
                }}
              >
                Trending
              </span>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="flex-1">
          <h3
            className={`font-bold text-white mb-3 leading-tight ${large ? "text-2xl md:text-3xl" : "text-lg"}`}
          >
            {project.title}
          </h3>
          <p className={`text-white/55 leading-relaxed ${large ? "text-base" : "text-sm"}`}>
            {project.description}
          </p>
        </div>


        {/* Large card extra visual */}
        {large && (
          <div className="mt-6 -mx-8 -mb-8 relative h-20 overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `linear-gradient(to top, rgba(${project.glowColor},0.3), transparent)`,
              }}
            />
            <svg className="absolute bottom-0 left-0 w-full" height="60" viewBox="0 0 400 60" preserveAspectRatio="none">
              <path
                d="M0,40 C80,10 160,55 240,25 C320,-5 360,45 400,20 L400,60 L0,60 Z"
                fill={`rgba(${project.glowColor},0.08)`}
              />
              <path
                d="M0,50 C100,25 200,55 300,35 C360,22 380,50 400,40 L400,60 L0,60 Z"
                fill={`rgba(${project.glowColor},0.05)`}
              />
            </svg>
            <div className="absolute bottom-4 left-8 flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: project.accent }}
              />
              <span className="text-xs font-medium" style={{ color: `rgba(${project.glowColor},0.6)` }}>
                Ready to deploy
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────────────── */
export function WhatYouCanBuild() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const initialY = isMobile ? 20 : 30;

      // Header slide-up animation
      gsap.from(".build-header-el", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".build-header",
          start: isMobile ? "top 95%" : "top 85%",
          toggleActions: "play reverse play reverse",
        },
      });

      // Cards batch animation as each enters viewport
      gsap.set(".build-card", { opacity: 0, y: initialY, scale: 0.97 });

      ScrollTrigger.batch(".build-card", {
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
            duration: 0.4,
            stagger: 0.06,
            ease: "power2.inOut",
            overwrite: true,
          });
        },
        start: isMobile ? "top 95%" : "top 85%",
      });

      // Sync with Lenis smooth scroll
      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);

      return () => clearTimeout(refreshTimer);
    },
    { scope: containerRef }
  );



  return (
    <section
      ref={containerRef}
      id="what-you-build"
      className="relative overflow-hidden py-28 md:py-36"
      style={{ background: "linear-gradient(180deg,#09090B 0%,#0f0a1e 50%,#09090B 100%)" }}
    >
      {/* ── Background orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)" }} />
      </div>



      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="build-header text-center mb-14 sm:mb-16 md:mb-20">
          <p className="build-header-el text-[11px] uppercase tracking-[0.16em] text-muted">
            What You&apos;ll Build
          </p>

          <h2 className="build-header-el mt-3 font-display text-[28px] sm:text-[34px] md:text-[42px] font-semibold leading-[1.1] tracking-tight text-text-primary">
            Turn Ideas Into{" "}
            <PixelHeading mode="uniform" className="text-gradient">
              Real-World Projects
            </PixelHeading>
          </h2>

          <p className="build-header-el mt-4 text-[15px] sm:text-[16px] leading-relaxed text-text-secondary max-w-2xl mx-auto">
            Learn by building production-ready applications on AWS cloud. From concept to global deployment.
          </p>
        </div>

        {/* ── Bento Grid ── */}
        <div className="build-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
          {/* Large feature card — spans 2 cols × 2 rows on lg */}
          <div className="lg:col-span-2 lg:row-span-2">
            <BuildCard project={projects[0]} large />
          </div>

          {/* Rest of cards */}
          {projects.slice(1).map((p) => (
            <BuildCard key={p.id} project={p} />
          ))}
        </div>

      </div>
    </section>

  );
}
