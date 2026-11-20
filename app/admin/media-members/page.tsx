"use client";

import { CardsSkeleton } from "@/components/admin/Skeletons";
import { useCallback, useEffect, useState } from "react";
import { Copy, KeyRound, UserPlus } from "lucide-react";

interface Member {
  id: string;
  email: string;
  display_name: string;
  active: boolean;
  created_at: string;
}

interface Credentials {
  email: string;
  password: string;
  reason: "created" | "reset";
}

interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const inputClass = "ad-input";

export default function MediaMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/media-users", { cache: "no-store" });
      const json = (await res.json()) as ApiResult<Member[]>;
      if (!res.ok || !json.success) {
        setError(
          res.status === 403
            ? "Only a super admin can manage media members."
            : json.error ?? "Failed to load media members."
        );
        return;
      }
      setMembers(json.data ?? []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setCredentials(null);
    try {
      const res = await fetch("/api/admin/media-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName }),
      });
      const json = (await res.json()) as ApiResult<{ email: string; temporaryPassword: string }>;
      if (!res.ok || !json.success || !json.data) {
        setError(json.error ?? "Could not create the account.");
        return;
      }
      setCredentials({ email: json.data.email, password: json.data.temporaryPassword, reason: "created" });
      setEmail("");
      setDisplayName("");
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const patchMember = async (member: Member, body: { active?: boolean; resetPassword?: boolean }) => {
    setError("");
    setCredentials(null);
    try {
      const res = await fetch(`/api/admin/media-users/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as ApiResult<{ temporaryPassword?: string }>;
      if (!res.ok || !json.success) {
        setError(json.error ?? "Could not update the member.");
        return;
      }
      if (json.data?.temporaryPassword) {
        setCredentials({ email: member.email, password: json.data.temporaryPassword, reason: "reset" });
      }
      await load();
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const copyPassword = async () => {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(credentials.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the password is visible on screen to copy by hand */
    }
  };

  return (
    <div className="pb-12">
      <main className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="ad-eyebrow">Admin</p>
            <h1 className="mt-1 font-lt-display text-2xl font-semibold tracking-[-0.035em] text-sbg-ink">Media members</h1>
            <p className="mt-1 text-sm text-sbg-ink-2">
              Accounts for the media team. They sign in at{" "}
              <code className="rounded-md bg-sbg-lilac-100 px-1.5 py-0.5 font-lt-mono text-xs text-sbg-lilac-700">/media/login</code> and can
              never open the admin dashboard.
            </p>
          </div>
          <a href="/admin" className="ad-btn ad-btn-ghost">
            ← Back to dashboard
          </a>
        </header>

        {error && (
          <p role="alert" className="ad-chip-danger rounded-2xl border border-red-700/20 p-4 text-sm font-medium">
            {error}
          </p>
        )}

        {credentials && (
          <div role="status" className="ad-card ad-card-tint-lilac space-y-3 p-5">
            <p className="text-sm font-medium text-sbg-ink">
              {credentials.reason === "created" ? "Account created." : "Password reset."} Share these
              details securely.
            </p>
            <dl className="grid gap-1 text-sm text-sbg-ink">
              <div className="flex gap-2"><dt className="w-24 text-sbg-ink-2">Email</dt><dd>{credentials.email}</dd></div>
              <div className="flex flex-wrap items-center gap-2">
                <dt className="w-24 text-sbg-ink-2">Password</dt>
                <dd className="font-lt-mono">{credentials.password}</dd>
                <button
                  onClick={copyPassword}
                  className="ad-btn ad-btn-ghost ml-1"
                >
                  <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </dl>
            <p className="text-xs text-sbg-ink-2">
              This password is temporary: the member must choose their own at first sign-in. It is shown only
              once and is not stored. If it is lost, reset it.
            </p>
          </div>
        )}

        <form onSubmit={handleCreate} className="ad-card grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="ad-label grid gap-1.5">
            Full name
            <input
              className={inputClass}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Aarav Sharma"
              required
              minLength={2}
              maxLength={80}
            />
          </label>
          <label className="ad-label grid gap-1.5">
            Email
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              required
              autoComplete="off"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="ad-btn ad-btn-primary"
          >
            <UserPlus className="h-4 w-4" />
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>

        <section aria-labelledby="members-heading" className="space-y-3">
          <h2 id="members-heading" className="font-lt-display text-lg font-semibold tracking-[-0.03em] text-sbg-ink">
            Current members {members.length > 0 && <span className="text-sbg-ink-3">({members.length})</span>}
          </h2>

          {loading ? (
            <CardsSkeleton count={3} label="Loading media members" />
          ) : members.length === 0 ? (
            <p className="ad-card p-6 text-sm text-sbg-ink-2">
              No media members yet.
            </p>
          ) : (
            <ul className="ad-card divide-y divide-sbg-ink/[0.06] overflow-hidden">
              {members.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-sbg-lilac-50">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sbg-ink">{m.display_name}</p>
                    <p className="truncate text-xs text-sbg-ink-2">{m.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`ad-chip ${m.active ? "ad-chip-ok" : ""}`}>
                      {m.active ? "Active" : "Disabled"}
                    </span>
                    <button
                      onClick={() => patchMember(m, { resetPassword: true })}
                      className="ad-btn ad-btn-ghost"
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Reset password
                    </button>
                    <button
                      onClick={() => patchMember(m, { active: !m.active })}
                      className="ad-btn ad-btn-ghost"
                    >
                      {m.active ? "Disable" : "Enable"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
