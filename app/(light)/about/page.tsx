import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { aboutPageJsonLd } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/site";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { SectionDivider } from "@/components/design/SectionDivider";
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

export const metadata: Metadata = buildPageMetadata({
  path: "/about",
  title: "About",
  description:
    "What the AWS Student Builder Group at Tulas University is about: cloud-first learning, a peer-driven community, and building real projects on AWS.",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutPageJsonLd(getSiteUrl())} />
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
      <main id="main-content">
      <About />
      <SectionDivider />
      <AboutMission />
      <SectionDivider />
      <AboutPillars />
      <SectionDivider />
      <AboutComparison />
      <SectionDivider />
      <AboutTimeline />
      <SectionDivider />
      <AboutEcosystem />
      <SectionDivider />
      <AboutTechnologies />
      {/* AboutStats intentionally not rendered: unverified figures, see .agents/tasks/about-redesign/content-inventory.md */}
      <SectionDivider />
      <AboutCTA />
      </main>
      <DesignFooter />
      </div>
    </>
  );
}
