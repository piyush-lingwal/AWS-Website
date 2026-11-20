import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPortalSession } from "@/lib/auth/require-role";
import { isRoleAllowed, MEDIA_PORTAL_ROLES } from "@/lib/auth/roles";
import Image from "next/image";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { ChangePasswordForm } from "@/components/features/media/ChangePasswordForm";

// Signed-in only. Lives OUTSIDE the (portal) group on purpose: the portal layout
// sends members who still have a temporary password HERE, so this page must not
// use that layout (it would redirect to itself forever).
export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const result = await getPortalSession();
  if (!result.ok || !isRoleAllowed(result.session.role, MEDIA_PORTAL_ROLES)) {
    redirect("/media/login");
  }
  const { user, mustChangePassword } = result.session;

  return (
    <>
      <ScrollAtmosphere />
      <main
        data-tone="dawn"
        className="relative z-10 flex min-h-screen items-center justify-center px-[var(--gutter)] py-12"
      >
        <div className="w-full max-w-md">
          <div className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-sbg-on-ink">
            <Image src="/logos/SBG_logo.png" alt="" width={28} height={28} className="h-7 w-7" />
          </div>
          <div className="surface space-y-5 rounded-[28px] p-6 sm:p-8">
            <header>
              <p className="t-eyebrow mb-3">AWS SBG · Media Portal</p>
              <h1 className="t-display text-[clamp(30px,8vw,40px)] text-sbg-ink">
                {mustChangePassword ? (
                  <>Choose your <span className="t-serif">password</span></>
                ) : (
                  <>Change <span className="t-serif">password</span></>
                )}
              </h1>
              <p className="mt-2 text-sm text-sbg-ink-2">
                {mustChangePassword
                  ? "Your account was set up with a temporary password. Choose your own to continue. Only you should know it."
                  : `Signed in as ${user.email}. Other devices will be signed out when you change it.`}
              </p>
            </header>
            <ChangePasswordForm email={user.email ?? null} forced={mustChangePassword} />
            {!mustChangePassword && (
              <Link href="/media" className="inline-flex items-center gap-1.5 text-xs text-sbg-ink-2 hover:text-sbg-ink">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to the portal
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
}