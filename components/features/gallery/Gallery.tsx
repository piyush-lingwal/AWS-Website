"use client";

import { isDriveUrl } from "@/lib/media/drive";
import { isPreprocessedMediaUrl } from "@/lib/media/image-src";
import * as React from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PixelHeading } from "@/components/ui/pixel-heading-character";
import { Spotlight } from "@/components/ui/spotlight";
import Link from "next/link";
import { Camera, Film } from "lucide-react";
import { formatEventDate } from "@/lib/media/format";
import type { GalleryGroup } from "@/lib/media/public-view";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const PLACEHOLDERS = [
  { span: "sm:col-span-2 sm:row-span-2" },
  { span: "" },
  { span: "" },
  { span: "" },
  { span: "sm:col-span-2" },
  { span: "" },
];

export function Gallery({ groups }: { groups: GalleryGroup[] }) {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(() => {
    // Header reveal
    gsap.from(".gallery-header-el", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".gallery-header-container",
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });

    // Set initial hidden state so gallery items stay hidden until reaching viewport
    gsap.set(".gallery-item", { opacity: 0, scale: 0.9, y: 30 });

    // Batched Gallery Items reveal for optimized staggered loading
    ScrollTrigger.batch(".gallery-item", {
      onEnter: (elements) => {
        gsap.to(elements, { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          overwrite: true
        });
      },
      onLeaveBack: (elements) => {
        gsap.to(elements, {
          opacity: 0,
          scale: 0.9,
          y: 30,
          duration: 0.4,
          overwrite: true
        });
      },
      start: "top 90%",
    });

    // Refresh ScrollTrigger to calculate offsets correctly after DOM is fully laid out
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => clearTimeout(refreshTimer);
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="gallery" className="bg-grid bg-noise relative overflow-hidden bg-bg min-h-screen">
      <Spotlight className="-top-24 left-32 md:-top-20 md:left-60" fill="#A78BFA" />
      
      {/* Headline ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/4 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />
      {/* Secondary glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-[480px] w-[480px] translate-x-1/3 rounded-full bg-secondary/8 blur-[140px]"
      />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 pt-28 pb-16 md:pt-32 md:pb-24 lg:pt-32 lg:pb-32 z-10">
        <div className="gallery-header-container">
          <p className="gallery-header-el text-[11px] uppercase tracking-[0.16em] text-muted">
            Gallery
          </p>
          <h2 className="gallery-header-el mt-4 font-display text-[32px] sm:text-[36px] md:text-[44px] font-semibold leading-[1.1] tracking-tight text-text-primary">
            Moments from the{" "}
            <PixelHeading mode="uniform" className="text-gradient">community.</PixelHeading>
          </h2>
          <p className="gallery-header-el mt-4 sm:mt-5 max-w-lg text-[15px] sm:text-[16px] leading-relaxed text-text-secondary">
            Workshops, hackathons, study jams, and celebrations — a look at
            what happens when builders get together.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="gallery-grid-container mt-14 grid grid-cols-1 gap-3 sm:grid-cols-3 relative z-10">
            {PLACEHOLDERS.map((item, i) => (
              <div
                key={i}
                className={`gallery-item group relative overflow-hidden rounded-xl border border-border bg-bg/80 backdrop-blur-sm transition-colors hover:border-border/80 ${item.span}`}
              >
                <div className="flex aspect-[4/3] w-full items-center justify-center">
                  <p className="text-[15px] font-medium tracking-wide text-muted">
                    Coming Soon...
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-14 space-y-4 relative z-10">
            {groups.map((group) => {
              const cover = group.cover ?? group.items[0] ?? null;
              const photoCount = group.items.filter((i) => i.kind === "image").length + (group.cover?.kind === "image" ? 1 : 0);
              const videoCount = group.items.filter((i) => i.kind === "video").length + (group.cover?.kind === "video" ? 1 : 0);
              return (
                <Link
                  key={group.event.id}
                  href={`/gallery/${group.event.id}`}
                  className="gallery-item group relative flex items-center gap-4 overflow-hidden rounded-xl border border-border bg-bg/80 p-3 backdrop-blur-sm transition-colors hover:border-primary/40 sm:p-4"
                >
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-black/30 sm:h-24 sm:w-36">
                    {cover && (
                      <Image
                        src={cover.thumbUrl}
                        alt=""
                        fill
                        sizes="144px"
                        unoptimized={isPreprocessedMediaUrl(cover.thumbUrl)}
                        referrerPolicy={isDriveUrl(cover.thumbUrl) ? "no-referrer" : undefined}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-[17px] font-semibold text-text-primary group-hover:text-primary-light sm:text-[19px]">
                      {group.event.name}
                    </h3>
                    <p className="mt-1 text-[13px] text-text-secondary">{formatEventDate(group.event.event_date)}</p>
                    <div className="mt-2 flex items-center gap-3 text-[12px] text-muted">
                      {photoCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Camera className="h-3.5 w-3.5" aria-hidden="true" /> {photoCount}
                        </span>
                      )}
                      {videoCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Film className="h-3.5 w-3.5" aria-hidden="true" /> {videoCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

