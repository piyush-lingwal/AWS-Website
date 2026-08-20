"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlipTextProps {
  /**
   * List of words or phrases to rotate through
   */
  words?: string[];

  /**
   * Fallback single text to animate
   */
  children?: string;

  /**
   * Duration in ms before flipping to next text
   * @default 3200
   */
  duration?: number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Inline styles (e.g. background gradients)
   */
  style?: React.CSSProperties;
}

export function FlipText({
  words,
  children,
  duration = 3200,
  className,
  style,
}: FlipTextProps) {
  const list =
    words && words.length > 0
      ? words
      : children
        ? [children]
        : ["Create the Cloud Future", "Build on AWS", "Architect AI Systems", "Innovate Together"];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (list.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % list.length);
    }, duration);
    return () => clearInterval(interval);
  }, [list, duration]);

  const currentText = list[index] || list[0];

  return (
    <span className="inline-block relative text-left py-1 align-baseline overflow-visible" style={{ perspective: "1000px" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={`${index}-${currentText}`}
          initial={{ opacity: 0, rotateX: -90, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, rotateX: 0, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, rotateX: 90, y: -16, filter: "blur(4px)" }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            transformOrigin: "50% 50% -12px",
            transformStyle: "preserve-3d",
            ...style,
          }}
          className={cn(
            "inline-block font-extrabold text-transparent bg-clip-text pt-1 pb-3 sm:pb-4 leading-[1.25]",
            className
          )}
        >
          {currentText}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default FlipText;

