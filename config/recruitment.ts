export type RecruitmentStatusMode = "auto" | "upcoming" | "open" | "closed";

export type RecruitmentStatus = "upcoming" | "open" | "closed";

export interface RecruitmentConfig {
  /**
   * Status mode:
   * - "auto": status is automatically computed based on start and end dates below
   * - "open": force website to OPEN mode (shows Register buttons & form)
   * - "closed": force website to CLOSED mode (shows Join Community buttons & closed page)
   * - "upcoming": force website to UPCOMING mode
   */
  statusMode: RecruitmentStatusMode;

  /** Date string for when registration opens (e.g. "DD-MM-YYYY HH:mm:ss" or "DD-MM-YYYY") */
  registrationStartDate: string;

  /** Date string for when registration closes (e.g. "DD-MM-YYYY HH:mm:ss" or "DD-MM-YYYY") */
  registrationEndDate: string;

  /** Primary fallback redirect URL when recruitment is closed */
  communityUrl: string;
}

/**
 * =========================================================================
 * SINGLE SOURCE OF TRUTH: RECRUITMENT CONFIGURATION
 * =========================================================================
 * Registrations are set to "open" by default for live applications.
 */
export const RECRUITMENT_CONFIG: RecruitmentConfig = {
  // Option 1: Force status manually ("open" | "closed" | "upcoming" | "auto")
  statusMode: (process.env.NEXT_PUBLIC_RECRUITMENT_STATUS as RecruitmentStatusMode) || "open",

  // Option 2: Start & end dates
  registrationStartDate: "01-01-2024 00:00:00",
  registrationEndDate: "31-12-2030 23:59:59",

  communityUrl: "/community",
};
