import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AWS Student Builders Group Tulas University",
    short_name: "AWS SBG Tulas",
    description:
      "Official AWS Student Builders Group at Tulas University.",

    start_url: "/",

    display: "standalone",

    background_color: "#09090B",

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