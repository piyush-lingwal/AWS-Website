"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";

const FIELD =
  "h-12 w-full rounded-2xl border border-sbg-ink/15 bg-white px-4 text-base text-sbg-ink placeholder:text-sbg-ink-3 transition-all focus:border-sbg-lilac-600 focus:outline-none focus:ring-2 focus:ring-sbg-lilac-600";

export default function LoginPage() {
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
        setError(authError.message);
        return;
      }

      router.push("/admin");
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
              Admin <span className="t-serif">login</span>
            </h1>
            <p className="mb-6 text-sm text-sbg-ink-2">
              Sign in to access the AWS SBG Admin Portal
            </p>
            <form id="login-form" onSubmit={handleLogin}>
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-sbg-ink">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@tulas.edu.in"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required
                    autoComplete="email"
                    className={FIELD}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-sm font-medium text-sbg-ink">
                    Password
                  </label>
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
              form="login-form"
              disabled={loading}
              className="btn btn-primary mt-6 h-12 w-full cursor-pointer justify-center disabled:cursor-wait disabled:opacity-80"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
