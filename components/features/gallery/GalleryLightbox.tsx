"use client";

// ============================================================
// Gallery Lightbox Modal
// Full-screen, cinema-style photo viewer with keyboard navigation
// (ArrowLeft, ArrowRight, Escape), photo counters, and zoom.
// Note: Direct downloading is intentionally disabled.
// ============================================================

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryLightboxProps {
  isOpen: boolean;
  photos: string[];
  currentIndex: number;
  eventTitle: string;
  onClose: () => void;
  onIndexChange: (newIndex: number) => void;
}

export function GalleryLightbox({
  isOpen,
  photos,
  currentIndex,
  eventTitle,
  onClose,
  onIndexChange,
}: GalleryLightboxProps) {
  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    const safeIdx = Math.max(0, Math.min(currentIndex, photos.length - 1));
    onIndexChange((safeIdx - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onIndexChange]);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    const safeIdx = Math.max(0, Math.min(currentIndex, photos.length - 1));
    onIndexChange((safeIdx + 1) % photos.length);
  }, [currentIndex, photos.length, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

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

  if (!isOpen || photos.length === 0) return null;

  const safeIndex = Math.max(0, Math.min(currentIndex, photos.length - 1));
  const currentPhoto = photos[safeIndex];
  if (!currentPhoto) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 pr-4">
          <p className="text-xs uppercase tracking-widest text-[#A78BFA] font-mono font-medium">
            Photo {currentIndex + 1} of {photos.length}
          </p>
          <h4 className="text-sm sm:text-base font-semibold text-white truncate max-w-md mt-0.5">
            {eventTitle}
          </h4>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            className="h-10 w-10 rounded-full bg-white/[0.08] hover:bg-white/20 text-[#A1A1AA] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image View (Right click disabled to protect community images) */}
      <div
        className="relative w-full h-full max-h-[85vh] max-w-6xl mx-auto p-4 flex items-center justify-center select-none"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          <Image
            src={currentPhoto}
            alt={`${eventTitle} - Photo ${currentIndex + 1}`}
            fill
            sizes="100vw"
            className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-none"
            priority
            draggable={false}
          />
        </div>

        {/* Previous Button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-black/60 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95 shadow-xl"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-black/60 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95 shadow-xl"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {photos.length > 1 && (
        <div
          className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-1.5 px-4 overflow-x-auto max-w-2xl mx-auto py-2 z-20"
          onClick={(e) => e.stopPropagation()}
          style={{ scrollbarWidth: "none" }}
        >
          {photos.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onIndexChange(idx)}
              className={`relative h-12 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                idx === currentIndex
                  ? "border-[#A78BFA] scale-105 shadow-lg shadow-[#6C63FF]/30"
                  : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              <Image
                src={p}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
