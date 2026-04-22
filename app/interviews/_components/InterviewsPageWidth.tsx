"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { INTERVIEWS_SIDEBAR_RAIL_ATTR } from "./interviewsSidebarRailDom";

function subscribe(onStoreChange: () => void) {
  const el = document.documentElement;
  const obs = new MutationObserver(onStoreChange);
  obs.observe(el, { attributes: true, attributeFilter: [INTERVIEWS_SIDEBAR_RAIL_ATTR] });
  return () => obs.disconnect();
}

function railCollapsedFromDom(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute(INTERVIEWS_SIDEBAR_RAIL_ATTR) === "collapsed";
}

type Cap = 1200 | 1400;

type Props = {
  children: ReactNode;
  className?: string;
  /** Default max width (px) when the sidebar is expanded. Grows by 400px when the rail is collapsed (md+). */
  cap?: Cap;
};

/**
 * Centers interview page content and caps its max width; the cap increases when the sidebar rail is collapsed
 * so the main column uses the extra horizontal space without overflowing the viewport.
 */
export function InterviewsPageWidth({ children, className, cap = 1200 }: Props) {
  const collapsed = useSyncExternalStore(subscribe, railCollapsedFromDom, () => false);
  const maxPx = collapsed ? cap + 400 : cap;
  const style = { maxWidth: `min(100%, ${maxPx}px)` } as const;

  return (
    <div className={["mx-auto w-full", className].filter(Boolean).join(" ")} style={style}>
      {children}
    </div>
  );
}
