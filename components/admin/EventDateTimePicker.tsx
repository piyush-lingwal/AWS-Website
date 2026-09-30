"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Edit2,
  Check,
} from "lucide-react";

interface EventDateTimePickerProps {
  eventDate: string;
  eventTiming: string;
  onDateChange: (date: string) => void;
  onTimingChange: (timing: string) => void;
}

// ── Time Math Helpers ───────────────────────────────────────────
function timeStringToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function minutesToTimeString(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  let hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours >= 12 ? "PM" : "AM";
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)} ${period}`;
}

function calculateDuration(startStr: string, endStr: string): string | null {
  const startMins = timeStringToMinutes(startStr);
  const endMins = timeStringToMinutes(endStr);
  if (startMins === null || endMins === null) return null;
  const diff = endMins - startMins;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours === 0) return `${mins} mins`;
  if (mins === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${hours} hr${hours > 1 ? "s" : ""} ${mins} mins`;
}

// Standard 30-min time slots from 07:00 AM to 10:00 PM
const TIME_SLOTS: string[] = [];
for (let m = 420; m <= 1320; m += 30) {
  TIME_SLOTS.push(minutesToTimeString(m));
}

// Popular AWS SBG Presets
const TIMING_PRESETS = [
  { label: "Keynote / Webinar", timing: "11:00 AM - 12:30 PM", start: "11:00 AM", end: "12:30 PM" },
  { label: "Morning Session", timing: "10:00 AM - 11:30 AM", start: "10:00 AM", end: "11:30 AM" },
  { label: "Cloud Workshop", timing: "02:00 PM - 04:00 PM", start: "02:00 PM", end: "04:00 PM" },
  { label: "Evening Tech Talk", timing: "05:00 PM - 06:30 PM", start: "05:00 PM", end: "06:30 PM" },
];

export default function EventDateTimePicker({
  eventDate,
  eventTiming,
  onDateChange,
  onTimingChange,
}: EventDateTimePickerProps) {
  // ── Mode: Structured Picker vs Custom Text ───────────────────
  const [isCustomTiming, setIsCustomTiming] = useState(false);

  // Structured time states
  const [startTime, setStartTime] = useState("11:00 AM");
  const [endTime, setEndTime] = useState("12:30 PM");

  // Sync internal start/end when incoming eventTiming changes
  useEffect(() => {
    if (!eventTiming) {
      setStartTime("11:00 AM");
      setEndTime("12:30 PM");
      return;
    }

    const match = eventTiming.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM))\s*(?:-|–|to)\s*(\d{1,2}:\d{2}\s*(?:AM|PM))$/i);
    if (match) {
      const normalizedStart = match[1].trim().toUpperCase();
      const normalizedEnd = match[2].trim().toUpperCase();
      setStartTime(normalizedStart);
      setEndTime(normalizedEnd);
      setIsCustomTiming(false);
    } else {
      // Non-standard timing string (e.g. "Full Day", "All Morning", etc.)
      setIsCustomTiming(true);
    }
  }, [eventTiming]);

  // Handlers for structured time updates
  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    // If end is currently before or equal to new start, auto-bump end time by 90 mins
    const startMins = timeStringToMinutes(newStart);
    const endMins = timeStringToMinutes(endTime);
    let targetEnd = endTime;

    if (startMins !== null && (endMins === null || endMins <= startMins)) {
      targetEnd = minutesToTimeString(startMins + 90);
      setEndTime(targetEnd);
    }

    onTimingChange(`${newStart} - ${targetEnd}`);
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd);
    onTimingChange(`${startTime} - ${newEnd}`);
  };

  const applyDurationOffset = (minutes: number) => {
    const startMins = timeStringToMinutes(startTime);
    if (startMins === null) return;
    const newEnd = minutesToTimeString(startMins + minutes);
    setEndTime(newEnd);
    onTimingChange(`${startTime} - ${newEnd}`);
  };

  const applyPreset = (preset: typeof TIMING_PRESETS[0]) => {
    setStartTime(preset.start);
    setEndTime(preset.end);
    setIsCustomTiming(false);
    onTimingChange(preset.timing);
  };

  // ── Date Helpers & Shortcuts ─────────────────────────────────
  const dateShortcuts = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const sat = new Date();
    const day = sat.getDay();
    const diffSat = day === 6 ? 7 : 6 - day;
    sat.setDate(sat.getDate() + diffSat);
    const satStr = sat.toISOString().split("T")[0];

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    return [
      { label: "Today", value: todayStr },
      { label: "Tomorrow", value: tomorrowStr },
      { label: "Saturday", value: satStr },
      { label: "+1 Week", value: nextWeekStr },
    ];
  }, []);

  const relativeDateBadge = useMemo(() => {
    if (!eventDate) return null;
    try {
      const target = new Date(eventDate + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return { label: "Today", bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" };
      if (diffDays === 1) return { label: "Tomorrow", bg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25" };
      if (diffDays > 1 && diffDays <= 7) return { label: `In ${diffDays} days`, bg: "bg-[#6C63FF]/15 text-[#A78BFA] border-[#6C63FF]/25" };
      if (diffDays > 7) return { label: `In ${diffDays} days`, bg: "bg-white/5 text-[#A1A1AA] border-white/10" };
      if (diffDays === -1) return { label: "Yesterday", bg: "bg-zinc-800 text-zinc-400 border-zinc-700" };
      return { label: `${Math.abs(diffDays)}d ago`, bg: "bg-zinc-800 text-zinc-400 border-zinc-700" };
    } catch {
      return null;
    }
  }, [eventDate]);

  const fullFormattedDate = useMemo(() => {
    if (!eventDate) return "";
    try {
      const d = new Date(eventDate + "T00:00:00");
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, [eventDate]);

  // Duration & Validation
  const durationLabel = useMemo(() => {
    if (isCustomTiming) return null;
    return calculateDuration(startTime, endTime);
  }, [startTime, endTime, isCustomTiming]);

  const isInvalidTimeRange = useMemo(() => {
    if (isCustomTiming) return false;
    const startMins = timeStringToMinutes(startTime);
    const endMins = timeStringToMinutes(endTime);
    return startMins !== null && endMins !== null && endMins <= startMins;
  }, [startTime, endTime, isCustomTiming]);

  return (
    <div className="p-4 rounded-2xl bg-[#121218] border border-white/[0.08] space-y-4 shadow-inner">
      {/* ── Section Title ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6C63FF]/10 border border-[#6C63FF]/25 flex items-center justify-center text-[#6C63FF]">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white block">
              Event Schedule &amp; Timing
            </span>
            <span className="text-[11px] text-[#71717A]">
              Will be printed directly on student certificates
            </span>
          </div>
        </div>

        {/* Live Duration / Status Indicator */}
        {durationLabel && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium bg-[#6C63FF]/15 text-[#A78BFA] border border-[#6C63FF]/30">
            <Clock className="w-3 h-3 text-[#6C63FF]" />
            <span>{durationLabel}</span>
          </span>
        )}
      </div>

      {/* ── PART 1: DATE SELECTOR ────────────────────────────── */}
      <div className="space-y-2 pt-2 border-t border-white/[0.05]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold flex items-center gap-1.5">
            <span>Date</span>
            <span className="text-[#6C63FF]">*</span>
          </label>

          {/* Relative Day Indicator */}
          {relativeDateBadge && (
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${relativeDateBadge.bg}`}
            >
              {relativeDateBadge.label}
            </span>
          )}
        </div>

        {/* Quick Date Shortcuts */}
        <div className="grid grid-cols-4 gap-1.5">
          {dateShortcuts.map((chip) => {
            const isSelected = eventDate === chip.value;
            return (
              <button
                type="button"
                key={chip.label}
                onClick={() => onDateChange(chip.value)}
                className={`h-7 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer truncate ${
                  isSelected
                    ? "bg-[#6C63FF] text-white font-semibold shadow-sm shadow-[#6C63FF]/30"
                    : "bg-white/[0.03] text-[#A1A1AA] hover:text-white hover:bg-white/[0.07] border border-white/[0.06]"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Date Input with Icon */}
        <div className="relative">
          <input
            type="date"
            required
            value={eventDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl text-xs bg-[#171720] border border-white/[0.1] text-white focus:outline-none focus:border-[#6C63FF] transition-colors [color-scheme:dark] cursor-pointer"
          />
        </div>

        {/* Formatted Date Banner */}
        {fullFormattedDate && (
          <div className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-[#A1A1AA] flex items-center gap-2">
            <span className="text-[#6C63FF]">📅</span>
            <span className="font-medium text-white">{fullFormattedDate}</span>
          </div>
        )}
      </div>

      {/* ── PART 2: TIMING SELECTOR ──────────────────────────── */}
      <div className="space-y-2 pt-2 border-t border-white/[0.05]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold flex items-center gap-1.5">
            <span>Timing</span>
            <span className="text-[#6C63FF]">*</span>
          </label>

          {/* Toggle between Structured Pickers and Custom String */}
          <button
            type="button"
            onClick={() => {
              if (isCustomTiming) {
                // Return to structured
                onTimingChange(`${startTime} - ${endTime}`);
                setIsCustomTiming(false);
              } else {
                setIsCustomTiming(true);
              }
            }}
            className="text-[11px] text-[#71717A] hover:text-[#A78BFA] transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <Edit2 className="w-3 h-3" />
            <span>{isCustomTiming ? "Use Pickers" : "Custom Text"}</span>
          </button>
        </div>

        {!isCustomTiming ? (
          <div className="space-y-2.5">
            {/* Session Preset Chips */}
            <div className="grid grid-cols-2 gap-1.5">
              {TIMING_PRESETS.map((preset) => {
                const isActive = eventTiming === preset.timing;
                return (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={`h-7 px-2.5 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer flex items-center justify-between truncate ${
                      isActive
                        ? "bg-[#6C63FF]/20 text-[#A78BFA] border border-[#6C63FF]/50"
                        : "bg-white/[0.02] text-[#8E8EA0] hover:text-white hover:bg-white/[0.06] border border-white/[0.05]"
                    }`}
                  >
                    <span className="truncate">{preset.label}</span>
                    {isActive && <Check className="w-3 h-3 text-[#A78BFA] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Start & End Time Dropdown Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Start Time */}
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
                  Start Time
                </span>
                <div className="relative">
                  <select
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full h-10 pl-3 pr-7 rounded-xl text-xs bg-[#171720] border border-white/[0.1] text-white focus:outline-none focus:border-[#6C63FF] transition-colors cursor-pointer appearance-none"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A]">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* End Time */}
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
                  End Time
                </span>
                <div className="relative">
                  <select
                    value={endTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className={`w-full h-10 pl-3 pr-7 rounded-xl text-xs bg-[#171720] border transition-colors cursor-pointer appearance-none ${
                      isInvalidTimeRange
                        ? "border-amber-500/50 text-amber-300 focus:border-amber-500"
                        : "border-white/[0.1] text-white focus:outline-none focus:border-[#6C63FF]"
                    }`}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A]">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Duration Extenders */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider shrink-0 mr-1">
                Duration:
              </span>
              {[
                { label: "+1h", mins: 60 },
                { label: "+1.5h", mins: 90 },
                { label: "+2h", mins: 120 },
                { label: "+3h", mins: 180 },
              ].map((btn) => (
                <button
                  type="button"
                  key={btn.label}
                  onClick={() => applyDurationOffset(btn.mins)}
                  className="h-6 px-2 rounded-md text-[10.5px] font-mono bg-white/[0.03] hover:bg-[#6C63FF]/20 text-[#A1A1AA] hover:text-[#A78BFA] border border-white/[0.06] hover:border-[#6C63FF]/30 transition-all cursor-pointer"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Error Warning if End <= Start */}
            {isInvalidTimeRange && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>End time is earlier than or equal to start time. Adjust end time or click duration.</span>
              </div>
            )}
          </div>
        ) : (
          /* Manual Custom Timing Mode */
          <div className="space-y-1.5">
            <input
              type="text"
              required
              value={eventTiming}
              onChange={(e) => onTimingChange(e.target.value)}
              placeholder="e.g. 11:00 AM - 12:30 PM (IST) or All Day"
              className="w-full h-10 px-3.5 rounded-xl text-xs bg-[#171720] border border-white/[0.1] text-white placeholder-[#52525B] focus:outline-none focus:border-[#6C63FF] transition-colors"
            />
            <p className="text-[10.5px] text-[#71717A]">
              Custom timing mode allows you to specify non-standard formats or multiple time zones.
            </p>
          </div>
        )}

        {/* Certificate Display String Preview */}
        <div className="p-2.5 rounded-xl bg-[#0B0B0F] border border-white/[0.05] flex items-center justify-between text-xs">
          <span className="text-[10.5px] text-[#71717A] font-mono uppercase tracking-wider">
            Certificate String:
          </span>
          <span className="font-mono font-semibold text-[#A78BFA]">
            {eventTiming || "Not specified"}
          </span>
        </div>
      </div>
    </div>
  );
}
