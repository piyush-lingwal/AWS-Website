import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
import { LearningHub } from "@/components/features/learning-hub/LearningHub";

export const metadata: Metadata = buildPageMetadata({
  path: "/learning-hub",
  title: "Learning Hub",
  description:
    "Resources to build cloud skills: AWS certification prep, AWS training, project starter kits, AWS Educate credits and a community blog from AWS SBG Tulas.",
});

export default function LearningHubPage() {
  return (
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <main id="main-content">
          <LearningHub />
        </main>
        <DesignFooter />
      </div>
    </>
  );
}
