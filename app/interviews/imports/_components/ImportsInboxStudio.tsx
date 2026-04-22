"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronRightIcon, ScanSearchIcon } from "lucide-react";
import { EmberGlyph } from "@/app/components/krowe/EmberGlyph";

export type StudioItem = {
  id: string;
  title: string | null;
  transcript_preview: string;
  summary_text: string | null;
  owner_name: string | null;
  owner_email: string | null;
  granola_updated_at: string;
  normalized_text: string;
};

type Props = {
  filteredItems: StudioItem[];
  itemsTotal: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
  projects: { id: string; name: string }[];
  busyId: string | null;
  onAssign: (itemId: string, projectId: string) => void;
  /** Base delay (s) for rail list stagger; aligns with overview / projects page entrance. */
  railEntranceDelayBase?: number;
};

export function ImportsInboxStudio({
  filteredItems,
  itemsTotal,
  selectedId,
  onSelect,
  query,
  onQueryChange,
  projects,
  busyId,
  onAssign,
  railEntranceDelayBase,
}: Props) {
  const reduceMotion = useReducedMotion();

  const selected = useMemo(
    () => filteredItems.find((i) => i.id === selectedId) ?? null,
    [filteredItems, selectedId],
  );

  useEffect(() => {
    if (filteredItems.length === 0) return;
    if (!selectedId || !filteredItems.some((i) => i.id === selectedId)) {
      onSelect(filteredItems[0].id);
    }
  }, [filteredItems, selectedId, onSelect]);

  const stagger = reduceMotion ? 0 : 0.04;
  const railBase =
    !reduceMotion && railEntranceDelayBase !== undefined ? railEntranceDelayBase + 0.04 : 0;
  const railStaggerStep = !reduceMotion && railEntranceDelayBase !== undefined ? 0.028 : stagger;

  if (filteredItems.length === 0) {
    return (
      <div className="noise-surface relative overflow-hidden rounded-[var(--radius-lg)] border border-dashed border-border/80 bg-card px-6 py-16 text-center shadow-[var(--shadow-1)] sm:py-20">
        <div className="relative z-[2] mx-auto flex max-w-md flex-col items-center">
          <EmberGlyph size={56} animated className="opacity-90" />
          <p className="mt-6 font-sans text-base leading-relaxed text-muted-foreground">
            {itemsTotal === 0
              ? "No unassigned transcripts right now. Run a full resync after connecting Granola."
              : "Nothing matches your search. Try another keyword or clear the filter."}
          </p>
          {itemsTotal === 0 && projects.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Create a workspace in{" "}
              <Link href="/interviews/projects" className="font-semibold text-primary underline-offset-4 hover:underline">
                Projects
              </Link>{" "}
              so imports have somewhere to land.
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card shadow-[var(--shadow-2)]">
      <div className="border-b border-border/60 bg-surface-subtle/90 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ScanSearchIcon className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="font-semibold tracking-tight text-foreground text-lg">Inbox studio</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Pick a note on the left; assign it on the blueprint canvas.
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold text-muted-foreground">
            {filteredItems.length} shown · {itemsTotal} total
          </span>
        </div>
        <label htmlFor="import-studio-search" className="sr-only">
          Filter inbox
        </label>
        <input
          id="import-studio-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Filter by title, summary, or transcript…"
          className="mt-4 w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        />
      </div>

      <div className="grid min-h-[min(70vh,880px)] grid-cols-1 lg:grid-cols-[minmax(260px,320px)_1fr]">
        {/* Rail */}
        <aside className="max-h-[min(70vh,880px)] overflow-y-auto border-b border-border/60 bg-muted/20 lg:border-b-0 lg:border-r">
          <ul className="flex flex-col gap-0 p-2">
            <AnimatePresence initial={false} mode="popLayout">
              {filteredItems.map((item, index) => {
                const active = item.id === selectedId;
                return (
                  <motion.li
                    key={item.id}
                    layout
                    initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
                    transition={{
                      duration: reduceMotion ? 0.01 : 0.22,
                      delay: reduceMotion ? 0 : railBase + index * railStaggerStep,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      className={`relative flex w-full gap-3 rounded-[12px] border px-3 py-3 text-left transition-colors duration-[var(--duration-fast)] ${
                        active
                          ? "border-primary/45 bg-primary-soft/90 shadow-[var(--shadow-1)]"
                          : "border-transparent bg-transparent hover:bg-background/90"
                      }`}
                    >
                      {active ? (
                        <span
                          className="absolute bottom-2 left-0 top-2 w-1 rounded-full bg-gradient-to-b from-primary to-primary-accent"
                          aria-hidden
                        />
                      ) : null}
                      <EmberGlyph size={18} animated={active} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.title || "Untitled interview"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {new Date(item.granola_updated_at).toLocaleString()}
                        </p>
                      </div>
                      <ChevronRightIcon
                        className={`mt-1 h-4 w-4 shrink-0 transition-transform ${active ? "translate-x-0.5 text-primary" : "text-muted-foreground/60"}`}
                        aria-hidden
                      />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </aside>

        {/* Canvas */}
        <div className="krowe-blueprint-canvas relative flex min-h-[320px] flex-col lg:min-h-0">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                role="region"
                aria-label="Selected import detail"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex min-h-full flex-1 flex-col"
              >
                <div className="sticky top-0 z-10 border-b border-border/60 bg-background/85 px-4 py-4 backdrop-blur-md sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Assign destination
                      </p>
                      <p className="truncate font-semibold text-foreground">
                        {selected.title || "Untitled interview"}
                      </p>
                    </div>
                    <div className="w-full shrink-0 sm:w-72">
                      <label htmlFor="assign-studio" className="sr-only">
                        Project
                      </label>
                      <select
                        id="assign-studio"
                        defaultValue=""
                        className="w-full rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground shadow-[var(--shadow-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!value) return;
                          onAssign(selected.id, value);
                          e.currentTarget.value = "";
                        }}
                        disabled={busyId === selected.id || projects.length === 0}
                      >
                        <option value="">
                          {projects.length > 0 ? "Assign to project…" : "Create a project first"}
                        </option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4 px-4 py-5 sm:px-6 sm:py-8">
                  <div className="rounded-[12px] border border-border/70 bg-card/90 p-4 shadow-[var(--shadow-1)]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Preview
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/95">{selected.transcript_preview}</p>
                  </div>

                  <details className="group rounded-[12px] border border-border/60 bg-surface-subtle/50">
                    <summary className="cursor-pointer list-none px-4 py-3 font-medium text-sm text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                        Full transcript &amp; meta
                      </span>
                    </summary>
                    <div className="space-y-3 border-t border-border/50 px-4 py-4">
                      {selected.summary_text ? (
                        <p className="text-sm leading-relaxed text-foreground/95">
                          <span className="font-semibold text-foreground">Summary:</span> {selected.summary_text}
                        </p>
                      ) : null}
                      <pre className="max-h-[min(52vh,480px)] overflow-auto whitespace-pre-wrap rounded-[10px] border border-border/60 bg-background p-4 font-mono text-xs leading-relaxed text-foreground/90">
                        {selected.normalized_text}
                      </pre>
                    </div>
                  </details>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
