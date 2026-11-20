"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usesNativeScroll } from "@/lib/layout/native-scroll";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Admin screens use the browser's own scrolling (see lib/layout/native-scroll.ts).
  const smooth = !usesNativeScroll(pathname);

  useEffect(() => {
    if (!smooth) return;
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      // Smooth scroll settings
      autoRaf: false, // We'll handle requestAnimationFrame via GSAP ticker
    });

    if (typeof window !== "undefined") {
      (window as any).__lenis = lenis;
    }

    lenis.on("scroll", ScrollTrigger.update);

    // Sync GSAP ticker with Lenis
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Keep Lenis and ScrollTrigger in sync whenever dynamic content modifies document height
    let resizeTimer: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 100);
    });

    if (typeof document !== "undefined" && document.body) {
      resizeObserver.observe(document.body);
    }

    return () => {
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      lenis.destroy();
      gsap.ticker.remove(update);
      if (typeof window !== "undefined") delete (window as any).__lenis;
    };
  }, [smooth]);

  useLayoutEffect(() => {
    // Jump, never glide: html has `scroll-behavior: smooth`, so a plain scrollTo(0, 0)
    // made a new page open at the (clamped) old position, e.g. the footer, and slide up.
    const lenis = (window as any).__lenis as Lenis | undefined;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Recalculate all ScrollTrigger positions after route change
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);


  return <>{children}</>;
}
