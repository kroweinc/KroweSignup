"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import SpiralPreloader from "@/app/components/SpiralPreloader";
import { EditorialPanel } from "./EditorialPanel";

const DEFAULT_MESSAGES = [
  "Analyzing your website…",
  "Extracting product signals…",
  "Mapping what we found…",
];

type SignupAnalyzeLoadingProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  messages?: string[];
  /** Smaller spiral on narrow panels */
  spiralSize?: number;
};

export function SignupAnalyzeLoading({
  title = "Hang tight.",
  subtitle = "We're reading your site and structuring answers you can edit next.",
  messages = DEFAULT_MESSAGES,
  spiralSize = 320,
}: SignupAnalyzeLoadingProps) {
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduceMotion || messages.length <= 1) return;
    const t = setInterval(() => {
      setI((n) => (n + 1) % messages.length);
    }, 2200);
    return () => clearInterval(t);
  }, [messages.length, reduceMotion]);

  return (
    <div className="signup-shell-layout flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden font-sans md:flex-row" aria-busy="true">
      <div className="signup-editorial-left flex min-h-[36vh] max-md:max-h-[50dvh] max-md:shrink-0 max-md:overflow-y-auto flex-[1_1_46%] flex-col md:max-w-[52%] lg:flex-[0_0_48%]">
        <EditorialPanel title={title} subtitle={subtitle} />
      </div>

      <div className="signup-analyze-workspace flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain bg-background px-6 py-14 md:px-12">
        <div className="flex min-h-full flex-1 flex-col items-center justify-center">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full max-w-md flex-col items-center gap-8 py-4"
        >
          <SpiralPreloader size={spiralSize} className="animate-fade-in" />
          <div className="min-h-[3.25rem] text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={messages[i] ?? i}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="text-sm font-medium text-foreground md:text-base"
              >
                {messages[i % messages.length]}
              </motion.p>
            </AnimatePresence>
            <p className="mt-3 text-sm text-muted-foreground">This usually takes a few moments.</p>
          </div>
        </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .signup-shell-layout { flex-direction: column !important; }
          .signup-editorial-left { flex: 0 0 auto !important; max-width: none !important; }
          .signup-analyze-workspace { flex: 1 1 0% !important; min-height: 0 !important; }
        }
      `}</style>
    </div>
  );
}
