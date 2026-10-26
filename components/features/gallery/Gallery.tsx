"use client";

// ============================================================
// AWS SBG Community Gallery (Hybrid Showcase & Event Albums)
// Features:
// 1. Latest Event Spotlight Bento Grid (Direct visual preview)
// 2. Event Albums Archive with realistic layered "Photo Stack" cards
// 3. Category Filter Navigation (Workshops, Hackathons, Meetups)
// 4. Fullscreen Cinema Lightbox & Modal (Downloads strictly disabled)
// 5. Flower overlays layered in background (z-0) behind cards (z-10)
// ============================================================

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PixelHeading } from "@/components/ui/pixel-heading-character";
import { Spotlight } from "@/components/ui/spotlight";
import {
  Camera,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Layers,
  ChevronRight,
  Filter,
  Loader2,
  ImageIcon,
} from "lucide-react";
import type { GalleryEvent } from "@/app/api/gallery/route";
import { EventAlbumModal } from "./EventAlbumModal";
import { GalleryLightbox } from "./GalleryLightbox";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Flower Overlays: Z-0 strictly in background behind cards
const FLOWER_OVERLAYS = [
  {
    id: 1,
    src: "/flowers/flower.webp",
    alt: "Decorative flower accent top-right",
    className:
      "flower-overlay absolute top-8 right-2 sm:top-10 sm:right-6 md:top-14 md:right-8 lg:top-16 lg:right-12 w-28 sm:w-44 md:w-56 lg:w-68 z-0 opacity-70 pointer-events-none select-none filter brightness-105 drop-shadow-[0_10px_25px_rgba(167,139,250,0.22)]",
  },
  {
    id: 2,
    src: "/flowers/flower3.webp",
    alt: "Decorative flower accent mid-left",
    className:
      "flower-overlay absolute top-[28%] -left-10 sm:top-[26%] sm:-left-6 md:left-0 lg:left-4 w-28 sm:w-40 md:w-52 lg:w-60 -rotate-45 z-0 opacity-60 pointer-events-none select-none filter brightness-105 drop-shadow-[0_10px_25px_rgba(244,114,182,0.22)]",
  },
  {
    id: 3,
    src: "/flowers/flower2.webp",
    alt: "Decorative flower accent bottom-right",
    className:
      "flower-overlay absolute bottom-4 right-2 sm:bottom-6 sm:right-4 md:bottom-8 md:right-8 lg:bottom-12 lg:right-12 w-32 sm:w-48 md:w-60 lg:w-72 -rotate-[45deg] z-0 opacity-75 pointer-events-none select-none filter brightness-115 saturate-110 drop-shadow-[0_10px_25px_rgba(167,139,250,0.25)]",
  },
];

export function Gallery() {
  const containerRef = useRef<HTMLElement>(null);
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Track images that fail to load safely without updating unmounted components
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleImageError = useCallback((url: string) => {
    if (!isMountedRef.current || !url) return;
    // Defer state update to next microtask so it never fires synchronously during mounting
    setTimeout(() => {
      if (isMountedRef.current) {
        setFailedImages((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
      }
    }, 0);
  }, []);

  // Interactive Modals State
  const [selectedAlbumEvent, setSelectedAlbumEvent] = useState<GalleryEvent | null>(null);
  const [spotlightLightbox, setSpotlightLightbox] = useState<{
    isOpen: boolean;
    index: number;
    photos: string[];
    title: string;
  }>({
    isOpen: false,
    index: 0,
    photos: [],
    title: "",
  });

  // Fetch Gallery Events from API (with unmount guard for StrictMode)
  useEffect(() => {
    let isMounted = true;

    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data)) {
            setEvents(json.data);
          }
        }
      } catch (err) {
        console.warn("[Gallery] Error fetching gallery events:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to verify if an event has concluded (strictly before today)
  const isConcluded = (dateStr: string | null) => {
    if (!dateStr || dateStr.trim() === "") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr.trim()}T00:00:00`);
    if (isNaN(d.getTime())) return false;
    return d < today;
  };

  // Only concluded events belong in the community gallery (upcoming events belong on Events/Landing)
  const concludedEvents = useMemo(() => {
    return events.filter((ev) => isConcluded(ev.event_date));
  }, [events]);

  // Deep-link handler: automatically open event album when redirected from Events page ("View the Moments")
  // Uses sessionStorage for a clean URL without exposing query parameters in the address bar.
  useEffect(() => {
    if (loading || concludedEvents.length === 0) return;

    let targetQuery: string | null = null;

    if (typeof window !== "undefined") {
      // 1. Check sessionStorage (clean navigation without query string in URL)
      try {
        const stored = sessionStorage.getItem("selected_gallery_event");
        if (stored) {
          targetQuery = stored;
          sessionStorage.removeItem("selected_gallery_event"); // Clear immediately
        }
      } catch {
        // ignore storage restrictions
      }

      // 2. Fallback check for URL search params (and immediately clean the address bar)
      if (!targetQuery && window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        targetQuery = urlParams.get("event") || urlParams.get("id");
      }

      // Ensure address bar stays clean (no query string or event ID visible)
      if (window.location.search) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }

    if (!targetQuery) return;

    const normalized = targetQuery.trim().toLowerCase();

    // Match by exact ID or event name among concluded events
    const matched = concludedEvents.find(
      (ev) =>
        ev.id.toLowerCase() === normalized ||
        ev.name.toLowerCase() === normalized ||
        ev.name.toLowerCase().includes(normalized) ||
        normalized.includes(ev.id.toLowerCase())
    );

    if (matched) {
      // Ensure category filter includes this event
      if (
        matched.event_type &&
        selectedCategory !== "All" &&
        selectedCategory.toLowerCase() !== matched.event_type.toLowerCase()
      ) {
        setSelectedCategory("All");
      }

      // Automatically open the full album modal to view all event moments
      setSelectedAlbumEvent(matched);

      // Smooth scroll to the event card in the gallery
      const scrollTimer = setTimeout(() => {
        const cardId = `event-card-${matched.id}`;
        const el = document.getElementById(cardId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 350);

      return () => clearTimeout(scrollTimer);
    }
  }, [loading, concludedEvents, selectedCategory]);

  // Compute Categories
  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    concludedEvents.forEach((ev) => {
      if (ev.event_type) set.add(ev.event_type);
    });
    return Array.from(set);
  }, [concludedEvents]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    if (selectedCategory === "All") return concludedEvents;
    return concludedEvents.filter(
      (ev) => (ev.event_type || "").toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [concludedEvents, selectedCategory]);

  // Split into Spotlight (latest event with photos) and Archive (previous events)
  const spotlightEvent = filteredEvents[0] || null;
  const archiveEvents = filteredEvents.slice(1);

  // GSAP Animations (Header reveal + Flower floating animation)
  useGSAP(
    () => {
      // Header reveal - auto-plays immediately with scrollTrigger safety
      gsap.fromTo(
        ".gallery-header-el",
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out",
        }
      );

      // Flower overlays reveal animation
      gsap.from(".flower-overlay", {
        opacity: 0,
        scale: 0.5,
        rotation: "+=30",
        duration: 1.2,
        stagger: 0.12,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      // Gentle continuous floating motion for each flower
      const flowerElements = gsap.utils.toArray<HTMLElement>(".flower-overlay");
      flowerElements.forEach((el, idx) => {
        const duration = 4 + (idx % 3) * 1.2;
        const yOffset = 10 + (idx % 3) * 5;
        const rotOffset = (idx % 2 === 0 ? 1 : -1) * (4 + (idx % 3) * 3);

        gsap.to(el, {
          y: `-=${yOffset}`,
          rotation: `+=${rotOffset}`,
          duration: duration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: idx * 0.15,
        });
      });

      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);

      return () => clearTimeout(refreshTimer);
    },
    { scope: containerRef }
  );

  // Date formatter
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBA";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section
      ref={containerRef}
      id="gallery"
      className="bg-grid bg-noise relative overflow-hidden bg-bg min-h-screen pb-24"
    >
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

      {/* Flower Overlays in background (z-0) */}
      {FLOWER_OVERLAYS.map((flower) => (
        <div key={flower.id} className={flower.className}>
          <Image
            src={flower.src}
            alt={flower.alt}
            width={320}
            height={320}
            className="w-full h-auto object-contain"
            priority={flower.id <= 2}
          />
        </div>
      ))}

      {/* Page Container (with ample top spacing so the fixed navbar never overlaps) */}
      <div className="relative mx-auto max-w-content px-4 sm:px-6 pt-36 sm:pt-40 md:pt-44 pb-16 z-10">
        {/* Header */}
        <div className="gallery-header-container space-y-3">
          <div className="gallery-header-el inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6C63FF]/15 border border-[#6C63FF]/30 text-[#A78BFA] text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
            <Camera className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Community Gallery</span>
          </div>

          <h2 className="gallery-header-el font-display text-[32px] sm:text-[40px] md:text-[48px] font-semibold leading-[1.1] tracking-tight text-white">
            Moments from the{" "}
            <PixelHeading mode="uniform" className="text-gradient">
              community.
            </PixelHeading>
          </h2>

          <p className="gallery-header-el max-w-xl text-[15px] sm:text-[16px] leading-relaxed text-zinc-300">
            Workshops, hackathons, study jams, and celebrations — categorized by event so you can explore each journey as it happened.
          </p>
        </div>

        {/* High-Visibility Category Filter Bar */}
        <div className="mt-8 p-1.5 sm:p-2 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex flex-wrap items-center gap-2 shadow-lg">
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold text-[#A78BFA] uppercase tracking-wider shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-9 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30 font-bold scale-[1.02]"
                      : "bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08]"
                  }`}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-16 flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-8 h-8 text-[#A78BFA] animate-spin mb-3" />
            <p className="text-sm font-mono text-[#A1A1AA]">
              Loading event galleries...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="mt-16 text-center py-16 px-4 rounded-3xl border border-white/[0.08] bg-white/[0.02]">
            <Camera className="w-10 h-10 text-[#71717A] mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Event Albums Found</h3>
            <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto">
              Photos uploaded through the Admin Media Studio will appear here automatically.
            </p>
          </div>
        )}

        {/* Spotlight & Archives View */}
        {!loading && spotlightEvent && (
          <div className="mt-12 space-y-16">
            {/* ══════════════════════════════════════════════════ */}
            {/* ── SECTION 1: LATEST EVENT SPOTLIGHT ───────────── */}
            {/* ══════════════════════════════════════════════════ */}
            <div
              id={`event-card-${spotlightEvent.id}`}
              className="rounded-3xl border border-white/[0.1] bg-[#0E0E14]/90 backdrop-blur-xl p-6 sm:p-8 md:p-10 relative z-10 overflow-hidden group/spotlight shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            >
              {/* Subtle top glow line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#6C63FF]/60 to-transparent" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Spotlight Info Card (Minimal: Name & Date only) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#6C63FF]/20 text-[#A78BFA] border border-[#6C63FF]/40">
                      <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                      Latest Event Spotlight
                    </span>
                    {spotlightEvent.event_date && (
                      <span className="flex items-center gap-1.5 text-xs font-mono text-[#A78BFA] bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(spotlightEvent.event_date)}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                    {spotlightEvent.name}
                  </h3>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedAlbumEvent(spotlightEvent)}
                      className="h-10 sm:h-11 px-5 sm:px-6 rounded-2xl text-xs font-semibold bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:brightness-110 text-white transition-all cursor-pointer shadow-lg shadow-[#6C63FF]/25 flex items-center gap-2 group/btn active:scale-[0.98]"
                    >
                      <span>View Full Album</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                    <span className="text-xs font-mono text-[#A1A1AA] bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.06]">
                      {
                        Array.from(
                          new Set([
                            ...(spotlightEvent.poster_url ? [spotlightEvent.poster_url] : []),
                            ...spotlightEvent.photos,
                          ])
                        ).filter((p) => !failedImages[p]).length
                      }{" "}
                      Photos
                    </span>
                  </div>
                </div>

                {/* Right: Focused 3-Photo Bento Grid (1 Big Preview + 2 Stacked) */}
                <div className="lg:col-span-7">
                  {(() => {
                    // Filter out any broken images (and deduplicate if poster is also in photos)
                    const spotlightPhotos = Array.from(
                      new Set([
                        ...(spotlightEvent.poster_url ? [spotlightEvent.poster_url] : []),
                        ...spotlightEvent.photos,
                      ])
                    ).filter((p) => !failedImages[p]);

                    if (spotlightPhotos.length === 0) {
                      return (
                        <div className="aspect-[16/10] rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col items-center justify-center p-6 text-center">
                          <ImageIcon className="w-8 h-8 text-[#71717A] mb-2" />
                          <p className="text-xs text-[#A1A1AA]">No photo previews available</p>
                        </div>
                      );
                    }

                    // Single photo event
                    if (spotlightPhotos.length === 1) {
                      return (
                        <div
                          onClick={() =>
                            setSpotlightLightbox({
                              isOpen: true,
                              index: 0,
                              photos: spotlightPhotos,
                              title: spotlightEvent.name,
                            })
                          }
                          className="group relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[#6C63FF]/50 bg-[#161622] cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
                        >
                          <Image
                            src={spotlightPhotos[0]}
                            alt={`${spotlightEvent.name} preview`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => handleImageError(spotlightPhotos[0])}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3.5">
                            <span className="text-[11px] font-mono text-white/90">View Photo</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#A78BFA]" />
                          </div>
                        </div>
                      );
                    }

                    // Two photos event (both horizontal side-by-side)
                    if (spotlightPhotos.length === 2) {
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {spotlightPhotos.map((photoUrl, pIdx) => (
                            <div
                              key={pIdx}
                              onClick={() =>
                                setSpotlightLightbox({
                                  isOpen: true,
                                  index: pIdx,
                                  photos: spotlightPhotos,
                                  title: spotlightEvent.name,
                                })
                              }
                              className="group relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[#6C63FF]/50 bg-[#161622] cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
                            >
                              <Image
                                src={photoUrl}
                                alt={`${spotlightEvent.name} preview ${pIdx + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={() => handleImageError(photoUrl)}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
                                <span className="text-[11px] font-mono text-white/90">View Photo</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#A78BFA]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    // 3 Photos layout: 1 in left horizontal, 2 next to it both in horizontal
                    const remainingCount = Math.max(0, spotlightPhotos.length - 3);

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-stretch">
                        {/* 1 in Left Horizontal (spans 2 columns) */}
                        <div
                          onClick={() =>
                            setSpotlightLightbox({
                              isOpen: true,
                              index: 0,
                              photos: spotlightPhotos,
                              title: spotlightEvent.name,
                            })
                          }
                          className="sm:col-span-2 group relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[#6C63FF]/50 bg-[#161622] cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
                        >
                          <Image
                            src={spotlightPhotos[0]}
                            alt={`${spotlightEvent.name} main preview`}
                            fill
                            sizes="(max-width: 768px) 100vw, 45vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => handleImageError(spotlightPhotos[0])}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3.5">
                            <span className="text-[11px] font-mono text-white/90">View Main Photo</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#A78BFA]" />
                          </div>
                        </div>

                        {/* 2 Next to it: Both Horizontal, Stacked in Column 3 */}
                        <div className="sm:col-span-1 flex flex-col justify-between gap-3.5">
                          {/* Photo 2 (horizontal) */}
                          <div
                            onClick={() =>
                              setSpotlightLightbox({
                                isOpen: true,
                                index: 1,
                                photos: spotlightPhotos,
                                title: spotlightEvent.name,
                              })
                            }
                            className="group relative aspect-[16/10] flex-1 rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[#6C63FF]/50 bg-[#161622] cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
                          >
                            <Image
                              src={spotlightPhotos[1]}
                              alt={`${spotlightEvent.name} preview 2`}
                              fill
                              sizes="(max-width: 768px) 100vw, 25vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={() => handleImageError(spotlightPhotos[1])}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
                              <span className="text-[11px] font-mono text-white/90">View Photo</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#A78BFA]" />
                            </div>
                          </div>

                          {/* Photo 3 (horizontal, clean image with modern Floating Glass Pill badge for +X More) */}
                          <div
                            onClick={() => {
                              if (remainingCount > 0) {
                                setSelectedAlbumEvent(spotlightEvent);
                              } else {
                                setSpotlightLightbox({
                                  isOpen: true,
                                  index: 2,
                                  photos: spotlightPhotos,
                                  title: spotlightEvent.name,
                                });
                              }
                            }}
                            className="group relative aspect-[16/10] flex-1 rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[#6C63FF]/50 bg-[#161622] cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
                          >
                            <Image
                              src={spotlightPhotos[2]}
                              alt={`${spotlightEvent.name} preview 3`}
                              fill
                              sizes="(max-width: 768px) 100vw, 25vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={() => handleImageError(spotlightPhotos[2])}
                            />

                            {/* Normal hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
                              <span className="text-[11px] font-mono text-white/90">
                                {remainingCount > 0 ? "View Full Album" : "View Photo"}
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#A78BFA]" />
                            </div>

                            {/* Modern Floating Frosted Glass Pill in bottom-right corner */}
                            {remainingCount > 0 && (
                              <div className="absolute bottom-2.5 right-2.5 z-10 px-3 py-1.5 rounded-xl bg-black/65 hover:bg-[#6C63FF] backdrop-blur-md border border-white/20 hover:border-[#6C63FF] text-white flex items-center gap-1.5 shadow-xl transition-all duration-200 group-hover:scale-105">
                                <Layers className="w-3.5 h-3.5 text-[#A78BFA] group-hover:text-white transition-colors" />
                                <span className="text-xs font-bold tracking-tight">+{remainingCount} More</span>
                                <ArrowUpRight className="w-3 h-3 text-white/70 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════ */}
            {/* ── SECTION 2: RELIVE PAST MOMENTS ──────────────── */}
            {/* ══════════════════════════════════════════════════ */}
            {archiveEvents.length > 0 && (
              <div className="space-y-8 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <Layers className="w-6 h-6 text-[#A78BFA] shrink-0" />
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Relive Past Moments
                    </h3>
                    <span className="text-xs font-mono text-[#71717A] bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                      {archiveEvents.length} {archiveEvents.length === 1 ? "Event" : "Events"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#71717A]">
                    Browse highlights or dive into the full photo collections
                  </p>
                </div>

                {/* Vertical Stack of Event Cards */}
                <div className="space-y-6">
                  {archiveEvents.map((ev) => {
                    const allPhotos = Array.from(
                      new Set([
                        ...(ev.poster_url ? [ev.poster_url] : []),
                        ...ev.photos,
                      ])
                    ).filter((p) => !failedImages[p]);

                    if (allPhotos.length === 0) return null;

                    const previewCount = 6;
                    const previewPhotos = allPhotos.slice(0, previewCount);
                    const remainingCount = Math.max(0, allPhotos.length - previewCount);

                    return (
                      <div
                        key={ev.id}
                        id={`event-card-${ev.id}`}
                        className="rounded-3xl border border-white/[0.08] bg-[#0E0E14]/75 backdrop-blur-md p-5 sm:p-7 space-y-4 shadow-lg hover:border-white/[0.14] transition-colors"
                      >
                        {/* Event Header: Minimal (Name, Date, & View More button) */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5">
                          <div className="space-y-1">
                            {ev.event_date && (
                              <p className="text-xs font-mono text-[#A78BFA] flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(ev.event_date)}</span>
                              </p>
                            )}
                            <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                              {ev.name}
                            </h4>
                          </div>

                          {/* Desktop/Tablet Header View More button (hidden on mobile) */}
                          <button
                            type="button"
                            onClick={() => setSelectedAlbumEvent(ev)}
                            className="hidden sm:flex h-9 px-4 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-[#6C63FF] hover:text-white text-zinc-300 border border-white/10 hover:border-[#6C63FF] transition-all cursor-pointer items-center gap-1.5 shrink-0 group/btn"
                          >
                            <span>View More</span>
                            <span className="text-[10px] font-mono text-[#A1A1AA] group-hover/btn:text-white/80">
                              ({allPhotos.length})
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                          </button>
                        </div>

                        {/* Photos Preview Grid: Strictly 4 photos on mobile (2x2 grid), up to 6 on tablet/desktop */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                          {previewPhotos.map((photoUrl, pIdx) => {
                            const isLastTileWithRemaining =
                              pIdx === previewPhotos.length - 1 && remainingCount > 0;

                            return (
                              <div
                                key={pIdx}
                                onClick={() => {
                                  if (isLastTileWithRemaining) {
                                    setSelectedAlbumEvent(ev);
                                  } else {
                                    setSpotlightLightbox({
                                      isOpen: true,
                                      index: pIdx,
                                      photos: allPhotos,
                                      title: ev.name,
                                    });
                                  }
                                }}
                                className={`group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/[0.08] hover:border-[#6C63FF]/50 bg-[#161622] cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${
                                  pIdx >= 4 ? "hidden sm:block" : ""
                                }`}
                              >
                                <Image
                                  src={photoUrl}
                                  alt={`${ev.name} preview photo ${pIdx + 1}`}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  onError={() => handleImageError(photoUrl)}
                                />

                                {/* Normal Photo Hover Overlay */}
                                {!isLastTileWithRemaining && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-2">
                                    <span className="text-[10px] font-mono text-white/90">View</span>
                                    <ArrowUpRight className="w-3 h-3 text-[#A78BFA]" />
                                  </div>
                                )}

                                {/* +X More Overlay on 6th Tile if remaining photos exist */}
                                {isLastTileWithRemaining && (
                                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-center p-1.5 transition-colors hover:bg-black/85 cursor-pointer">
                                    <Layers className="w-4 h-4 text-[#A78BFA] mb-0.5" />
                                    <span className="text-sm font-bold text-white tracking-tight">
                                      +{remainingCount} More
                                    </span>
                                    <span className="text-[9px] font-mono text-[#A1A1AA] uppercase">
                                      View All
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Mobile View More Button — placed cleanly after the 4 preview images */}
                        <button
                          type="button"
                          onClick={() => setSelectedAlbumEvent(ev)}
                          className="sm:hidden w-full h-10 mt-1 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-[#6C63FF] hover:text-white text-zinc-300 border border-white/10 hover:border-[#6C63FF] transition-all cursor-pointer flex items-center justify-center gap-2 group/btn active:scale-[0.98]"
                        >
                          <span>View More</span>
                          <span className="text-[10px] font-mono text-[#A1A1AA] group-hover/btn:text-white/80">
                            ({allPhotos.length})
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Interactive Event Album Modal ────────────────── */}
      <EventAlbumModal
        event={selectedAlbumEvent}
        isOpen={Boolean(selectedAlbumEvent)}
        onClose={() => setSelectedAlbumEvent(null)}
      />

      {/* ── Direct Spotlight Lightbox ────────────────────── */}
      <GalleryLightbox
        isOpen={spotlightLightbox.isOpen}
        photos={spotlightLightbox.photos}
        currentIndex={spotlightLightbox.index}
        eventTitle={spotlightLightbox.title}
        onClose={() =>
          setSpotlightLightbox((prev) => ({ ...prev, isOpen: false }))
        }
        onIndexChange={(newIdx) =>
          setSpotlightLightbox((prev) => ({ ...prev, index: newIdx }))
        }
      />
    </section>
  );
}
