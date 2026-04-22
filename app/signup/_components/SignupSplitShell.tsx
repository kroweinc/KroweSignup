"use client";

import type { ReactNode } from "react";
import { EditorialPanel } from "@/app/components/shell/EditorialPanel";

export type SignupSplitShellProps = {
  editorialTitle: ReactNode;
  editorialSubtitle?: ReactNode;
  /** Wider right column for dense forms (e.g. URL review). */
  variant?: "default" | "wide";
  children: ReactNode;
};

/**
 * Same 50/50 split rhythm as auth: editorial peach left, white content right.
 */
export function SignupSplitShell({
  editorialTitle,
  editorialSubtitle,
  variant = "default",
  children,
}: SignupSplitShellProps) {
  const maxW = variant === "wide" ? "max-w-4xl" : "max-w-2xl";

  return (
    <div className="signup-shell-layout flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden font-sans md:flex-row">
      <div className="signup-editorial-left flex min-h-[38vh] max-md:max-h-[50dvh] max-md:shrink-0 max-md:overflow-y-auto flex-[1_1_46%] flex-col md:max-w-[52%] lg:flex-[0_0_48%]">
        <EditorialPanel title={editorialTitle} subtitle={editorialSubtitle} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain bg-background">
        <div className={`mx-auto w-full min-w-0 px-6 py-10 md:px-12 md:py-14 ${maxW}`}>{children}</div>
      </div>
      <style>{`
        @media (max-width: 767px) {
          .signup-shell-layout { flex-direction: column !important; }
          .signup-editorial-left { flex: 0 0 auto !important; max-width: none !important; min-height: 38vh; }
        }
      `}</style>
    </div>
  );
}
