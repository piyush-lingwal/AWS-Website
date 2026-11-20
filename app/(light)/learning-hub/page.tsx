import type { Metadata } from "next";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
import { LearningHub } from "@/components/features/learning-hub/LearningHub";

export const metadata: Metadata = {
  title: "Learning Hub",
  description:
    "Resources to level up your cloud skills — AWS certifications, workshop archives, Skill Builder, project starter kits, and more from AWS SBG Tulas.",
  alternates: {
    canonical: "/learning-hub",
  },
};

export default function LearningHubPage() {
  return (
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <LearningHub />
        <DesignFooter />
      </div>
    </>
  );
}
