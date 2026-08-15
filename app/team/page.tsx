import type { Metadata } from "next";
import { Team } from "@/components/features/team/Team";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Meet the students who organise, teach, mentor, and keep the AWS Student Builders Group running at Tulas University, Dehradun.",
  alternates: {
    canonical: "/team",
  },
};

export default function TeamPage() {
  return <Team />;
}
