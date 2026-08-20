import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import {
  GeistPixelSquare,
  GeistPixelGrid,
  GeistPixelCircle,
  GeistPixelTriangle,
  GeistPixelLine,
} from "geist/font/pixel";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import "./globals.css";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://awstulas.org";
const siteName =
  "AWS Student Builder Group at Tulas University | Official AWS Cloud Community";
const siteDescription =
  "Official website of AWS Student Builder Group at Tulas University, Dehradun. Join workshops, cloud events, hackathons, AWS learning programs, technical communities, and student innovation initiatives.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
    { media: "(prefers-color-scheme: light)", color: "#09090B" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: siteName,
    template: "%s | AWS Student Builder Group — Tulas University",
  },

  description: siteDescription,

  keywords: [
    "AWS Student Builder Group",
    "AWS SBG",
    "AWS SBG Tulas",
    "AWS SBG Dehradun",
    "AWS Student Builder Group Tulas University",
    "AWS Cloud Club",
    "Cloud Computing",
    "AWS Community",
    "Student Builder Group",
    "Tulas University",
    "Dehradun",
    "AWS Workshops",
    "AWS Events",
    "AWS Cloud",
    "AWS Certifications",
    "Student Developer Community",
    "Hackathons",
    "Cloud Learning",
    "AWS Student Community Dehradun",
  ],

  applicationName: "AWS Student Builder Group",
  creator: "AWS Student Builder Group at Tulas University",
  publisher: "AWS Student Builder Group",
  category: "Education",
  referrer: "origin-when-cross-origin",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    siteName: "AWS Student Builder Group",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "AWS Student Builder Group at Tulas University",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/opengraph-image.png"],
  },

  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", type: "image/png" },
    ],
  },

  manifest: "/manifest.webmanifest",

  // verification: {
  //   google: "ADD_YOUR_GOOGLE_SEARCH_CONSOLE_CODE_HERE",
  // },

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "AWS SBG",
  },
};

import SmoothScroll from "@/components/layout/SmoothScroll";
import { MotionConfigWrapper } from "@/components/layout/MotionConfigWrapper";
import { Toaster } from "sonner";
import { ChatbotMascot } from "@/components/layout/ChatbotMascot";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(poppins.variable, "font-sans")}>
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body
        suppressHydrationWarning
        className={`${GeistPixelSquare.variable} ${GeistPixelGrid.variable} ${GeistPixelCircle.variable} ${GeistPixelTriangle.variable} ${GeistPixelLine.variable}`}
      >
        <Toaster richColors theme="dark" position="top-right" />
        <MotionConfigWrapper>
          <SmoothScroll>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </SmoothScroll>
        </MotionConfigWrapper>
        <ChatbotMascot />
      </body>
    </html>
  );
}
