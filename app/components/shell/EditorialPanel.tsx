"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/** Peach editorial column — shared by auth split and signup flows. */
export const EDITORIAL_PANEL_BG =
  "linear-gradient(145deg, #fff5f0 0%, #fef0e5 50%, #fde8d5 100%)";

const EASE = [0.16, 1, 0.3, 1] as const;

export type EditorialPanelProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  showMark?: boolean;
  className?: string;
};

export function EditorialPanel({ title, subtitle, showMark = true, className = "" }: EditorialPanelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`signup-editorial relative flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden px-[clamp(2rem,5vw,4rem)] py-10 md:py-[clamp(2.5rem,5vw,5rem)] ${className}`}
      style={{ background: EDITORIAL_PANEL_BG }}
      role="region"
      aria-label="Introduction"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: "var(--blueprint-grid)",
          backgroundSize: "var(--blueprint-grid-size)",
        }}
        aria-hidden
      />
      <div className="noise-surface pointer-events-none absolute inset-0 rounded-none" aria-hidden />

      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.48, ease: EASE }}
        className="relative z-[1] max-w-[380px] text-center"
      >
        {showMark ? (
          <div className="mb-8 flex justify-center md:mb-10">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-primary/15 bg-background/90 shadow-sm">
              <Image src="/KroweIcon.png" alt="Krowe" width={36} height={36} className="size-9 object-contain" priority />
            </div>
          </div>
        ) : null}
        <div className="serif-text text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl md:text-[clamp(1.65rem,2.8vw,2.35rem)]">
          {title}
        </div>
        {subtitle ? (
          <p className="mt-4 max-w-prose text-pretty text-base leading-relaxed text-muted-foreground md:mt-5">{subtitle}</p>
        ) : null}
      </motion.div>
    </div>
  );
}
