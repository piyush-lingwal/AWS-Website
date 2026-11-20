import {
  CONTACT_EMAIL,
  ORG_ALT_NAMES,
  ORG_NAME,
  SITE_DESCRIPTION,
  SOCIAL_PROFILES,
  absoluteUrl,
} from "./site.ts";
import { parseDay } from "../design/home-events.ts";

/** Serialises for an inline <script>: escapes "<" and the JS line separators. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

const ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Dehradun",
  addressRegion: "Uttarakhand",
  addressCountry: "IN",
};

export function organizationNode(base: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: ORG_NAME,
    alternateName: [...ORG_ALT_NAMES],
    url: base,
    logo: `${base}/logos/SBG_logo.png`,
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    address: ADDRESS,
    parentOrganization: { "@type": "CollegeOrUniversity", name: "Tulas University" },
    sameAs: [...SOCIAL_PROFILES],
  };
}

export function websiteNode(base: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: ORG_NAME,
    url: base,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${base}/#organization` },
  };
}

export interface TeamJsonLdMember {
  name: string;
  role: string | null;
  picture_url: string | null;
}

export interface TeamJsonLdFaculty {
  name: string;
  title: string;
}

const PLACEHOLDER_PICTURE = "/members/boy2.png";

function publicImage(url: string | null): string | undefined {
  if (!url || !url.startsWith("https://") || url.includes(PLACEHOLDER_PICTURE)) return undefined;
  return url;
}

/** Person nodes for the leadership roster and faculty only. Never email, course or branch. */
export function teamJsonLd(
  core: readonly TeamJsonLdMember[],
  faculty: readonly TeamJsonLdFaculty[],
  base: string,
) {
  const org = { "@id": `${base}/#organization` };
  const leaders = core.map((m) => {
    const image = publicImage(m.picture_url);
    return {
      "@type": "Person",
      name: m.name,
      ...(m.role ? { jobTitle: m.role } : {}),
      memberOf: org,
      ...(image ? { image } : {}),
    };
  });
  const staff = faculty.map((f) => ({
    "@type": "Person",
    name: f.name,
    jobTitle: f.title,
    affiliation: org,
  }));
  return {
    "@context": "https://schema.org",
    "@graph": [...leaders, ...staff],
  };
}

export function aboutPageJsonLd(base: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${base}/about#aboutpage`,
    url: `${base}/about`,
    name: `About ${ORG_NAME}`,
    description: SITE_DESCRIPTION,
    about: { "@id": `${base}/#organization` },
    isPartOf: { "@id": `${base}/#website` },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: readonly BreadcrumbItem[], base: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path, base),
    })),
  };
}

export interface EventJsonLdRow {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  event_end_date?: string | null;
  cover_url?: string | null;
}

/** Event nodes for rows with a real start date only. No offers, performer, attendance mode or time of day. */
export function eventsJsonLd(events: readonly EventJsonLdRow[], base: string) {
  const nodes = events.flatMap((e) => {
    const start = parseDay(e.event_date);
    if (!start || !e.event_date) return [];
    const startDate = e.event_date.trim();
    const end = parseDay(e.event_end_date);
    const endDate = end && end.getTime() >= start.getTime() && e.event_end_date ? e.event_end_date.trim() : undefined;
    const description = e.description?.trim();
    const image = e.cover_url && e.cover_url.startsWith("https://") ? e.cover_url : undefined;
    return [
      {
        "@type": "Event",
        "@id": `${base}/events#event-${encodeURIComponent(e.id)}`,
        name: e.name,
        ...(description ? { description } : {}),
        startDate,
        ...(endDate ? { endDate } : {}),
        eventStatus: "https://schema.org/EventScheduled",
        location: { "@type": "Place", name: "Tulas University", address: ADDRESS },
        organizer: { "@id": `${base}/#organization` },
        url: `${base}/events`,
        ...(image ? { image } : {}),
      },
    ];
  });
  return { "@context": "https://schema.org", "@graph": nodes };
}