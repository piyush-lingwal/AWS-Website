import type { Metadata } from "next";
import { About } from "@/components/features/about/About";
import { AboutComparison } from "@/components/features/about/AboutComparison";
import { AboutTimeline } from "@/components/features/about/AboutTimeline";
import { AboutPillars } from "@/components/features/about/AboutPillars";
import { AboutEcosystem } from "@/components/features/about/AboutEcosystem";
import { AboutTechnologies } from "@/components/features/about/AboutTechnologies";
import { AboutStats } from "@/components/features/about/AboutStats";
import { AboutCTA } from "@/components/features/about/AboutCTA";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn what the AWS Student Builder Group at Tulas University is about — cloud-first learning, peer-driven community, hackathons, AWS certifications, and building real-world projects on AWS.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <About />
      <AboutComparison />
      <AboutTimeline />
      <AboutPillars />
      <AboutEcosystem />
      <AboutTechnologies />
      {/* <AboutStats /> - Hidden for now */}
      <AboutCTA />
    </>
  );
}
