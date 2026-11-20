"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { NAV_ITEMS as ITEMS, isActiveNav } from "@/lib/design/nav";
import { isDarkCapablePath } from "@/lib/design/theme";
import { ThemeToggle } from "./ThemeToggle";

const MEETUP_URL = "https://www.meetup.com/tulas-university-dehradun/";

// TODO: re-enable dark mode toggle (set to true). Theme system stays active; only the button is hidden.
const SHOW_DARK_MODE_TOGGLE = false;

export function DesignNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const themable = isDarkCapablePath(pathname);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <MotionConfig reducedMotion="user">
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <a href="#top" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-sbg-paper focus:text-sbg-ink focus:px-3 focus:py-2">
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="nav-glass mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-3 rounded-full pl-2 pr-2 sm:h-16 sm:pl-3"
      >
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-full pr-2" aria-label="AWS Student Builder Group, home">
          <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sbg-on-ink sm:h-11 sm:w-11">
            <Image src="/logos/SBG_logo.png" alt="" width={26} height={26} className="relative z-10 h-[26px] w-[26px]" />
            {/* Shimmer sweep. The tile is dark navy in both themes, so a white band reads the same in each.
                MotionConfig reducedMotion="user" disables this transform for prefers-reduced-motion. */}
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatType: "loop" }}
              style={{ willChange: "transform" }}
            />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-lt-display text-[12.5px] font-semibold tracking-tight text-sbg-ink sm:text-[15px]">
              AWS Student Builder Group
            </span>
            <span className="block truncate text-[10px] text-sbg-ink-3 sm:text-[11.5px]">at Tulas University, Dehradun</span>
          </span>
        </Link>

        <LayoutGroup id="desktop-nav">
          <ul className="hidden items-center gap-1 lg:flex">
            {ITEMS.map(({ label, href }) => {
              const active = isActiveNav(href, pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative block rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-200 ${
                      active ? "text-sbg-accent-strong" : "text-sbg-ink-2 hover:bg-[var(--chip-hover)] hover:text-sbg-ink"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-sbg-lilac-100 shadow-[0_1px_0_var(--hl)_inset,0_4px_12px_-4px_rgba(124,58,237,0.35)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </LayoutGroup>
        <div className="flex items-center gap-2">
          {SHOW_DARK_MODE_TOGGLE && themable && <ThemeToggle />}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center rounded-full text-sbg-ink transition-colors hover:bg-[var(--btn-ghost-hover)] active:scale-95"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "x" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid place-items-center"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </button>        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className="fixed inset-0 -z-10 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <div className="mx-auto mt-2 flex max-w-[1240px] lg:justify-end">
              <motion.div
                key="panel"
                id="nav-menu"
                className="nav-glass w-full origin-top rounded-3xl p-2 lg:w-80 lg:origin-top-right"
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <ul className="lg:hidden">
                  {ITEMS.map(({ label, href }, i) => {
                    const active = isActiveNav(href, pathname);
                    return (
                      <motion.li
                        key={href}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i + 0.05, duration: 0.2 }}
                      >
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-[52px] items-center justify-between rounded-2xl px-4 text-[17px] font-medium transition-colors active:bg-[var(--chip-hover)] ${
                            active ? "bg-sbg-lilac-100 text-sbg-accent-strong" : "text-sbg-ink"
                          }`}
                        >
                          {label}
                          {active && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-sbg-accent-strong" />}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
                <div className="mt-2 border-t border-[var(--hl)] p-2 pt-3 lg:mt-0 lg:border-t-0 lg:pt-2">
                  <a
                    href={MEETUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="btn btn-primary !min-h-[48px] w-full !text-[15px]"
                  >
                    Join on Meetup <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>    </header>
    </MotionConfig>
  );
}
