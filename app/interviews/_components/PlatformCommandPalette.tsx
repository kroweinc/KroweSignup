"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search } from "lucide-react";
import { KroweInput } from "@/app/components/krowe/KroweInput";
import { KROWE_EASE } from "@/lib/motion/kroweEase";
import { parseInterviewsProjectIdFromPathname } from "@/lib/interviews/interviewsPathname";
import { getCommandPaletteNavRows } from "./platformSearchManifest";
import { filterAndSortPaletteRows, type PaletteRow } from "@/lib/interviews/platformSearchFilter";

const PALETTE_TRANSITION = { duration: 0.22, ease: KROWE_EASE };
/** Single transition for scrim opacity + blur so open and close feel equally smooth. */
const OVERLAY_TRANSITION = { duration: 0.44, ease: KROWE_EASE };
const ROW_TRANSITION = { duration: 0.18, ease: KROWE_EASE };

type ApiProject = {
  id: string;
  name: string;
  status: string;
};

type Props = {
  shellProjectId?: string;
};

function emptySubscribe() {
  return () => {};
}

export function PlatformCommandPalette({ shellProjectId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const dialogId = useId();
  const listboxId = `${dialogId}-listbox`;
  const titleId = `${dialogId}-title`;

  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  const pathnameProjectId = useMemo(() => parseInterviewsProjectIdFromPathname(pathname ?? ""), [pathname]);
  const primaryFromProjects = projects[0]?.id ?? null;
  const effectiveProjectId = shellProjectId ?? pathnameProjectId ?? primaryFromProjects;

  const navRows: PaletteRow[] = useMemo(() => {
    const ctx = { projectId: effectiveProjectId };
    return getCommandPaletteNavRows(ctx).map((r) => ({
      id: r.id,
      group: r.group,
      label: r.label,
      subtitle: r.subtitle,
      href: r.href,
      icon: r.icon,
      keywords: r.keywords,
    }));
  }, [effectiveProjectId]);

  const projectRows: PaletteRow[] = useMemo(
    () =>
      projects.map((p) => ({
        id: `project:${p.id}`,
        group: "projects" as const,
        label: p.name,
        subtitle: p.status.replace(/_/g, " "),
        href: `/interviews/${p.id}`,
        icon: "workspaces",
        keywords: [p.status, p.id],
      })),
    [projects],
  );

  const allRows = useMemo(() => [...navRows, ...projectRows], [navRows, projectRows]);
  const filteredRows = useMemo(() => filterAndSortPaletteRows(query, allRows, 50), [query, allRows]);

  const maxIdx = Math.max(0, filteredRows.length - 1);
  const safeActiveIndex = filteredRows.length === 0 ? 0 : Math.min(activeIndex, maxIdx);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/interviews/project", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = (await res.json()) as { projects?: ApiProject[] };
      setProjects(data.projects ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    // Async refresh when palette opens; avoids stale project list.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadProjects only updates state from network response
    void loadProjects();
  }, [open, loadProjects]);

  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      const isK = e.key === "k" || e.key === "K";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen((o) => {
          if (o) return false;
          setQuery("");
          setActiveIndex(0);
          return true;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(t);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const activeRow = filteredRows[safeActiveIndex];
  const activeDescendantId = activeRow ? `${dialogId}-opt-${activeRow.id}` : undefined;

  useEffect(() => {
    if (!open || !activeDescendantId) return;
    requestAnimationFrame(() => {
      document.getElementById(activeDescendantId)?.scrollIntoView({ block: "nearest" });
    });
  }, [activeDescendantId, open, safeActiveIndex]);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const onOverlayExitComplete = useCallback(() => {
    setQuery("");
    setActiveIndex(0);
    document.body.style.overflow = "";
    prevFocusRef.current?.focus?.();
    prevFocusRef.current = null;
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  const onDialogKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (filteredRows.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((safeActiveIndex + 1) % filteredRows.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((safeActiveIndex - 1 + filteredRows.length) % filteredRows.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const row = filteredRows[safeActiveIndex];
      if (row) go(row.href);
    }
  };

  const transition = reduceMotion ? { duration: 0.01 } : PALETTE_TRANSITION;

  if (!isClient) return null;

  const overlay = (
    <AnimatePresence onExitComplete={onOverlayExitComplete}>
      {open ? (
        <motion.div
          key="platform-command-palette"
          className="fixed inset-0 z-[200] cursor-default bg-background/28 [will-change:backdrop-filter,opacity]"
          role="presentation"
          initial={
            reduceMotion
              ? { opacity: 1, backdropFilter: "blur(8px)" }
              : { opacity: 0, backdropFilter: "blur(0px)" }
          }
          animate={{
            opacity: 1,
            backdropFilter: reduceMotion ? "blur(8px)" : "blur(16px)",
          }}
          exit={
            reduceMotion
              ? { opacity: 1, backdropFilter: "blur(8px)" }
              : {
                  opacity: 0,
                  backdropFilter: "blur(0px)",
                }
          }
          transition={reduceMotion ? { duration: 0.01 } : OVERLAY_TRANSITION}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="pointer-events-none absolute inset-0 z-[1] flex items-start justify-center pt-[min(12vh,120px)] px-3 sm:px-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="pointer-events-auto w-full max-w-2xl overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card shadow-[var(--shadow-3)]"
              initial={reduceMotion ? { y: 0, scale: 1 } : { y: 10, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              transition={transition}
              onKeyDown={onDialogKeyDown}
            >
              <h2 id={titleId} className="sr-only">
                Search Krowe
              </h2>
              <div className="border-b border-border/80 p-3">
                <KroweInput
                  ref={inputRef}
                  icon={<Search className="size-4" aria-hidden />}
                  placeholder="Search pages and projects…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls={listboxId}
                  aria-activedescendant={activeDescendantId}
                  className="[&_input]:text-[15px]"
                />
              </div>

              <div
                id={listboxId}
                role="listbox"
                aria-label="Results"
                className="max-h-[min(52vh,420px)] overflow-y-auto overscroll-contain px-1 py-2 [scrollbar-width:thin]"
              >
                {filteredRows.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches.</p>
                ) : (
                  <GroupedPaletteList
                    rows={filteredRows}
                    activeIndex={safeActiveIndex}
                    onPick={go}
                    onHoverIndex={setActiveIndex}
                    dialogId={dialogId}
                    reduceMotion={Boolean(reduceMotion)}
                  />
                )}
              </div>

              <div className="border-t border-border/60 px-3 py-2 text-center text-[11px] text-muted-foreground">
                <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                  <span>↑↓ Navigate</span>
                  <span>·</span>
                  <span>↵ Open</span>
                  <span>·</span>
                  <span>esc Close</span>
                  <span>·</span>
                  <span>⌘K / Ctrl+K</span>
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}

function groupLabel(group: PaletteRow["group"]): string {
  if (group === "platform") return "Platform";
  if (group === "workspace") return "Workspace";
  return "Projects";
}

type GroupedProps = {
  rows: PaletteRow[];
  activeIndex: number;
  onPick: (href: string) => void;
  onHoverIndex: (i: number) => void;
  dialogId: string;
  reduceMotion: boolean;
};

function GroupedPaletteList({ rows, activeIndex, onPick, onHoverIndex, dialogId, reduceMotion }: GroupedProps) {
  const groups: PaletteRow["group"][] = ["platform", "workspace", "projects"];

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const items = rows
          .map((row, globalIndex) => ({ row, globalIndex }))
          .filter(({ row }) => row.group === group);
        if (items.length === 0) return null;

        return (
          <div key={group}>
            <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {groupLabel(group)}
            </p>
            <div className="flex flex-col gap-0.5">
              <AnimatePresence initial={false} mode="popLayout">
                {items.map(({ row, globalIndex }) => {
                  const isActive = globalIndex === activeIndex;
                  const optId = `${dialogId}-opt-${row.id}`;
                  return (
                    <motion.div
                      key={row.id}
                      layout={!reduceMotion}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={ROW_TRANSITION}
                    >
                      <button
                        type="button"
                        id={optId}
                        role="option"
                        aria-selected={isActive}
                        className={`flex w-full items-center gap-2.5 rounded-[11px] px-2.5 py-2.5 text-left text-sm transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] ${
                          isActive
                            ? "bg-primary-soft/70 font-medium text-primary"
                            : "text-foreground hover:bg-surface-subtle"
                        }`}
                        onMouseEnter={() => onHoverIndex(globalIndex)}
                        onClick={() => onPick(row.href)}
                      >
                        <span className="material-symbols-outlined shrink-0 text-[20px] opacity-85" aria-hidden>
                          {row.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{row.label}</span>
                          {row.subtitle ? (
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{row.subtitle}</span>
                          ) : null}
                        </span>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
