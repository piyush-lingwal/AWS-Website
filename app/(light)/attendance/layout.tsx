import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/attendance",
  title: "Attendance",
  description:
    "Mark your attendance and generate your AWS Student Builder Group certificate for sessions and workshops at Tulas University.",
  noindex: true,
});

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}