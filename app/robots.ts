import type { MetadataRoute } from "next";
import { buildRobots } from "@/lib/seo/routes";
import { getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(getSiteUrl());
}
