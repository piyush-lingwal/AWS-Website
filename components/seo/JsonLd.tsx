import React from "react";
import { organizationNode, serializeJsonLd, websiteNode } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/site";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return <JsonLd data={organizationNode(getSiteUrl())} />;
}

export function WebSiteJsonLd() {
  return <JsonLd data={websiteNode(getSiteUrl())} />;
}
