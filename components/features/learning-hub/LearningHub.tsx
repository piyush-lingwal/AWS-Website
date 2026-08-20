"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "@/components/ui/animate-ui/icons/external-link";
import { BadgeCheck } from "@/components/ui/animate-ui/icons/badge-check";
import { Layers } from "@/components/ui/animate-ui/icons/layers";
import { Play } from "@/components/ui/animate-ui/icons/play";
import { Terminal } from "@/components/ui/animate-ui/icons/terminal";
import { PixelHeading } from "@/components/ui/pixel-heading-character";
import { Spotlight } from "@/components/ui/spotlight";

type Resource = {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
  linkLabel: string;
  accent: string;
};

const RESOURCES: Resource[] = [
  {
    icon: BadgeCheck,
    title: "AWS Certification & Exam Prep",
    description:
      "Explore official AWS Certification paths, exam guides, and preparation resources for Practitioner, Associate, and Specialty credentials.",
    link: "https://aws.amazon.com/certification/",
    linkLabel: "Explore certifications",
    accent: "bg-primary/10 text-primary-light",
  },
  {
    icon: Play,
    title: "AWS Training & Skill Building",
    description:
      "Access hundreds of free digital training courses, hands-on labs, and official learning plans designed by AWS experts.",
    link: "https://aws.amazon.com/training/",
    linkLabel: "Start AWS training",
    accent: "bg-success/10 text-success",
  },
  {
    icon: BadgeCheck,
    title: "AWS Cloud Practitioner Exam Guide",
    description:
      "Official AWS Certified Cloud Practitioner (CLF-C02) exam guide, domain breakdown, sample questions, and preparation resources.",
    link: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
    linkLabel: "Cloud Practitioner guide",
    accent: "bg-accent/10 text-accent",
  },
  {
    icon: Terminal,
    title: "Project Starter Kits",
    description:
      "Boilerplates for common AWS patterns — REST APIs with Lambda, static sites on S3 + CloudFront, CI/CD with CodePipeline, and more.",
    link: "#",
    linkLabel: "Clone a starter",
    accent: "bg-info/10 text-info",
  },
  {
    icon: BadgeCheck,
    title: "AWS Educate & Student Credits",
    description:
      "Members get access to free AWS Educate courses and promotional credits for hands-on practice building real cloud applications.",
    link: "https://aws.amazon.com/education/awseducate/",
    linkLabel: "Explore AWS Educate",
    accent: "bg-warning/10 text-warning",
  },
  {
    icon: Layers,
    title: "Community Blog",
    description:
      "Technical write-ups, project deep-dives, and certification journeys written by our members. Learn from real builder experiences.",
    link: "#",
    linkLabel: "Read posts",
    accent: "bg-secondary/10 text-secondary",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export function LearningHub() {
  return (
    <section id="learning-hub" className="bg-grid bg-noise relative overflow-hidden bg-bg min-h-screen">
      <Spotlight className="-top-24 left-32 md:-top-20 md:left-60" fill="#A78BFA" />
      {/* Headline ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/4 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />
      {/* Secondary glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 bottom-0 h-[420px] w-[420px] translate-y-1/3 rounded-full bg-accent/6 blur-[130px]"
      />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 pt-28 pb-16 md:pt-32 md:pb-24 lg:pt-32 lg:pb-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p
            variants={itemVariants}
            className="text-[11px] uppercase tracking-[0.16em] text-muted"
          >
            Learning Hub
          </motion.p>
          <motion.h2
            variants={itemVariants}
            className="mt-4 font-display text-[32px] sm:text-[36px] md:text-[44px] font-semibold leading-[1.1] tracking-tight text-text-primary flex items-center justify-start flex-wrap gap-2"
          >
            <span>Resources to</span>{" "}
            <PixelHeading mode="uniform" className="text-gradient">level up.</PixelHeading>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mt-4 sm:mt-5 max-w-lg text-[15px] sm:text-[16px] leading-relaxed text-text-secondary"
          >
            Everything you need to go from cloud-curious to cloud-certified —
            free workshops, starter kits, credits, and a community to learn with.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {RESOURCES.map((resource) => {
            const Icon = resource.icon;
            const isExternal = resource.link.startsWith("http");
            return (
              <motion.a
                key={resource.title}
                href={resource.link}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                variants={itemVariants}
                className="group flex flex-col gap-4 rounded-xl border border-border bg-bg p-6 transition-colors transition-shadow duration-300 hover:border-primary-light/30 hover:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${resource.accent} transition-colors duration-200`}
                  >
                    <Icon size={20} strokeWidth={1.75} animateOnHover />
                  </span>
                  <ExternalLink
                    size={14}
                    animateOnHover
                    className="text-muted opacity-0 transition-opacity transition-colors duration-200 group-hover:opacity-100 group-hover:text-primary-light"
                  />
                </div>

                <h3 className="font-display text-[16px] font-semibold tracking-tight text-text-primary">
                  {resource.title}
                </h3>

                <p className="text-sm leading-relaxed text-text-secondary">
                  {resource.description}
                </p>

                <span className="mt-auto text-[13px] font-medium text-primary-light transition-colors group-hover:text-primary">
                  {resource.linkLabel} →
                </span>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
