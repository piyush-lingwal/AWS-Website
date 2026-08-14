import { RECRUITMENT_CONFIG, RecruitmentConfig, RecruitmentStatus } from "@/config/recruitment";

/**
 * Parse a date string supporting:
 * - DD-MM-YYYY HH:mm:ss (e.g., "26-07-2026 00:00:00")
 * - DD-MM-YYYY (e.g., "26-07-2026")
 * - ISO string or standard JS Date strings
 */
export function parseDateString(dateStr: string): Date {
  if (!dateStr) return new Date();

  const trimmed = dateStr.trim();

  // Match DD-MM-YYYY or DD-MM-YYYY HH:mm:ss
  const ddmmyyyyMatch = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1; // 0-indexed
    const year = parseInt(ddmmyyyyMatch[3], 10);
    const hour = ddmmyyyyMatch[4] ? parseInt(ddmmyyyyMatch[4], 10) : 0;
    const minute = ddmmyyyyMatch[5] ? parseInt(ddmmyyyyMatch[5], 10) : 0;
    const second = ddmmyyyyMatch[6] ? parseInt(ddmmyyyyMatch[6], 10) : 0;
    return new Date(year, month, day, hour, minute, second);
  }

  // Fallback to standard JS Date parser (for ISO dates, etc.)
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Format a Date or Date string to "DD-MM-YYYY HH:mm:ss" or "DD-MM-YYYY".
 * Keeps time till seconds only (no milliseconds or timezone strings).
 */
export function formatDateToString(input: string | Date, includeTime = true): string {
  const date = typeof input === "string" ? parseDateString(input) : input;
  if (isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (!includeTime) {
    return `${day}-${month}-${year}`;
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get current recruitment configuration.
 */
export function getRecruitmentConfig(): RecruitmentConfig {
  return RECRUITMENT_CONFIG;
}

/**
 * Determine the effective recruitment status ("upcoming", "open", or "closed").
 * Supports manual override from statusMode, or automatically evaluates dates.
 */
export function getRecruitmentStatus(nowDate: Date = new Date()): RecruitmentStatus {
  const config = getRecruitmentConfig();
  const mode = config.statusMode ? String(config.statusMode).trim().toLowerCase() : "";

  // If manual override is specified (and not "auto"), respect it immediately
  if (mode === "open" || mode === "closed" || mode === "upcoming") {
    return mode as RecruitmentStatus;
  }

  const now = nowDate.getTime();
  const start = parseDateString(config.registrationStartDate).getTime();
  const end = parseDateString(config.registrationEndDate).getTime();

  if (now < start) {
    return "upcoming";
  }

  if (now >= start && now <= end) {
    return "open";
  }

  return "open";
}

/**
 * Convenience helper to check if recruitment is currently open.
 */
export function isRecruitmentOpen(nowDate: Date = new Date()): boolean {
  const status = getRecruitmentStatus(nowDate);
  return String(status).trim().toLowerCase() === "open";
}

export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/**
 * Calculate time remaining until registration closes.
 */
export function getRegistrationTimeRemaining(nowDate: Date = new Date()): TimeRemaining {
  const config = getRecruitmentConfig();
  const end = parseDateString(config.registrationEndDate).getTime();
  const now = nowDate.getTime();
  const diff = end - now;

  if (diff <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    totalMs: diff,
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
}

