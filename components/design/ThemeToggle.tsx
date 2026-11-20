"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

const SIZE = "h-10 w-10 shrink-0 rounded-full";
const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

/** Round glass switch in the nav: sun in light, moon in dark, cross-faded with a quarter turn. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Same-size placeholder until mounted: the stored theme is unknown on the server.
  if (!mounted) return <span aria-hidden="true" className={`${SIZE} inline-block`} />;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`${SIZE} relative grid place-items-center border border-[var(--glass-line)] text-sbg-ink transition-colors duration-200 hover:bg-[var(--chip-hover)]`}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={isDark ? "moon" : "sun"}
          className="absolute grid place-items-center"
          initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
          transition={spring}
        >
          {isDark ? <Moon className="h-[18px] w-[18px]" aria-hidden="true" /> : <Sun className="h-[18px] w-[18px]" aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
