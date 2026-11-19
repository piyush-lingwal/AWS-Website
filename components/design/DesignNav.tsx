"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

// In the live site these point at the real pages (/, /about, /events, /team, /learning-hub, /gallery).
// The preview scrolls to the matching section of this one page instead.
const ITEMS = [
  { label: "Home", id: "top" },
  { label: "Mission", id: "about" },
  { label: "Build", id: "build" },
  { label: "Why join", id: "why" },
  { label: "Events", id: "events" },
  { label: "Learn", id: "learn" },
] as const;

export function DesignNav() {
  const [active, setActive] = useState<string>("top");
  const [open, setOpen] = useState(false);

  // Scroll spy: the section crossing the middle of the screen is the active one.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const { id } of ITEMS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <a href="#top" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="surface mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-3 rounded-full pl-2 pr-2 sm:h-16 sm:pl-3"
      >
        <Link href="/preview" className="flex min-w-0 items-center gap-3 rounded-full pr-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sbg-ink sm:h-11 sm:w-11">
            <Image src="/logos/SBG_logo.png" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-lt-display text-[14px] font-semibold tracking-tight text-sbg-ink sm:text-[15px]">
              <span className="sm:hidden">AWS SBG</span>
              <span className="hidden sm:inline">AWS Student Builder Group</span>
            </span>
            <span className="hidden truncate text-[11.5px] text-sbg-ink-3 sm:block">at Tulas University, Dehradun</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {ITEMS.map(({ label, id }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={active === id ? "true" : undefined}
                className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-200 ${
                  active === id ? "bg-sbg-lilac-100 text-sbg-lilac-700" : "text-sbg-ink-2 hover:bg-white hover:text-sbg-ink"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/register" className="btn btn-primary !min-h-[42px] !px-5 !text-[14px]">
            Join Group <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-full text-sbg-ink hover:bg-white lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="surface mx-auto mt-2 max-w-[1240px] rounded-3xl p-2 lg:hidden">
          <ul>
            {ITEMS.map(({ label, id }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-[16px] font-medium ${active === id ? "bg-sbg-lilac-100 text-sbg-lilac-700" : "text-sbg-ink"}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
