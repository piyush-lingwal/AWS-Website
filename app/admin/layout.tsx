import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { Bricolage_Grotesque, Figtree, Instrument_Serif } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { cn } from "@/lib/utils";
import { getAdminSession } from "@/lib/auth/require-admin";
import { AdminPortalProvider } from "@/components/admin/AdminPortalProvider";
import { AdminShell } from "@/components/admin/AdminShell";
import "./admin-daylight.css";

export const metadata: Metadata = {
  title: "Admin Portal — AWS Student Builder Group",
  robots: { index: false, follow: false },
};

// Admin uses the light "Daylight Cloud" theme, same fonts as app/(light)/layout.tsx.
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-lt-display", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-lt-serif", display: "swap" });
const body = Figtree({ subsets: ["latin"], variable: "--font-lt-body", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBF9FF",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already guarantees a signed-in user. Here we also require
  // that the user is actually an admin (row in public.admin_users).
  const result = await getAdminSession();
  if (!result.ok && result.reason !== "misconfigured") {
    redirect("/login");
  }

  const fonts = cn(display.variable, serif.variable, body.variable, GeistMono.variable, "admin-daylight font-lt-body");

  if (!result.ok) {
    return (
      <div className={cn(fonts, "relative min-h-screen")}>
        <div aria-hidden className="ad-backdrop-fixed" />
        <main className="relative z-10 flex min-h-screen items-center justify-center p-6 text-center">
          <div className="ad-card max-w-md p-8">
            <h1 className="text-xl font-semibold">Admin access is not configured</h1>
            <p className="mt-2 text-sm text-sbg-ink-2">
              The admin_users table is missing or unreachable. Apply the latest
              database migration, then reload.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // The admin shell lives here, inside the provider, so it can show live attendance status.
  return (
    <div className={fonts}>
      <AdminPortalProvider>
        <AdminShell>{children}</AdminShell>
      </AdminPortalProvider>
    </div>
  );
}
