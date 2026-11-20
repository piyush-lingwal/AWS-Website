"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  User,
  Zap,
} from "lucide-react";
import { AnimatedCountdown } from "@/components/ui/animated-countdown";
import { SectionDivider } from "@/components/design/SectionDivider";
import { SuggestEventSection } from "@/components/features/events/SuggestEventSection";
import { Reveal } from "@/components/design/Reveal";
import { dayFromIso, mapEventRows, startOfDay, type EventStatus, type EventView } from "@/lib/design/events-view";
import { isDriveUrl } from "@/lib/media/drive";
import { isPreprocessedMediaUrl } from "@/lib/media/image-src";
import type { ApiResponse, DbEvent } from "@/types/certificate";
import { cn } from "@/lib/utils";
import { pixelWave } from "@/lib/design/pixel-cloud";

const MEETUP_URL = "https://www.meetup.com/tulas-university-dehradun/";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Event = EventView & {
  tagColor: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getNextEvent(events: Event[]): Event | undefined {
  return events.find((e) => e.status === "current" || e.status === "upcoming");
}

function hasConcreteDate(event: Event): boolean {
  return Boolean(event.isoDate && event.isoDate.trim() !== "");
}

/** Light pastel chip colours per category (custom categories fall back to lilac). */
const TAG_COLORS: Record<string, string> = {
  Workshop: "bg-sbg-lilac-100 text-sbg-accent-strong",
  Hackathon: "bg-[var(--tag-peach-bg)] text-[color:var(--tag-peach-fg)]",
  Quiz: "bg-[var(--tag-sky-bg)] text-[color:var(--tag-sky-fg)]",
  Event: "bg-[var(--tag-mint-bg)] text-[color:var(--tag-mint-fg)]",
};
const DEFAULT_TAG_COLOR = "bg-sbg-lilac-100 text-sbg-accent-strong";

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatusIndicator({ status }: { status: EventStatus }) {
  if (status === "past") {
    return (
      <span className="t-eyebrow inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-2.5 py-1 !text-[10px] ring-1 ring-inset ring-[var(--line)]">
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        Concluded
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="t-eyebrow inline-flex items-center gap-1.5 rounded-full bg-sbg-lilac-600 px-2.5 py-1 !text-[10px] !text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        Up Next
      </span>
    );
  }
  return (
    <span className="t-eyebrow inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-2.5 py-1 !text-[10px] !text-sbg-accent-strong ring-1 ring-inset ring-sbg-lilac-300">
      <span className="h-1.5 w-1.5 rounded-full bg-sbg-lilac-600" />
      Upcoming
    </span>
  );
}

function PixelCorner({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none grid grid-cols-3 gap-1", className)}>
      {Array.from({ length: 9 }, (_, k) => (
        <span
          key={k}
          data-hot={[0, 4, 8].includes(k) || undefined}
          className="px-tile h-2 w-2 rounded-[2px]"
          style={{ background: [0, 4, 8].includes(k) ? "#FF9900" : "var(--pixel-dim)", ...pixelWave(k, 3) }}
        />
      ))}
    </span>
  );
}

function EventCard({ event }: { event: Event }) {
  const isPast = event.status === "past";
  const isCurrent = event.status === "current";

  return (
    <article
      className={cn(
        "surface lift group relative flex h-full flex-col overflow-hidden rounded-[28px]",
        isCurrent && "ring-2 ring-sbg-lilac-300"
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-sbg-lilac-100">
        {event.coverUrl ? (
          <Image
            src={event.coverUrl}
            alt={`Cover photo for ${event.title}`}
            fill
            unoptimized={isPreprocessedMediaUrl(event.coverUrl)}
            referrerPolicy={isDriveUrl(event.coverUrl) ? "no-referrer" : undefined}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]",
              isPast && "saturate-[.85]"
            )}
          />
        ) : (
          <div
            aria-hidden="true"
            className="grid h-full w-full place-items-center"
            style={{ backgroundImage: "var(--cover-grad)" }}
          >
            <Image src="/logos/SBG_logo.png" alt="" width={56} height={56} className="h-14 w-14 opacity-60" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* status, category, registration state */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <StatusIndicator status={event.status} />
          <span className={cn("t-eyebrow rounded-full px-2.5 py-1 !text-[10px]", event.tagColor)}>{event.tag}</span>
          {!isPast && (
            <span className="t-eyebrow inline-flex items-center gap-1.5 rounded-full bg-[var(--tag-mint-bg)] px-2.5 py-1 !text-[10px] !text-[color:var(--tag-mint-fg)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ok-dot)]" />
              Registrations Open
            </span>
          )}
        </div>

        <h3 className="t-display text-[24px] text-sbg-ink sm:text-[28px]">{event.title}</h3>

        <p className={cn("mt-3 line-clamp-3 text-[15px] leading-relaxed", event.description ? "text-sbg-ink-2" : "italic text-sbg-ink-3")}>
          {event.description || "Official community session & workshop."}
        </p>

        <dl className="mt-auto grid gap-3 border-t border-[var(--line)] pt-5 sm:grid-cols-2">
          <MetaItem icon={Calendar} label="Date" value={event.date} />
          <MetaItem icon={Clock} label="Time" value={event.timing || "Schedule TBA"} />
          <MetaItem icon={MapPin} label="Venue" value="Tulas University, Dehradun" />
          {event.speakerName ? (
            <MetaItem icon={User} label="Keynote" value={event.speakerName} />
          ) : (
            <MetaItem icon={User} label="Host" value="AWS Student Builder Group" />
          )}
        </dl>

        {/* action strip */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
          {!isPast ? (
            <>
              <a href={MEETUP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary !min-h-[44px]">
                Register Now <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <span className="t-eyebrow hidden !text-[10px] sm:inline">RSVP on Meetup</span>
            </>
          ) : (
            <>
              <span className="t-eyebrow flex items-center gap-1.5 !text-[10px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--ok-dot)]" aria-hidden="true" />
                Session Concluded
              </span>
              <Link href="/gallery" className="btn btn-ghost !min-h-[44px]">
                <Camera className="h-4 w-4" aria-hidden="true" />
                View the Moments <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sbg-lilac-100 text-sbg-accent-strong">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="t-eyebrow !text-[10px]">{label}</dt>
        <dd className="mt-0.5 text-[14px] font-semibold text-sbg-ink">{value}</dd>
      </div>
    </div>
  );
}

/** Animated placeholder shown while data loads */
function EventCardSkeleton() {
  return (
    <div className="surface h-[460px] animate-pulse rounded-[28px]" aria-hidden="true" />
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function Events({ initialEvents, todayIso }: { initialEvents?: DbEvent[] | null; todayIso?: string } = {}) {
  // ── Live data ────────────────────────────────────────────
  // With server data the first render already holds the events (same HTML as the server).
  // Without it (database outage) the page loads them from /api/events after mount.
  const hasInitial = Array.isArray(initialEvents);
  const [rows, setRows] = React.useState<DbEvent[]>(hasInitial ? initialEvents : []);
  const [today, setToday] = React.useState<Date>(() => dayFromIso(todayIso) ?? startOfDay(new Date()));
  const [loading, setLoading] = React.useState<boolean>(!hasInitial);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // The server's day can differ from the visitor's: re-label with the browser's day after mount.
  React.useEffect(() => {
    const browserToday = startOfDay(new Date());
    setToday((prev) => (prev.getTime() === browserToday.getTime() ? prev : browserToday));
  }, []);

  React.useEffect(() => {
    if (hasInitial) return;
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

        if (!cancelled) setRows(json.data ?? []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map database rows → UI Event shape (first non-past row is labelled "current")
  const events = React.useMemo<Event[]>(
    () =>
      mapEventRows(rows, today).map((view) => ({
        ...view,
        tagColor: TAG_COLORS[view.tag] ?? DEFAULT_TAG_COLOR,
      })),
    [rows, today]
  );
  const nextEvent = getNextEvent(events);
  const upcomingEvents = events.filter((e) => e.status !== "past");
  // Sort concluded events with most recent first
  const pastEvents = [...events.filter((e) => e.status === "past")].reverse();
  const ready = !loading && !fetchError;

  return (
    <div id="events">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section data-tone="dawn" aria-label="Events overview" className="relative pb-16 pt-32 sm:pb-24 sm:pt-40">
        <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="space-y-6 lg:col-span-7">
              <p className="t-eyebrow flex items-center gap-3">
                <span className="t-pixel text-sbg-accent">01</span>
                <span className="h-px w-10 bg-sbg-lilac-300" />
                Official community calendar
              </p>
              <h1 className="t-display text-[clamp(38px,5.3vw,80px)] text-sbg-ink">
                What&apos;s on the <span className="t-serif text-sbg-accent">schedule.</span>
              </h1>
              <p className="t-lead max-w-xl">
                Hands-on cloud workshops, live architectural teardowns, hackathons, and certification study sprints hosted by
                the AWS Student Builder Group at Tulas University.
              </p>
              <ul className="flex flex-wrap items-center gap-2.5 pt-1">
                {[
                  { icon: Zap, label: "Hands-on Cloud Labs" },
                  { icon: Award, label: "Verified Credentials" },
                  { icon: Layers, label: "Free Student Access" },
                ].map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 rounded-full bg-[var(--chip-bg)] px-3.5 py-2 text-[13px] text-sbg-ink-2 ring-1 ring-[var(--line)]"
                  >
                    <Icon className="h-3.5 w-3.5 text-sbg-accent" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal index={1} className="lg:col-span-5">
              {nextEvent && hasConcreteDate(nextEvent) ? (
                <div className="surface relative overflow-hidden rounded-[36px] p-6 sm:p-7">
                  <PixelCorner className="absolute right-5 top-5 opacity-80" />
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2 pr-16">
                      <span className="t-eyebrow flex items-center gap-2 !text-sbg-accent-strong">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--ok-dot)]" />
                        Next upcoming event
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("t-eyebrow rounded-full px-2.5 py-1 !text-[10px]", nextEvent.tagColor)}>
                        {nextEvent.tag}
                      </span>
                      <span className="t-eyebrow rounded-full bg-[var(--tag-mint-bg)] px-2.5 py-1 !text-[10px] !text-[color:var(--tag-mint-fg)]">
                        Registrations Open
                      </span>
                    </div>

                    <div>
                      <h2 className="t-display line-clamp-2 text-[clamp(26px,2.6vw,36px)] text-sbg-ink">{nextEvent.title}</h2>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-sbg-ink-2">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-sbg-accent" aria-hidden="true" />
                          {nextEvent.date}
                        </span>
                        {nextEvent.timing && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-sbg-accent" aria-hidden="true" />
                            {nextEvent.timing}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="t-eyebrow mb-2.5 !text-[10px]">Event starts in</p>
                      <AnimatedCountdown
                        targetDate={nextEvent.isoDate}
                        variant="modern"
                        size="md"
                        completionMessage="The event is live now!"
                        containerClassName="w-full border-[var(--line)] bg-[var(--btn-ghost-bg)] p-2 shadow-none backdrop-blur-none"
                        unitClassName="min-w-0 flex-1 border-[var(--surface-line)] bg-sbg-lilac-100/70 px-1 py-2.5 hover:border-sbg-lilac-300 hover:bg-sbg-lilac-100 sm:px-2 sm:py-3"
                        numberClassName="text-2xl font-bold tracking-tight text-sbg-ink sm:text-3xl lg:text-4xl"
                        labelClassName="text-[8.5px] font-semibold uppercase tracking-wider text-sbg-ink-3 sm:text-[9.5px]"
                        accentClassName="via-sbg-lilac-300"
                      />
                    </div>

                    <a
                      href={MEETUP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full justify-center !min-h-[48px]"
                    >
                      Register Now on Meetup <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="surface relative overflow-hidden rounded-[36px] p-6 sm:p-8">
                  <PixelCorner className="absolute right-5 top-5 opacity-80" />
                  <div className="space-y-4">
                    <p className="t-eyebrow !text-sbg-accent-strong">Stay connected</p>
                    <h2 className="t-display text-[clamp(26px,2.6vw,36px)] text-sbg-ink">
                      Stay connected <span className="t-serif text-sbg-accent">with us.</span>
                    </h2>
                    <p className="text-[15px] leading-relaxed text-sbg-ink-2">
                      Join our active community on Meetup to get notified first as soon as our next hands-on cloud workshop
                      drops.
                    </p>
                    <a href={MEETUP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary !min-h-[48px]">
                      Visit Meetup Chapter <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Loading / error / empty ──────────────────────────── */}
      {loading && (
        <>
        <SectionDivider />
        <section data-tone="clear" aria-busy="true" aria-label="Loading events" className="relative py-16">
          <div className="mx-auto grid max-w-[1240px] gap-6 px-[var(--gutter)] md:grid-cols-2">
            {[0, 1, 2].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </section>
        </>
      )}

      {!loading && fetchError && (
        <>
        <SectionDivider />
        <section data-tone="clear" className="relative py-16">
          <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-3 px-[var(--gutter)] text-center">
            <p className="text-[16px] font-medium text-sbg-ink">Could not load events right now.</p>
            <p className="max-w-md rounded-2xl bg-[var(--chip-bg)] p-3 font-mono text-[13px] text-sbg-ink-3 ring-1 ring-[var(--line)]">
              {fetchError}
            </p>
          </div>
        </section>
        </>
      )}

      {ready && events.length === 0 && (
        <>
        <SectionDivider />
        <section data-tone="clear" className="relative py-16">
          <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
            <div className="surface mx-auto max-w-md rounded-[28px] px-8 py-8">
              <p className="t-eyebrow flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sbg-lilac-600" />
                Coming Soon
              </p>
              <h3 className="t-display mt-3 text-[28px] text-sbg-ink">Events being planned</h3>
              <p className="mt-2 text-[15px] text-sbg-ink-2">
                Our next workshop schedule is in the works. Announcements drop here first!
              </p>
            </div>
          </div>
        </section>
        </>
      )}

      {/* ── Upcoming sessions ────────────────────────────────── */}
      {ready && upcomingEvents.length > 0 && (
        <>
        <SectionDivider />
        <section data-tone="clear" aria-label="Upcoming sessions" className="relative py-16 sm:py-24">
          <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
            <Reveal className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="t-eyebrow mb-4 flex items-center gap-3">
                  <span className="t-pixel text-sbg-accent">02</span>
                  <span className="h-px w-10 bg-sbg-lilac-300" />
                  Upcoming sessions
                </p>
                <h2 className="t-display text-[clamp(34px,5.4vw,76px)] text-sbg-ink">
                  Save your <span className="t-serif text-sbg-accent">seat.</span>
                </h2>
              </div>
              <span className="t-eyebrow w-fit rounded-full bg-[var(--chip-bg)] px-3.5 py-2 ring-1 ring-[var(--line)]">
                {upcomingEvents.length} {upcomingEvents.length === 1 ? "Session Scheduled" : "Sessions Scheduled"}
              </span>
            </Reveal>

            <ul className="grid gap-6 md:grid-cols-2">
              {upcomingEvents.map((event, idx) => (
                <Reveal as="li" key={event.id || `upcoming-${idx}`} index={idx % 3}>
                  <EventCard event={event} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
        </>
      )}

      {/* ── Concluded sessions ───────────────────────────────── */}
      {ready && pastEvents.length > 0 && (
        <>
        <SectionDivider />
        <section data-tone="bloom" aria-label="Concluded sessions" className="relative py-16 sm:py-24">
          <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
            <Reveal className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="t-eyebrow mb-4 flex items-center gap-3">
                  <span className="t-pixel text-sbg-accent">{upcomingEvents.length > 0 ? "03" : "02"}</span>
                  <span className="h-px w-10 bg-sbg-lilac-300" />
                  Completed archive
                </p>
                <h2 className="t-display text-[clamp(34px,5.4vw,76px)] text-sbg-ink">
                  Concluded <span className="t-serif text-sbg-accent">sessions.</span>
                </h2>
                <p className="t-lead mt-5 max-w-xl">
                  Browse previous workshops, webinars, and hackathons completed by the AWS Student Builder Group.
                </p>
              </div>
              <span className="t-eyebrow w-fit rounded-full bg-[var(--chip-bg)] px-3.5 py-2 ring-1 ring-[var(--line)]">
                {pastEvents.length} {pastEvents.length === 1 ? "Session Concluded" : "Sessions Concluded"}
              </span>
            </Reveal>

            <ul className="grid gap-6 md:grid-cols-2">
              {pastEvents.map((event, idx) => (
                <Reveal as="li" key={event.id} index={idx % 3}>
                  <EventCard event={event} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
        </>
      )}

      <SectionDivider />
      {/* ── Suggest an event ─────────────────────────────────── */}
      <SuggestEventSection number={String(2 + (upcomingEvents.length > 0 ? 1 : 0) + (pastEvents.length > 0 ? 1 : 0)).padStart(2, "0")} />
    </div>
  );
}
