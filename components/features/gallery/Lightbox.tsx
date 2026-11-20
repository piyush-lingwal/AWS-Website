"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ExternalLink, Play, X } from "lucide-react";
import { formatDuration } from "@/lib/media/format";
import { isDriveUrl } from "@/lib/media/drive";
import { isPreprocessedMediaUrl } from "@/lib/media/image-src";
import { masonryGapRows, masonryRowScale, masonrySpan, tileAspectRatio } from "@/lib/media/gallery-layout";

export interface LightboxItem {
  id: string;
  kind: "image" | "video";
  url: string;
  thumbUrl: string;
  posterUrl?: string;
  /** Google Drive player for a Drive video (an iframe, since Drive has no direct file url). */
  embedUrl?: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  durationS: number | null;
}

/** The still image a tile shows, or null for a video that has none (it then previews its first frame). */
function tileImage(item: LightboxItem): string | null {
  if (item.kind === "image") return item.thumbUrl;
  if (item.thumbUrl !== item.url) return item.thumbUrl; // a real thumbnail, not the video file itself
  return item.posterUrl ?? null;
}

/** Tile shape from the stored size; a guess when the size is not known (fixed once the file loads). */
function initialRatio(item: LightboxItem): number {
  return tileAspectRatio(item.width, item.height) ?? (item.kind === "video" ? 16 / 9 : 1);
}

/**
 * Masonry grid (Pinterest style): every tile keeps its photo's real shape and
 * shows the small thumbnail; each one goes into the shortest column, left to
 * right (.gallery-masonry in app/globals.css). Clicking opens the full-size
 * file in a lightbox.
 */
export function MediaGrid({ items }: { items: LightboxItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const scale = useMemo(() => masonryRowScale(items.map(initialRatio)), [items]);

  if (items.length === 0) return null;

  const gridVars = { "--scale": scale, "--gap-rows": masonryGapRows(scale) } as CSSProperties;

  return (
    <>
      <div className="gallery-masonry-wrap">
        <ul className="gallery-masonry" style={gridVars}>
          {items.map((item, i) => (
            <MasonryTile key={item.id} item={item} scale={scale} position={i + 1} onOpen={() => setIndex(i)} />
          ))}
        </ul>
      </div>

      {/* In document.body so the overlay sits above the page's fixed navigation (page content has its own stacking context). */}
      {index !== null &&
        createPortal(
          <LightboxOverlay items={items} index={index} onClose={() => setIndex(null)} onNavigate={setIndex} />,
          document.body
        )}
    </>
  );
}

function MasonryTile({
  item,
  scale,
  position,
  onOpen,
}: {
  item: LightboxItem;
  scale: number;
  position: number;
  onOpen: () => void;
}) {
  // Corrected from the loaded file if it disagrees with the stored size, so a tile never crops a normal photo.
  const [ratio, setRatio] = useState(() => initialRatio(item));
  const correct = (w: number, h: number) => {
    const actual = tileAspectRatio(w, h);
    if (actual !== null && Math.abs(actual - ratio) / ratio > 0.01) setRatio(actual);
  };
  const still = tileImage(item);

  return (
    <li style={{ gridRowEnd: `span ${masonrySpan(ratio, scale)}` }}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={item.caption ?? (item.kind === "video" ? `Play video ${position}` : `View photo ${position}`)}
        className="group relative block h-full w-full overflow-hidden rounded-[18px] border border-[var(--surface-line)] bg-sbg-lilac-100 shadow-[0_10px_30px_-18px_var(--tile-shadow)] transition-shadow duration-300 hover:shadow-[0_24px_44px_-20px_rgba(76,29,149,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sbg-accent"
        // The grid row span sets the height; the aspect ratio only takes effect in the fallback column layout.
        style={{ aspectRatio: String(ratio) }}
      >
        {still ? (
          <Image
            src={still}
            alt={item.caption ?? ""}
            fill
            unoptimized={isPreprocessedMediaUrl(still)}
            // Google answers 429 to Drive thumbnail requests that carry our Referer.
            referrerPolicy={isDriveUrl(still) ? "no-referrer" : undefined}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onLoad={(e) => correct(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          // A video without a thumbnail: the browser shows its first frame (#t=0.1 makes Safari do it too).
          <video
            src={`${item.url}#t=0.1`}
            preload="metadata"
            muted
            playsInline
            tabIndex={-1}
            aria-hidden="true"
            onLoadedMetadata={(e) => correct(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Hover: darken a little and show the caption, so photos can be told apart without opening them. */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1B1140]/70 via-[#1B1140]/0 to-[#1B1140]/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {item.caption && (
          <span className="pointer-events-none absolute inset-x-2 bottom-2 line-clamp-2 text-left text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {item.caption}
          </span>
        )}

        {item.kind === "video" && (
          <>
            <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
              <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
            </span>
            <span className="pointer-events-none absolute right-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white">
              {formatDuration(item.durationS)}
            </span>
          </>
        )}
      </button>
    </li>
  );
}

/** Full-size photo: its real size when it fits the screen, scaled down (never cropped or enlarged) when it does not. */
function FullImage({ item }: { item: LightboxItem }) {
  const [loaded, setLoaded] = useState(false);
  const w = item.width;
  const h = item.height;
  const noReferrer = isDriveUrl(item.url) ? "no-referrer" : undefined;

  if (!w || !h) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.url}
        alt={item.caption ?? ""}
        referrerPolicy={noReferrer}
        className="block h-auto max-h-[calc(100vh-9rem)] w-auto max-w-[94vw] rounded-lg"
      />
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{ aspectRatio: `${w} / ${h}`, width: `min(${w}px, 94vw, calc((100vh - 9rem) * ${w / h}))` }}
    >
      {/* The thumbnail is already loaded from the grid: show it at once, then the full file fades in over it.
          It is removed once the full file is in, so it cannot show through transparent parts of a photo. */}
      {!loaded && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbUrl}
          alt=""
          aria-hidden="true"
          referrerPolicy={isDriveUrl(item.thumbUrl) ? "no-referrer" : undefined}
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt={item.caption ?? ""}
        referrerPolicy={noReferrer}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

function LightboxOverlay({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const item = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  const next = useCallback(() => onNavigate((index + 1) % items.length), [index, items.length, onNavigate]);
  const prev = useCallback(() => onNavigate((index - 1 + items.length) % items.length), [index, items.length, onNavigate]);

  useEffect(() => {
    closeRef.current?.focus();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // The site's smooth scrolling would otherwise keep scrolling the page behind the overlay.
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, next, prev]);

  // Fetch the neighbouring photos in the background so next / previous open instantly.
  useEffect(() => {
    if (items.length < 2) return;
    for (const n of [(index + 1) % items.length, (index - 1 + items.length) % items.length]) {
      const neighbour = items[n];
      if (neighbour.kind !== "image") continue;
      const img = new window.Image();
      if (isDriveUrl(neighbour.url)) img.referrerPolicy = "no-referrer";
      img.src = neighbour.url;
    }
  }, [index, items]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption ?? (item.kind === "video" ? "Video" : "Photo")}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--scrim)] p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous"
            className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:left-4"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next"
            className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:right-4"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </>
      )}

      <div className="relative flex flex-col items-center gap-3">
        {item.embedUrl ? (
          <iframe
            key={item.id}
            src={item.embedUrl}
            title={item.caption ?? "Video"}
            allow="autoplay; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            className="aspect-video w-[min(90vw,64rem)] max-h-[75vh] rounded-lg border-0 bg-black"
          />
        ) : item.kind === "video" ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            key={item.id}
            src={item.url}
            poster={item.posterUrl}
            controls
            autoPlay
            playsInline
            className="max-h-[calc(100vh-9rem)] max-w-[94vw] rounded-lg"
          />
        ) : (
          <FullImage key={item.id} item={item} />
        )}

        {item.caption && <p className="max-w-xl text-center text-sm text-white/80">{item.caption}</p>}
        <div className="flex items-center gap-3 font-mono text-xs text-[#D9C8FF]">
          {items.length > 1 && (
            <span>
              {index + 1} / {items.length}
            </span>
          )}
          {item.kind === "image" && item.width && item.height && (
            <span>
              {item.width} × {item.height}
            </span>
          )}
          {item.kind === "image" && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-white/90 underline-offset-4 hover:text-white hover:underline"
            >
              Open full size <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
