"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { clamp01, isToneName, rgbTriplet, toneAtY, toneSet, type ThemeName, type ToneStop } from "@/lib/design/atmosphere";
import { isDarkCapablePath } from "@/lib/design/theme";
import { mulberry32 } from "@/lib/design/pixel-cloud";
import { cssVars } from "./use-scroll-var";

/**
 * The living background. Fixed behind the page; as the reader scrolls it:
 *   - blends its colours between the tones of the sections ([data-tone="dawn"] ...),
 *   - drifts three large colour blobs across the screen,
 *   - floats a field of small pixels (the brand's motif) at different speeds,
 *   - drives the thin progress bar at the top.
 * It only writes CSS variables from one rAF-throttled scroll handler; React never re-renders.
 */
export function ScrollAtmosphere() {
  const layer = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  // Dark palette only on a dark-capable page (the chrome is shared with /community etc.).
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const theme: ThemeName = resolvedTheme === "dark" && isDarkCapablePath(pathname) ? "dark" : "light";
  const themeRef = useRef<ThemeName>(theme);
  const repaint = useRef<() => void>(() => {});

  // 26 pixels, placed once from a seed (the same on server and client).
  const pixels = useMemo(() => {
    const rnd = mulberry32(21);
    return Array.from({ length: 26 }, (_, i) => ({
      key: i,
      x: `${Math.round(rnd() * 96)}%`,
      y: `${Math.round(rnd() * 94)}%`,
      s: Math.round(5 + rnd() * 11),
      o: Math.round((0.25 + rnd() * 0.5) * 100) / 100,
      f: Math.round((6 + rnd() * 14) * 10) / 10,
      amp: Math.round(10 + rnd() * 36),
      v: Math.round((rnd() - 0.5) * 70),
      spark: i % 9 === 4,
    }));
  }, []);

  useEffect(() => {
    const el = layer.current;
    if (!el) return;

    let stops: ToneStop[] = [];
    let maxScroll = 1;
    let frame = 0;

    const measure = () => {
      stops = Array.from(document.querySelectorAll<HTMLElement>("[data-tone]"))
        .flatMap((node) => {
          const name = node.dataset.tone;
          if (!isToneName(name)) return [];
          const r = node.getBoundingClientRect();
          return [{ at: r.top + window.scrollY + r.height / 2, tone: name }];
        })
        .sort((a, b) => a.at - b.at);
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    const paint = () => {
      frame = 0;
      const y = window.scrollY;
      const p = clamp01(y / maxScroll);
      const tone = toneAtY(stops, y + window.innerHeight * 0.5, toneSet(themeRef.current));
      el.style.setProperty("--bg", rgbTriplet(tone.base));
      el.style.setProperty("--a", rgbTriplet(tone.a));
      el.style.setProperty("--b", rgbTriplet(tone.b));
      el.style.setProperty("--c", rgbTriplet(tone.c));
      el.style.setProperty("--p", p.toFixed(4));
      bar.current?.style.setProperty("--p", p.toFixed(4));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    repaint.current = schedule;
    remeasure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    // Pinned scenes set their own height after layout, so measure again whenever the page grows or shrinks.
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(remeasure) : null;
    observer?.observe(document.body);
    window.addEventListener("load", remeasure);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("load", remeasure);
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // The palette lives in a ref (no re-render per scroll); repaint right away when the theme changes.
  useEffect(() => {
    themeRef.current = theme;
    repaint.current();
  }, [theme]);

  return (
    <>
      <div ref={bar} className="progress" aria-hidden="true" />
      <div ref={layer} className="atmos" aria-hidden="true">
        <div className="atmos-blob atmos-a" />
        <div className="atmos-blob atmos-b" />
        <div className="atmos-blob atmos-c" />
        {pixels.map((p) => (
          <span
            key={p.key}
            className="atmos-px"
            data-spark={p.spark}
            style={cssVars({ "--x": p.x, "--y": p.y, "--s": `${p.s}px`, "--o": p.o, "--f": p.f, "--amp": p.amp, "--v": p.v })}
          />
        ))}
        <div className="atmos-fade" />
        <div className="atmos-grain" />
      </div>
    </>
  );
}
