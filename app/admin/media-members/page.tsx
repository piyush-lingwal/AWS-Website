"use client";

import { CardsSkeleton } from "@/components/admin/Skeletons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Check, Copy, Search, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";

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

function initials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? email).slice(0, 2);
  return letters.toUpperCase();
}

function joined(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function MediaMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    setPendingId(member.id);
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
    } finally {
      setPendingId(null);
    }
  };

  const deleteMember = async (member: Member) => {
    setPendingId(member.id);
    setError("");
    setCredentials(null);
    try {
      const res = await fetch(`/api/admin/media-users/${member.id}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResult<{ id: string }>;
      if (!res.ok || !json.success) {
        setError(json.error ?? "Could not delete the member.");
        return;
      }
      setConfirmDeleteId(null);
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPendingId(null);
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

  const activeCount = members.filter((m) => m.active).length;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.display_name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [members, query]);

  return (
    <div className="pb-12">
      <main className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="ad-eyebrow">Admin</p>
            <h1 className="mt-1 font-lt-display text-3xl font-semibold tracking-[-0.035em] text-sbg-ink">Media members</h1>
            <p className="mt-2 text-sm leading-relaxed text-sbg-ink-2">
              Accounts for the media team. They sign in at{" "}
              <code className="rounded-md bg-sbg-lilac-100 px-1.5 py-0.5 font-lt-mono text-xs text-sbg-lilac-700">/media/login</code> and can
              never open the admin dashboard.
            </p>
          </div>
          <a href="/admin" className="ad-btn ad-btn-ghost">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to dashboard
          </a>
        </header>

        <dl className="grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="ad-card flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sbg-lilac-100 text-sbg-lilac-700" aria-hidden="true">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <dt className="text-xs text-sbg-ink-2">Members</dt>
              <dd className="font-lt-display text-xl font-semibold text-sbg-ink">{loading ? "–" : members.length}</dd>
            </div>
          </div>
          <div className="ad-card flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sbg-lilac-100 text-sbg-lilac-700" aria-hidden="true">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <dt className="text-xs text-sbg-ink-2">Active</dt>
              <dd className="font-lt-display text-xl font-semibold text-sbg-ink">{loading ? "–" : activeCount}</dd>
            </div>
          </div>
        </dl>

        {error && (
          <p role="alert" className="ad-chip-danger flex items-start gap-2 rounded-2xl border border-red-700/20 p-4 text-sm font-medium">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <AnimatePresence initial={false}>
          {credentials && (
            <motion.div
              key="credentials"
              role="status"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ad-card ad-card-tint-lilac space-y-4 rounded-[28px] p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-sbg-lilac-700" aria-hidden="true">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-lt-display text-base font-semibold text-sbg-ink">
                    {credentials.reason === "created" ? "Account created" : "Password reset"}
                  </p>
                  <p className="text-sm text-sbg-ink-2">Share these sign-in details with the member securely.</p>
                </div>
              </div>
              <dl className="grid gap-3 rounded-2xl border border-sbg-ink/10 bg-white/80 p-4 text-sm text-sbg-ink">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <dt className="w-24 text-xs font-medium uppercase tracking-wide text-sbg-ink-2">Email</dt>
                  <dd className="break-all">{credentials.email}</dd>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <dt className="w-24 text-xs font-medium uppercase tracking-wide text-sbg-ink-2">Password</dt>
                  <dd className="select-all break-all rounded-lg bg-sbg-lilac-50 px-2 py-1 font-lt-mono">{credentials.password}</dd>
                  <button type="button" onClick={copyPassword} className="ad-btn ad-btn-ghost sm:ml-auto">
                    {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    <span aria-live="polite">{copied ? "Copied" : "Copy password"}</span>
                  </button>
                </div>
              </dl>
              <p className="text-xs leading-relaxed text-sbg-ink-2">
                This password is temporary: the member must choose their own at first sign-in. It is shown only
                once and is not stored. If it is lost, reset it.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <section aria-labelledby="create-heading" className="ad-card ad-card-tint-lilac rounded-[28px] p-5 sm:p-6 lg:sticky lg:top-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-sbg-lilac-700" aria-hidden="true">
                <UserPlus className="h-5 w-5" />
              </span>
              <div>
                <h2 id="create-heading" className="font-lt-display text-lg font-semibold tracking-[-0.03em] text-sbg-ink">
                  Add a member
                </h2>
                <p className="text-xs text-sbg-ink-2">A temporary password is generated for you.</p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="mt-5 grid gap-4">
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
              <button type="submit" disabled={submitting} className="ad-btn ad-btn-primary justify-center">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                {submitting ? "Creating…" : "Create account"}
              </button>
            </form>
          </section>

          <section aria-labelledby="members-heading" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="members-heading" className="font-lt-display text-lg font-semibold tracking-[-0.03em] text-sbg-ink">
                Current members {members.length > 0 && <span className="text-sbg-ink-3">({members.length})</span>}
              </h2>
              {members.length > 4 && (
                <label className="relative block w-full sm:w-64">
                  <span className="sr-only">Search members by name or email</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sbg-ink-3" aria-hidden="true" />
                  <input
                    type="search"
                    className={`${inputClass} pl-9`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search members"
                  />
                </label>
              )}
            </div>

            {loading ? (
              <CardsSkeleton count={3} label="Loading media members" />
            ) : members.length === 0 ? (
              <div className="ad-card flex flex-col items-center gap-3 rounded-[28px] px-6 py-12 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sbg-lilac-100 text-sbg-lilac-700" aria-hidden="true">
                  <Users className="h-7 w-7" />
                </span>
                <p className="font-lt-display text-base font-semibold text-sbg-ink">No media members yet</p>
                <p className="max-w-xs text-sm text-sbg-ink-2">Add the first member with the form and share the temporary password they receive.</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="ad-card rounded-2xl p-6 text-sm text-sbg-ink-2">No members match “{query}”.</p>
            ) : (
              <ul className="ad-card divide-y divide-sbg-ink/[0.06] overflow-hidden rounded-[28px]">
                {filtered.map((m) => (
                  <li
                    key={m.id}
                    className={`flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-sbg-lilac-50 ${m.active ? "" : "bg-sbg-ink/[0.02]"}`}
                  >
                    <div className="flex min-w-0 flex-1 basis-[12rem] items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                          m.active ? "bg-sbg-lilac-100 text-sbg-lilac-700" : "bg-sbg-ink/[0.06] text-sbg-ink-3"
                        }`}
                      >
                        {initials(m.display_name, m.email)}
                      </span>
                      <div className="min-w-0">
                        <p className={`truncate font-medium ${m.active ? "text-sbg-ink" : "text-sbg-ink-2"}`}>{m.display_name}</p>
                        <p className="truncate text-xs text-sbg-ink-2">
                          {m.email}
                          {joined(m.created_at) && <span className="text-sbg-ink-3"> · Added {joined(m.created_at)}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                      <span className={`ad-chip ${m.active ? "ad-chip-ok" : ""} !px-2 !py-0.5 !text-[11px]`}>{m.active ? "Active" : "Disabled"}</span>
                      <button
                        type="button"
                        disabled={pendingId === m.id}
                        onClick={() => patchMember(m, { active: !m.active })}
                        className="ad-btn ad-btn-ghost"
                        aria-label={`${m.active ? "Disable" : "Enable"} ${m.display_name}`}
                      >
                        {m.active ? "Disable" : "Enable"}
                      </button>                      {confirmDeleteId === m.id ? (
                        <div role="group" aria-label={`Confirm deleting ${m.display_name}`} className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-sbg-ink">
                            Delete {m.display_name}&apos;s account? This cannot be undone.
                          </span>
                          <button
                            type="button"
                            disabled={pendingId === m.id}
                            onClick={() => deleteMember(m)}
                            className="ad-btn ad-btn-danger"
                          >
                            {pendingId === m.id ? "Deleting…" : "Confirm"}
                          </button>
                          <button
                            type="button"
                            disabled={pendingId === m.id}
                            onClick={() => setConfirmDeleteId(null)}
                            className="ad-btn ad-btn-ghost"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={pendingId === m.id}
                          onClick={() => setConfirmDeleteId(m.id)}
                          className="ad-btn ad-btn-danger"
                          aria-label={`Delete ${m.display_name}'s account`}
                          title="Delete member"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
