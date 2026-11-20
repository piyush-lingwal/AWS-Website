"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Calendar, Users, GraduationCap, LayoutDashboard, Menu, X, LogOut, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, adminActiveNavId, type AdminNavIcon } from "@/lib/admin/nav";
import { useAdminPortal } from "@/components/admin/AdminPortalProvider";
import { AttendanceStatus } from "@/components/admin/AttendanceStatus";

const ICONS: Record<AdminNavIcon, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  overview: LayoutDashboard,
  events: Calendar,
  registrations: Users,
  team: GraduationCap,
  media: Camera,
};

function BrandTile() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 rounded-2xl p-1 transition-opacity hover:opacity-90"
      title="AWS SBG — Go to Public Home"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sbg-ink p-2 shadow-[0_10px_24px_-10px_var(--shadow-strong)]">
        <img src="/logos/SBG_logo.png" alt="AWS SBG Logo" className="h-full w-full object-contain" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-lt-display text-sm font-semibold tracking-[-0.02em] text-sbg-ink">AWS Student Builder Group</span>
        <span className="block truncate text-[11px] text-sbg-ink-3">at Tulas University Dehradun</span>
      </span>
    </Link>
  );
}

function AdminShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { logout } = useAdminPortal();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);

  // The URL is the only source of truth for the active item, so Back, refresh and shared links all agree.
  const activeId = adminActiveNavId(pathname, searchParams.get("tab"));

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileDrawerRef.current?.querySelector<HTMLAnchorElement>("nav a")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileNavOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      mobileMenuButtonRef.current?.focus();
    };
  }, [isMobileNavOpen]);

  const signOutLabel = "Sign out of Admin Portal";

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="ad-backdrop-fixed" />
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-xl focus:bg-sbg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      {/* Desktop: sticky full-height sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-5 border-r border-sbg-ink/10 bg-white/70 p-4 backdrop-blur-xl lg:flex">
        <BrandTile />
        <p className="ad-eyebrow px-2">Admin Portal</p>
        <nav aria-label="Admin functions navigation" className="flex flex-col gap-1">
          {ADMIN_NAV_ITEMS.map((link) => {
            const Icon = ICONS[link.icon];
            const isActive = activeId === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                title={`Go to ${link.label}`}
                className={cn(
                  "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-150",
                  isActive
                    ? "bg-sbg-lilac-100 font-semibold text-sbg-accent-strong"
                    : "font-medium text-sbg-ink-2 hover:bg-sbg-lilac-50 hover:text-sbg-ink"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden={true} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <AttendanceStatus align="left" direction="up" className="w-full" />
          <button
            type="button"
            onClick={() => void logout()}
            className="ad-btn ad-btn-ghost w-full justify-start hover:!border-[var(--ad-danger-line)] hover:!bg-[var(--ad-danger-bg)] hover:!text-[var(--ad-danger)]"
            aria-label={signOutLabel}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile: sticky top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-sbg-ink/10 bg-white/80 px-3 backdrop-blur-xl lg:hidden">
        <button
          ref={mobileMenuButtonRef}
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="ad-btn ad-btn-ghost h-11 w-11 shrink-0 !p-0"
          aria-label={isMobileNavOpen ? "Close admin navigation" : "Open admin navigation"}
          aria-expanded={isMobileNavOpen}
          aria-controls="admin-mobile-navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex min-w-0 flex-1 justify-center">
          <AttendanceStatus align="center" />
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="ad-btn ad-btn-ghost h-11 w-11 shrink-0 !p-0 hover:!bg-[var(--ad-danger-bg)] hover:!text-[var(--ad-danger)]"
          aria-label={signOutLabel}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-[60] lg:hidden", isMobileNavOpen ? "block" : "hidden")} aria-hidden={!isMobileNavOpen}>
        <button
          type="button"
          className="ad-backdrop absolute inset-0 h-full w-full cursor-default"
          onClick={() => setIsMobileNavOpen(false)}
          aria-label="Close admin navigation"
        />
        <aside
          id="admin-mobile-navigation"
          ref={mobileDrawerRef}
          className="relative flex h-full w-[min(20rem,calc(100vw-3rem))] max-w-full flex-col border-r border-sbg-ink/10 bg-sbg-paper p-4 shadow-2xl"
          aria-label="Admin navigation"
        >
          <div className="mb-5 flex items-center justify-between border-b border-sbg-ink/10 pb-4">
            <div className="min-w-0">
              <p className="truncate font-lt-display text-sm font-semibold text-sbg-ink">Admin Portal</p>
              <p className="ad-eyebrow mt-0.5 !text-[10px] !text-sbg-ink-3">Navigation</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="ad-btn ad-btn-ghost h-11 w-11 shrink-0 !p-0"
              aria-label="Close admin navigation"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Admin functions navigation" className="flex flex-col gap-1.5">
            {ADMIN_NAV_ITEMS.map((link) => {
              const Icon = ICONS[link.icon];
              const isActive = activeId === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-left text-sm transition-colors",
                    isActive
                      ? "bg-sbg-lilac-100 font-semibold text-sbg-accent-strong"
                      : "font-medium text-sbg-ink-2 hover:bg-sbg-lilac-50 hover:text-sbg-ink"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden={true} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>

      {/* The page inside renders its own <main>, so this wrapper is a div. */}
      <div id="admin-content" className="relative lg:pl-64">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminShellContent>{children}</AdminShellContent>
    </Suspense>
  );
}
