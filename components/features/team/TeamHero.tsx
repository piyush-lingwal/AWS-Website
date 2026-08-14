"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Zap, Star, Users, Sparkles, Layers } from "lucide-react";
import { RecruitmentCountdown } from "@/components/recruitment/RecruitmentCountdown";

/* ─── Floating Word Tag (Desktop) ────────────────────────── */
function FloatingTag({ text, className }: { text: string; className: string }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
      transition={{ duration: 5 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
      className={`hidden md:block absolute px-3 py-1.5 rounded-full backdrop-blur-md bg-bg-surface/80 border border-border text-xs font-mono text-text-secondary shadow-lg pointer-events-none select-none ${className}`}
    >
      {text}
    </motion.div>
  );
}

/* ─── Main Hero ──────────────────────────────────────────── */
export function TeamHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [6, -6]), { stiffness: 80, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-6, 6]), { stiffness: 80, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let id: number;
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth ?? window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight ?? 800;
    };
    resize();
    window.addEventListener("resize", resize);

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 30 : 55;

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 1.8 + 0.8,
      color: ["#7C3AED", "#A78BFA", "#C084FC", "#38BDF8", "#8B5CF6"][Math.floor(Math.random() * 5)],
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        particles.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(167,139,250,${(1 - d / 110) * 0.14})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      id = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
      className="relative min-h-[92vh] sm:min-h-[100vh] flex items-center justify-center overflow-hidden pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-3.5 sm:px-6"
    >
      {/* Canvas bg */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 md:left-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-primary/15 blur-[100px] sm:blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/2 translate-x-1/2 md:right-1/4 w-[280px] sm:w-[350px] h-[280px] sm:h-[350px] rounded-full bg-accent/10 blur-[80px] sm:blur-[100px]" />

      {/* Floating tags (Desktop only to prevent mobile clutter) */}
      <FloatingTag text="☁️ AWS Cloud" className="top-36 left-8 lg:left-24" />
      <FloatingTag text="🚀 Open to All Years" className="top-40 right-8 lg:right-24" />
      <FloatingTag text="⚡ 6 Builder Wings" className="bottom-36 left-8 lg:left-32" />
      <FloatingTag text="🎯 2026 Core Team" className="bottom-32 right-8 lg:right-32" />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center px-2">
        
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-[10px] sm:text-xs font-mono text-primary-light mb-6 sm:mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span>COHORT 2026 · WING APPLICATIONS OPEN</span>
        </motion.div>

        {/* 3D tilt headline card */}
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="perspective-1000"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-display leading-[1.04] sm:leading-[0.95] tracking-tight text-text-primary"
          >
            The Builders
            <br />
            <span className="relative inline-block mt-1 sm:mt-0">
              <span className="bg-gradient-to-r from-primary-light via-accent to-purple-300 bg-clip-text text-transparent">
                of Tomorrow.
              </span>
              {/* Underline glow */}
              <span className="absolute -bottom-1.5 sm:-bottom-2 left-0 right-0 h-[2px] sm:h-[3px] bg-gradient-to-r from-primary/0 via-primary to-primary/0 blur-sm" />
            </span>
          </motion.h1>
        </motion.div>

        {/* Mobile Quick Chips (Only on mobile for clean glanceability) */}
        <div className="flex md:hidden flex-wrap items-center justify-center gap-1.5 mt-5">
          <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-white/70">
            ☁️ AWS Cloud
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-white/70">
            ⚡ 6 Wings
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-white/70">
            🚀 All Branches
          </span>
        </div>

        {/* Reveal badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 sm:mt-8 inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-bg-card/90 border border-border backdrop-blur-md max-w-full"
        >
          <div className="flex items-center gap-1 text-warning shrink-0">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-warning" />
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-warning/60" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-text-secondary text-left sm:text-center">
            Core Team Reveal — <span className="text-text-primary font-semibold">Coming Soon</span>. Secure your wing now.
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-4 sm:mt-6 text-xs sm:text-base md:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed px-2"
        >
          6 specialized Builder Wings. Limited slots. Open to every branch and year at Tula&apos;s University.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none mx-auto"
        >
          <a
            href="#wings"
            className="w-full sm:w-auto group relative px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm overflow-hidden shadow-[0_0_30px_-5px_rgba(124,58,237,0.6)] hover:shadow-[0_0_45px_-5px_rgba(124,58,237,0.8)] transition-all duration-300 hover:scale-[1.02] text-center"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>Explore Builder Wings</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-bg-card border border-border hover:border-primary/50 text-text-secondary hover:text-text-primary font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm text-center"
          >
            Submit Application
          </Link>
        </motion.div>

        {/* Recruitment countdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 flex justify-center max-w-full overflow-hidden"
        >
          <RecruitmentCountdown />
        </motion.div>
      </div>

      {/* Scroll indicator (hidden on very short screens) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-1.5"
      >
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted">scroll</span>
        <div className="w-4 h-7 rounded-full border border-border/50 flex justify-center pt-1">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-primary-light"
          />
        </div>
      </motion.div>
    </div>
  );
}
