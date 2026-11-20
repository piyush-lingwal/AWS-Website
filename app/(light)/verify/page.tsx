import Link from "next/link";
import { Award, ArrowLeft, FileSearch, QrCode, ShieldCheck, Type } from "lucide-react";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
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
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <main>
          <section data-tone="dawn" className="px-[var(--gutter)] pb-16 pt-36 sm:pb-24">
            <div className="mx-auto w-full max-w-2xl">
              <header className="mb-8 text-center sm:mb-10">
                <p className="t-eyebrow mb-4 inline-flex max-w-full items-center justify-center gap-2">
                  <Award className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>AWS Student Builder Group • Official Registry</span>
                </p>
                <h1 className="t-display mb-4 text-[clamp(40px,7vw,72px)] text-sbg-ink">
                  Verify a <span className="t-serif">certificate</span>
                </h1>
                <p className="t-lead mx-auto max-w-md">
                  Check that a certificate from AWS Student Builder Group at Tulas University is real, and see the official record behind it.
                </p>
              </header>

              <div className="surface rounded-[28px] p-5 sm:p-8">
                <VerifyIdForm autoFocus />
              </div>

              <section aria-labelledby="how-it-works" className="mt-10 sm:mt-12">
                <h2 id="how-it-works" className="t-eyebrow mb-4 text-center">
                  How it works
                </h2>
                <ol className="grid gap-3 sm:grid-cols-3">
                  {STEPS.map(({ icon: Icon, title, text }, i) => (
                    <li key={title} className="surface flex gap-3 rounded-[24px] p-4 sm:block">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sbg-lilac-100 text-sbg-lilac-700 sm:mb-3">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-sbg-ink">
                          <span className="mr-1.5 font-lt-mono text-xs text-sbg-lilac-700">{i + 1}.</span>
                          {title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-sbg-ink-2">{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-sbg-ink-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                Only certificates issued by AWS Student Builder Group appear in this registry.
              </p>

              <p className="mt-6 text-center text-xs">
                <Link href="/" className="inline-flex items-center gap-1.5 text-sbg-ink-2 transition-colors hover:text-sbg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sbg-lilac-600">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Back to AWS SBG home
                </Link>
              </p>
            </div>
          </section>
        </main>
        <DesignFooter />
      </div>
    </>
  );
}
