"use client";

import React from "react";
import Link from "next/link";
import { useRecruitment } from "@/hooks/useRecruitment";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { cn } from "@/lib/utils";

export interface RecruitmentCTAProps {
  variant?: "primary" | "secondary" | "border-gradient" | "navbar" | "raw";
  openText?: string;
  closedText?: string;
  openHref?: string;
  closedHref?: string;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function RecruitmentCTA({
  variant = "primary",
  openText = "Register Now",
  closedText = "Join Group",
  openHref = "/register",
  closedHref = "/register",
  className,
  containerClassName,
  onClick,
  showIcon = true,
  children,
}: RecruitmentCTAProps) {
  const { status } = useRecruitment();
  const isOpen = status === "open";

  const href = isOpen ? openHref : closedHref;
  const defaultLabel = isOpen ? openText : closedText;
  const label = children || defaultLabel;

  if (variant === "border-gradient") {
    return (
      <Link href={href} onClick={onClick} className="w-full sm:w-auto">
        <HoverBorderGradient
          containerClassName={cn("rounded-full w-full sm:w-auto", containerClassName)}
          className={cn(
            "font-inter uppercase tracking-wider font-semibold text-white px-6 sm:px-7 py-3.5 flex items-center justify-center gap-2 text-xs sm:text-sm w-full cursor-pointer",
            className
          )}
        >
          <span>{label}</span>
          {showIcon && <ArrowRight size={16} animateOnHover />}
        </HoverBorderGradient>
      </Link>
    );
  }

  if (variant === "navbar") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all duration-300 hover:bg-primary-hover hover:scale-105 cursor-pointer",
          className
        )}
      >
        <span>{label}</span>
      </Link>
    );
  }

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-[13px] font-semibold text-text-primary backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/35 hover:scale-105 cursor-pointer",
          className
        )}
      >
        <span>{label}</span>
        {showIcon && <ArrowRight size={15} animateOnHover />}
      </Link>
    );
  }

  if (variant === "raw") {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {label}
      </Link>
    );
  }

  // Default "primary" variant
  const isExternal = href.startsWith("http");
  const primaryClass = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-[13px] font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.4)] transition-all duration-300 hover:bg-primary-hover hover:scale-105 hover:shadow-[0_0_35px_rgba(124,58,237,0.65)] cursor-pointer",
    className
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={primaryClass}
      >
        <span>{label}</span>
        {showIcon && <ArrowRight size={15} animateOnHover />}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={primaryClass}
    >
      <span>{label}</span>
      {showIcon && <ArrowRight size={15} animateOnHover />}
    </Link>
  );
}
