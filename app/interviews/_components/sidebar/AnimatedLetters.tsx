"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { KROWE_EASE } from "@/lib/motion/kroweEase";
import { SIDEBAR_LETTER_DURATION_S, SIDEBAR_LETTER_STAGGER_S } from "./sidebarLetterTiming";

type Props = {
  text: string;
  /** When true, letters sit on the baseline; when false, they play the “fallen” pose. */
  expanded: boolean;
  reduceMotion: boolean;
  className?: string;
  "aria-hidden"?: boolean;
};

/**
 * Per-letter fall (right → left) when `expanded` becomes false; rise (left → right) when it becomes true.
 */
export function AnimatedLetters({ text, expanded, reduceMotion, className, ...rest }: Props) {
  const chars = useMemo(() => (text ? [...text] : []), [text]);

  if (chars.length === 0) return null;

  if (reduceMotion) {
    return (
      <motion.span
        className={className}
        initial={false}
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.14, ease: KROWE_EASE }}
        style={{ display: "inline-block", whiteSpace: "nowrap", font: "inherit" }}
        {...rest}
      >
        {text}
      </motion.span>
    );
  }

  return (
    <span
      className={className}
      {...rest}
      style={{ display: "inline-flex", overflow: "visible", font: "inherit" }}
    >
      {chars.map((ch, i) => {
        const isSpace = ch === " ";
        const closeDelay = (chars.length - 1 - i) * SIDEBAR_LETTER_STAGGER_S;
        const openDelay = i * SIDEBAR_LETTER_STAGGER_S;
        return (
          <motion.span
            key={`${ch}-${i}`}
            className="inline-block font-inherit"
            initial={
              expanded
                ? { y: 0, rotate: 0, opacity: 1 }
                : { y: 22, rotate: -9, opacity: 0 }
            }
            animate={
              expanded
                ? {
                    y: 0,
                    rotate: 0,
                    opacity: 1,
                    transition: {
                      duration: SIDEBAR_LETTER_DURATION_S,
                      delay: openDelay,
                      ease: KROWE_EASE,
                    },
                  }
                : {
                    y: 22,
                    rotate: -9,
                    opacity: 0,
                    transition: {
                      duration: SIDEBAR_LETTER_DURATION_S,
                      delay: closeDelay,
                      ease: KROWE_EASE,
                    },
                  }
            }
            style={{ originX: 0.5, originY: 0 }}
          >
            {isSpace ? "\u00a0" : ch}
          </motion.span>
        );
      })}
    </span>
  );
}
