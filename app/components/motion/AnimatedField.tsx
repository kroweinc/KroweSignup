"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { KROWE_EASE } from "@/lib/motion/kroweEase";

/**
 * Staggered entrance for form fields / filter controls.
 * Wrap native selects for motion-orchestrated pages; pair with select-focus ring via className.
 */
export function AnimatedField({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.22, ease: KROWE_EASE }}
    >
      {children}
    </motion.div>
  );
}
