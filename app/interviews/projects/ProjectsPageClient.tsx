"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { SparklesIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ContentHeader } from "@/app/components/krowe/ContentHeader";
import { KROWE_EASE } from "@/lib/motion/kroweEase";
import { InterviewsPageWidth } from "@/app/interviews/_components/InterviewsPageWidth";
import { ProjectsManagerClient } from "./ProjectsManagerClient";
import type { DashboardProject } from "./types";

export type ProjectsStatCard = {
  label: string;
  value: number;
  hint: string;
};

type Breadcrumb = { label: string; href?: string };

type Props = {
  breadcrumbs: Breadcrumb[];
  title: string;
  description: string;
  headerActions: ReactNode;
  statCards: ProjectsStatCard[];
  readinessPct: number;
  readyProjects: number;
  projectCount: number;
  initialProjects: DashboardProject[];
  isAdmin: boolean;
};

const HERO_HEADLINE = "Turn raw human signal into build-ready decisions.";
const HERO_SUBCOPY =
  "Track interview volume, project readiness, and decision velocity in one operational console. Run analysis the moment you hit your minimum signal threshold.";

export function ProjectsPageClient({
  breadcrumbs,
  title,
  description,
  headerActions,
  statCards,
  readinessPct,
  readyProjects,
  projectCount,
  initialProjects,
  isAdmin,
}: Props) {
  const reduceMotion = useReducedMotion();
  const words = HERO_HEADLINE.split(" ");
  const headlineWordCount = words.length;
  const clipStart = 0.1;
  const perWordDelay = 0.038;
  const clipDuration = 0.24;
  const headlineEnd = clipStart + (headlineWordCount - 1) * perWordDelay + clipDuration;
  const supportingDelay = headlineEnd + 0.04;
  const buttonsDelay = supportingDelay + 0.1;
  const overviewBlockDelay = buttonsDelay + 0.05;
  const metrics = statCards;
  const queueTitleDelay = overviewBlockDelay + 0.16 + metrics.length * 0.022;

  const scrollToList = () => {
    document.getElementById("projects-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (reduceMotion) {
    return (
      <InterviewsPageWidth className="space-y-8">
        <ContentHeader breadcrumbs={breadcrumbs} title={title} description={description} actions={headerActions} />

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
              Interview intelligence
            </span>
            <h2 className="krowe-display-m mt-4 max-w-3xl text-pretty text-foreground">
              Turn raw human signal into{" "}
              <span className="text-primary">build-ready decisions.</span>
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{HERO_SUBCOPY}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToList}
                className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-4)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:-translate-y-px active:translate-y-px"
                style={{ background: "var(--gradient-primary)" }}
              >
                Jump to projects
              </button>
              <Link
                href="/interviews/new"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow-1)] transition-colors duration-[var(--duration-fast)] hover:border-primary hover:bg-surface-subtle"
              >
                New project
              </Link>
            </div>
          </div>
        </div>

        <OverviewSectionStatic
          metrics={metrics}
          readinessPct={readinessPct}
          readyProjects={readyProjects}
          projectCount={projectCount}
        />

        <section>
          <h3 className="mb-4 font-semibold tracking-tight text-foreground text-lg sm:text-xl">All projects</h3>
          <div id="projects-list">
            <ProjectsManagerClient initialProjects={initialProjects} isAdmin={isAdmin} />
          </div>
        </section>
      </InterviewsPageWidth>
    );
  }

  return (
    <InterviewsPageWidth className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: KROWE_EASE }}
      >
        <ContentHeader breadcrumbs={breadcrumbs} title={title} description={description} actions={headerActions} />
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
            Interview intelligence
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
              onClick={scrollToList}
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-4)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:-translate-y-px active:translate-y-px"
              style={{ background: "var(--gradient-primary)" }}
            >
              Jump to projects
            </button>
            <Link
              href="/interviews/new"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow-1)] transition-colors duration-[var(--duration-fast)] hover:border-primary hover:bg-surface-subtle"
            >
              New project
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: overviewBlockDelay, duration: 0.28, ease: KROWE_EASE }}
        className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card shadow-[var(--shadow-1)]"
      >
        <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h3 className="text-sm font-semibold text-foreground">Overview</h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Usage</span>
            <Link
              href="/interviews/usage?range=24h"
              className="rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
            >
              24h
            </Link>
            <Link
              href="/interviews/usage?range=7d"
              className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              7d
            </Link>
            <Link
              href="/interviews/usage?range=30d"
              className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              30d
            </Link>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 lg:p-5">
          {metrics.map((metric, i) => (
            <motion.article
              key={metric.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: overviewBlockDelay + 0.04 + i * 0.034,
                duration: 0.22,
                ease: KROWE_EASE,
              }}
              className="rounded-[var(--radius-lg)] border border-border/80 bg-card px-5 py-4 shadow-[var(--shadow-1)] transition-shadow duration-[var(--duration-fast)] hover:shadow-[var(--shadow-2)]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{metric.label}</p>
              <p className="mt-2 font-sans text-3xl font-semibold tabular-nums text-foreground">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
            </motion.article>
          ))}
        </div>

        <div className="border-t border-border/60 px-4 py-4 sm:px-5">
          <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${readinessPct}%` }}
              transition={{
                delay: overviewBlockDelay + 0.14 + metrics.length * 0.034,
                duration: 0.45,
                ease: KROWE_EASE,
              }}
              style={{ background: "var(--gradient-primary)" }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Decision readiness: {readyProjects}/{projectCount} projects in ready state.
          </p>
        </div>
      </motion.section>

      <section>
        <motion.h3
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: queueTitleDelay, duration: 0.2, ease: KROWE_EASE }}
          className="mb-4 font-semibold tracking-tight text-foreground text-lg sm:text-xl"
        >
          All projects
        </motion.h3>
        <div id="projects-list">
          <ProjectsManagerClient
            initialProjects={initialProjects}
            isAdmin={isAdmin}
            listEntranceDelayBase={queueTitleDelay}
          />
        </div>
      </section>
    </InterviewsPageWidth>
  );
}

function OverviewSectionStatic({
  metrics,
  readinessPct,
  readyProjects,
  projectCount,
}: {
  metrics: ProjectsStatCard[];
  readinessPct: number;
  readyProjects: number;
  projectCount: number;
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card shadow-[var(--shadow-1)]">
      <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h3 className="text-sm font-semibold text-foreground">Overview</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Usage</span>
          <Link
            href="/interviews/usage?range=24h"
            className="rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
          >
            24h
          </Link>
          <Link
            href="/interviews/usage?range=7d"
            className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            7d
          </Link>
          <Link
            href="/interviews/usage?range=30d"
            className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            30d
          </Link>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 lg:p-5">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[var(--radius-lg)] border border-border/80 bg-card px-5 py-4 shadow-[var(--shadow-1)] transition-shadow duration-[var(--duration-fast)] hover:shadow-[var(--shadow-2)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{metric.label}</p>
            <p className="mt-2 font-sans text-3xl font-semibold tabular-nums text-foreground">{metric.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
          </article>
        ))}
      </div>

      <div className="border-t border-border/60 px-4 py-4 sm:px-5">
        <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-[width] duration-[var(--duration-fast)]"
            style={{ width: `${readinessPct}%`, background: "var(--gradient-primary)" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Decision readiness: {readyProjects}/{projectCount} projects in ready state.
        </p>
      </div>
    </section>
  );
}
