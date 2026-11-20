"use client";

import { isDriveUrl } from "@/lib/media/drive";
import { isPreprocessedMediaUrl } from "@/lib/media/image-src";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Camera, Film } from "lucide-react";
import { formatEventDate } from "@/lib/media/format";
import type { GalleryGroup } from "@/lib/media/public-view";
import { Reveal } from "@/components/design/Reveal";

const PLACEHOLDERS = [
  { span: "sm:col-span-2 sm:row-span-2" },
  { span: "" },
  { span: "" },
  { span: "" },
  { span: "sm:col-span-2" },
  { span: "" },
];

/** The gallery index in the light "Daylight Cloud" theme (DESIGN.md): one card per event. */
export function Gallery({ groups }: { groups: GalleryGroup[] }) {
  return (
    <section id="top" data-tone="dawn" aria-label="Event galleries" className="relative min-h-screen pb-24 pt-36 sm:pb-32 sm:pt-44">
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <Reveal className="max-w-2xl">
          <p className="t-eyebrow mb-4 flex items-center gap-3">
            <span className="t-pixel text-sbg-accent">01</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Gallery
          </p>
          <h1 className="t-display text-[clamp(38px,5.8vw,84px)] text-sbg-ink">
            Moments from the <span className="t-serif text-sbg-accent">community.</span>
          </h1>
          <p className="t-lead mt-5">
            Workshops, hackathons, study jams, and celebrations: a look at what happens when builders get together.
          </p>
        </Reveal>

        {groups.length === 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-3">
            {PLACEHOLDERS.map((item, i) => (
              <Reveal key={i} index={i % 3} className={item.span}>
                <div className="surface flex aspect-[4/3] h-full w-full items-center justify-center rounded-[26px]">
                  <p className="t-eyebrow">Coming soon</p>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <ul className="mt-14 grid gap-4 sm:mt-20 lg:grid-cols-2">
            {groups.map((group, i) => {
              const cover = group.cover ?? group.items[0] ?? null;
              const photoCount = group.items.filter((i) => i.kind === "image").length + (group.cover?.kind === "image" ? 1 : 0);
              const videoCount = group.items.filter((i) => i.kind === "video").length + (group.cover?.kind === "video" ? 1 : 0);
              return (
                <Reveal as="li" key={group.event.id} index={i % 2}>
                  <Link
                    href={`/gallery/${group.event.id}`}
                    className="surface lift group flex h-full items-center gap-4 overflow-hidden rounded-[26px] p-3 sm:gap-5 sm:p-4"
                  >
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-[18px] bg-sbg-lilac-100 sm:h-28 sm:w-40">
                      {cover ? (
                        <Image
                          src={cover.thumbUrl}
                          alt=""
                          fill
                          sizes="160px"
                          unoptimized={isPreprocessedMediaUrl(cover.thumbUrl)}
                          referrerPolicy={isDriveUrl(cover.thumbUrl) ? "no-referrer" : undefined}
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div aria-hidden="true" className="grid h-full w-full place-items-center" style={{ backgroundImage: "var(--cover-grad)" }}>
                          <Image src="/logos/SBG_logo.png" alt="" width={40} height={40} className="h-10 w-10 opacity-60" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="t-display truncate text-[20px] text-sbg-ink sm:text-[24px]">{group.event.name}</h2>
                      <p className="mt-1 text-[13px] text-sbg-ink-2">{formatEventDate(group.event.event_date)}</p>
                      <div className="mt-3 flex items-center gap-3 text-[12px] text-sbg-ink-3">
                        {photoCount > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Camera className="h-3.5 w-3.5 text-sbg-accent" aria-hidden="true" /> {photoCount}
                          </span>
                        )}
                        {videoCount > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Film className="h-3.5 w-3.5 text-sbg-accent" aria-hidden="true" /> {videoCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="mr-1 hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-sbg-lilac-100 text-sbg-accent-strong transition-colors group-hover:bg-sbg-lilac-600 group-hover:text-white sm:grid">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
