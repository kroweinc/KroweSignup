"use client";

import Link from "next/link";
import { LayoutGroup, motion } from "motion/react";
import type { SidebarNavKey } from "./interviewsSidebarTypes";
import { getManifestEntriesForSidebar, type PlatformNavManifestEntry } from "./platformSearchManifest";
import { AnimatedLetters } from "./sidebar/AnimatedLetters";

/** Matches pre–collapsible sidebar: same radius, type scale, padding, and gaps. */
function navClass(active: boolean, railCollapsed: boolean): string {
  const base =
    "relative z-0 flex items-center rounded-[11px] py-2 text-sm transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const layout = railCollapsed ? "justify-center gap-0 px-2" : "gap-2.5 px-2.5";

  if (active) {
    if (railCollapsed) {
      return `${base} ${layout} bg-transparent font-semibold text-primary`;
    }
    return `${base} ${layout} bg-primary-soft/70 font-semibold text-primary`;
  }

  return `${base} ${layout} text-muted-foreground hover:bg-surface-subtle hover:text-foreground`;
}

type Props = {
  activeNav?: SidebarNavKey;
  linkProjectId: string | null;
  railCollapsed: boolean;
  lettersExpanded: boolean;
  reduceMotion: boolean;
};

function isEntryActive(entry: PlatformNavManifestEntry, activeNav?: SidebarNavKey): boolean {
  if (!activeNav) return false;
  const keys = entry.activeNavKeys ?? [entry.navKey];
  return keys.includes(activeNav);
}

export function InterviewsSidebarNav({
  activeNav,
  linkProjectId,
  railCollapsed,
  lettersExpanded,
  reduceMotion,
}: Props) {
  const { platform, workspace, account } = getManifestEntriesForSidebar(linkProjectId);
  const showWorkspace = workspace.length > 0;

  return (
    <LayoutGroup id="interviews-sidebar-nav">
      <nav
        id="interviews-sidebar-nav"
        aria-label="Primary"
        className="relative z-[2] flex min-h-0 flex-1 flex-col space-y-4"
      >
        <div>
          {!railCollapsed ? (
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Platform
            </p>
          ) : null}
          <div className="space-y-0.5">
            {platform.map((entry) => {
              const href = entry.resolveHref({ projectId: linkProjectId });
              if (!href) return null;
              return (
                <NavLink
                  key={entry.id}
                  href={href}
                  active={isEntryActive(entry, activeNav)}
                  icon={entry.icon}
                  label={entry.label}
                  railCollapsed={railCollapsed}
                  lettersExpanded={lettersExpanded}
                  reduceMotion={reduceMotion}
                />
              );
            })}
          </div>
        </div>

        {showWorkspace && linkProjectId && (
          <div>
            {!railCollapsed ? (
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Workspace
              </p>
            ) : null}
            <div className="space-y-0.5">
              {workspace.map((entry) => {
                const href = entry.resolveHref({ projectId: linkProjectId });
                if (!href) return null;
                return (
                  <NavLink
                    key={entry.id}
                    href={href}
                    active={isEntryActive(entry, activeNav)}
                    icon={entry.icon}
                    label={entry.label}
                    railCollapsed={railCollapsed}
                    lettersExpanded={lettersExpanded}
                    reduceMotion={reduceMotion}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-auto shrink-0 border-t border-border/50 pt-3">
          <div className="space-y-0.5">
            {(() => {
              const href = account.resolveHref({ projectId: linkProjectId });
              if (!href) return null;
              return (
                <NavLink
                  href={href}
                  active={isEntryActive(account, activeNav)}
                  icon={account.icon}
                  label={account.label}
                  railCollapsed={railCollapsed}
                  lettersExpanded={lettersExpanded}
                  reduceMotion={reduceMotion}
                />
              );
            })()}
          </div>
        </div>
      </nav>
    </LayoutGroup>
  );
}

function NavLink({
  href,
  active,
  icon,
  label,
  railCollapsed,
  lettersExpanded,
  reduceMotion,
}: {
  href: string;
  active: boolean;
  icon: string;
  label: string;
  railCollapsed: boolean;
  lettersExpanded: boolean;
  reduceMotion: boolean;
}) {
  const showLabel = !railCollapsed;

  return (
    <Link
      href={href}
      className={`${navClass(active, railCollapsed)} ${railCollapsed ? "overflow-visible" : ""}`}
      aria-current={active ? "page" : undefined}
      aria-label={railCollapsed ? label : undefined}
      title={railCollapsed ? label : undefined}
    >
      {active ? (
        <motion.span
          layoutId="interviews-sidebar-active-cap"
          layout={!reduceMotion}
          className={
            railCollapsed
              ? "pointer-events-none absolute inset-[4px] z-0 rounded-[11px] border-2 border-primary bg-primary-soft/15 shadow-[0_0_16px_color-mix(in_oklch,var(--primary)_42%,transparent),inset_0_0_12px_color-mix(in_oklch,var(--primary)_12%,transparent)]"
              : "pointer-events-none absolute inset-y-[5px] left-1 z-0 w-[3px] rounded-full bg-gradient-to-b from-primary via-primary to-primary-accent shadow-[0_0_14px_color-mix(in_oklch,var(--primary)_38%,transparent)]"
          }
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          aria-hidden
        />
      ) : null}
      <span
        className={`relative z-[1] flex min-w-0 flex-1 items-center gap-2.5 ${railCollapsed ? "justify-center" : ""}`}
      >
        <span className="material-symbols-outlined text-[18px] opacity-85" aria-hidden>
          {icon}
        </span>
        {showLabel ? (
          <span className="min-w-0 flex-1 overflow-visible text-left">
            <AnimatedLetters text={label} expanded={lettersExpanded} reduceMotion={reduceMotion} />
          </span>
        ) : null}
      </span>
    </Link>
  );
}
