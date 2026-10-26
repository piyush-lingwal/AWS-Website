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
    <main className="min-h-screen bg-[#0B0A09] text-white overflow-x-hidden">
      {/* Screen 1: Who We Are */}
      <About />

      {/* Screen 2: What makes us different */}
      <AboutComparison />

      {/* Screen 3: The builder journey */}
      <AboutTimeline />

      {/* Screen 4: Our Pillars */}
      <AboutPillars />

      {/* Screen 5: The AWS Ecosystem */}
      <AboutEcosystem />

      {/* Screen 6: Technologies We Explore */}
      <AboutTechnologies />

      {/* Screen 7: Ready to Build / CTA */}
      <AboutCTA />
    </main>
  );
}
