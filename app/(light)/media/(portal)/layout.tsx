import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/auth/require-role";
import { isRoleAllowed, MEDIA_PORTAL_ROLES, type PortalRole } from "@/lib/auth/roles";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import Image from "next/image";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { SignOutButton } from "@/components/features/media/SignOutButton";

const ROLE_LABEL: Record<PortalRole, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  media_manager: "Media team",
};

// Everything inside this route group requires a signed-in user who holds a
// media-portal role. /media/login lives OUTSIDE this group on purpose, so it
// stays public and cannot cause a redirect loop.
export default async function MediaPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getPortalSession();

  if (!result.ok && result.reason === "misconfigured") {
    return (
      <>
        <ScrollAtmosphere />
        <main
          data-tone="dawn"
          className="relative z-10 flex min-h-screen items-center justify-center p-6 text-center"
        >
          <div className="surface max-w-md rounded-[28px] p-6 sm:p-8">
            <h1 className="text-xl font-semibold text-sbg-ink">Media portal is not configured</h1>
            <p className="mt-2 text-sm text-sbg-ink-2">
              The media_members table is missing or unreachable. Apply the latest
              database migration, then reload.
            </p>
          </div>
        </main>
      </>
    );
  }
  if (!result.ok || !isRoleAllowed(result.session.role, MEDIA_PORTAL_ROLES)) {
    redirect("/media/login");
  }

  // Temporary password still in use: the portal is closed until it is changed.
  if (result.session.mustChangePassword) redirect("/media/change-password");

  const { user, role, displayName } = result.session;

  return (
    <>
      <ScrollAtmosphere />
      <div className="relative z-10 min-h-screen pb-24">
        <header className="nav-glass sticky top-0 z-40">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Link
                href="/media"
                aria-label="Media portal home"
                className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sbg-on-ink"
              >
                <Image src="/logos/SBG_logo.png" alt="" width={28} height={28} className="h-7 w-7" />
              </Link>
              <div className="min-w-0">
                <p className="t-eyebrow">AWS SBG · Media Portal</p>
                <h1 className="truncate text-lg font-semibold leading-tight text-sbg-ink sm:text-xl">
                  {displayName ?? user.email}
                </h1>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-sbg-ink-2">
                  <span className="truncate">{user.email}</span>
                  <span className="inline-flex items-center rounded-full bg-sbg-lilac-100 px-2 py-0.5 text-[11px] font-semibold text-sbg-lilac-700">
                    {ROLE_LABEL[role]}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/media/change-password" className="btn btn-ghost h-10 gap-2 px-3.5 text-xs">
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Change password</span>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl space-y-8 px-4 pt-8 sm:px-6 sm:pt-10">{children}</main>
      </div>
    </>
  );
}