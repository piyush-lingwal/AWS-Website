import React from "react";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    name: "AWS Student Builders Group at Tulas University",
    alternateName: ["AWS SBG Tulas", "AWS Cloud Club Tulas University"],
    url: "https://aws-sbg-tulas.vercel.app",
    logo: "https://aws-sbg-tulas.vercel.app/icon.png",
    description:
      "Official AWS Student Builders Group at Tulas University, Dehradun. A student community focused on AWS cloud computing, technical workshops, and hackathons.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dehradun",
      addressRegion: "Uttarakhand",
      addressCountry: "IN",
    },
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "Tulas University",
      location: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dehradun",
          addressRegion: "Uttarakhand",
          addressCountry: "IN",
        },
      },
    },
    sameAs: [
      "https://github.com/Piyush-codez0/AWS-SBG-Website", // Placeholder, user can update with actual social links
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AWS Student Builders Group at Tulas University",
    alternateName: ["AWS SBG Tulas", "AWS Cloud Club Dehradun"],
    url: "https://aws-sbg-tulas.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://aws-sbg-tulas.vercel.app/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
