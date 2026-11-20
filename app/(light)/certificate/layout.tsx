import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/certificate",
  title: "Certificate",
  description:
    "Generate your AWS Student Builder Group certificate for sessions and workshops at Tulas University.",
  noindex: true,
});

export default function CertificateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}