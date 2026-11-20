"use client";

import { useRef } from "react";
import Image from "next/image";
import { Reveal } from "@/components/design/Reveal";
import { cssVars, useScrollVar } from "@/components/design/use-scroll-var";

const TECHNOLOGIES = [
  { src: "/assets/AWS services icons/Compute/EC2.png", name: "EC2", description: "Compute" },
  { src: "/assets/AWS services icons/Storage/Simple-Storage-Service.png", name: "S3", description: "Storage" },
  { src: "/assets/AWS services icons/Compute/Lambda.png", name: "Lambda", description: "Serverless" },
  { src: "/assets/AWS services icons/Networking-Content-Delivery/CloudFront.png", name: "CloudFront", description: "CDN" },
  { src: "/assets/AWS services icons/Security-Identity-Compliance/Identity-and-Access-Management.png", name: "IAM", description: "Security" },
  { src: "/assets/AWS services icons/Database/DynamoDB.png", name: "DynamoDB", description: "NoSQL" },
  { src: "/assets/AWS services icons/Containers/Elastic-Container-Service.png", name: "ECS", description: "Containers" },
  { src: "/assets/AWS services icons/Containers/Elastic-Kubernetes-Service.png", name: "EKS", description: "Kubernetes" },
  { src: "/assets/AWS services icons/Front-End-Web-Mobile/Amplify.png", name: "Amplify", description: "Full-Stack" },
  { src: "/assets/AWS services icons/Machine-Learning/SageMaker.png", name: "SageMaker", description: "AI/ML" },
  { src: "/assets/AWS services icons/Management-Governance/CloudWatch.png", name: "CloudWatch", description: "Monitoring" },
  { src: "/assets/AWS services icons/App-Integration/API-Gateway.png", name: "API Gateway", description: "APIs" },
];

const ROWS = [
  { items: TECHNOLOGIES.slice(0, 6), dir: "marquee-left" },
  { items: TECHNOLOGIES.slice(6), dir: "marquee-right" },
] as const;

/** Section 07. Which services we use: two scroll-driven rows of service chips. */
export function AboutTechnologies() {
  const ref = useRef<HTMLElement>(null);
  useScrollVar(ref, ["start end", "end start"]);

  return (
    <section ref={ref} data-tone="dawn" className="scene relative flex min-h-[78svh] flex-col justify-center overflow-hidden pb-48 pt-32 sm:pb-72 sm:pt-44" style={cssVars({ "--t": 0 })}>
      <div className="mx-auto w-full max-w-[1240px] px-[var(--gutter)]">
        <Reveal className="mb-16 max-w-2xl sm:mb-24">
          <p className="t-eyebrow mb-4 flex items-center gap-3">
            <span className="t-pixel text-sbg-accent">07</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Tech Stack
          </p>
          <h2 className="t-display pb-3 text-[clamp(34px,5.4vw,76px)] leading-[1.08] text-sbg-ink">
            Technologies we <span className="t-serif text-sbg-accent">explore.</span>
          </h2>
        </Reveal>
      </div>

      <div
        className="flex flex-col gap-4 py-2 sm:gap-5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
      >
        {ROWS.map((row) => (
          <div key={row.dir} className="motion-reduce:overflow-x-auto">
            <div className={`marquee-row ${row.dir}`} role="list">
              {[0, 1, 2].flatMap((copy) =>
                row.items.map((t) => (
                  <span
                    key={`${copy}-${t.name}`}
                    role={copy === 0 ? "listitem" : undefined}
                    aria-hidden={copy === 0 ? undefined : "true"}
                    className="surface inline-flex items-center gap-3 whitespace-nowrap rounded-full py-2.5 pl-2.5 pr-6"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white">
                      <Image src={encodeURI(t.src)} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                    </span>
                    <span>
                      <span className="t-display block text-[18px] text-sbg-ink">{t.name}</span>
                      <span className="t-eyebrow block !text-[10.5px]">{t.description}</span>
                    </span>
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
