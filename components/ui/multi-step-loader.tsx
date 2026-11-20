"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "@/components/ui/animate-ui/icons/check";
import { LoaderCircle } from "@/components/ui/animate-ui/icons/loader-circle";

export type LoadingState = {
  text: string;
};

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 1500,
  loop = false,
  onComplete,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
  onComplete?: () => void;
}) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }

    const timeout = setTimeout(() => {
      if (currentState < loadingStates.length - 1) {
        setCurrentState((prevState) => prevState + 1);
      } else {
        if (loop) {
          setCurrentState(0);
        } else {
          onComplete?.();
        }
      }
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentState, loading, loop, loadingStates.length, duration, onComplete]);

  if (!loading) return null;

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full fixed inset-0 z-[120] flex items-center justify-center backdrop-blur-2xl bg-sbg-paper/85 p-6 text-sbg-ink"
        >
          <div className="relative w-full max-w-lg mx-auto flex flex-col items-center justify-center">
            {/* Header badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sbg-lilac-100 border border-sbg-lilac-200 text-xs font-mono font-medium text-sbg-lilac-700"
            >
              <span className="h-2 w-2 rounded-full bg-sbg-lilac-600 animate-pulse" />
              AWS DEPLOY PIPELINE ACTIVE
            </motion.div>

            {/* Step list container */}
            <div className="w-full space-y-4">
              {loadingStates.map((loadingState, index) => {
                const isCurrent = index === currentState;
                const isPast = index < currentState;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{
                      opacity: isCurrent ? 1 : isPast ? 0.7 : 0.25,
                      x: 0,
                      scale: isCurrent ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.35 }}
                    className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-300 ${
                      isCurrent
                        ? "border-sbg-lilac-300 bg-white shadow-[0_8px_24px_-12px_rgba(124,77,255,0.35)] text-sbg-ink"
                        : isPast
                        ? "border-[var(--line)] bg-white/60 text-sbg-ink-2"
                        : "border-transparent text-sbg-ink-3"
                    }`}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-white">
                      {isPast ? (
                        <Check size={16} className="text-emerald-600" animate />
                      ) : isCurrent ? (
                        <LoaderCircle size={16} className="text-sbg-lilac-600" animate loop />
                      ) : (
                        <span className="text-[11px] font-mono font-semibold text-sbg-ink-3">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    <span className="text-sm font-medium font-sans tracking-wide">
                      {loadingState.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
