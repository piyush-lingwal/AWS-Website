import { Bricolage_Grotesque, Figtree, Instrument_Serif } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { EventsAtmosphere } from "@/components/features/events/EventsAtmosphere";
import { cn } from "@/lib/utils";
import "./events-theme.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-lt-display", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-lt-serif", display: "swap" });
const body = Figtree({ subsets: ["latin"], variable: "--font-lt-body", display: "swap" });

/** Applies the Daylight Cloud light theme to /events only. Self-contained: no dependency on /preview. */
export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(display.variable, serif.variable, body.variable, GeistMono.variable, "events-page font-lt-body")}>
      <EventsAtmosphere />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
