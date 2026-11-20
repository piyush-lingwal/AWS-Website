"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import Image from "next/image";
import Link from "next/link";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
const FIELD =
  "h-12 w-full rounded-2xl border border-sbg-ink/15 bg-white px-4 text-base text-sbg-ink placeholder:text-sbg-ink-3 transition-all focus:border-sbg-lilac-600 focus:outline-none focus:ring-2 focus:ring-sbg-lilac-600";

/** Only ever send people back to somewhere inside the media portal. */
function safeRedirectTarget(): string {
  const target = new URLSearchParams(window.location.search).get("redirect");
  if (target && target.startsWith("/media") && !target.startsWith("//") && !target.startsWith("/media/login")) {
    return target;
  }
  return "/media";
}

export default function MediaLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError("Invalid email or password.");
        return;
      }

      // Signing in is not enough: the account must have media access.
      const res = await fetch("/api/media/me", { cache: "no-store" });
      if (!res.ok) {
        await supabase.auth.signOut();
        setError(
          res.status === 403
            ? "This account does not have media portal access. Ask a super admin to create your media account."
            : "Could not verify your access. Please try again."
        );
        return;
      }

      // Still on the temporary password: go straight to the form that replaces it.
      const me = await res.json().catch(() => null);
      router.push(me?.data?.mustChangePassword ? "/media/change-password" : safeRedirectTarget());
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollAtmosphere />
      <main
        data-tone="dawn"
        className="relative z-10 flex min-h-screen items-center justify-center px-[var(--gutter)] py-12"
      >
        <div className="w-full max-w-sm">
          <Link
            href="/"
            aria-label="AWS Student Builder Group, home"
            className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-sbg-on-ink"
          >
            <Image src="/logos/SBG_logo.png" alt="" width={28} height={28} className="h-7 w-7" />
          </Link>
          <div className="surface rounded-[28px] p-6 sm:p-8">
            <p className="t-eyebrow mb-3">Staff</p>
            <h1 className="t-display mb-2 text-[clamp(34px,9vw,44px)] text-sbg-ink">
              Media <span className="t-serif">portal</span>
            </h1>
            <p className="mb-6 text-sm text-sbg-ink-2">
              Sign in to upload and manage event photos and videos
            </p>
            <form id="media-login-form" onSubmit={handleLogin}>
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-sbg-ink">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required
                    autoComplete="email"
                    className={FIELD}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-sm font-medium text-sbg-ink">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                    autoComplete="current-password"
                    className={FIELD}
                  />
                </div>
                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700"
                  >
                    {error}
                  </p>
                )}
              </div>
            </form>
            <button
              type="submit"
              form="media-login-form"
              disabled={loading}
              className="btn btn-primary mt-6 h-12 w-full cursor-pointer justify-center disabled:cursor-wait disabled:opacity-80"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}