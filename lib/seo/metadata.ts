import type { Metadata } from "next";
import { SITE_NAME } from "./site.ts";

export interface PageMetadataInput {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
  /** Image path or absolute URL. Defaults to the generated /opengraph-image. */
  image?: string;
  /** Use `title` as the full title, bypassing the layout template. */
  absoluteTitle?: boolean;
}

const OG_ALT = "AWS Student Builder Group at Tulas University";

/**
 * Next replaces (does not merge) a child's openGraph and twitter objects, so
 * each page must emit complete ones. This builds them in one place.
 */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const { path, title, description, noindex, image = "/opengraph-image", absoluteTitle } = input;
  const images = [{ url: image, width: 1200, height: 630, alt: OG_ALT }];

  const meta: Metadata = {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };

  if (noindex) {
    meta.robots = { index: false, follow: true };
  } else {
    meta.alternates = { canonical: path };
  }
  return meta;
}
