import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/register",
  title: "Join the Builder Team",
  description:
    "Apply to join the AWS Student Builder Group at Tulas University: add your contact and academic details, choose your wings and upload your resume.",
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}