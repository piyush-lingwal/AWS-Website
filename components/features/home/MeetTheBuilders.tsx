"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";
import { PixelHeading } from "@/components/ui/pixel-heading-character";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const PREVIEW_MEMBERS = [
  { name: "Piyush Lingwal", designation: "Builder Group Leader", quote: "", src: "/members/piyushlingwal.png" },
  { name: "Piyush Rawat", designation: "Tech Lead", quote: "", src: "/members/piyushrawat.png" },
];

export function MeetTheBuilders() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    gsap.from(".builders-header-el", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".builders-header",
        start: isMobile ? "top 95%" : "top 85%",
        toggleActions: "play reverse play reverse",
      },
    });

    gsap.fromTo(".builders-slider",
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: ".builders-slider",
          start: isMobile ? "top 95%" : "top 85%",
          toggleActions: "play reverse play reverse",
        },
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="meet-builders" className="bg-grid bg-noise relative overflow-hidden bg-bg border-t border-border">
      {/* Subtle purple heading glow */}
      <div aria-hidden className="pointer-events-none absolute right-1/4 top-8 h-[200px] w-[340px] translate-x-1/2 rounded-full bg-gradient-to-r from-primary/10 via-purple-600/8 to-primary/10 blur-[90px]" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-[400px] w-[400px] -translate-x-1/3 rounded-full bg-primary/8 blur-[130px]" />

      <div className="relative mx-auto max-w-content px-4 sm:px-6 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Member images 3D circular slider */}
          <div className="builders-slider w-full flex justify-center order-2 lg:order-1">
            <CircularTestimonials
              testimonials={PREVIEW_MEMBERS}
              autoplay={true}
              hideText={true}
              colors={{
                arrowBackground: "rgba(124, 58, 237, 0.2)",
                arrowForeground: "#FAFAFA",
                arrowHoverBackground: "#7C3AED",
              }}
            />
          </div>

          {/* Right text */}
          <div className="builders-header order-1 lg:order-2">
            <p className="builders-header-el text-[11px] uppercase tracking-[0.16em] text-muted">
              Our Team
            </p>
            <h2 className="builders-header-el mt-4 font-display text-[28px] sm:text-[34px] md:text-[42px] font-semibold leading-[1.1] tracking-tight text-text-primary">
              Powered by{" "}
              <PixelHeading mode="uniform" className="text-gradient">Passionate Students</PixelHeading>
            </h2>
            <p className="builders-header-el mt-5 text-[15px] sm:text-[16px] leading-relaxed text-text-secondary max-w-md">
              Behind every workshop, event, and initiative is a team of students committed to creating opportunities for others to learn, build, and grow.
            </p>
            <div className="builders-header-el mt-8">
              <Link
                href="/team"
                className="group inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-6 py-3 text-[13px] font-semibold text-primary-light transition-all duration-200 hover:bg-primary/20 hover:border-primary/60 cursor-pointer"
              >
                Meet Our Team
                <ArrowRight size={14} animateOnHover />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
