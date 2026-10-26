"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { DbEvent } from "@/types/certificate";

interface UpcomingPosterStageProps {
  event: DbEvent;
  isFallback: boolean;
}

export function UpcomingPosterStage({ event, isFallback }: UpcomingPosterStageProps) {
  const [posterFailed, setPosterFailed] = useState(false);
  const hasPoster = Boolean(event.poster_url && !posterFailed);

  // ── 1. If Poster IS uploaded: Show clean real event poster ──
  if (hasPoster) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-primary/40 bg-gradient-to-br from-[#1A1333] via-[#100C22] to-[#080511] aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] max-h-[380px] w-full shadow-2xl group flex flex-col justify-between">
        <Image
          src={event.poster_url!}
          alt={event.name}
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={() => {
            setTimeout(() => setPosterFailed(true), 0);
          }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

        {/* Top Bar */}
        <div className="relative z-10 flex items-center justify-between gap-2 p-4">
          <div className="flex items-center gap-2 shrink-0 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <Image
              src="/logos/AWS_logo.svg"
              alt="AWS"
              width={24}
              height={14}
              className="h-3 w-auto brightness-200"
            />
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/90 font-bold">
              SBG
            </span>
          </div>
        </div>

        {/* Bottom Venue Pill */}
        <div className="relative z-10 p-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 border border-white/15 text-[11px] text-white/90 backdrop-blur-md">
            <MapPin className="w-3 h-3 text-primary-light shrink-0" />
            <span className="truncate">Tulas University, Dehradun</span>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. If Poster IS NOT uploaded: Exact original dark atmospheric card ──
  return (
    <div className="relative rounded-2xl overflow-hidden border border-primary/40 bg-gradient-to-br from-[#1A1333] via-[#100C22] to-[#080511] p-5 sm:p-6 min-h-[260px] sm:min-h-[290px] flex flex-col justify-between shadow-2xl group">
      {/* Atmospheric background conference image overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80"
          alt="Event Stage Atmosphere"
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover opacity-25 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080511] via-[#100C22]/80 to-transparent" />
      </div>

      {/* Top Bar of Poster */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <Image
            src="/logos/AWS_logo.svg"
            alt="AWS"
            width={30}
            height={18}
            className="h-3.5 w-auto brightness-200"
          />
          <div className="text-[9px] font-mono uppercase tracking-widest text-white/80 font-bold leading-tight">
            STUDENT
            <br />
            BUILDER GROUP
          </div>
        </div>

        <div className="w-7 h-7 rounded-full border border-primary/30 bg-white/[0.05] p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
          <Image
            src="/logos/SBG_logo.png"
            alt="AWS Builder Logo"
            width={20}
            height={20}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Middle Title Preview */}
      <div className="relative z-10 my-auto py-3">
        <div className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight leading-none">
          AWS
        </div>
        <div className="text-2xl sm:text-3xl font-display font-extrabold text-primary-light tracking-tight mt-0.5">
          {event.name}
        </div>
        <div className="mt-2.5 inline-block px-3 py-1 rounded-full border border-primary/30 text-[9.5px] font-mono tracking-widest uppercase text-white/90 bg-primary/20 backdrop-blur-md font-semibold">
          {isFallback ? "ANNOUNCING SOON" : "OFFICIAL COMMUNITY EVENT"}
        </div>
      </div>

      {/* Bottom Venue Pill */}
      <div className="relative z-10 flex items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] text-white/90 backdrop-blur-md">
          <MapPin className="w-3 h-3 text-primary-light shrink-0" />
          <span className="truncate">Tulas University, Dehradun</span>
        </div>
      </div>
    </div>
  );
}
