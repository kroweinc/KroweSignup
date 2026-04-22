"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { InterviewsSidebarNav } from "./InterviewsSidebarNav";
import type { SidebarNavKey } from "./interviewsSidebarTypes";
import { AnimatedLetters } from "./sidebar/AnimatedLetters";
import { INTERVIEWS_SIDEBAR_RAIL_ATTR } from "./interviewsSidebarRailDom";
import { serializeInterviewSidebarRailCookie } from "./interviewsSidebarCookie";

const STORAGE_KEY = "krowe:interviews-sidebar-collapsed";
/** Matches `transition-[width]` on the aside (ms). */
const SIDEBAR_WIDTH_TRANSITION_MS = 300;

type Props = {
  activeNav?: SidebarNavKey;
  routeProjectId?: string;
  linkProjectId: string | null;
  inProjectRoute: boolean;
  /** From server cookie so first paint matches persisted rail (no expand→collapse flash on navigation). */
  initialRailCollapsed: boolean;
};

export function InterviewsSidebarClient({
  activeNav,
  routeProjectId,
  linkProjectId,
  inProjectRoute,
  initialRailCollapsed,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [railCollapsed, setRailCollapsed] = useState(initialRailCollapsed);
  const [lettersExpanded, setLettersExpanded] = useState(!initialRailCollapsed);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    for (const t of timeoutsRef.current) {
      clearTimeout(t);
    }
    timeoutsRef.current = [];
  }, []);

  /** Legacy: localStorage-only users get state + cookie aligned before first paint (desktop). */
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    if (initialRailCollapsed) return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") {
        setRailCollapsed(true);
        setLettersExpanded(false);
        document.cookie = serializeInterviewSidebarRailCookie(true);
      }
    } catch {
      /* ignore */
    }
  }, [initialRailCollapsed]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      if (!mq.matches) {
        clearTimers();
        setRailCollapsed(false);
        setLettersExpanded(true);
        try {
          window.localStorage.setItem(STORAGE_KEY, "0");
          document.cookie = serializeInterviewSidebarRailCookie(false);
        } catch {
          /* ignore */
        }
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    document.documentElement.setAttribute(
      INTERVIEWS_SIDEBAR_RAIL_ATTR,
      railCollapsed ? "collapsed" : "expanded",
    );
    return () => {
      document.documentElement.removeAttribute(INTERVIEWS_SIDEBAR_RAIL_ATTR);
    };
  }, [railCollapsed]);

  const persist = useCallback((collapsed: boolean) => {
    try {
      document.cookie = serializeInterviewSidebarRailCookie(collapsed);
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const handleToggle = useCallback(() => {
    clearTimers();
    if (reduceMotion) {
      const next = !railCollapsed;
      setRailCollapsed(next);
      setLettersExpanded(!next);
      persist(next);
      return;
    }

    if (!railCollapsed) {
      // Mirror open: letters first, then rail after the same width-transition delay.
      setLettersExpanded(false);
      const tClose = setTimeout(() => {
        setRailCollapsed(true);
        persist(true);
      }, SIDEBAR_WIDTH_TRANSITION_MS);
      timeoutsRef.current.push(tClose);
      return;
    }

    setRailCollapsed(false);
    persist(false);
    const t = setTimeout(() => {
      setLettersExpanded(true);
    }, SIDEBAR_WIDTH_TRANSITION_MS);
    timeoutsRef.current.push(t);
  }, [clearTimers, persist, railCollapsed, reduceMotion]);

  const showAllProjects = inProjectRoute && routeProjectId && !railCollapsed;

  return (
    <aside
      id="interviews-sidebar"
      className={`sticky top-0 flex h-screen shrink-0 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain border-r border-border bg-background [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/60 [&::-webkit-scrollbar]:w-1.5 ${
        railCollapsed ? "px-2 pb-4 pt-2 md:w-[76px]" : "p-3 pb-4 md:w-[260px]"
      } w-full transition-[width,padding] duration-[300ms] ease-[var(--ease-out-smooth)] max-md:w-full`}
    >
      {/* Brand + toggle (toggle above logo when rail is collapsed) */}
      <div
        className={`mb-1 overflow-visible ${railCollapsed ? "flex flex-col items-stretch gap-1.5 py-0.5" : "flex flex-row items-center gap-1.5"}`}
      >
        {railCollapsed ? (
          <>
            <button
              type="button"
              className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:bg-surface-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              aria-expanded={false}
              aria-controls="interviews-sidebar-nav"
              onClick={handleToggle}
              title="Expand sidebar"
            >
              <PanelLeftOpen className="size-[18px]" strokeWidth={2} aria-hidden />
              <span className="sr-only">Expand sidebar</span>
            </button>
            <Link
              href="/interviews/projects"
              aria-label="Krowe, all projects"
              className="mx-auto flex items-center justify-center rounded-[var(--radius-md)] px-2 py-2.5 transition-colors duration-[var(--duration-fast)] hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <Image
                src="/KroweIcon.png"
                alt=""
                width={26}
                height={26}
                className="rounded-[6px] object-contain"
                aria-hidden
              />
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/interviews/projects"
              aria-label="Krowe, all projects"
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-2.5 transition-colors duration-[var(--duration-fast)] hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              <Image
                src="/KroweIcon.png"
                alt=""
                width={26}
                height={26}
                className="shrink-0 rounded-[6px] object-contain"
                aria-hidden
              />
              <span className="krowe-display-m min-w-0 text-[1.125rem] leading-none tracking-tight text-foreground">
                <AnimatedLetters text="Krowe" expanded={lettersExpanded} reduceMotion={Boolean(reduceMotion)} />
              </span>
            </Link>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:bg-surface-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              aria-expanded={true}
              aria-controls="interviews-sidebar-nav"
              onClick={handleToggle}
              title="Collapse sidebar"
            >
              <PanelLeftClose className="size-[18px]" strokeWidth={2} aria-hidden />
              <span className="sr-only">Collapse sidebar</span>
            </button>
          </>
        )}
      </div>

      <div className="mb-3 h-px bg-border/60" />

      {showAllProjects ? (
        <Link
          href="/interviews/projects"
          className="mb-4 flex items-center gap-2 rounded-[11px] border border-dashed border-border/85 bg-background px-2.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-[var(--duration-fast)] hover:border-primary/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <span className="material-symbols-outlined text-[18px] text-primary opacity-90" aria-hidden>
            chevron_left
          </span>
          All projects
        </Link>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col">
        <InterviewsSidebarNav
          activeNav={activeNav}
          linkProjectId={linkProjectId}
          railCollapsed={railCollapsed}
          lettersExpanded={lettersExpanded}
          reduceMotion={Boolean(reduceMotion)}
        />
      </div>
    </aside>
  );
}
