import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance Portal — AWS Student Builder Group",
  description:
    "Official attendance verification and instant certificate generation portal for AWS Student Builder Group sessions and workshops at Tulas University.",
  keywords: [
    "AWS SBG",
    "Attendance",
    "Certificate",
    "Tulas University",
    "Student Builder Group",
  ],
  openGraph: {
    title: "Attendance Portal — AWS Student Builder Group",
    description:
      "Mark your attendance and generate your official AWS Student Builder Group certificate.",
    type: "website",
  },
};

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
