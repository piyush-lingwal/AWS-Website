"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cssVars } from "./use-scroll-var";

/** Fades and lifts its children in the first time they enter the screen (CSS in preview.css). */
export function Reveal({
  as: Tag = "div",
  index = 0,
  className = "",
  children,
}: {
  as?: ElementType;
  /** Position in a group: later ones arrive a beat after earlier ones. */
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.in = "true";
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.in = "true";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={cssVars({ "--i": index })}>
      {children}
    </Tag>
  );
}
