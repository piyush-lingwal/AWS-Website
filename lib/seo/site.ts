/** Single source of truth for site identity and the canonical base URL. Pure module. */

export const SITE_NAME = "AWS Student Builder Group";
export const ORG_NAME = "AWS Student Builder Group at Tulas University";
export const ORG_ALT_NAMES: readonly string[] = ["AWS SBG Tulas", "AWS SBG Tulas University"];
export const SITE_DESCRIPTION =
  "Official site of the AWS Student Builder Group at Tulas University, Dehradun: cloud workshops, events, hackathons and AWS learning for students.";
export const CONTACT_EMAIL = "awssbg@tulas.edu.in";
export const SOCIAL_PROFILES: readonly string[] = [
  "https://www.meetup.com/tulas-university-dehradun/",
  "https://www.linkedin.com/company/aws-tulas/",
  "https://www.instagram.com/aws.sbgtulas",
];
export const FALLBACK_SITE_URL = "https://awstulas.org";

/**
 * Picks the canonical base URL from NEXT_PUBLIC_SITE_URL. Invalid values fall
 * back; a localhost value is ignored in production so a misconfigured deploy
 * cannot emit localhost canonicals. The result never has a trailing slash.
 */
export function resolveSiteUrl(env: string | undefined | null, nodeEnv?: string): string {
  const raw = (env ?? "").trim();
  if (!raw) return FALLBACK_SITE_URL;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return FALLBACK_SITE_URL;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return FALLBACK_SITE_URL;
  const host = url.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1";
  if (isLocal && nodeEnv === "production") return FALLBACK_SITE_URL;
  return url.origin;
}

export function getSiteUrl(): string {
  return resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, process.env.NODE_ENV);
}

/** Joins a path onto the base URL. "/" yields the bare origin. */
export function absoluteUrl(path: string, base: string = getSiteUrl()): string {
  const root = base.replace(/\/+$/, "");
  if (!path || path === "/") return root;
  return `${root}${path.startsWith("/") ? path : `/${path}`}`;
}
