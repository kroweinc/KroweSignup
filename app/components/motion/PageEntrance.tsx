"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { KROWE_EASE } from "@/lib/motion/kroweEase";

type Props = {
  children: ReactNode;
  className?: string;
  /** Vertical offset in px before settle (default 8). */
  initialY?: number;
  /** Motion duration in seconds (default 0.24). */
  duration?: number;
};

/**
 * Route-level entrance — fade + lift with Krowe easing (see kroweDesign docs/animations).
 * Honors `prefers-reduced-motion`.
 */
export function PageEntrance({ children, className, initialY = 8, duration = 0.24 }: Props) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: initialY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: KROWE_EASE }}
    >
      {children}
    </motion.div>
  );
}
