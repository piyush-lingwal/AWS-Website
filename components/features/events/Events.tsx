"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  Award,
  Zap,
  Camera,
  ArrowRight,
} from "lucide-react";
import { SquareArrowOutUpRight } from "@/components/ui/animate-ui/icons/square-arrow-out-up-right";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedCountdown } from "@/components/ui/animated-countdown";
import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine,
} from "@/components/ui/timeline";
import { SuggestEventSection } from "@/components/features/events/SuggestEventSection";
import Image from "next/image";
import { isDriveUrl } from "@/lib/media/drive";
import { isPreprocessedMediaUrl } from "@/lib/media/image-src";
import type { ApiResponse, DbEvent } from "@/types/certificate";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MEETUP_URL = "https://www.meetup.com/tulas-university-dehradun/";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type EventStatus = "past" | "current" | "upcoming";

type Event = {
  id: string;
  title: string;
  date: string;
  rawDate: string | null; // null when the event date is TBA
  timing: string | null;
  isoDate: string; // used for countdown target
  speakerName: string | null;
  attendanceOpen: boolean;
  tag: string;
  tagColor: string;
  dotColor: string;
  description: string;
  status: EventStatus;
  coverUrl: string | null;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Formats a YYYY-MM-DD string to a human-readable date. */
function formatDisplayDate(iso: string | null): string {
  if (!iso) return ""; // TBA
  try {
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Determines event status relative to today.
 * The first non-past event is labelled "current"; the rest are "upcoming".
 */
function computeStatus(
  eventDate: string | null,
  firstFutureId: string | null,
  id: string
): EventStatus {
  // TBA events (empty / null date) have no confirmed date yet — treat as upcoming
  if (!eventDate || eventDate.trim() === "") {
    return id === firstFutureId ? "current" : "upcoming";
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!eventDate) return "past"; // TBA events are not countdown targets
  const date = new Date(eventDate + "T00:00:00");
  // If the date string is malformed, also treat as upcoming rather than concluded
  if (isNaN(date.getTime())) return "upcoming";
  if (date < today) return "past";
  if (id === firstFutureId) return "current";
  return "upcoming";
}

function getNextEvent(events: Event[]): Event | undefined {
  return events.find((e) => e.status === "current" || e.status === "upcoming");
}

function hasConcreteDate(event: Event): boolean {
  return Boolean(event.isoDate && event.isoDate.trim() !== "");
}

function getTimelineDotStatus(status: EventStatus) {
  if (status === "past") return "done" as const;
  if (status === "current") return "current" as const;
  return "default" as const;
}

/* ------------------------------------------------------------------ */
/*  Sub-Components                                                     */
/* ------------------------------------------------------------------ */

function StatusIndicator({ status }: { status: EventStatus }) {
  if (status === "past") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sbg-ink/[0.05] px-2.5 py-1 text-[11px] font-medium text-sbg-ink-3 ring-1 ring-inset ring-sbg-ink/10">
        <CheckCircle2 className="h-3 w-3 text-sbg-ink-3" />
        Concluded
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sbg-lilac-100 px-2.5 py-1 text-[11px] font-semibold text-sbg-lilac-700 ring-1 ring-inset ring-sbg-lilac-300">
        <span className="h-1.5 w-1.5 rounded-full bg-sbg-lilac-600 animate-pulse" />
        Up Next
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-sbg-ink-2 ring-1 ring-inset ring-sbg-ink/10">
      <span className="h-1.5 w-1.5 rounded-full bg-sbg-ink-3/60" />
      Upcoming
    </span>
  );
}

function EventCard({ event, className }: { event: Event; className?: string }) {
  const isPast = event.status === "past";
  const isCurrent = event.status === "current";

  return (
    <SpotlightCard
      className={cn(
        "group relative overflow-hidden rounded-[24px] border backdrop-blur-xl transition-all duration-300 flex flex-col h-full",
        isCurrent
          ? "border-sbg-lilac-300 bg-white/80 bg-gradient-to-br from-sbg-lilac-100 to-white/85 hover:bg-white/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_24px_50px_-24px_rgba(76,29,149,0.35)] ring-1 ring-sbg-lilac-200"
          : isPast
          ? "border-white/80 bg-white/55 hover:border-white hover:bg-white/75 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_40px_-28px_rgba(76,29,149,0.22)]"
          : "border-white/90 bg-white/75 hover:border-sbg-lilac-300 hover:bg-white/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_50px_-24px_rgba(76,29,149,0.28),0_2px_6px_-2px_rgba(76,29,149,0.08)] hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_30px_60px_-24px_rgba(76,29,149,0.38)]",
        className
      )}
      contentClassName="h-full flex flex-col flex-1"
      spotlightColor={
        isCurrent
          ? "rgba(124, 58, 237, 0.06)"
          : isPast
          ? "rgba(27, 17, 64, 0.025)"
          : "rgba(124, 58, 237, 0.04)"
      }
      borderColor={
        isCurrent
          ? "rgba(124, 58, 237, 0.14)"
          : isPast
          ? "rgba(27, 17, 64, 0.05)"
          : "rgba(124, 58, 237, 0.1)"
      }
    >
      {/* Top ambient glow for Up Next event */}
      {isCurrent && (
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-32 w-64 rounded-full bg-sbg-lilac-300/45 blur-2xl" />
      )}

      {/* Cover photo uploaded via the Media Portal, when one exists */}
      {event.coverUrl && (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-[var(--line)]">
          <Image
            src={event.coverUrl}
            alt=""
            fill
            unoptimized={isPreprocessedMediaUrl(event.coverUrl)}
            referrerPolicy={isDriveUrl(event.coverUrl) ? "no-referrer" : undefined}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
        </div>
      )}

      <div className="p-5 sm:p-6 flex flex-col justify-between h-full flex-1">
        <div className="flex-1 flex flex-col">
          {/* Top row: Status + Category Tag + Registrations Open Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusIndicator status={event.status} />
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${event.tagColor}`}
              >
                {event.tag}
              </span>
            </div>

            {/* Registrations Open indicator for active/upcoming event */}
            {!isPast && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DDF3E6] border border-[#9AD6B1] px-2.5 py-0.5 text-[10.5px] font-lt-mono font-semibold uppercase tracking-wider text-[#166534]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Registrations Open
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`font-lt-display text-[20px] sm:text-[23px] font-semibold leading-[1.15] tracking-[-0.025em] transition-colors duration-200 ${
              isPast
                ? "text-sbg-ink/80 group-hover:text-sbg-ink"
                : "text-sbg-ink group-hover:text-sbg-lilac-600"
            }`}
          >
            {event.title}
          </h3>

          {/* Description */}
          {event.description ? (
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-sbg-ink-2 line-clamp-3">
              {event.description}
            </p>
          ) : (
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-sbg-ink-3 italic line-clamp-3">
              Official community session & workshop.
            </p>
          )}

          {/* Metadata Chips: Date, Timing, Speaker */}
          <div className="mt-auto pt-5 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Date Chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 border border-[var(--line)] text-xs text-sbg-ink-2">
              <Calendar className="w-3.5 h-3.5 text-sbg-lilac-600 shrink-0" />
              <span className="font-medium truncate">{event.date}</span>
            </div>

            {/* Timing Chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 border border-[var(--line)] text-xs text-sbg-ink-2">
              <Clock className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span className="font-medium truncate">{event.timing || "Schedule TBA"}</span>
            </div>

            {/* Speaker Chip */}
            {event.speakerName ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 border border-[var(--line)] text-xs text-sbg-ink-2 sm:col-span-2">
                <User className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span className="font-medium truncate">
                  Keynote: <strong className="text-sbg-ink font-semibold">{event.speakerName}</strong>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 border border-[var(--line)] text-xs text-sbg-ink-2 sm:col-span-2">
                <User className="w-3.5 h-3.5 text-sbg-lilac-600/80 shrink-0" />
                <span className="font-medium truncate">
                  Host: <strong className="text-sbg-ink font-semibold">AWS Student Builder Group</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Strip (Footer) */}
        <div className="mt-5 pt-4 border-t border-[var(--line)]">
          {!isPast ? (
            /* Upcoming / Up Next: Prominent CTA to Meetup Registration */
            <div className="flex items-center justify-between gap-3">
              <a
                href={MEETUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary !min-h-[44px] !px-5 !text-[14px] cursor-pointer"
              >
                <span>Register Now</span>
                <SquareArrowOutUpRight size={14} animateOnHover />
              </a>
              <span className="t-eyebrow !text-[10.5px] hidden sm:inline">
                RSVP on Meetup
              </span>
            </div>
          ) : (
            /* Concluded Event: View the Moments in Gallery */
            <div className="flex items-center justify-between gap-3">
              <span className="t-eyebrow !text-[10.5px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]/80" />
                Session Concluded
              </span>
              <Link
                href="/gallery"
                className="group/btn inline-flex items-center gap-1.5 text-[13px] text-sbg-lilac-700 hover:text-sbg-lilac-600 transition-colors font-semibold cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-sbg-lilac-600/80 group-hover/btn:text-sbg-lilac-600 transition-colors" />
                <span>View the Moments</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}

/** Animated placeholder shown while data loads */
function EventCardSkeleton() {
  return (
    <div className="rounded-[24px] border border-white/90 bg-white/60 p-5 sm:p-6 animate-pulse flex flex-col justify-between h-full space-y-4 shadow-[0_20px_50px_-28px_rgba(76,29,149,0.25)]">
      <div className="space-y-3 flex-1">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-sbg-lilac-200/70" />
          <div className="h-5 w-20 rounded-full bg-sbg-lilac-200/70" />
        </div>
        <div className="h-6 w-3/4 rounded bg-sbg-lilac-200/70" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-sbg-lilac-100" />
          <div className="h-4 w-5/6 rounded bg-sbg-lilac-100" />
        </div>
        <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="h-8 rounded-xl bg-sbg-lilac-100" />
          <div className="h-8 rounded-xl bg-sbg-lilac-100" />
          <div className="h-8 rounded-xl bg-sbg-lilac-100 sm:col-span-2" />
        </div>
      </div>
      <div className="pt-4 border-t border-[var(--line)] flex justify-between items-center">
        <div className="h-4 w-28 rounded bg-sbg-lilac-100" />
        <div className="h-4 w-24 rounded bg-sbg-lilac-100" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function Events() {
  const containerRef = React.useRef<HTMLElement>(null);

  // ── Live data ────────────────────────────────────────────
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      setFetchError(null);

      try {
        const res = await fetch("/api/events", { cache: "no-store" });
        const json: ApiResponse<DbEvent[]> = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || `Server returned error (${res.status})`);
        }

        const rawEvents: DbEvent[] = json.data ?? [];

        // Determine the first non-past event so we can label it "current"
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstFutureRow = rawEvents.find((row: DbEvent) => {
          if (!row.event_date) return false;
          const d = new Date(row.event_date + "T00:00:00");
          return !isNaN(d.getTime()) && d >= today;
        });

        const firstFutureId = firstFutureRow?.id ?? null;

        // Map Supabase rows → UI Event shape
        const mapped: Event[] = rawEvents.map((row: DbEvent) => {
          const eventDate = row.event_date ?? "";
          const status = computeStatus(eventDate, firstFutureId, row.id);
          const eventTag = row.event_type || "Event";
          // Pastel tints from the Daylight Cloud palette (same hues as the preview's event cards).
          // Concluded events share one muted neutral so they recede.
          const pastTag = "bg-sbg-ink/[0.05] text-sbg-ink-3";
          const tagColorMap: Record<string, string> = {
            Workshop:  status === "past" ? pastTag : status === "current" ? "bg-sbg-lilac-100 text-sbg-lilac-700 border border-sbg-lilac-300" : "bg-sbg-lilac-100 text-sbg-lilac-700",
            Hackathon: status === "past" ? pastTag : status === "current" ? "bg-[#FFEBD3] text-[#9A5300] border border-[#F5C48A]"             : "bg-[#FFEBD3] text-[#9A5300]",
            Quiz:      status === "past" ? pastTag : status === "current" ? "bg-[#DCEBFF] text-[#1D4ED8] border border-[#A9C8F5]"             : "bg-[#DCEBFF] text-[#1D4ED8]",
            Event:     status === "past" ? pastTag : status === "current" ? "bg-[#DDF3E6] text-[#166534] border border-[#9AD6B1]"             : "bg-[#DDF3E6] text-[#166534]",
          };
          const tagColor = tagColorMap[eventTag] ?? (
            status === "past"
              ? pastTag
              : status === "current"
              ? "bg-sbg-lilac-100 text-sbg-lilac-700 border border-sbg-lilac-300"
              : "bg-sbg-lilac-100 text-sbg-lilac-700"
          );
          return {
            id: row.id,
            title: row.name,
            date: formatDisplayDate(eventDate),
            rawDate: eventDate,
            timing: row.event_timing ?? "",
            isoDate: status !== "past" && eventDate ? eventDate + "T00:00:00" : "",
            speakerName: row.speaker_name,
            attendanceOpen: row.attendance_open,
            tag: eventTag,
            tagColor,
            dotColor: status === "past" ? "text-sbg-ink-3" : "text-sbg-lilac-600",
            description: row.description ?? "",
            status,
            coverUrl: row.cover_url,
          };
        });

        if (!cancelled) setEvents(mapped);
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          setFetchError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const nextEvent = getNextEvent(events);
  const upcomingEvents = events.filter((e) => e.status !== "past");
  // Sort concluded events with most recent first
  const pastEvents = [...events.filter((e) => e.status === "past")].reverse();

  // ── GSAP animations ───────────────────────────────────────
  useGSAP(
    () => {
      if (loading) return;

      gsap.from(".events-hero-left", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power2.out",
      });

      gsap.from(".events-hero-right", {
        opacity: 0,
        scale: 0.96,
        duration: 0.8,
        delay: 0.15,
        ease: "power3.out",
      });

      gsap.set(".timeline-event-item", { opacity: 0, x: -20 });
      ScrollTrigger.batch(".timeline-event-item", {
        onEnter: (elements) => {
          gsap.to(elements, {
            opacity: 1,
            x: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: "power3.out",
            overwrite: true,
          });
        },
        start: "top 88%",
      });

      gsap.set(".concluded-event-item", { opacity: 0, y: 20 });
      ScrollTrigger.batch(".concluded-event-item", {
        onEnter: (elements) => {
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            overwrite: true,
          });
        },
        start: "top 92%",
      });

      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);

      return () => clearTimeout(refreshTimer);
    },
    { scope: containerRef, dependencies: [loading] }
  );

  return (
    <section
      ref={containerRef}
      id="events"
      className="relative min-h-screen"
    >
      <div className="relative mx-auto max-w-[1240px] px-[var(--gutter)] pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-36 lg:pb-32">

        {/* ══════════════════════════════════════════════════════ */}
        {/* ── HIGH-IMPACT 2-COLUMN HERO SECTION ────────────────── */}
        {/* ══════════════════════════════════════════════════════ */}
        <div data-tone="dawn" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & Community Value */}
          <div className="events-hero-left lg:col-span-6 xl:col-span-7 space-y-5">
            <div className="t-eyebrow inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 px-3.5 py-1.5 !text-[10.5px] !text-sbg-ink-2 backdrop-blur">
              <Sparkles className="w-3.5 h-3.5 text-sbg-lilac-600" />
              <span>Official Community Calendar</span>
            </div>

            <h1 className="t-display text-[clamp(38px,5.2vw,72px)] text-sbg-ink">
              What&apos;s on the{" "}
              <span className="t-serif text-sbg-lilac-600">schedule.</span>
            </h1>

            <p className="t-lead max-w-xl">
              Hands-on cloud workshops, live architectural teardowns, hackathons, and certification study sprints hosted by the AWS Student Builder Group at Tulas University.
            </p>

            {/* Quick Value Points */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 text-[13px] font-medium text-sbg-ink">
              <div className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 backdrop-blur">
                <Zap className="w-3.5 h-3.5 text-[#EA8A00]" />
                <span>Hands-on Cloud Labs</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 backdrop-blur">
                <Award className="w-3.5 h-3.5 text-sbg-lilac-600" />
                <span>Verified Credentials</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 backdrop-blur">
                <Layers className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Free Student Access</span>
              </div>
            </div>
          </div>

          {/* Right Column: Stylish, Bigger Live Countdown Command Stage */}
          <div className="events-hero-right lg:col-span-6 xl:col-span-5 w-full">
            {nextEvent && hasConcreteDate(nextEvent) ? (
              <SpotlightCard
                className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/80 bg-gradient-to-b from-sbg-lilac-100/90 to-white/80 hover:bg-white/90 p-6 sm:p-7 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_30px_60px_-24px_rgba(76,29,149,0.35),0_2px_6px_-2px_rgba(76,29,149,0.08)] backdrop-blur-xl ring-1 ring-sbg-lilac-200"
                spotlightColor="rgba(124, 58, 237, 0.05)"
                borderColor="rgba(124, 58, 237, 0.12)"
              >
                {/* Ambient Top Glow */}
                <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-28 w-60 rounded-full bg-sbg-lilac-300/50 blur-3xl" />

                <div className="relative space-y-5">
                  {/* Stage Top Bar */}
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] pb-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10.5px] font-lt-mono uppercase tracking-wider font-semibold text-[#166534]">
                        Next Upcoming Event
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide ${nextEvent.tagColor}`}
                      >
                        {nextEvent.tag}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-lt-mono uppercase font-bold tracking-wider bg-[#DDF3E6] border border-[#9AD6B1] text-[#166534]">
                      Registrations Open
                    </span>
                  </div>

                  {/* Event Title Preview */}
                  <div>
                    <h2 className="font-lt-display text-xl sm:text-2xl font-semibold text-sbg-ink tracking-[-0.025em] leading-[1.15] line-clamp-2">
                      {nextEvent.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[13px] text-sbg-ink-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sbg-lilac-600" />
                        <span>{nextEvent.date}</span>
                      </div>
                      {nextEvent.timing && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>{nextEvent.timing}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── BIGGER, STYLISH COUNTDOWN DISPLAY ── */}
                  <div className="py-2">
                    <p className="t-eyebrow !text-[10.5px] mb-2.5 flex items-center gap-1.5">
                      <span>Event starts in:</span>
                    </p>
                    <AnimatedCountdown
                      targetDate={nextEvent.isoDate}
                      variant="modern"
                      size="md"
                      completionMessage="🎉 The event is live now!"
                      containerClassName="w-full bg-white/60 border-white/90 shadow-none backdrop-blur-md p-2 sm:p-2.5"
                      unitClassName="bg-white/80 border-[var(--line)] shadow-none hover:border-sbg-lilac-300 hover:bg-white min-w-0 flex-1 py-2.5 sm:py-3 px-1 sm:px-2"
                      numberClassName="text-2xl sm:text-3xl lg:text-4xl font-semibold font-lt-display tracking-[-0.03em] text-sbg-ink"
                      labelClassName="text-[8.5px] sm:text-[9.5px] uppercase font-lt-mono tracking-wider text-sbg-ink-3 font-medium"
                      accentClassName="via-sbg-lilac-400/60"
                    />
                  </div>

                  {/* ── CTA BUTTON TO MEETUP ── */}
                  <div className="pt-2 border-t border-[var(--line)]">
                    <a
                      href={MEETUP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full cursor-pointer"
                    >
                      <span>Register Now on Meetup</span>
                      <SquareArrowOutUpRight size={14} animateOnHover />
                    </a>
                  </div>
                </div>
              </SpotlightCard>
            ) : (
              /* Fallback Stage when no future countdown target is set */
              <SpotlightCard
                className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/75 hover:bg-white/90 p-6 sm:p-8 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_30px_60px_-24px_rgba(76,29,149,0.3)]"
                spotlightColor="rgba(124, 58, 237, 0.04)"
                borderColor="rgba(124, 58, 237, 0.1)"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-sbg-lilac-100 border border-sbg-lilac-200 flex items-center justify-center text-sbg-lilac-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-lt-display text-2xl font-semibold tracking-[-0.025em] text-sbg-ink">
                    Stay Connected With Us
                  </h3>
                  <p className="text-sm text-sbg-ink-2 leading-relaxed">
                    Join our active community on Meetup to get notified first as soon as our next hands-on cloud workshop drops.
                  </p>
                  <a
                    href={MEETUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary !min-h-[44px] !px-5 !text-[14px] cursor-pointer"
                  >
                    <span>Visit Meetup Chapter</span>
                    <SquareArrowOutUpRight size={13} />
                  </a>
                </div>
              </SpotlightCard>
            )}
          </div>
        </div>

        {/* ── Loading skeletons ────────────────────────────────── */}
        {loading && (
          <div className="mt-16 space-y-6">
            {[0, 1, 2].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Error state ──────────────────────────────────────── */}
        {!loading && fetchError && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center py-16">
            <p className="text-[15px] text-sbg-ink-2 font-medium">
              Could not load events right now.
            </p>
            <p className="text-[13px] text-sbg-ink-3 max-w-md font-lt-mono bg-white/70 p-3 rounded-xl border border-[var(--line)]">
              {fetchError}
            </p>
          </div>
        )}

        {/* ── Empty state (No events in DB at all) ─────────────── */}
        {!loading && !fetchError && events.length === 0 && (
          <div className="mt-16 flex flex-col items-center py-20">
            <div className="inline-flex flex-col items-start gap-3 rounded-[24px] border border-white/90 bg-white/75 backdrop-blur-xl shadow-[0_20px_50px_-24px_rgba(76,29,149,0.28)] px-8 py-7 text-center sm:text-left">
              <p className="t-eyebrow flex items-center gap-2 mx-auto sm:mx-0">
                <span className="h-1.5 w-1.5 rounded-full bg-sbg-lilac-600 animate-pulse" />
                Coming Soon
              </p>
              <h3 className="font-lt-display text-[24px] sm:text-[28px] font-semibold tracking-[-0.025em] text-sbg-ink">
                Events being <span className="t-serif text-sbg-lilac-600">planned</span>
              </h3>
              <p className="text-[14.5px] text-sbg-ink-2 max-w-sm">
                Our next workshop schedule is in the works. Announcements drop here first!
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* ── SECTION 1: UPCOMING SESSIONS (TIMELINE) ─────────── */}
        {/* ══════════════════════════════════════════════════════ */}
        {!loading && !fetchError && upcomingEvents.length > 0 && (
          <div data-tone="bloom" className="mt-20 sm:mt-24">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sbg-lilac-600 animate-pulse" />
                <h3 className="t-display text-[clamp(26px,3.2vw,40px)] text-sbg-ink">
                  Upcoming <span className="t-serif text-sbg-lilac-600">Sessions</span>
                </h3>
              </div>
              <span className="t-eyebrow !text-[10.5px] px-3 py-1.5 rounded-full bg-white/70 border border-[var(--line)] backdrop-blur">
                {upcomingEvents.length} {upcomingEvents.length === 1 ? "Session Scheduled" : "Sessions Scheduled"}
              </span>
            </div>

            <Timeline positions="left" className="gap-0">
              {upcomingEvents.map((event, idx) => (
                <TimelineItem
                  key={event.id || `upcoming-${idx}`}
                  status={event.status === "past" ? "done" : "default"}
                  className="timeline-event-item"
                >
                  <TimelineHeading
                    className={`text-[13px] font-medium ${
                      event.status === "current"
                        ? "text-sbg-lilac-700 font-semibold"
                        : "text-sbg-ink-2"
                    }`}
                  >
                    {event.date}
                  </TimelineHeading>

                  <TimelineDot
                    status={getTimelineDotStatus(event.status)}
                    className={`${event.dotColor} ${
                      event.status === "current"
                        ? "ring-2 ring-sbg-lilac-400/50 ring-offset-2 ring-offset-sbg-paper scale-125"
                        : ""
                    }`}
                  />

                  {idx < upcomingEvents.length - 1 && (
                    <TimelineLine
                      done={event.status === "past"}
                      className={
                        event.status === "current"
                          ? "bg-gradient-to-b from-sbg-lilac-600 to-sbg-lilac-200"
                          : "bg-sbg-lilac-200"
                      }
                    />
                  )}

                  <TimelineContent className="pb-10 pt-1 w-full max-w-2xl">
                    <div className="group">
                      <EventCard event={event} />
                    </div>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* ── SECTION 2: CONCLUDED SESSIONS (ARCHIVE) ──────────── */}
        {/* ══════════════════════════════════════════════════════ */}
        {!loading && !fetchError && pastEvents.length > 0 && (
          <div data-tone="clear" className="mt-20 sm:mt-28 pt-12 border-t border-[var(--line)]">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="t-eyebrow !text-[10.5px] inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-[var(--line)] backdrop-blur mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sbg-ink-3" />
                  <span>Completed Archive</span>
                </div>
                <h3 className="t-display text-[clamp(28px,3.6vw,48px)] text-sbg-ink">
                  Concluded <span className="t-serif text-sbg-lilac-600">Sessions</span>
                </h3>
                <p className="mt-2 text-sm sm:text-[15px] text-sbg-ink-2 max-w-lg leading-relaxed">
                  Browse previous workshops, webinars, and hackathons completed by the AWS Student Builder Group.
                </p>
              </div>

              <span className="t-eyebrow !text-[10.5px] px-3 py-1.5 rounded-full bg-white/70 border border-[var(--line)] backdrop-blur w-fit">
                {pastEvents.length} {pastEvents.length === 1 ? "Session Concluded" : "Sessions Concluded"}
              </span>
            </div>

            {/* Grid of Concluded Event Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              {pastEvents.map((event) => (
                <div key={event.id} className="concluded-event-item h-full flex flex-col">
                  <EventCard event={event} className="h-full flex-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Suggest Event Section ─────────────────────────────── */}
        <SuggestEventSection />
      </div>
    </section>
  );
}
