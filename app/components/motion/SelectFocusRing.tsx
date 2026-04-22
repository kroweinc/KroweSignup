"use client";

import type { ReactNode } from "react";

/**
 * Focus-within ring for native `<select>` — smooth ring when the control is focused (dropdown open/focused).
 */
export function SelectFocusRing({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl transition-[box-shadow] duration-200 ease-out has-[select:focus-visible]:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_28%,transparent)] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
