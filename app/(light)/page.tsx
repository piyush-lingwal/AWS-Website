import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_DESCRIPTION } from "@/lib/seo/site";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { SectionDivider } from "@/components/design/SectionDivider";
import { DesignNav } from "@/components/design/DesignNav";
import { Hero } from "@/components/design/Hero";
import { UpcomingEvents } from "@/components/design/UpcomingEvents";
import { Manifesto } from "@/components/design/Manifesto";
import { BuildRail } from "@/components/design/BuildRail";
import { WhyJoin } from "@/components/design/WhyJoin";
import { EventFormats, Learn } from "@/components/design/EventsLearn";
import { TeamTeaser } from "@/components/design/TeamTeaser";
import { FinalCta, Stats } from "@/components/design/StatsCta";
import { DesignFooter } from "@/components/design/DesignFooter";
import { getPublicEvents } from "@/lib/events/public-events";
import { isoDayInZone } from "@/lib/design/events-view";

export const metadata: Metadata = buildPageMetadata({
  path: "/",
  title: "AWS Student Builder Group at Tulas University, Dehradun",
  description: SITE_DESCRIPTION,
  absoluteTitle: true,
});

// The team preview reads team_members, so render per request to show roster edits without a redeploy.
export const dynamic = "force-dynamic";

/**
 * The landing page, in the light "Daylight Cloud" theme (DESIGN.md).
 * Each section declares a data-tone: the background blends between those tones as the reader scrolls.
 */
export default async function Home() {
  const events = await getPublicEvents();
  const todayIso = isoDayInZone(new Date(), "Asia/Kolkata");
  return (
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <main id="main-content">
        <Hero />
        <SectionDivider />
        <UpcomingEvents initialEvents={events} todayIso={todayIso} />
        <SectionDivider />
        <Manifesto />
        <SectionDivider />
        <BuildRail />
        <SectionDivider />
        <WhyJoin />
        <SectionDivider />
        <EventFormats />
        <SectionDivider />
        <TeamTeaser />
        <SectionDivider />
        <Learn />
        <SectionDivider />
        <Stats />
        <SectionDivider />
        <FinalCta />
        </main>
        <DesignFooter />
      </div>
    </>
  );
}
