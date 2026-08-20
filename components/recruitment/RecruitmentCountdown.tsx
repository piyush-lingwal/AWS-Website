"use client";

import React from "react";
import { useRecruitment } from "@/hooks/useRecruitment";
import { Sparkles } from "@/components/ui/animate-ui/icons/sparkles";

export interface RecruitmentCountdownProps {
  className?: string;
  showTitle?: boolean;
}

export function RecruitmentCountdown({
  className = "",
  showTitle = true,
}: RecruitmentCountdownProps) {
  const { mounted, isOpen, timeRemaining } = useRecruitment();

  // If not mounted yet (SSR) or recruitment is NOT open, hide countdown completely
  if (!mounted || !isOpen || timeRemaining.isExpired) {
    return null;
  }

  const { days, hours, minutes, seconds } = timeRemaining;

  const timeUnits = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Mins", value: minutes },
    { label: "Secs", value: seconds },
  ];

  return (
    <div
      className={`relative inline-flex flex-col items-center rounded-2xl border border-white/15 bg-black/75 p-4 sm:p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.7),_inset_0_1px_0_rgba(255,255,255,0.1)] ${className}`}
    >
      {showTitle && (
        <div className="mb-3 flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-primary-light font-mono">
          <Sparkles size={14} className="text-accent" animate loop />
          <span>Applications Close In</span>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3 font-mono">
        {timeUnits.map((unit, idx) => (
          <React.Fragment key={unit.label}>
            {idx > 0 && <span className="text-lg sm:text-2xl font-bold text-primary/50 animate-pulse">:</span>}
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-11 sm:h-12 sm:w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-base sm:text-xl font-extrabold text-white shadow-inner">
                {String(unit.value).padStart(2, "0")}
              </div>
              <span className="mt-1 text-[9px] uppercase tracking-wider text-muted font-sans font-medium">
                {unit.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
