import type { Viewport } from "next";
import { Bricolage_Grotesque, Figtree, Instrument_Serif } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { cn } from "@/lib/utils";
import { ThemeScope } from "@/components/design/ThemeScope";
import "./daylight.css";

// Pages in this route group use the light "Daylight Cloud" theme (see DESIGN.md).
// To move another page to the new theme, move its folder into app/(light) and add
// its path to lib/layout/standalone-pages.ts (so it draws the light navbar and footer).
//
// Typography (DESIGN.md section 4):
//   Bricolage Grotesque  display: characterful, tight, modern
//   Instrument Serif     italic accent words: the editorial contrast
//   Figtree              body: friendly and very readable
//   Geist Mono           labels and numbers (and the pixel fonts already on <body>)
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-lt-display", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-lt-serif", display: "swap" });
const body = Figtree({ subsets: ["latin"], variable: "--font-lt-body", display: "swap" });

// Page metadata (title, description, canonical, Open Graph) is set by each page
// and by app/layout.tsx; this layout only sets the browser chrome colour.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBF9FF",
};

export default function LightLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeScope className={cn(display.variable, serif.variable, body.variable, GeistMono.variable, "sbg-light font-lt-body")}>
      {children}
    </ThemeScope>
  );
}
