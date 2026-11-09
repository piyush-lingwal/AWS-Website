import Link from "next/link";
import { Award, ArrowLeft, FileSearch, QrCode, ShieldCheck, Type } from "lucide-react";
import { VerifyIdForm } from "@/components/verify/VerifyIdForm";

const STEPS = [
  {
    icon: QrCode,
    title: "Find the ID",
    text: "It is printed under the QR code at the bottom left of the certificate.",
  },
  {
    icon: Type,
    title: "Enter it here",
    text: "Type the ID, or paste the verification link printed next to it.",
  },
  {
    icon: FileSearch,
    title: "Read the record",
    text: "See who it was issued to, for which event, and view the original certificate.",
  },
] as const;

export default function CertificateSearchPage() {
  return (
    <div
      className="flex min-h-screen flex-col justify-center px-4 pb-16 pt-28 text-[#F4F4F6] selection:bg-[#6C63FF]/30 sm:px-6 sm:pb-24 sm:pt-32"
      style={{
        background: `
          radial-gradient(750px 380px at 50% 12%, rgba(108,99,255,0.18), transparent 70%),
          radial-gradient(400px 300px at 85% 25%, rgba(255,153,0,0.06), transparent 70%),
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px) 0 0/48px 48px,
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px) 0 0/48px 48px,
          #08080B
        `,
      }}
    >
      <main className="mx-auto w-full max-w-2xl">
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-[rgba(108,99,255,0.25)] bg-[rgba(108,99,255,0.1)] px-3.5 py-1.5 text-[11px] font-medium text-[#A78BFA] sm:text-xs">
            <Award className="h-3.5 w-3.5 shrink-0 text-[#6C63FF]" aria-hidden="true" />
            <span className="truncate">AWS Student Builder Group • Official Registry</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Verify a certificate
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-[#8B8B96] sm:text-base">
            Check that a certificate from AWS Student Builder Group at Tulas University is real, and see the official record behind it.
          </p>
        </header>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-1 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
          <div className="rounded-[calc(2rem-4px)] bg-[#0F0F13] p-5 sm:p-8">
            <VerifyIdForm autoFocus />
          </div>
        </div>

        <section aria-labelledby="how-it-works" className="mt-10 sm:mt-12">
          <h2 id="how-it-works" className="mb-4 text-center font-mono text-[11px] font-medium uppercase tracking-wider text-[#71717A]">
            How it works
          </h2>
          <ol className="grid gap-3 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:block">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#26262D] bg-[#17171C] text-[#A78BFA] sm:mb-3">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    <span className="mr-1.5 font-mono text-xs text-[#6C63FF]">{i + 1}.</span>
                    {title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#8B8B96]">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-[#71717A]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
          Only certificates issued by AWS Student Builder Group appear in this registry.
        </p>

        <p className="mt-6 text-center text-xs">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[#8B8B96] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/60">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to AWS SBG home
          </Link>
        </p>
      </main>
    </div>
  );
}
