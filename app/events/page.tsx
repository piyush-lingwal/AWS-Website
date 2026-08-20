import type { Metadata } from "next";
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
  return <Events />;
}
