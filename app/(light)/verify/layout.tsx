import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/verify",
  title: "Verify a Certificate",
  description:
    "Check that a certificate issued by AWS Student Builder Group at Tulas University is genuine by entering its certificate ID.",
});

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}