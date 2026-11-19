"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { cssVars, useScrollVar } from "./use-scroll-var";
import { useMotionValueEvent } from "framer-motion";

const icon = (path: string) => encodeURI(`/assets/AWS services icons/${path}`);

const CARDS = [
  {
    title: "Web Applications",
    text: "Build scalable full-stack applications with serverless architecture and global CDN distribution across AWS edge locations.",
    tech: ["Next.js", "Lambda", "S3", "CloudFront"],
    icon: icon("Networking-Content-Delivery/CloudFront.png"),
    tint: "#EFE8FF",
  },
  {
    title: "AI & Machine Learning",
    text: "Integrate intelligent features with AWS AI services: chatbots, computer vision and predictive analytics.",
    tech: ["SageMaker", "Bedrock", "Rekognition"],
    icon: icon("Machine-Learning/SageMaker.png"),
    tint: "#FFE7F1",
  },
  {
    title: "Real-Time Analytics",
    text: "Process millions of events per second with streaming data pipelines and live dashboards.",
    tech: ["Kinesis", "Athena", "QuickSight"],
    icon: icon("Management-Governance/CloudWatch.png"),
    tint: "#FFEBD3",
  },
  {
    title: "Mobile Backends",
    text: "Complete backend infrastructure for mobile apps: auth, real-time sync and push notifications.",
    tech: ["Amplify", "Cognito", "AppSync"],
    icon: icon("Front-End-Web-Mobile/Amplify.png"),
    tint: "#DDF3E6",
  },
  {
    title: "Cloud Security",
    text: "Enterprise-grade security with identity management, threat detection and compliance automation.",
    tech: ["IAM", "GuardDuty", "WAF"],
    icon: icon("Security-Identity-Compliance/Identity-and-Access-Management.png"),
    tint: "#FFE1E1",
  },
  {
    title: "DevOps & Infrastructure",
    text: "Automate deployments with CI/CD pipelines, container orchestration and infrastructure as code.",
    tech: ["CloudFormation", "CodePipeline", "ECS"],
    icon: icon("Containers/Elastic-Container-Service.png"),
    tint: "#DCEBFF",
  },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Scene 3. Vertical scrolling drives a horizontal track of cards. The section is
 * as tall as the distance the track has to travel, so one scrolled pixel moves
 * the cards one pixel: it feels like dragging the cards, not like an animation.
 */
export function BuildRail() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const progress = useScrollVar(ref);

  // Section height = viewport height + the distance the track must travel.
  useEffect(() => {
    const section = ref.current;
    const el = track.current;
    if (!section || !el) return;

    const size = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const shift = Math.max(0, el.scrollWidth - window.innerWidth);
      section.style.setProperty("--shift", String(shift));
      section.style.height = reduced ? "auto" : `${window.innerHeight + shift}px`;
    };
    size();
    window.addEventListener("resize", size);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(size) : null;
    ro?.observe(el);
    return () => {
      window.removeEventListener("resize", size);
      ro?.disconnect();
    };
  }, []);

  // "03 / 06": the card nearest the middle of the track.
  useMotionValueEvent(progress, "change", (v) => {
    if (counter.current) counter.current.textContent = pad(Math.min(CARDS.length, Math.max(1, Math.round(v * (CARDS.length - 1)) + 1)));
  });

  return (
    <section id="build" ref={ref} data-tone="violet" className="scene relative" style={cssVars({ "--t": 0, "--shift": 0, height: "320svh" })}>
      <div className="pin rail-pin flex flex-col justify-center gap-8 sm:gap-10">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-[var(--gutter)] pt-20 sm:pt-24 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="t-eyebrow mb-4 flex items-center gap-3">
              <span className="t-pixel text-sbg-lilac-600">02</span>
              <span className="h-px w-10 bg-sbg-lilac-300" />
              What you can build
            </p>
            <h2 className="t-display text-[clamp(34px,5.4vw,76px)] text-sbg-ink">
              Ship real things <span className="t-serif text-sbg-lilac-600">on AWS.</span>
            </h2>
          </div>
          <p className="t-lead max-w-md">Six kinds of project our builders take from idea to deployed, with mentors and the AWS services behind them.</p>
        </div>

        <div className="rail-scroller">
          <ul ref={track} className="rail-track">
            {CARDS.map((card, i) => (
              <li key={card.title} className="rail-card">
                <article
                  className="surface lift relative flex h-full min-h-[330px] flex-col justify-between gap-10 overflow-hidden rounded-[28px] p-6 sm:min-h-[360px] sm:p-7"
                  style={{ backgroundImage: `linear-gradient(160deg, ${card.tint} 0%, rgba(255,255,255,0.78) 52%)` }}
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-[0_8px_24px_-10px_rgba(76,29,149,0.45)]">
                      <Image src={card.icon} alt="" width={40} height={40} className="h-10 w-10" />
                    </span>
                    <span className="t-pixel text-[15px] text-sbg-ink-3">{pad(i + 1)}</span>
                  </div>
                  <div>
                    <h3 className="t-display text-[26px] text-sbg-ink sm:text-[30px]">{card.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-sbg-ink-2">{card.text}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {card.tech.map((t) => (
                        <li key={t} className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1 font-lt-mono text-[11.5px] text-sbg-ink-2">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto flex w-full max-w-[1240px] items-center gap-4 px-[var(--gutter)] pb-8">
          <span className="t-pixel w-8 text-[15px] text-sbg-ink">
            <span ref={counter}>01</span>
          </span>
          <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-sbg-lilac-200">
            <span className="rail-bar absolute inset-0 block rounded-full bg-sbg-lilac-600" />
          </span>
          <span className="t-pixel w-8 text-right text-[15px] text-sbg-ink-3">{pad(CARDS.length)}</span>
        </div>
      </div>
    </section>
  );
}
