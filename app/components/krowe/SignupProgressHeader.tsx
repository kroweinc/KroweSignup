"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Clock } from "lucide-react";

export type SignupProgressCompleted = { step: number; name: string };

export type SignupProgressHeaderProps = {
  currentStep: number;
  totalSteps: number;
  sectionName: string;
  estimatedTimeRemaining?: string;
  completedSteps?: SignupProgressCompleted[];
};

export function SignupProgressHeader({
  currentStep,
  totalSteps,
  sectionName,
  estimatedTimeRemaining = "~3 min",
  completedSteps = [],
}: SignupProgressHeaderProps) {
  const reduceMotion = useReducedMotion();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [shimmer, setShimmer] = useState(false);
  const prevStep = useRef(currentStep);
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  useEffect(() => {
    if (reduceMotion) return;
    if (currentStep !== prevStep.current) {
      setShimmer(true);
      const t = setTimeout(() => setShimmer(false), 300);
      prevStep.current = currentStep;
      return () => clearTimeout(t);
    }
  }, [currentStep, reduceMotion]);

  return (
    <div className="border-b border-border bg-background px-6 py-5 font-sans md:px-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="shrink-0 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{currentStep}</span> of {totalSteps}
        </p>

        <div className="relative min-w-0 flex-1 overflow-hidden px-4 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={sectionName}
              initial={reduceMotion ? undefined : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: reduceMotion ? 0 : 0.15 }}
              className="truncate text-sm font-medium text-foreground"
              aria-live="polite"
            >
              {sectionName}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-3.5" aria-hidden />
          <span>{estimatedTimeRemaining}</span>
        </div>
      </div>

      <div className="relative">
        <div className="h-[3px] overflow-hidden rounded-[var(--radius-full)] bg-border">
          <div
            className="relative h-full overflow-hidden bg-primary transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out-smooth)]"
            style={{ width: `${progress}%` }}
          >
            {shimmer ? (
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                style={{
                  animation: reduceMotion ? "none" : "shimmer-krowe 280ms var(--ease-out-smooth) forwards",
                }}
              />
            ) : null}
          </div>
        </div>

        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            const stepData = completedSteps.find((s) => s.step === step);

            return (
              <div
                key={step}
                className={isCompleted ? "pointer-events-auto cursor-default" : "pointer-events-none"}
                onMouseEnter={() => isCompleted && setHoveredStep(step)}
                onMouseLeave={() => setHoveredStep(null)}
                style={{
                  position: "relative",
                  width: isCurrent ? 10 : 8,
                  height: isCurrent ? 10 : 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isCompleted ? (
                  <span className="flex size-2 items-center justify-center rounded-full bg-primary">
                    <svg width="6" height="6" viewBox="0 0 10 8" fill="none" aria-hidden className="text-white">
                      <polyline
                        points="1,4 4,7 9,1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="12"
                        strokeDashoffset="12"
                        style={{
                          animation: reduceMotion
                            ? "none"
                            : "draw-check-krowe 200ms var(--ease-out-smooth) forwards",
                        }}
                      />
                    </svg>
                  </span>
                ) : (
                  <span
                    className={[
                      "block rounded-full transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)]",
                      isCurrent ? "scale-125 bg-primary shadow-[0_0_0_3px_var(--primary-soft)]" : "scale-100 bg-border",
                    ].join(" ")}
                    style={{ width: "100%", height: "100%" }}
                  />
                )}

                {hoveredStep === step && stepData ? (
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] bg-foreground px-3 py-1.5 text-xs text-background animate-[fade-up-in_140ms_var(--ease-out-smooth)_forwards]">
                    {stepData.name}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
