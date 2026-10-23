"use client";

// ============================================================
// Event Media Studio Modal (Promotional Poster & Gallery Photos)
// ============================================================
//
// Allows admins and media leads to manage promotional posters
// and gallery photos for any event.
//
// Key Features:
// 1. Auto WebP Conversion: Every uploaded image (poster or photo)
//    is converted & compressed via Sharp to ~150–200 KB WebP.
// 2. Clear File Name & Size Display: Displays the exact new
//    converted .webp filename and compressed file size (in KB).
// 3. Persistent Media: Reopening the modal for any event reloads
//    previously uploaded posters and photos from server disk +
//    localStorage cache, with distinct "Uploaded" vs "New • WebP" badges.
// 4. In-Grid Editing & Removal: Delete individual photos, replace poster,
//    or clear all media and save the updated cleared state cleanly.
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Upload,
  Camera,
  Sparkles,
  Trash2,
  Plus,
  ImageIcon,
  X,
  Loader2,
  Check,
} from "lucide-react";
import type { DbEvent } from "@/types/certificate";

export interface AdminMediaPoster {
  url: string;
  name: string;
  size: number;
  originalSize?: number;
  file?: File;
  isExisting?: boolean;
}

export interface AdminMediaPhoto {
  id: string;
  url: string;
  name: string;
  size: number;
  originalSize?: number;
  file?: File;
  isExisting?: boolean;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface EventMediaModalProps {
  event: DbEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (savedData: {
    poster: AdminMediaPoster | null;
    photos: AdminMediaPhoto[];
  }) => void;
}

export function EventMediaModal({
  event,
  isOpen,
  onClose,
  onSave,
}: EventMediaModalProps) {
  const [poster, setPoster] = useState<AdminMediaPoster | null>(null);
  const [photos, setPhotos] = useState<AdminMediaPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const posterInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  // ── Load saved media for the selected event ────────────────
  const loadEventMedia = useCallback(async (ev: DbEvent) => {
    setLoading(true);

    let initialPoster: AdminMediaPoster | null = null;
    let initialPhotos: AdminMediaPhoto[] = [];
    let hasExplicitCache = false;

    // 1. Synchronously read from localStorage cache
    try {
      const cached = localStorage.getItem(`aws_event_media_${ev.id}`);
      if (cached) {
        hasExplicitCache = true;
        const parsed = JSON.parse(cached);
        if (parsed.poster) {
          initialPoster = { ...parsed.poster, isExisting: true };
        }
        if (Array.isArray(parsed.photos)) {
          initialPhotos = parsed.photos.map((p: any) => ({ ...p, isExisting: true }));
        }
      }
    } catch {}

    // 2. ONLY fallback to event record if there was NO cached entry at all
    if (!hasExplicitCache) {
      if (ev.poster_url) {
        initialPoster = {
          url: ev.poster_url,
          name: ev.poster_url.split("/").pop() || "poster.webp",
          size: 180 * 1024,
          isExisting: true,
        };
      }
      if (ev.photos && ev.photos.length > 0) {
        initialPhotos = ev.photos.map((url, idx) => ({
          id: `existing-${idx}`,
          url,
          name: url.split("/").pop() || `photo-${idx + 1}.webp`,
          size: 175 * 1024,
          isExisting: true,
        }));
      }
    }

    setPoster(initialPoster);
    setPhotos(initialPhotos);

    // 3. Fetch latest manifest from server
    try {
      const res = await fetch(`/api/admin/events/media?eventId=${encodeURIComponent(ev.id)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // If a manifest exists on server (even if cleared with null poster and empty photos)
          if (json.data.updatedAt) {
            const serverPoster = json.data.poster
              ? { ...json.data.poster, isExisting: true }
              : null;
            const serverPhotos = Array.isArray(json.data.photos)
              ? json.data.photos.map((p: any) => ({ ...p, isExisting: true }))
              : [];

            setPoster(serverPoster);
            setPhotos(serverPhotos);
            try {
              localStorage.setItem(
                `aws_event_media_${ev.id}`,
                JSON.stringify({ poster: serverPoster, photos: serverPhotos, updatedAt: json.data.updatedAt })
              );
            } catch {}
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote media manifest:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && event) {
      loadEventMedia(event);
    } else {
      setPoster(null);
      setPhotos([]);
      setSaving(false);
    }
  }, [isOpen, event, loadEventMedia]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !saving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, saving, onClose]);

  // ── Handle Poster Selection & Sharp Conversion ─────────────
  const handlePosterSelect = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Poster image must be less than 25MB.");
      return;
    }

    if (poster?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(poster.url);
    }

    try {
      const { convertToWebp } = await import("@/lib/convert-to-webp");
      toast.loading("Converting & compressing poster to WebP…", { id: "webp-convert" });
      const converted = await convertToWebp(file);
      const savedPct = Math.round((1 - converted.size / file.size) * 100);
      toast.success(
        `"${file.name}" → ${converted.name} (${formatFileSize(converted.size)}${savedPct > 0 ? `, ${savedPct}% smaller` : ""})`,
        { id: "webp-convert", duration: 4000 }
      );
      setPoster({
        url: URL.createObjectURL(converted),
        name: converted.name,
        size: converted.size,
        originalSize: file.size,
        file: converted,
        isExisting: false,
      });
    } catch {
      toast.error("WebP conversion failed — using original file.", { id: "webp-convert" });
      setPoster({
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        file,
        isExisting: false,
      });
    }
  };

  const handleRemovePoster = () => {
    if (poster?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(poster.url);
    }
    setPoster(null);
  };

  // ── Handle Gallery Photos Selection & Batch Conversion ─────
  const handlePhotosSelect = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    const validFiles: File[] = [];

    for (const file of rawFiles) {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image file.`);
        continue;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 25MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    toast.loading(`Compressing ${validFiles.length} photo(s) to WebP…`, { id: "photos-webp" });

    try {
      const { convertMultipleToWebp } = await import("@/lib/convert-to-webp");
      const convertedFiles = await convertMultipleToWebp(validFiles);

      const newPhotos: AdminMediaPhoto[] = convertedFiles.map((converted, idx) => {
        const originalFile = validFiles[idx] || converted;
        return {
          id: `photo-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          url: URL.createObjectURL(converted),
          name: converted.name,
          size: converted.size,
          originalSize: originalFile.size,
          file: converted,
          isExisting: false,
        };
      });

      setPhotos((prev) => [...prev, ...newPhotos]);

      const totalOriginal = validFiles.reduce((sum, f) => sum + f.size, 0);
      const totalCompressed = convertedFiles.reduce((sum, f) => sum + f.size, 0);
      const savedPct = Math.round((1 - totalCompressed / totalOriginal) * 100);

      toast.success(
        `${convertedFiles.length} photo(s) converted to WebP! (${formatFileSize(totalCompressed)}${savedPct > 0 ? `, ${savedPct}% smaller` : ""})`,
        { id: "photos-webp", duration: 4000 }
      );
    } catch {
      toast.error("WebP compression failed for some photos — keeping original format.", { id: "photos-webp" });
      const fallbackPhotos: AdminMediaPhoto[] = validFiles.map((f, idx) => ({
        id: `photo-raw-${Date.now()}-${idx}`,
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
        file: f,
        isExisting: false,
      }));
      setPhotos((prev) => [...prev, ...fallbackPhotos]);
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // ── Save & Upload Media Assets (Supports Full Removal) ──────
  const handleSave = async () => {
    if (!event) return;

    setSaving(true);
    toast.loading("Persisting event media assets…", { id: "media-upload" });

    try {
      const isCleared = !poster && photos.length === 0;
      const formData = new FormData();
      formData.append("eventId", event.id);

      if (isCleared) {
        formData.append("clearAll", "true");
      } else {
        // Handle Poster
        if (poster) {
          if (poster.file) {
            formData.append("poster", poster.file);
            formData.append(
              "posterMeta",
              JSON.stringify({
                name: poster.name,
                size: poster.size,
                originalSize: poster.originalSize,
              })
            );
          } else if (poster.isExisting) {
            formData.append(
              "existingPoster",
              JSON.stringify({
                url: poster.url,
                name: poster.name,
                size: poster.size,
                originalSize: poster.originalSize,
              })
            );
          }
        }

        // Handle Photos
        const existingToKeep: any[] = [];
        const newPhotosMeta: any[] = [];

        photos.forEach((p) => {
          if (p.file) {
            formData.append("newPhotos", p.file);
            newPhotosMeta.push({
              id: p.id,
              name: p.name,
              size: p.size,
              originalSize: p.originalSize,
            });
          } else {
            existingToKeep.push({
              id: p.id,
              url: p.url,
              name: p.name,
              size: p.size,
              originalSize: p.originalSize,
            });
          }
        });

        formData.append("existingPhotos", JSON.stringify(existingToKeep));
        formData.append("newPhotosMeta", JSON.stringify(newPhotosMeta));
      }

      const res = await fetch("/api/admin/events/media", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to persist media assets.");
      }

      const savedManifest = json.data;
      const savedPoster: AdminMediaPoster | null = savedManifest.poster
        ? { ...savedManifest.poster, isExisting: true }
        : null;
      const savedPhotos: AdminMediaPhoto[] = (savedManifest.photos || []).map((p: any) => ({
        ...p,
        isExisting: true,
      }));

      // 1. Sync localStorage
      try {
        localStorage.setItem(
          `aws_event_media_${event.id}`,
          JSON.stringify({
            poster: savedPoster,
            photos: savedPhotos,
            updatedAt: savedManifest.updatedAt || new Date().toISOString(),
          })
        );
      } catch (e) {
        console.warn("LocalStorage save warning:", e);
      }

      // 2. Notify parent component to update in-memory events state
      if (onSave) {
        onSave({ poster: savedPoster, photos: savedPhotos });
      }

      // 3. AWS S3 Lead hook log
      console.log("[AWS S3 Upload Hook Ready]", {
        eventId: event.id,
        eventName: event.name,
        poster: savedPoster,
        photoCount: savedPhotos.length,
        photos: savedPhotos,
      });

      if (isCleared) {
        toast.success(`Media assets removed for "${event.name}".`, {
          id: "media-upload",
          duration: 4000,
        });
      } else {
        toast.success(
          `Media assets saved for "${event.name}"! (${savedPoster ? "Poster" : ""}${savedPoster && savedPhotos.length ? " + " : ""}${savedPhotos.length ? `${savedPhotos.length} Photo(s)` : ""})`,
          { id: "media-upload", duration: 4000 }
        );
      }

      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save media assets.", { id: "media-upload" });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center overscroll-contain animate-in fade-in duration-150"
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={saving ? undefined : onClose}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl p-1 rounded-[2rem] bg-white/[0.05] border border-white/10 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto"
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="rounded-[calc(2rem-4px)] bg-[#0F0F14] overflow-hidden flex flex-col max-h-[88vh]">
          {/* Header */}
          <div className="px-6 sm:px-7 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#121218]">
            <div className="min-w-0 pr-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight truncate">
                  Event Media Studio
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6C63FF]/20 text-[#A78BFA] border border-[#6C63FF]/30 shrink-0">
                  {event.event_date ? event.event_date : "Upcoming"}
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-1 truncate">
                Managing promotional assets for{" "}
                <span className="text-white font-medium">&quot;{event.name}&quot;</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-8 w-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[#71717A] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div
            className="p-6 sm:p-7 space-y-6 overflow-y-auto overscroll-contain flex-1 min-h-0"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
            }}
          >
            {/* ── Section 1: Event Poster / Banner ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold">
                      Event Poster / Main Banner
                    </label>
                    {poster && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                          poster.isExisting
                            ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {poster.isExisting ? "Uploaded" : "New • WebP"}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#71717A] mt-0.5">
                    Promotional hero banner (auto-converted &amp; compressed to WebP 150–200 KB)
                  </p>
                </div>
                {poster && (
                  <button
                    type="button"
                    onClick={() => posterInputRef.current?.click()}
                    className="text-[11px] font-mono text-[#A78BFA] hover:text-white underline cursor-pointer"
                  >
                    Replace Poster
                  </button>
                )}
              </div>

              <input
                ref={posterInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handlePosterSelect(e.target.files[0]);
                  }
                }}
              />

              {poster ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 group">
                  <div className="aspect-video w-full max-h-56 overflow-hidden flex items-center justify-center bg-[#0A0A0E] relative">
                    <img
                      src={poster.url}
                      alt="Poster Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 pointer-events-none">
                      {poster.isExisting ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-black/80 backdrop-blur-md text-purple-300 border border-purple-500/40 shadow-sm flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-purple-400" />
                          Uploaded Poster
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-black/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 shadow-sm flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          New WebP
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-[#14141B] border-t border-white/[0.06] flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#6C63FF]/15 border border-[#6C63FF]/30 flex items-center justify-center text-[#A78BFA] shrink-0">
                        <ImageIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span
                          className="text-white truncate font-medium block font-mono text-[12px]"
                          title={poster.name}
                        >
                          {poster.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#71717A]">
                          <span className="text-emerald-400 font-semibold">
                            {formatFileSize(poster.size)}
                          </span>
                          {poster.originalSize && poster.originalSize > poster.size && (
                            <span>
                              (was {formatFileSize(poster.originalSize)} •{" "}
                              {Math.round((1 - poster.size / poster.originalSize) * 100)}% saved)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => posterInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-[#A78BFA] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePoster}
                        className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Remove poster"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => posterInputRef.current?.click()}
                  className="w-full py-8 px-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#6C63FF]/50 bg-white/[0.015] hover:bg-[#6C63FF]/[0.02] flex flex-col items-center justify-center cursor-pointer transition-all group text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] group-hover:bg-[#6C63FF]/15 border border-white/[0.08] group-hover:border-[#6C63FF]/30 flex items-center justify-center text-[#71717A] group-hover:text-[#A78BFA] mb-3 transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-white group-hover:text-[#A78BFA] transition-colors">
                    Click to select or drag event poster
                  </p>
                  <p className="text-[11px] text-[#71717A] mt-1">
                    Any image format • Auto-converted &amp; compressed to WebP (150–200 KB)
                  </p>
                </div>
              )}
            </div>

            {/* ── Section 2: Event Photos / Gallery ── */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold">
                      Event Photos &amp; Moments
                    </label>
                    {photos.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.06] text-[#D4D4D8] border border-white/[0.06]">
                        {photos.length} total
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#71717A] mt-0.5">
                    Moments, speaker shots, and workshop photos from this session
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => photosInputRef.current?.click()}
                  className="h-8 px-3 rounded-lg text-xs font-medium text-[#A78BFA] hover:text-white bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 border border-[#6C63FF]/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photos</span>
                </button>
              </div>

              <input
                ref={photosInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handlePhotosSelect(e.target.files);
                  }
                }}
              />

              {photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.id || idx}
                      className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0E0E14] group flex flex-col justify-between shadow-sm"
                    >
                      {/* Thumbnail + Badges */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                        <img
                          src={photo.url}
                          alt={photo.name || `Photo ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Top overlay badge: Uploaded vs New WebP */}
                        <div className="absolute top-2 left-2 pointer-events-none">
                          {photo.isExisting ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 backdrop-blur-md text-purple-300 border border-purple-500/40 shadow-sm flex items-center gap-1">
                              <Check className="w-2.5 h-2.5 text-purple-400" />
                              Uploaded
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 shadow-sm flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                              New WebP
                            </span>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="absolute top-2 right-2 h-6 w-6 rounded-md bg-black/70 hover:bg-red-500 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Footer info: File Name & Size */}
                      <div className="p-2 bg-[#121218] border-t border-white/[0.06] flex items-center justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <span
                            className="text-[11px] font-mono text-[#D4D4D8] group-hover:text-white truncate block"
                            title={photo.name}
                          >
                            {photo.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#A78BFA] font-semibold shrink-0">
                          {formatFileSize(photo.size)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Add more button tile in grid */}
                  <div
                    onClick={() => photosInputRef.current?.click()}
                    className="aspect-video rounded-xl border border-dashed border-white/10 hover:border-[#6C63FF]/50 bg-white/[0.02] hover:bg-[#6C63FF]/[0.03] flex flex-col items-center justify-center cursor-pointer transition-colors text-center p-2 group min-h-[110px]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-[#6C63FF]/20 flex items-center justify-center text-[#71717A] group-hover:text-[#A78BFA] transition-colors mb-1">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-[#71717A] group-hover:text-white">
                      Add More Photos
                    </span>
                    <span className="text-[9px] text-[#52525B] font-mono">
                      Auto-WebP
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => photosInputRef.current?.click()}
                  className="w-full py-8 px-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#6C63FF]/50 bg-white/[0.015] hover:bg-[#6C63FF]/[0.02] flex flex-col items-center justify-center cursor-pointer transition-all group text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] group-hover:bg-[#6C63FF]/15 border border-white/[0.08] group-hover:border-[#6C63FF]/30 flex items-center justify-center text-[#71717A] group-hover:text-[#A78BFA] mb-3 transition-colors">
                    <Camera className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-white group-hover:text-[#A78BFA] transition-colors">
                    Click to select session gallery photos
                  </p>
                  <p className="text-[11px] text-[#71717A] mt-1">
                    Any image format • Auto-converted &amp; compressed to WebP (150–200 KB)
                  </p>
                </div>
              )}
            </div>

            {/* Notice for Media Lead / Lead */}
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Uploaded assets are automatically converted to high-quality WebP format for optimal site performance, saved locally and ready for AWS S3 sync.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 sm:px-7 py-4 border-t border-white/[0.06] bg-[#121218] flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 px-4 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:brightness-110 text-white transition-all cursor-pointer disabled:opacity-40 shadow-lg shadow-[#6C63FF]/20 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes…</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{!poster && photos.length === 0 ? "Save Changes (Clear All Media)" : "Save & Upload Media"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
