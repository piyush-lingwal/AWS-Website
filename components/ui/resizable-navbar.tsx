"use client";
import { cn } from "@/lib/utils";
import { Menu } from "@/components/ui/animate-ui/icons/menu";
import { X } from "@/components/ui/animate-ui/icons/x";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";

import React, { useRef, useState } from "react";


interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn("sticky inset-x-0 top-4 sm:top-6 lg:top-8 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 16,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "950px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-[#120F0C]/85 border border-[#FF9900]/25 shadow-[0_4px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(255,153,0,0.06)] px-4 py-2 lg:flex backdrop-blur-[16px]",
        visible && "bg-[#14100D]/95 border-[#FF9900]/35 shadow-[0_8px_35px_rgba(0,0,0,0.7),0_0_25px_rgba(255,153,0,0.12)]",
        className,
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const pathname = usePathname();

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-text-secondary transition duration-200 lg:flex lg:space-x-2",
        className,
      )}
    >
      {items.map((item, idx) => {
        const isActive = pathname === item.link;
        return (
          <a
            onMouseEnter={() => setHovered(idx)}
            onClick={onItemClick}
            className={cn(
              "relative px-4 py-2 transition-colors",
              isActive ? "text-[#FF9900] font-semibold" : "text-white/75 hover:text-[#FFB84D]"
            )}
            key={`link-${idx}`}
            href={item.link}
          >
            {isActive && (
              <motion.div
                layoutId="active"
                className="absolute inset-0 h-full w-full rounded-full bg-[#FF9900]/15 border border-[#FF9900]/30 shadow-[0_0_15px_rgba(255,153,0,0.15)]"
              />
            )}
            {hovered === idx && !isActive && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-white/[0.06]"
              />
            )}
            <span className="relative z-20">{item.name}</span>
          </a>
        );
      })}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "90%" : "100%",
        borderRadius: "9999px",
        y: visible ? 20 : 16,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between self-start rounded-full bg-[#120F0C]/85 border border-[#FF9900]/25 shadow-lg px-4 py-2 lg:hidden backdrop-blur-[16px]",
        visible && "bg-[#14100D]/95 border-[#FF9900]/35 shadow-[0_8px_35px_rgba(0,0,0,0.7),0_0_20px_rgba(255,153,0,0.12)]",
        className,
      )}
      style={{ overflow: "visible" }}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
  visible,
}: MobileNavHeaderProps & { visible?: boolean }) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 -z-10 h-[100dvh] w-screen bg-[#0B0A09]/60 sm:hidden"
            style={{ pointerEvents: "auto" }}
          />
          
          {/* Menu Container */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
              "absolute inset-x-0 top-[calc(100%+0.75rem)] z-50 flex w-full flex-col items-start justify-start gap-1 rounded-2xl bg-[#120F0C]/95 backdrop-blur-xl border border-[#FF9900]/25 p-3 shadow-[0_8px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(255,153,0,0.1)]",
              className,
            )}
          >
            {/* Decorative top accent */}
            <div className="mx-auto mb-2 h-[2px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#FF9900]/60 to-transparent" />
            {/* Stagger children (nav items) with cascading entrance */}
            <div className="flex w-full flex-col gap-1">
              {React.Children.map(children, (child, index) => (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.15,
                    delay: 0.05 + index * 0.04,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                >
                  {child}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="relative z-20 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[#FF9900]/10 active:scale-90"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <X size={20} className="text-text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Menu size={20} className="text-text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export const NavbarLogo = ({ visible }: { visible?: boolean }) => {
  return (
    <a
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2.5 px-1 py-1 text-sm font-normal"
    >
      <div className="relative bg-[#14100D] border border-[#FF9900]/30 shadow-[0_0_12px_rgba(255,153,0,0.2)] rounded-xl flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 p-1.5 overflow-hidden shrink-0">

        <img
          src="/logos/SBG_logo.png"
          alt="AWS SBG Logo"
          className="w-full h-full object-contain relative z-10"
        />
        <motion.div
          className="absolute top-0 left-0 size-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 pointer-events-none"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{ willChange: "transform" }}
        />
      </div>
      {!visible && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="flex flex-col"
        >
          {/* Full name on desktop, abbreviated on mobile */}
          <span className="font-bold tracking-wide text-text-primary text-xs sm:text-sm leading-tight hidden sm:block">
            AWS STUDENT BUILDER GROUP
          </span>
          <span className="font-bold tracking-wide text-text-primary text-xs leading-tight sm:hidden">
            AWS Student Builder Group
          </span>
          <span className="text-text-secondary text-[10px] sm:text-[11px] leading-tight hidden sm:block">
            at Tulas University Dehradun
          </span>
          <span className="text-text-secondary text-[9px] sm:text-[10px] leading-tight sm:hidden">
            Tulas University
          </span>
        </motion.div>
      )}
    </a>
  );
};


export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-5 py-2 rounded-full text-[13px] font-semibold relative cursor-pointer hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 inline-block text-center tracking-wide overflow-hidden group";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-[#FF9900] via-[#FFA926] to-[#FF8800] text-black font-extrabold shadow-[0_0_20px_rgba(255,153,0,0.35)] hover:shadow-[0_0_30px_rgba(255,153,0,0.55)] hover:scale-[1.04] border border-[#FFB84D]/60 hover:border-[#FFB84D]",
    secondary: "bg-transparent shadow-none text-white hover:text-[#FFB84D]",
    dark: "bg-[#14100D] text-white border border-[#FF9900]/30 shadow-[0_0_20px_rgba(255,153,0,0.2)]",
    gradient:
      "bg-gradient-to-r from-[#FF9900] to-[#E88B00] text-black font-bold shadow-[0_2px_12px_rgba(255,153,0,0.35)]",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <span className="relative z-10">{children}</span>
    </Tag>
  );
};
