"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Mail } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FAQS = [
  {
    q: "Who can apply to a Builder Wing?",
    a: "Any student at Tulas University — any branch, any year (1st to 4th). We value curiosity and enthusiasm over prior experience. If you're excited about AWS and cloud, you belong here.",
  },
  {
    q: "Do I need AWS knowledge or certifications?",
    a: "No prior certification is required. We provide AWS lab credits, learning resources, and peer mentorship once you join. We build you up from scratch.",
  },
  {
    q: "Can I apply for multiple wings?",
    a: "Yes — list up to 2 wings in your application. We'll evaluate your best fit and discuss it during the orientation session.",
  },
  {
    q: "How much time does it require per week?",
    a: "Roughly 3–5 hours per week, mostly on weekends or around event sprints. We respect your academics — this is built to be flexible and manageable.",
  },
  {
    q: "What do I get as a Core Team Member?",
    a: "An official AWS SBG member badge, community merchandise, AWS lab credits, a leadership certificate, mentorship from AWS experts, and priority access to regional cloud conferences.",
  },
  {
    q: "When will the Core Team be revealed?",
    a: "The official 2026 Core Team Reveal will happen once selections are complete. Submit your application early to secure your wing.",
  },
];

export function TeamFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const faqListRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Header reveal
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 88%",
            once: true,
          },
        }
      );
    }

    // 2. FAQ list stagger
    if (faqListRef.current) {
      const items = faqListRef.current.querySelectorAll(".gsap-faq-item");
      gsap.fromTo(
        items,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: faqListRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
    return () => clearTimeout(timer);
  }, { scope: sectionRef });

  // Recalculate trigger bounds when accordion items open or close
  React.useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 320);
    return () => clearTimeout(timer);
  }, [openIdx]);

  return (
    <section ref={sectionRef} data-tone="dawn" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1240px] px-[var(--gutter)] py-24 md:py-32">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-20">

          {/* Left sticky header (Desktop) / Top header (Mobile) */}
          <div ref={headerRef} className="lg:sticky lg:top-28">
            <p className="t-eyebrow flex items-center gap-3">
              <span className="t-pixel text-sbg-accent">05</span>
              <span className="h-px w-10 bg-sbg-lilac-300" />
              Got Questions?
            </p>

            <h2 className="t-display mb-5 mt-5 text-[clamp(34px,4.6vw,60px)] text-sbg-ink">
              Frequently <br className="hidden sm:inline" />
              <span className="t-serif text-sbg-accent">Asked Questions.</span>
            </h2>

            <p className="t-lead max-w-sm">
              Everything you need to know about joining the AWS Student Builder Group.
            </p>

            {/* Desktop Contact Card */}
            <div className="surface mt-8 hidden rounded-[24px] p-6 lg:block">
              <p className="t-eyebrow mb-2">Have a different question?</p>
              <a
                href="mailto:awssbg@tulas.edu.in"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-sbg-accent-strong transition-colors hover:text-sbg-accent"
              >
                <Mail className="h-4 w-4" />
                <span>awssbg@tulas.edu.in →</span>
              </a>
            </div>
          </div>

          {/* Right: FAQ accordion with GSAP Stagger */}
          <div ref={faqListRef} className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className={`gsap-faq-item surface overflow-hidden rounded-[22px] transition-all duration-300 ${
                    isOpen ? "!bg-[var(--tile-bg)] !border-sbg-lilac-300 shadow-lg" : "hover:!bg-[var(--wash-90)]"
                  }`}
                  style={isOpen ? { backgroundImage: "linear-gradient(155deg, var(--card-lilac) 0%, var(--wash-90) 58%)" } : undefined}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="flex w-full select-none items-center justify-between gap-4 p-5 text-left sm:p-6"
                  >
                    <span className="t-display text-[17px] leading-snug text-sbg-ink sm:text-[19px]">
                      {faq.q}
                    </span>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? "bg-sbg-lilac-600 text-white" : "bg-sbg-lilac-100 text-sbg-accent-strong"}`}>
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="mx-5 border-t border-sbg-lilac-200 pb-5 pt-4 text-[15px] leading-relaxed text-sbg-ink-2 sm:mx-6 sm:pb-6">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Mobile Contact Card */}
            <div className="gsap-faq-item surface mt-6 rounded-[22px] p-5 text-center lg:hidden">
              <p className="t-eyebrow mb-2">Have a different question?</p>
              <a
                href="mailto:awssbg@tulas.edu.in"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-sbg-accent-strong transition-colors hover:text-sbg-accent"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>awssbg@tulas.edu.in →</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}