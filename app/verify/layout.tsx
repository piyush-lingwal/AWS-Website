import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Certificate — AWS Student Builder Group",
  description:
    "Official credential verification portal for AWS Student Builder Group at Tula's University. Verify authenticity of session participation and workshop certificates.",
  keywords: [
    "AWS SBG",
    "Certificate Verification",
    "Tula's University",
    "Credentials",
    "AWS",
  ],
  openGraph: {
    title: "Verify Certificate — AWS Student Builder Group",
    description:
      "Official certificate verification system for AWS Student Builder Group.",
    type: "website",
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
