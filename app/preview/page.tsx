import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { Hero } from "@/components/design/Hero";
import { Manifesto } from "@/components/design/Manifesto";
import { BuildRail } from "@/components/design/BuildRail";
import { WhyJoin } from "@/components/design/WhyJoin";
import { Events, Learn } from "@/components/design/EventsLearn";
import { FinalCta, Stats } from "@/components/design/StatsCta";
import { DesignFooter } from "@/components/design/DesignFooter";

/**
 * Sample landing page for the "Daylight Cloud" light redesign (see DESIGN.md).
 * Lives at /preview and shares nothing visual with the live pages, so it can be
 * judged on its own. Each section declares a data-tone: the background blends
 * between those tones as the reader scrolls.
 */
export default function PreviewPage() {
  return (
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <Hero />
        <Manifesto />
        <BuildRail />
        <WhyJoin />
        <Events />
        <Learn />
        <Stats />
        <FinalCta />
        <DesignFooter />
      </div>
      <p className="t-eyebrow fixed bottom-4 right-4 z-40 hidden items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 px-3 py-1.5 !text-[10px] backdrop-blur sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-sbg-spark" />
        Design preview
      </p>
    </>
  );
}
