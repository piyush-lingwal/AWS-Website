"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Calendar, Clock, MapPin } from "lucide-react";
import { isDriveUrl } from "@/lib/media/drive";
import { isPreprocessedMediaUrl } from "@/lib/media/image-src";
import { eventDateLabel, eventDayLabel, parseDay, pickHomeEvents, startOfToday, type HomeEvent } from "@/lib/design/home-events";
import type { ApiResponse, DbEvent } from "@/types/certificate";
import { Reveal } from "./Reveal";
import { pixelWave } from "@/lib/design/pixel-cloud";

const MEETUP_URL = "https://www.meetup.com/tulas-university-dehradun/";

/** Shown when no upcoming event is published yet. */
const COMING_SOON: HomeEvent = {
  id: "next-session",
  name: "Next AWS Event in the Works",
  description:
    "We are cooking up our next hands-on AWS Event Session and hackathon. Join our Meetup group to get notified the second registrations open!",
  event_date: null,
  event_timing: "To be announced",
};

type LoadState = { status: "loading" } | { status: "ready"; next: HomeEvent | null; past: HomeEvent[] };

/**
 * Section 01. The live "What's next?" card and the most recent past events.
 * The server passes the events (initialEvents) so the HTML already holds them; without them
 * (database outage) they load from /api/events after mount.
 * Until the data arrives a placeholder of the same size holds the space, so the page never jumps.
 */
export function UpcomingEvents({ initialEvents, todayIso }: { initialEvents?: DbEvent[] | null; todayIso?: string } = {}) {
  const hasInitial = Array.isArray(initialEvents);
  // undefined = loading, null = could not load
  const [data, setData] = useState<HomeEvent[] | null | undefined>(hasInitial ? initialEvents : undefined);
  const [today, setToday] = useState<Date>(() => parseDay(todayIso) ?? startOfToday());

  // The server's day can differ from the visitor's: re-pick with the browser's day after mount.
  useEffect(() => {
    const browserToday = startOfToday();
    setToday((prev) => (prev.getTime() === browserToday.getTime() ? prev : browserToday));
  }, []);

  useEffect(() => {
    if (hasInitial) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/events", { cache: "no-store" });
        const json: ApiResponse<HomeEvent[]> = res.ok ? await res.json() : { success: false };
        if (!alive) return;
        setData(json.success && Array.isArray(json.data) ? json.data : null);
      } catch {
        if (alive) setData(null);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = useMemo<LoadState>(() => {
    if (data === undefined) return { status: "loading" };
    if (data === null) return { status: "ready", next: null, past: [] };
    const { next, past } = pickHomeEvents(data, today);
    return { status: "ready", next, past: past.slice(0, 3) };
  }, [data, today]);

  const ready = state.status === "ready";
  const upcoming = ready ? state.next : null;
  const event = upcoming ?? COMING_SOON;
  const past = ready ? state.past : [];
  const day = parseDay(event.event_date);
  const leaf = day
    ? { top: day.toLocaleDateString("en-IN", { month: "short" }), big: String(day.getDate()), note: eventDayLabel(event) }
    : { top: "Date", big: "TBA", note: "Stay tuned" };

  return (
    <section id="events" data-tone="clear" aria-label="Community events" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <Reveal className="relative mb-24 max-w-2xl sm:mb-24">
          <p className="t-eyebrow mb-4 flex items-center gap-3">
            <span className="t-pixel text-sbg-accent">01</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Upcoming event
          </p>
          <h2 className="t-display text-[clamp(34px,5.4vw,76px)] text-sbg-ink">
            What&apos;s <span className="t-serif text-sbg-accent">next?</span>
          </h2>
          <p className="t-lead mt-5">
            Join our upcoming event and be part of hands-on learning, engaging sessions and a growing community of builders.
          </p>
        </Reveal>

        <Reveal className="relative">
          {/* Kio peeks over the top edge of the card */}
          <Image
            src="/whats-next-kiro.webp"
            alt=""
            width={1536}
            height={1024}
            className="kio-shadow pointer-events-none absolute -top-[80px] right-3 z-10 h-auto w-[150px] drop-shadow-[0_18px_22px_rgba(27,17,64,0.3)] sm:-top-[128px] sm:right-12 lg:-top-[180px] sm:w-[300px]"
          />

          {!ready ? (
            <div className="surface h-[460px] animate-pulse rounded-[36px] sm:h-[400px]" aria-busy="true" aria-label="Loading the next event" />
          ) : (
            <article className="surface relative grid gap-6 overflow-visible rounded-[36px] p-4 sm:p-6 lg:grid-cols-12 lg:gap-10">
              {/* poster */}
              <div
                className="relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[26px] p-6 text-white shadow-[0_24px_50px_-28px_rgba(74,29,158,0.8)] ring-1 ring-white/10 sm:p-7 lg:col-span-5"
                style={{ backgroundImage: "linear-gradient(135deg, #2E1170 0%, #4A1D9E 55%, #6428D4 100%)" }}
              >
                <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#AF8CFF]/45 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-[#FF9900]/20 blur-3xl" />
                {/* pixel-cloud accent: a stepped block cluster in the top-right corner */}
                <span aria-hidden="true" className="pointer-events-none absolute right-6 top-6 grid grid-cols-5 gap-2 lg:gap-2.5">
                  {Array.from({ length: 25 }, (_, k) => {
                    const on = [4, 8, 9, 12, 13, 14, 16, 17, 18, 19].includes(k);
                    const hot = [4, 14].includes(k);
                    return <span key={k} data-hot={hot || undefined} className="px-tile h-3.5 w-3.5 rounded-[4px] lg:h-5 lg:w-5" style={{ background: hot ? "#FF9900" : on ? "rgba(255,255,255,0.3)" : "transparent", ...pixelWave(k, 5) }} />;
                  })}
                </span>
                <div className="relative flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/12 ring-1 ring-white/20">
                    <Image src="/logos/SBG_logo.png" alt="" width={22} height={22} className="h-[22px] w-[22px]" />
                  </span>
                  <span className="t-eyebrow !text-[10px] !leading-tight !text-white/80">
                    AWS Student
                    <br />
                    Builder Group
                  </span>
                </div>
                <div className="relative flex flex-col gap-5 py-8">
                  <div className="flex items-end gap-5">
                    <div className="grid h-[148px] w-[128px] shrink-0 grid-rows-[38px_1fr] lg:h-[176px] lg:w-[152px] lg:grid-rows-[44px_1fr] overflow-hidden rounded-3xl bg-white text-center text-sbg-ink shadow-[0_22px_40px_-14px_rgba(0,0,0,0.6)]">
                      <span className="t-eyebrow grid place-items-center bg-[#FF9900] !text-[12px] !font-semibold !text-[#1B1140]">{leaf.top}</span>
                      <span className={`t-display grid place-items-center leading-none text-[#2E1170] ${day ? "text-[68px] lg:text-[84px]" : "text-[44px] lg:text-[54px]"}`}>{leaf.big}</span>
                    </div>
                    <p className="t-serif min-w-0 pb-2 !text-[clamp(30px,3.4vw,54px)] leading-[1.02] text-white">{leaf.note}</p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] text-white/90">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF9900] opacity-70 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF9900]" />
                    </span>
                    {upcoming ? "Registrations open" : "Announcing soon"}
                  </span>
                </div>
                <p className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-[12px] text-white/90">
                  <MapPin className="h-3.5 w-3.5 text-[#D9C8FF]" aria-hidden="true" /> Tulas University, Dehradun
                </p>
              </div>
              {/* details */}
              <div className="flex flex-col justify-between gap-6 py-1 lg:col-span-7 lg:pr-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="t-eyebrow flex items-center gap-2 !text-sbg-accent-strong">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    {upcoming ? "Upcoming event" : "Community announcement"}
                  </p>
                  <span aria-hidden="true" className="flex gap-1.5">
                    {[0, 1, 2, 3].map((k) => (
                      <span key={k} data-hot={k === 0 || undefined} className="px-tile h-2 w-2 rounded-[2px]" style={{ background: k === 0 ? "#FF9900" : "var(--pixel-dim)", ...pixelWave(k, 4) }} />
                    ))}
                  </span>
                </div>

                <div>
                  <h3 className="t-display text-[clamp(28px,3.6vw,48px)] text-sbg-ink">{event.name}</h3>
                  <p className={`mt-3 ${upcoming ? "line-clamp-3" : ""} max-w-xl text-[16px] leading-relaxed text-sbg-ink-2`}>
                    {event.description ||
                      "Join us for our upcoming hands-on session featuring keynote highlights, community discussions and hands-on workshops. Learn, network and explore the latest in cloud technology with fellow builders."}
                  </p>
                  {!upcoming && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {["Hands-on labs", "Hackathon", "Community meetup"].map((t) => (
                        <li key={t} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-sbg-lilac-100 px-3 py-1.5 text-[12px] font-medium text-sbg-ink-2">
                          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-[2px] bg-[#FF9900]" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <dl className="grid items-stretch gap-3 sm:grid-cols-3">
                  {[
                    { icon: Calendar, label: "Date", value: eventDateLabel(event), note: eventDayLabel(event) },
                    { icon: Clock, label: "Time", value: event.event_timing || "To be announced", note: "IST" },
                    { icon: MapPin, label: "Venue", value: "Tulas University", note: "Dehradun" },
                  ].map(({ icon: Icon, label, value, note }) => (
                    <div key={label} className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-sbg-lilac-100 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-sbg-accent-strong ring-1 ring-[var(--line)]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <dt className="t-eyebrow !text-[10px]">{label}</dt>
                        <dd className="mt-1 text-[13px] font-semibold leading-snug text-sbg-ink xl:whitespace-nowrap">{value}</dd>
                        <dd className="text-[12px] text-sbg-ink-3">{note}</dd>
                      </div>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[13px] text-sbg-ink-3">
                    {upcoming ? "Free for students. Seats fill up fast." : "Join the Meetup group to hear first."}
                  </p>
                  <a href={MEETUP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary !min-h-[48px] justify-center">
                    {upcoming ? "Register now" : "Join on Meetup"} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          )}
        </Reveal>

        {past.length > 0 && (
          <div className="mt-20 sm:mt-28">
            <Reveal className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="t-eyebrow mb-3 flex items-center gap-3">
                  <span className="h-px w-8 bg-sbg-lilac-300" />
                  Our past events
                </p>
                <h3 className="t-display text-[clamp(28px,3.6vw,48px)] text-sbg-ink">
                  Moments from <span className="t-serif text-sbg-accent">our journey.</span>
                </h3>
              </div>
              <Link href="/events" className="btn btn-ghost self-start sm:self-auto">
                View past events <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((e, i) => (
                <Reveal as="li" key={e.id} index={i}>
                  <PastCard event={e} />
                </Reveal>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function PastCard({ event }: { event: HomeEvent }) {
  const cover = event.cover_url ?? null;
  return (
    <Link href="/events" className="surface lift group block overflow-hidden rounded-[26px]">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-sbg-lilac-100">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            unoptimized={isPreprocessedMediaUrl(cover)}
            referrerPolicy={isDriveUrl(cover) ? "no-referrer" : undefined}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          // No cover uploaded yet: the brand's pixel chip on a lilac wash, never stock photography.
          <div aria-hidden="true" className="grid h-full w-full place-items-center" style={{ backgroundImage: "linear-gradient(135deg, var(--lilac-200) 0%, var(--lilac-100) 55%, var(--card-lilac) 100%)" }}>
            <Image src="/logos/SBG_logo.png" alt="" width={64} height={64} className="h-16 w-16 opacity-60" />
          </div>
        )}
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-[var(--surface)]/90 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] text-sbg-ink-2 ring-1 ring-[var(--line)] backdrop-blur">
          Past event
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <h4 className="t-display line-clamp-1 text-[20px] text-sbg-ink">{event.name}</h4>
          <p className="mt-2 flex items-center gap-2 text-[13px] text-sbg-ink-3">
            <Calendar className="h-3.5 w-3.5 text-sbg-accent" aria-hidden="true" />
            {eventDateLabel(event)}
          </p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sbg-lilac-100 text-sbg-accent-strong transition-colors group-hover:bg-sbg-accent group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
