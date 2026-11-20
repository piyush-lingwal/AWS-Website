import type { Metadata } from "next";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
import { About } from "@/components/features/about/About";
import { AboutComparison } from "@/components/features/about/AboutComparison";
import { AboutTimeline } from "@/components/features/about/AboutTimeline";
import { AboutPillars } from "@/components/features/about/AboutPillars";
import { AboutEcosystem } from "@/components/features/about/AboutEcosystem";
import { AboutTechnologies } from "@/components/features/about/AboutTechnologies";
import { AboutMission } from "@/components/features/about/AboutMission";
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
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
      <About />
      <AboutMission />
      <AboutPillars />
      <AboutComparison />
      <AboutTimeline />
      <AboutEcosystem />
      <AboutTechnologies />
      {/* AboutStats intentionally not rendered: unverified figures, see .agents/tasks/about-redesign/content-inventory.md */}
      <AboutCTA />
      <DesignFooter />
      </div>
    </>
  );
}
