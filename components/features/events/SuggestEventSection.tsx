"use client";

import React, { useState } from "react";
import { Reveal } from "@/components/design/Reveal";
import { submitEventSuggestion } from "@/actions/suggest-event";
import { Send } from "@/components/ui/animate-ui/icons/send";
import { LoaderCircle } from "@/components/ui/animate-ui/icons/loader-circle";
import { Lightbulb } from "@/components/ui/animate-ui/icons/lightbulb";
import { Check } from "@/components/ui/animate-ui/icons/check";
import { Globe, Users } from "lucide-react";
import { toast } from "sonner";
import { pixelWave } from "@/lib/design/pixel-cloud";

const CATEGORIES = [
  { id: "workshop", label: "Hands-on Workshop" },
  { id: "hackathon", label: "Hackathon / Build Day" },
  { id: "study-jam", label: "AWS Study Jam / Certification" },
  { id: "guest-talk", label: "Guest Tech Talk" },
  { id: "community", label: "Community Networking / Social" },
];

export function SuggestEventSection({ number = "04" }: { number?: string }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    category: "workshop",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await submitEventSuggestion(formData);

      if (res.success) {
        setSubmitted(true);
        toast.success("Event suggestion submitted!", {
          description: "Our core team will review your idea soon.",
        });
        setFormData({
          name: "",
          email: "",
          title: "",
          category: "workshop",
          description: "",
        });
      } else {
        toast.error("Submission failed", {
          description: res.error,
        });
      }
    } catch {
      toast.error("An error occurred", {
        description: "Please check your network connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const label = "t-eyebrow !text-[11px] !text-sbg-accent-strong";
  const field =
    "rounded-2xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 text-[15px] text-sbg-ink placeholder:text-sbg-ink-3 focus:border-sbg-lilac-600 focus:outline-none focus:ring-2 focus:ring-sbg-lilac-300 transition-all";

  return (
    <section data-tone="dusk" aria-label="Suggest an event" className="suggest-event-container relative py-16 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <Reveal className="surface relative mx-auto max-w-3xl overflow-hidden rounded-[36px]">
          <span aria-hidden="true" className="pointer-events-none absolute right-6 top-6 grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }, (_, k) => (
              <span
                key={k}
                data-hot={[0, 4, 8].includes(k) || undefined}
                className="px-tile h-2 w-2 rounded-[2px]"
                style={{ background: [0, 4, 8].includes(k) ? "#FF9900" : "var(--pixel-dim)", ...pixelWave(k, 3) }}
              />
            ))}
          </span>
          <div className="p-6 sm:p-10">
            {/* Header */}
            <div>
              <p className="t-eyebrow mb-4 flex flex-wrap items-center gap-3">
                <span className="t-pixel text-sbg-accent">{number}</span>
                <span className="h-px w-10 bg-sbg-lilac-300" />
                Community driven
              </p>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="t-eyebrow inline-flex items-center gap-1.5 rounded-full bg-sbg-lilac-100 px-3 py-1.5 !text-[10px] !text-sbg-accent-strong">
                  <Lightbulb size={13} animateOnHover />
                  <span>Community Driven</span>
                </div>
                <div className="t-eyebrow inline-flex items-center gap-1.5 rounded-full bg-[var(--tag-sky-bg)] px-3 py-1.5 !text-[10px] !text-[color:var(--tag-sky-fg)]">
                  <Globe size={13} aria-hidden="true" />
                  <span>Open to Everyone</span>
                </div>
              </div>

              <h2 className="t-display text-[clamp(30px,4vw,52px)] text-sbg-ink">
                Have an event idea? <span className="t-serif text-sbg-accent">Suggest it to the team.</span>
              </h2>

              {/* Prompt for Outsiders & Everyone */}
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-sbg-lilac-100/70 p-4 text-[14px] text-sbg-ink-2">
                <Users size={18} className="mt-0.5 shrink-0 text-sbg-accent-strong" aria-hidden="true" />
                <p className="leading-relaxed">
                  <strong className="font-semibold text-sbg-ink">Open to Everyone:</strong> You don&apos;t have to be a Tulas student! External students, developers, industry professionals, and tech enthusiasts from anywhere can suggest or request an event.
                </p>
              </div>
            </div>

            {/* Form / Success State */}
            {submitted ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-[var(--tag-mint-bg)] p-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tile-bg)] text-[color:var(--tag-mint-fg)]">
                  <Check size={24} />
                </div>
                <h3 className="t-display text-[22px] text-sbg-ink">Suggestion Received!</h3>
                <p className="mt-1 max-w-md text-[14px] text-sbg-ink-2">
                  Thanks for helping shape the AWS Student Builder Group roadmap. We review suggestions weekly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-5 cursor-pointer text-[13px] font-semibold text-sbg-accent-strong hover:underline"
                >
                  Submit another suggestion
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="suggest-name" className={label}>
                    Your Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="suggest-name"
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={field}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="suggest-email" className={label}>
                    Your Email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="suggest-email"
                    type="email"
                    required
                    placeholder="alex@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={field}
                  />
                </div>

                {/* Event Title / Topic */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="suggest-title" className={label}>
                    Event Topic / Title <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="suggest-title"
                    type="text"
                    required
                    placeholder="e.g. Serverless Microservices with AWS Lambda & DynamoDB"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={field}
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="suggest-category" className={label}>
                    Event Type
                  </label>
                  <div className="relative w-full">
                    <select
                      id="suggest-category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`${field} w-full cursor-pointer appearance-none pr-10`}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sbg-accent-strong">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="suggest-description" className={label}>
                    Why should we host this? / Details <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="suggest-description"
                    required
                    rows={3}
                    placeholder="Briefly describe what attendees will learn, target prerequisites, or speaker suggestions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${field} resize-none`}
                  />
                </div>

                {/* Submit Button */}
                <div className="mt-2 flex justify-start sm:col-span-2">
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50">
                    {isSubmitting ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Suggestion</span>
                        <Send size={15} animateOnHover />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
