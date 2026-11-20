import type { Metadata } from "next";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
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

export const metadata: Metadata = {
  title:
    "AWS Student Builder Group at Tulas University | Official AWS Cloud Community",
  description:
    "Official website of AWS Student Builder Group at Tulas University, Dehradun. Join workshops, cloud events, hackathons, AWS learning programs, and student innovation initiatives powered by AWS.",
  alternates: {
    canonical: "/",
  },
};

// The team preview reads team_members, so render per request to show roster edits without a redeploy.
export const dynamic = "force-dynamic";

/**
 * The landing page, in the light "Daylight Cloud" theme (DESIGN.md).
 * Each section declares a data-tone: the background blends between those tones as the reader scrolls.
 */
export default function Home() {
  return (
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <Hero />
        <UpcomingEvents />
        <Manifesto />
        <BuildRail />
        <WhyJoin />
        <EventFormats />
        <TeamTeaser />
        <Learn />
        <Stats />
        <FinalCta />
        <DesignFooter />
      </div>
    </>
  );
}
