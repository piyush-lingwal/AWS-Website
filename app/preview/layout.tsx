import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, Instrument_Serif } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { cn } from "@/lib/utils";
import "./preview.css";

// "Daylight Cloud" typography (DESIGN.md, section 4):
//   Bricolage Grotesque  display: characterful, tight, modern
//   Instrument Serif     italic accent words: the editorial contrast
//   Figtree              body: friendly and very readable
//   Geist Mono           labels and numbers (and the pixel fonts already on <body>)
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-lt-display", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-lt-serif", display: "swap" });
const body = Figtree({ subsets: ["latin"], variable: "--font-lt-body", display: "swap" });

export const metadata: Metadata = {
  title: "Design preview — Daylight Cloud",
  description: "A preview of the light-theme redesign of the AWS Student Builder Group website.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBF9FF",
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(display.variable, serif.variable, body.variable, GeistMono.variable, "sbg-light font-lt-body")}>
      {children}
    </div>
  );
}
