"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { extractCertificateId } from "@/lib/certificates/verify-view";

/**
 * The "enter a Certificate ID" form, used on /verify and on the not-found result.
 * Accepts a bare ID or a whole verification link pasted from a PDF or QR scan.
 */
export function VerifyIdForm({
  initialValue = "",
  autoFocus = false,
  submitLabel = "Verify Certificate",
}: {
  initialValue?: string;
  autoFocus?: boolean;
  submitLabel?: string;
}) {
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError("Enter the Certificate ID printed on the certificate.");
      return;
    }
    const id = extractCertificateId(value);
    if (!id) {
      setError("That is not a valid ID. It looks like AWS-SBG-2026-GKTZ4W.");
      return;
    }
    setBusy(true);
    router.push(`/verify/${id}`);
  };

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor={inputId} className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-wider text-[#8B8B96]">
        Certificate ID
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8B96]" aria-hidden="true" />
          <input
            id={inputId}
            type="text"
            inputMode="text"
            autoFocus={autoFocus}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            placeholder="AWS-SBG-2026-GKTZ4W"
            className="h-12 w-full rounded-xl border border-[#26262D] bg-[#17171C] pl-11 pr-4 font-mono text-sm tracking-wider text-white placeholder-[#52525B] transition-colors focus:border-[#6C63FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/40"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#6C63FF] px-5 text-sm font-semibold text-white shadow-lg shadow-[#6C63FF]/20 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
              <span>Checking…</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>{submitLabel}</span>
              <ArrowRight className="h-4 w-4 opacity-70" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-[#71717A]">
        You can also paste the verification link printed under the QR code.
      </p>
      {error && (
        <p id={errorId} role="alert" className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
