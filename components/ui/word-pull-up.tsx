"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface WordPullUpProps {
  words: string;
  delayMultiple?: number;
  className?: string;
  wrapperClassName?: string;
}

export function WordPullUp({
  words,
  delayMultiple = 0.08,
  className,
  wrapperClassName,
}: WordPullUpProps) {
  const wordsArray = words.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: delayMultiple,
      },
    },
  };

  const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", damping: 15 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn("flex flex-wrap gap-[0.25em]", wrapperClassName)}
    >
      {wordsArray.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={item}
          className={cn("inline-block", className)}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
