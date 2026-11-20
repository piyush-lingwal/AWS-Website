"use client";

import React, { useState } from "react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SparklesText } from "@/components/ui/sparkles-text";
import { submitEventSuggestion } from "@/actions/suggest-event";
import { Send } from "@/components/ui/animate-ui/icons/send";
import { LoaderCircle } from "@/components/ui/animate-ui/icons/loader-circle";
import { Lightbulb } from "@/components/ui/animate-ui/icons/lightbulb";
import { Check } from "@/components/ui/animate-ui/icons/check";
import { Globe, Users } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "workshop", label: "Hands-on Workshop" },
  { id: "hackathon", label: "Hackathon / Build Day" },
  { id: "study-jam", label: "AWS Study Jam / Certification" },
  { id: "guest-talk", label: "Guest Tech Talk" },
  { id: "community", label: "Community Networking / Social" },
];

// Daylight Cloud form styling (shared by every text field below).
const FIELD_CLASS =
  "rounded-xl border border-sbg-ink/15 bg-white/80 px-3.5 py-2.5 text-sm font-medium text-sbg-ink placeholder:text-sbg-ink-3/70 placeholder:font-normal focus:border-sbg-lilac-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sbg-lilac-300 transition-all";
const LABEL_CLASS = "t-eyebrow !text-sbg-ink-2";

export function SuggestEventSection() {
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

  return (
    <section data-tone="dusk" className="suggest-event-container mt-16 sm:mt-20 w-full max-w-2xl mx-auto">
      <SpotlightCard
        className="rounded-[28px] border-white/90 bg-white/75 hover:bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_30px_60px_-24px_rgba(76,29,149,0.3),0_2px_6px_-2px_rgba(76,29,149,0.08)]"
        spotlightColor="rgba(124, 58, 237, 0.04)"
        borderColor="rgba(124, 58, 237, 0.1)"
      >
        <div className="p-5 sm:p-8 lg:p-10">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sbg-lilac-100 px-3 py-1 text-[11px] font-medium text-sbg-lilac-700 ring-1 ring-inset ring-sbg-lilac-300">
                <Lightbulb size={13} className="text-sbg-lilac-600" animateOnHover />
                <span>Community Driven</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#DCEBFF] px-3 py-1 text-[11px] font-medium text-[#1D4ED8] ring-1 ring-inset ring-[#A9C8F5]">
                <Globe size={13} className="text-[#2563EB]" />
                <span>Open to Everyone</span>
              </div>
            </div>

            <h3 className="font-lt-display text-[24px] sm:text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-sbg-ink">
              Have an event idea?{" "}
              <SparklesText
                text="Suggest it to the team."
                sparkleCount={5}
                colors={{ first: "#AF8CFF", second: "#FF9900" }}
                className="t-serif text-sbg-lilac-600 !font-normal"
              />
            </h3>

            {/* Prompt for Outsiders & Everyone */}
            <div className="mt-3.5 flex items-start gap-2.5 rounded-2xl border border-sbg-lilac-200 bg-sbg-lilac-50 p-3.5 text-xs sm:text-sm text-sbg-ink-2">
              <Users size={18} className="shrink-0 text-sbg-lilac-600 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-sbg-ink font-semibold">Open to Everyone:</strong> You don&apos;t have to be a Tulas student! External students, developers, industry professionals, and tech enthusiasts from anywhere can suggest or request an event.
              </p>
            </div>
          </div>

          {/* Form / Success State */}
          {submitted ? (
            <div className="mt-6 rounded-2xl border border-[#9AD6B1] bg-[#DDF3E6] p-6 text-center flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#16A34A] mb-3">
                <Check size={24} />
              </div>
              <h4 className="font-lt-display text-xl font-semibold tracking-[-0.02em] text-sbg-ink">Suggestion Received!</h4>
              <p className="mt-1 text-sm text-sbg-ink-2 max-w-md">
                Thanks for helping shape the AWS Student Builder Group roadmap. We review suggestions weekly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-5 text-[13px] font-semibold text-sbg-lilac-700 hover:text-sbg-lilac-600 hover:underline cursor-pointer"
              >
                Submit another suggestion
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="suggest-name" className={LABEL_CLASS}>
                  Your Name <span className="text-sbg-lilac-600 font-bold">*</span>
                </label>
                <input
                  id="suggest-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={FIELD_CLASS}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="suggest-email" className={LABEL_CLASS}>
                  Your Email <span className="text-sbg-lilac-600 font-bold">*</span>
                </label>
                <input
                  id="suggest-email"
                  type="email"
                  required
                  placeholder="alex@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={FIELD_CLASS}
                />
              </div>

              {/* Event Title / Topic */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label htmlFor="suggest-title" className={LABEL_CLASS}>
                  Event Topic / Title <span className="text-sbg-lilac-600 font-bold">*</span>
                </label>
                <input
                  id="suggest-title"
                  type="text"
                  required
                  placeholder="e.g. Serverless Microservices with AWS Lambda & DynamoDB"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={FIELD_CLASS}
                />
              </div>

              {/* Category */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label htmlFor="suggest-category" className={LABEL_CLASS}>
                  Event Type
                </label>
                <div className="relative w-full">
                  <select
                    id="suggest-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`${FIELD_CLASS} w-full appearance-none pr-10 hover:border-sbg-ink/30 cursor-pointer`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-white text-sbg-ink py-2">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sbg-lilac-600">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label htmlFor="suggest-description" className={LABEL_CLASS}>
                  Why should we host this? / Details <span className="text-sbg-lilac-600 font-bold">*</span>
                </label>
                <textarea
                  id="suggest-description"
                  required
                  rows={3}
                  placeholder="Briefly describe what attendees will learn, target prerequisites, or speaker suggestions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${FIELD_CLASS} resize-none`}
                />
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2 mt-2 flex justify-start">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
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
      </SpotlightCard>
    </section>
  );
}
