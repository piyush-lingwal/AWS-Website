"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Link2, Share2 } from "lucide-react";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and non-secure origins: fall back to a hidden textarea.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

const BTN =
  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/60 active:scale-[0.98] sm:h-10";

/** Download / copy / share actions for a verified certificate. */
export function VerifyActions({ certificateId, eventName }: { certificateId: string; eventName: string }) {
  const [copied, setCopied] = useState<"link" | null>(null);
  const [canShare, setCanShare] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const pageUrl = () => `${window.location.origin}/verify/${certificateId}`;

  const flash = () => {
    setCopied("link");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap">
      <a
        href={`/api/certificates/${certificateId}`}
        download={`${certificateId}.pdf`}
        className={`${BTN} bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-md shadow-[#6C63FF]/20 hover:brightness-110`}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        <span>Download PDF</span>
      </a>
      <button
        type="button"
        onClick={async () => {
          if (await copyText(pageUrl())) flash();
        }}
        className={`${BTN} border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]`}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
        <span>{copied ? "Link copied" : "Copy link"}</span>
      </button>
      {canShare && (
        <button
          type="button"
          onClick={() => {
            navigator
              .share({ title: `Verified certificate · ${eventName}`, text: `Certificate ${certificateId}`, url: pageUrl() })
              .catch(() => undefined); // The person closed the share sheet.
          }}
          className={`${BTN} border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]`}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          <span>Share</span>
        </button>
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? "Verification link copied to the clipboard" : ""}
      </span>
    </div>
  );
}

/** A certificate ID that copies itself on tap. */
export function CopyId({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(value)) {
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        }
      }}
      title="Copy Certificate ID"
      aria-label={done ? "Certificate ID copied" : `Copy Certificate ID ${value}`}
      className="group inline-flex max-w-full cursor-pointer items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/60"
    >
      <span className="min-w-0 break-all font-mono text-sm font-bold text-[#A78BFA]">{value}</span>
      {done ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-[#71717A] transition-colors group-hover:text-white" aria-hidden="true" />
      )}
    </button>
  );
}
