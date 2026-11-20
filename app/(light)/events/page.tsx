import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
import { Events } from "@/components/features/events/Events";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicEvents } from "@/lib/events/public-events";
import { isoDayInZone } from "@/lib/design/events-view";
import { eventsJsonLd } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/site";

export const metadata: Metadata = buildPageMetadata({
  path: "/events",
  title: "Events",
  description:
    "Upcoming AWS workshops, hackathons, quizzes, and sessions from the AWS Student Builder Group at Tulas University, Dehradun.",
});

// Events come from the database on every request so the HTML always lists the live schedule.
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getPublicEvents();
  const todayIso = isoDayInZone(new Date(), "Asia/Kolkata");
  return (
    <>
      {events && <JsonLd data={eventsJsonLd(events, getSiteUrl())} />}
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <main id="main-content">
          <Events initialEvents={events} todayIso={todayIso} />
        </main>
        <DesignFooter />
      </div>
    </>
  );
}
