import { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AWS Student Builder Group Tulas University",
    short_name: "AWS SBG Tulas",
    description: SITE_DESCRIPTION,

    start_url: "/",

    display: "standalone",

    background_color: "#FBF9FF",

    theme_color: "#7C3AED",

    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}