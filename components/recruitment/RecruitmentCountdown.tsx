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
      className={`surface relative inline-flex flex-col items-center rounded-3xl p-4 sm:p-5 ${className}`}
    >
      {showTitle && (
        <div className="t-eyebrow mb-3 flex items-center gap-1.5 text-sbg-lilac-700">
          <Sparkles size={14} className="text-sbg-lilac-600" animate loop />
          <span>Applications Close In</span>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3">
        {timeUnits.map((unit, idx) => (
          <React.Fragment key={unit.label}>
            {idx > 0 && <span className="animate-pulse text-lg font-bold text-sbg-lilac-400 sm:text-2xl">:</span>}
            <div className="flex flex-col items-center">
              <div className="t-pixel flex h-11 w-12 items-center justify-center rounded-2xl bg-sbg-lilac-100 text-lg text-sbg-ink sm:h-14 sm:w-16 sm:text-2xl">
                {String(unit.value).padStart(2, "0")}
              </div>
              <span className="t-eyebrow mt-1.5 text-[9px]">
                {unit.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
