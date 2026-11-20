import type { Metadata } from "next";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
import { Events } from "@/components/features/events/Events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming AWS workshops, hackathons, study jams, and build days from the AWS Student Builder Group at Tulas University, Dehradun.",
  alternates: {
    canonical: "/events",
  },
};

export default function EventsPage() {
  return (
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <Events />
        <DesignFooter />
      </div>
    </>
  );
}
