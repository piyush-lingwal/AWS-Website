"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  minDate?: string; // "YYYY-MM-DD"
  maxDate?: string; // "YYYY-MM-DD"
  onSelectTBA?: () => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseIsoDate(iso?: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
}

function formatToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(iso?: string): string {
  if (!iso) return "";
  const parsed = parseIsoDate(iso);
  if (!parsed) return iso;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  required = false,
  disabled = false,
  className,
  minDate,
  maxDate,
  onSelectTBA,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showYearSelect, setShowYearSelect] = useState(false);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Position coordinates for portal overlay
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
    placement: "bottom" | "top";
  }>({
    top: 0,
    left: 0,
    placement: "bottom",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize view to the selected date or today
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  const [viewYear, setViewYear] = useState<number>(() => {
    return selectedDate ? selectedDate.getFullYear() : today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return selectedDate ? selectedDate.getMonth() : today.getMonth();
  });

  // When value changes externally and popover is closed, update view
  useEffect(() => {
    if (selectedDate && !isOpen) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [selectedDate, isOpen]);

  // Calculate and update popover position above/below the trigger button
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 320; // 20rem / w-80
    const popoverHeight = 360; // approximate height of calendar

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Flip to top if insufficient space below
    const placement =
      spaceBelow < popoverHeight && spaceAbove > spaceBelow ? "top" : "bottom";

    const top =
      placement === "bottom"
        ? rect.bottom + 8
        : Math.max(12, rect.top - popoverHeight - 8);

    // Keep horizontally within viewport boundaries with 12px margin
    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - popoverWidth - 12);
    }
    if (left < 12) {
      left = 12;
    }

    setPopoverPos({ top, left, placement });
  }, []);

  // Track position when open on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    // Use capture: true so scrolling inside modals/parents updates position instantly
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Click outside and escape key listener (handles portaled elements)
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
      setShowYearSelect(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setShowYearSelect(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Calendar days grid computation (6 rows x 7 days = 42 cells)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      iso: string;
      disabled: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Leading days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - 1, daysInPrevMonth - i);
      const iso = formatToIso(d);
      days.push({
        date: d,
        isCurrentMonth: false,
        iso,
        disabled: Boolean(
          (minDate && iso < minDate) || (maxDate && iso > maxDate)
        ),
        isToday: iso === formatToIso(today),
        isSelected: Boolean(value && iso === value),
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day);
      const iso = formatToIso(d);
      days.push({
        date: d,
        isCurrentMonth: true,
        iso,
        disabled: Boolean(
          (minDate && iso < minDate) || (maxDate && iso > maxDate)
        ),
        isToday: iso === formatToIso(today),
        isSelected: Boolean(value && iso === value),
      });
    }

    // Trailing days to fill 42 cells (6 rows)
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(viewYear, viewMonth + 1, day);
      const iso = formatToIso(d);
      days.push({
        date: d,
        isCurrentMonth: false,
        iso,
        disabled: Boolean(
          (minDate && iso < minDate) || (maxDate && iso > maxDate)
        ),
        isToday: iso === formatToIso(today),
        isSelected: Boolean(value && iso === value),
      });
    }

    return days;
  }, [viewYear, viewMonth, minDate, maxDate, today, value]);

  // Year range list for year selector
  const yearOptions = useMemo(() => {
    const current = today.getFullYear();
    const years: number[] = [];
    for (let y = current - 5; y <= current + 6; y++) {
      years.push(y);
    }
    return years;
  }, [today]);

  const selectDay = (iso: string) => {
    onChange(iso);
    setIsOpen(false);
    setShowYearSelect(false);
  };

  const handleQuickSelectToday = () => {
    const iso = formatToIso(today);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(iso);
    setIsOpen(false);
  };

  const handleQuickSelectTomorrow = () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const iso = formatToIso(tomorrow);
    setViewYear(tomorrow.getFullYear());
    setViewMonth(tomorrow.getMonth());
    onChange(iso);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Trigger Button styled like input */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => {
              const next = !prev;
              if (next) updatePosition();
              return next;
            });
          }
        }}
        className={cn(
          "w-full h-11 px-3.5 rounded-xl text-sm bg-white/90 border text-left flex items-center justify-between transition-all duration-200 cursor-pointer select-none",
          isOpen
            ? "border-[#7C3AED] ring-2 ring-[#7C3AED]/20 text-[#1B1140]"
            : "border-[#1B1140]/15 hover:border-[#CBB5FF] text-[#1B1140]",
          disabled && "opacity-50 cursor-not-allowed",
          !value && "text-[#6A6190]"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon
            className={cn(
              "w-4 h-4 shrink-0 transition-colors",
              isOpen || value ? "text-[#7C3AED]" : "text-[#6A6190]"
            )}
          />
          <span className={cn("truncate", !value && "text-[#6A6190]")}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center">
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-[#6A6190] transition-transform duration-200",
              isOpen && "rotate-180 text-[#1B1140]"
            )}
          />
        </div>
      </button>

      {/* Hidden input for HTML form validation */}
      <input
        type="hidden"
        value={value || ""}
        required={required}
        aria-hidden="true"
      />

      {/* Floating Calendar Overlay via React Portal (Floats above all modals, never cropped) */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            style={{
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
            }}
            className={cn(
              "fixed z-[99999] w-80 p-3.5 rounded-2xl overscroll-contain",
              "bg-white border border-[#1B1140]/10 text-[#1B1140] shadow-[0_30px_80px_-24px_rgba(76,29,149,0.38)]",
              "animate-in fade-in-0 zoom-in-95 duration-150"
            )}
          >
            {/* Header: Month / Year / Navigation */}
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                type="button"
                onClick={() => setShowYearSelect((prev) => !prev)}
                className="flex items-center gap-1.5 px-2 py-1 -ml-1 rounded-lg text-sm font-semibold text-[#1B1140] hover:bg-[#F4EFFF] transition-colors cursor-pointer"
              >
                <span>
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-[#4D4470] transition-transform",
                    showYearSelect && "rotate-180 text-[#1B1140]"
                  )}
                />
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[#4D4470] hover:text-[#1B1140] hover:bg-[#F4EFFF] transition-colors cursor-pointer"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[#4D4470] hover:text-[#1B1140] hover:bg-[#F4EFFF] transition-colors cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Year/Month Selector View */}
            {showYearSelect ? (
              <div className="py-2 animate-in fade-in-0 duration-150">
                <div className="text-xs font-mono uppercase text-[#6A6190] px-2 mb-2 font-medium">
                  Select Year
                </div>
                <div
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                  className="grid grid-cols-4 gap-1.5 mb-3 max-h-40 overflow-y-auto overscroll-contain px-1"
                >
                  {yearOptions.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setViewYear(year);
                        setShowYearSelect(false);
                      }}
                      className={cn(
                        "h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                        viewYear === year
                          ? "bg-[#7C3AED] text-white font-bold"
                          : "text-[#1B1140] hover:bg-[#F4EFFF]"
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-mono uppercase text-[#6A6190] px-2 mb-2 font-medium">
                  Select Month
                </div>
                <div className="grid grid-cols-3 gap-1.5 px-1">
                  {MONTH_NAMES.map((name, idx) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setViewMonth(idx);
                        setShowYearSelect(false);
                      }}
                      className={cn(
                        "h-8 rounded-lg text-xs font-medium transition-colors truncate px-1 cursor-pointer",
                        viewMonth === idx
                          ? "bg-[#7C3AED] text-white font-bold"
                          : "text-[#1B1140] hover:bg-[#F4EFFF]"
                      )}
                    >
                      {name.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Day of week headers */}
                <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
                  {WEEKDAY_NAMES.map((w, idx) => (
                    <div
                      key={w}
                      className={cn(
                        "text-[11px] font-mono font-medium py-1 select-none",
                        idx === 0 || idx === 6
                          ? "text-[#6428D4]"
                          : "text-[#6A6190]"
                      )}
                    >
                      {w}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, idx) => {
                    return (
                      <button
                        key={`${day.iso}-${idx}`}
                        type="button"
                        disabled={day.disabled}
                        onClick={() => !day.disabled && selectDay(day.iso)}
                        className={cn(
                          "h-8 w-8 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-all duration-150 select-none cursor-pointer",
                          day.isSelected
                            ? "bg-[#7C3AED] text-white font-bold shadow-md shadow-[#7C3AED]/30 scale-105"
                            : day.isToday
                            ? "ring-1 ring-[#7C3AED] text-[#6428D4] font-bold hover:bg-[#EFE8FF]"
                            : day.isCurrentMonth
                            ? "text-[#1B1140] hover:bg-[#F4EFFF]"
                            : "text-[#6A6190]/70 hover:bg-[#F4EFFF] hover:text-[#4D4470]",
                          day.disabled &&
                            "opacity-25 cursor-not-allowed pointer-events-none"
                        )}
                      >
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Actions Footer */}
                <div className="mt-3 pt-2.5 border-t border-[#1B1140]/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleQuickSelectToday}
                      className="px-2 py-1 rounded-md text-[11px] font-medium text-[#6428D4] hover:text-[#4A1D9E] hover:bg-[#EFE8FF] transition-colors cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickSelectTomorrow}
                      className="px-2 py-1 rounded-md text-[11px] font-medium text-[#4D4470] hover:text-[#1B1140] hover:bg-[#F4EFFF] transition-colors cursor-pointer"
                    >
                      Tomorrow
                    </button>
                    {onSelectTBA && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onSelectTBA();
                        }}
                        className="px-2 py-1 rounded-md text-[11px] font-medium text-[#92400E] hover:text-[#78350F] hover:bg-[#FFEBD3] transition-colors cursor-pointer"
                      >
                        To be announced
                      </button>
                    )}
                  </div>

                  
                </div>
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
