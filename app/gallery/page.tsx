import type { Metadata } from "next";
import { Gallery } from "@/components/features/gallery/Gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos and moments from AWS Student Builder Group workshops, hackathons, study jams, and community events at Tulas University.",
  alternates: {
    canonical: "/gallery",
  },
};

export default function GalleryPage() {
  return <Gallery />;
}
