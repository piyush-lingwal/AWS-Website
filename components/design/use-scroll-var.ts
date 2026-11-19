"use client";

import { useEffect, type CSSProperties, type RefObject } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll, type UseScrollOptions } from "framer-motion";

/** Inline style that sets CSS custom properties (the CSS reads them with var()). */
export function cssVars(vars: Record<string, string | number>): CSSProperties {
  return vars as CSSProperties;
}

/**
 * Writes how far the reader has scrolled through `ref` (0 at the start edge,
 * 1 at the end edge) into a CSS variable on that element. CSS does the rest.
 *
 * No React state is involved, so scrolling never re-renders anything: this
 * is what keeps pinned scenes smooth. With reduced motion the variable is
 * simply 1, so every scene shows its finished state.
 *
 * Returns the motion value for the few places that also need the number in JS.
 */
export function useScrollVar(
  ref: RefObject<HTMLElement | null>,
  offset: UseScrollOptions["offset"] = ["start start", "end end"],
  name = "--t"
) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset });

  const write = (value: number) => {
    const v = reduced ? 1 : Math.min(1, Math.max(0, value));
    ref.current?.style.setProperty(name, v.toFixed(4));
  };

  useMotionValueEvent(scrollYProgress, "change", write);
  useEffect(() => {
    write(scrollYProgress.get());
    // write only reads refs and the (stable) reduced flag
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return scrollYProgress;
}
