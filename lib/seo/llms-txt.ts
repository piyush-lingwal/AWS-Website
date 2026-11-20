import { CONTACT_EMAIL, ORG_NAME, SITE_DESCRIPTION, SOCIAL_PROFILES, absoluteUrl } from "./site.ts";

// EMERGING, NON-STANDARD convention (llmstxt.org). Google Search ignores llms.txt
// and no major AI service has confirmed using it; this is low-cost optionality only.
// Keep content factual: no statistics or unverified claims.

const PAGES: ReadonlyArray<{ path: string; title: string; line: string }> = [
  { path: "/", title: "Home", line: "Overview of the group, upcoming events and ways to join." },
  { path: "/about", title: "About", line: "Who we are, what the group does and how it relates to AWS and Tulas University." },
  { path: "/events", title: "Events", line: "Workshops, hackathons and meetups hosted by the group." },
  { path: "/team", title: "Team", line: "The faculty and student team that runs the group." },
  { path: "/learning-hub", title: "Learning Hub", line: "Learning resources and AWS study material for students." },
  { path: "/gallery", title: "Gallery", line: "Photos from past events." },
  { path: "/register", title: "Register", line: "Sign up to take part in the community." },
  { path: "/community", title: "Community", line: "How to connect with the group and other members." },
  { path: "/verify", title: "Verify certificate", line: "Check that a certificate issued by the group is genuine." },
];

export function buildLlmsTxt(base: string): string {
  const lines: string[] = [
    `# ${ORG_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Pages",
    "",
    ...PAGES.map((p) => `- [${p.title}](${absoluteUrl(p.path, base)}): ${p.line}`),
    "",
    "## Contact and profiles",
    "",
    `- Email: ${CONTACT_EMAIL}`,
    ...SOCIAL_PROFILES.map((u) => `- ${u}`),
    "",
    "## Optional",
    "",
    `- [Sitemap](${absoluteUrl("/sitemap.xml", base)}): Full list of public pages.`,
    "",
  ];
  return lines.join("\n");
}
