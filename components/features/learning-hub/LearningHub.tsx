"use client";

import * as React from "react";

import { ExternalLink } from "@/components/ui/animate-ui/icons/external-link";
import { BadgeCheck } from "@/components/ui/animate-ui/icons/badge-check";
import { Layers } from "@/components/ui/animate-ui/icons/layers";
import { Play } from "@/components/ui/animate-ui/icons/play";
import { Terminal } from "@/components/ui/animate-ui/icons/terminal";

import { Reveal } from "@/components/design/Reveal";

type Resource = {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
  linkLabel: string;
  tint: string;
  span: string;
  featured?: boolean;
};

const RESOURCES: Resource[] = [
  {
    icon: BadgeCheck,
    title: "AWS Certification & Exam Prep",
    description:
      "Explore official AWS Certification paths, exam guides, and preparation resources for Practitioner, Associate, and Specialty credentials.",
    link: "https://aws.amazon.com/certification/",
    linkLabel: "Explore certifications",
    tint: "var(--card-lilac)",
    span: "md:col-span-7",
    featured: true,
  },
  {
    icon: Play,
    title: "AWS Training & Skill Building",
    description:
      "Access hundreds of free digital training courses, hands-on labs, and official learning plans designed by AWS experts.",
    link: "https://aws.amazon.com/training/",
    linkLabel: "Start AWS training",
    tint: "var(--card-mint)",
    span: "md:col-span-5",
  },
  {
    icon: BadgeCheck,
    title: "AWS Cloud Practitioner Exam Guide",
    description:
      "Official AWS Certified Cloud Practitioner (CLF-C02) exam guide, domain breakdown, sample questions, and preparation resources.",
    link: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
    linkLabel: "Cloud Practitioner guide",
    tint: "var(--card-peach)",
    span: "md:col-span-5",
  },
  {
    icon: Terminal,
    title: "Project Starter Kits",
    description:
      "Boilerplates for common AWS patterns — REST APIs with Lambda, static sites on S3 + CloudFront, CI/CD with CodePipeline, and more.",
    link: "#",
    linkLabel: "Clone a starter",
    tint: "var(--card-sky)",
    span: "md:col-span-7",
  },
  {
    icon: BadgeCheck,
    title: "AWS Educate & Student Credits",
    description:
      "Members get access to free AWS Educate courses and promotional credits for hands-on practice building real cloud applications.",
    link: "https://aws.amazon.com/education/awseducate/",
    linkLabel: "Explore AWS Educate",
    tint: "var(--card-blush)",
    span: "md:col-span-6",
  },
  {
    icon: Layers,
    title: "Community Blog",
    description:
      "Technical write-ups, project deep-dives, and certification journeys written by our members. Learn from real builder experiences.",
    link: "#",
    linkLabel: "Read posts",
    tint: "var(--card-rose)",
    span: "md:col-span-6",
  },
];

/** The Learning Hub in the light "Daylight Cloud" theme (DESIGN.md). */
export function LearningHub() {
  return (
    <section id="top" data-tone="dawn" aria-label="Learning Hub" className="relative min-h-screen pb-24 pt-32 sm:pb-36 sm:pt-40">
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <Reveal className="grid items-end gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
          <p className="t-eyebrow mb-5 flex items-center gap-3">
            <span className="t-pixel text-sbg-accent">01</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Learning Hub
          </p>
          <h1 className="t-display text-[clamp(38px,5.8vw,84px)] text-sbg-ink">
            Resources to <span className="t-serif text-sbg-accent">level up.</span>
          </h1>
          </div>
          <p className="t-lead max-w-md border-l border-sbg-lilac-300 pl-5 lg:pb-3">
            Everything you need to go from cloud-curious to cloud-certified —
            free workshops, starter kits, credits, and a community to learn with.
          </p>
        </Reveal>

        <ul className="mt-14 grid gap-4 sm:mt-20 md:grid-cols-12 md:gap-5">
          {RESOURCES.map((resource, i) => {
            const Icon = resource.icon;
            const isExternal = resource.link.startsWith("http");
            return (
              <Reveal as="li" key={resource.title} index={i % 2} className={resource.span}>
                <a
                  href={resource.link}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className={`surface lift group flex h-full flex-col gap-4 rounded-[26px] p-6 ${resource.featured ? "md:gap-6 md:rounded-[32px] md:p-10" : "md:p-7"}`}
                  style={{ backgroundImage: `linear-gradient(155deg, ${resource.tint} 0%, var(--wash-80) 58%)` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--chip-bg)] text-sbg-accent-strong">
                      <Icon size={20} strokeWidth={1.75} animateOnHover />
                    </span>
                    <ExternalLink
                      size={14}
                      animateOnHover
                      className="text-sbg-ink-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    />
                  </div>

                  <h2 className={`t-display text-sbg-ink ${resource.featured ? "text-[26px] md:text-[40px]" : "text-[22px] md:text-[26px]"}`}>{resource.title}</h2>

                  <p className={`leading-relaxed text-sbg-ink-2 ${resource.featured ? "text-[15px] md:max-w-lg md:text-[17px]" : "text-[15px]"}`}>{resource.description}</p>

                  <span className="mt-auto text-[14px] font-medium text-sbg-accent-strong transition-colors group-hover:text-sbg-accent">
                    {resource.linkLabel}{" "}
                    <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                      →
                    </span>
                  </span>
                </a>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}