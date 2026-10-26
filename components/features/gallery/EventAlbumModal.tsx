"use client";

// ============================================================
// Event Album Modal
// Displays an event's complete photo collection with clean,
// minimal event name and date header (no description clutter).
// ============================================================

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Calendar, Camera, ArrowUpRight } from "lucide-react";
import type { GalleryEvent } from "@/app/api/gallery/route";
import { GalleryLightbox } from "./GalleryLightbox";

interface EventAlbumModalProps {
  event: GalleryEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventAlbumModal({ event, isOpen, onClose }: EventAlbumModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const handleClose = () => {
    setLightboxOpen(false);
    onClose();
  };

  // Combine poster + photos for the full album collection (deduplicated)
  const allAlbumPhotos = Array.from(
    new Set([
      ...(event.poster_url ? [event.poster_url] : []),
      ...event.photos,
    ])
  );

  const handleOpenPhoto = (idx: number) => {
    setActivePhotoIndex(idx);
    setLightboxOpen(true);
  };

  // Format date display
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
    <>
      <div
        className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-8 flex items-center justify-center overscroll-contain animate-in fade-in duration-200"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" />

        {/* Modal Container */}
        <div
          className="relative w-full max-w-5xl rounded-[2rem] bg-[#0E0E14] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Minimal Header: Just Event Name and Date */}
          <div className="px-6 sm:px-8 py-5 border-b border-white/[0.08] bg-[#12121A]/80 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {event.event_date && (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-[#A78BFA] bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(event.event_date)}
                  </span>
                )}
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {allAlbumPhotos.length} {allAlbumPhotos.length === 1 ? "Photo" : "Photos"}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight truncate">
                {event.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="h-9 w-9 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-[#71717A] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Gallery Content */}
          <div
            className="p-6 sm:p-8 overflow-y-auto overscroll-contain flex-1 min-h-0"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
            }}
          >
            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allAlbumPhotos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenPhoto(idx)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[#6C63FF]/50 bg-white/[0.02] cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#6C63FF]/10"
                >
                  <Image
                    src={photoUrl}
                    alt={`${event.name} photo ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5">
                    <div className="flex justify-end">
                      <span className="h-7 w-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center">
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#A78BFA]" />
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
                      <span>{idx === 0 && event.poster_url === photoUrl ? "Event Poster" : `Photo ${idx + 1}`}</span>
                      <span className="text-white/80">Click to expand</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="px-6 sm:px-8 py-3.5 border-t border-white/[0.08] bg-[#12121A]/60 flex items-center justify-between text-xs text-[#71717A] shrink-0">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#A78BFA]" />
              AWS Student Builder Group Community Album
            </span>
            <span>Click any photo for cinema view</span>
          </div>
        </div>
      </div>

      {/* Lightbox Triggered from Album */}
      <GalleryLightbox
        isOpen={lightboxOpen}
        photos={allAlbumPhotos}
        currentIndex={activePhotoIndex}
        eventTitle={event.name}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setActivePhotoIndex}
      />
    </>
  );
}
