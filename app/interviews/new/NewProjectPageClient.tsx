"use client";

import { FolderPlusIcon, SparklesIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ContentHeader } from "@/app/components/krowe/ContentHeader";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import { KROWE_EASE } from "@/lib/motion/kroweEase";
import { getDashboardPageEntranceTiming } from "@/lib/motion/dashboardPageEntrance";
import { InterviewsPageWidth } from "@/app/interviews/_components/InterviewsPageWidth";
import NewProjectForm from "./NewProjectForm";

const HERO_HEADLINE = "Start with intent, not just a title";
const HERO_SUBCOPY =
  "Shape a clear research brief and launch a project workspace designed for fast interview-driven decisions.";

type Props = {
  isAdmin: boolean;
};

export default function NewProjectPageClient({ isAdmin }: Props) {
  const reduceMotion = useReducedMotion();
  const words = HERO_HEADLINE.split(" ");
  const { clipStart, perWordDelay, clipDuration, supportingDelay, buttonsDelay, overviewBlockDelay } =
    getDashboardPageEntranceTiming(words.length);
  const gridDelay = overviewBlockDelay + 0.06;

  const scrollToForm = () => {
    document.getElementById("new-project-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const headerEl = (
    <ContentHeader
      breadcrumbs={[
        { label: "Interviews", href: "/interviews" },
        { label: "Projects", href: "/interviews/projects" },
        { label: "New project" },
      ]}
      title="Create project"
      description="Define a focused project so interview signals, analysis, and decisions stay traceable from day one."
      actions={
        <KroweLinkButton href="/interviews/projects" variant="secondary">
          Back to projects
        </KroweLinkButton>
      }
    />
  );

  const briefCallout = (
    <div className="noise-surface relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-gradient-to-r from-primary-soft/90 via-background to-card px-5 py-4 shadow-[var(--shadow-1)] sm:px-7">
      <div className="relative z-[2] flex flex-wrap items-center gap-3">
        <FolderPlusIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <p className="text-sm font-medium text-foreground">
          <span className="text-primary">Project brief</span>
          <span className="text-muted-foreground">
            {" "}
            — Name the opportunity space first. Optional session linking helps admins ground downstream spec work in
            known context.
          </span>
        </p>
      </div>
    </div>
  );

  const stepTiles = (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3 shadow-[var(--shadow-1)] backdrop-blur-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Step 1</p>
        <p className="mt-1 text-sm font-medium text-foreground">Name your opportunity space</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3 shadow-[var(--shadow-1)] backdrop-blur-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Step 2</p>
        <p className="mt-1 text-sm font-medium text-foreground">Link context (optional for admins)</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3 shadow-[var(--shadow-1)] backdrop-blur-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Step 3</p>
        <p className="mt-1 text-sm font-medium text-foreground">Launch and begin interview collection</p>
      </div>
    </div>
  );

  const mainGrid = (
    <section
      className="overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-card shadow-[var(--shadow-1)]"
      aria-labelledby="new-project-workspace-heading"
    >
      <div className="grid gap-px bg-border/60 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
        <aside className="relative overflow-hidden bg-gradient-to-br from-primary-soft via-background to-card p-6 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse at 20% 30%, color-mix(in oklch, var(--primary) 14%, transparent) 0%, transparent 55%)",
            }}
          />
          <div className="relative">
            <p
              id="new-project-workspace-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              Guided setup
            </p>
            <h3 className="mt-2 max-w-sm text-pretty text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Build a workspace your team can trust.
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A strong title keeps synthesis, decisions, and activity logs aligned under one narrative.
            </p>
            <div className="mt-6">{stepTiles}</div>
          </div>
        </aside>
        <div className="bg-card p-5 sm:p-8" id="new-project-form">
          <NewProjectForm isAdmin={isAdmin} />
        </div>
      </div>
    </section>
  );

  if (reduceMotion) {
    return (
      <InterviewsPageWidth className="space-y-8 pb-8">
        {headerEl}
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-gradient-to-br from-primary-soft via-background to-card shadow-[var(--shadow-1)]">
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at 80% 40%, color-mix(in oklch, var(--primary) 18%, transparent) 0%, transparent 72%)",
            }}
          />
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold text-primary shadow-[var(--shadow-1)] backdrop-blur-sm">
              <SparklesIcon size={14} className="shrink-0" aria-hidden />
              Research workspace
            </span>
            <h2 className="krowe-display-m mt-4 max-w-3xl text-pretty text-foreground">
              {HERO_HEADLINE.split(" ").map((word, i, arr) =>
                i === arr.length - 1 ? (
                  <span key={`${word}-${i}`} className="text-primary">
                    {word}
                  </span>
                ) : (
                  <span key={`${word}-${i}`}>{word} </span>
                ),
              )}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{HERO_SUBCOPY}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-4)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:-translate-y-px active:translate-y-px"
                style={{ background: "var(--gradient-primary)" }}
              >
                Open project form
              </button>
              <KroweLinkButton href="/interviews/projects" variant="secondary">
                All projects
              </KroweLinkButton>
            </div>
          </div>
        </div>
        {briefCallout}
        {mainGrid}
      </InterviewsPageWidth>
    );
  }

  return (
    <InterviewsPageWidth className="space-y-8 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: KROWE_EASE }}
      >
        {headerEl}
      </motion.div>

      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-gradient-to-br from-primary-soft via-background to-card shadow-[var(--shadow-1)]">
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 80% 40%, color-mix(in oklch, var(--primary) 18%, transparent) 0%, transparent 72%)",
          }}
        />
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.03, ease: KROWE_EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold text-primary shadow-[var(--shadow-1)] backdrop-blur-sm"
          >
            <SparklesIcon size={14} className="shrink-0" aria-hidden />
            Research workspace
          </motion.span>

          <h2 className="krowe-display-m mt-4 max-w-3xl text-pretty text-foreground">
            {words.map((word, i) => {
              const isAccent = i === words.length - 1;
              return (
                <motion.span
                  key={`${word}-${i}`}
                  initial={{ clipPath: "inset(0 100% 0 0)", opacity: 1 }}
                  animate={{ clipPath: "inset(0 0% 0 0)" }}
                  transition={{
                    delay: clipStart + i * perWordDelay,
                    duration: clipDuration,
                    ease: KROWE_EASE,
                  }}
                  className={isAccent ? "text-primary" : undefined}
                  style={{ display: "inline-block", marginRight: "0.28em" }}
                >
                  {word}
                </motion.span>
              );
            })}
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: supportingDelay, duration: 0.26, ease: KROWE_EASE }}
            className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground"
          >
            {HERO_SUBCOPY}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: buttonsDelay, duration: 0.24, ease: KROWE_EASE }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-4)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:-translate-y-px active:translate-y-px"
              style={{ background: "var(--gradient-primary)" }}
            >
              Open project form
            </button>
            <KroweLinkButton href="/interviews/projects" variant="secondary">
              All projects
            </KroweLinkButton>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: overviewBlockDelay, duration: 0.26, ease: KROWE_EASE }}
      >
        {briefCallout}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: gridDelay, duration: 0.28, ease: KROWE_EASE }}
      >
        {mainGrid}
      </motion.div>
    </InterviewsPageWidth>
  );
}
