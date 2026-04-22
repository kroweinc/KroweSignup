"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquareQuoteIcon, SparklesIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ContentHeader } from "@/app/components/krowe/ContentHeader";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import { RunAnalysisButton } from "./RunAnalysisButton";
import { GranolaImportsButton } from "./GranolaImportsButton";
import type { FeatureSpec, ProblemCluster, DecisionOutput } from "@/lib/interviews/types";
import { toLiveInsightsClusterTitle } from "@/lib/interviews/liveInsightsTitle";
import type { InterviewSignalLabel, InterviewSignalMetrics } from "@/lib/interviews/interviewSignal";
import type { AnalysisResponse } from "@/lib/analysis/hypothesisVsReality";
import { KROWE_EASE } from "@/lib/motion/kroweEase";
import { InterviewsPageWidth } from "@/app/interviews/_components/InterviewsPageWidth";

type Interview = {
  id: string;
  status: "pending" | "structured" | "failed";
  created_at: string;
  interviewee_name: string | null;
  interviewee_context: string | null;
  high_signal: boolean;
  signal_label: InterviewSignalLabel;
  signal_metrics: InterviewSignalMetrics;
};

type Project = {
  id: string;
  name: string;
  status: "collecting" | "processing" | "ready" | "failed";
  interview_count: number;
  created_at: string;
  updated_at: string;
  session_id: string | null;
  onboarding_mode: "manual" | "webscraper" | null;
  onboarding_completed_at: string | null;
};

type ClusterWithId = ProblemCluster & { id: string };
type DecisionWithId = Omit<DecisionOutput, "project_id"> & {
  id: string;
  updated_at: string;
};
type AnalysisDecision = AnalysisResponse["decision"];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    collecting: "bg-primary-soft text-primary border border-primary/35",
    processing:  "bg-warning-soft text-warning border border-warning/40",
    ready:       "bg-success-soft text-success border border-success/40",
    failed:      "bg-danger-soft text-danger border border-danger/40",
    pending:     "bg-muted text-muted-foreground border border-border",
    structured:  "bg-success-soft text-success border border-success/40",
  };
  const dots: Record<string, string> = {
    collecting: "bg-primary animate-pulse",
    processing: "bg-warning animate-pulse",
    ready:      "bg-success",
  };
  const labels: Record<string, string> = {
    collecting: "Collecting",
    processing: "Processing",
    ready:      "Ready",
    failed:     "Failed",
    pending:    "Pending",
    structured: "Structured",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
        styles[status] ?? "bg-muted text-muted-foreground border border-border"
      }`}
    >
      {dots[status] && (
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      )}
      {labels[status] ?? status}
    </span>
  );
}

type Props = {
  project: Project;
  interviews: Interview[];
  projectId: string;
  latestDecision: DecisionWithId | null;
  latestDecisionVerdict: AnalysisDecision | null;
  topCluster: ClusterWithId | null;
  allClusters: ClusterWithId[];
  decisionFeatures: FeatureSpec[];
};

function formatTimeAgo(iso?: string) {
  if (!iso) return "No analysis yet";
  const ms = Date.now() - new Date(iso).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (ms < minute) return "just now";
  if (ms < hour) return `${Math.floor(ms / minute)}m ago`;
  if (ms < day) return `${Math.floor(ms / hour)}h ago`;
  return `${Math.floor(ms / day)}d ago`;
}

function initialForName(name: string | null, fallbackIndex: number) {
  if (!name) return `#${fallbackIndex + 1}`;
  return name.trim().charAt(0).toUpperCase() || `#${fallbackIndex + 1}`;
}

function signalBadgeClasses(label: InterviewSignalLabel) {
  if (label === "High") return "bg-primary-soft text-interview-brand";
  if (label === "Medium") return "bg-muted text-muted-foreground";
  return "bg-danger-soft text-danger";
}

function deriveDecisionLabel(status?: DecisionOutput["status"]) {
  if (status === "ready") return "Ready";
  if (status === "processing") return "Processing";
  if (status === "insufficient_data") return "Insufficient Data";
  if (status === "failed") return "Failed";
  return "Not Run";
}

function deriveVerdictLabel(
  verdict: AnalysisDecision | null,
  status?: DecisionOutput["status"]
) {
  if (verdict === "proceed") return "Proceed";
  if (verdict === "refine") return "Refine";
  if (verdict === "pivot") return "Pivot";
  if (verdict === "rethink") return "Rethink";
  return deriveDecisionLabel(status);
}

function deriveVerdictClassName(verdict: AnalysisDecision | null): string {
  if (verdict === "proceed") return "text-success";
  if (verdict === "pivot") return "text-danger";
  if (verdict === "refine") return "text-warning";
  return "text-foreground";
}

const PROJECT_HERO_HEADLINE = "Turn scattered transcripts into one decision spine.";
const PROJECT_HERO_SUBCOPY =
  "This workspace aggregates voices, clusters pain, and tracks verdict confidence — add interviews, run analysis when you hit three, then tighten the narrative in Decision.";

function formatPipelineLabel(status: Project["status"]): string {
  const labels: Record<Project["status"], string> = {
    collecting: "Collecting",
    processing: "Processing",
    ready: "Ready",
    failed: "Failed",
  };
  return labels[status] ?? status;
}

type OverviewMetric = { label: string; value: string | number; hint: string };

export function ProjectPageClient({
  project,
  interviews,
  projectId,
  latestDecision,
  latestDecisionVerdict,
  topCluster,
  allClusters,
  decisionFeatures,
}: Props) {
  const router = useRouter();
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const confidencePct = Math.round((latestDecision?.confidence_score ?? 0) * 100);
  const rankedClusters = useMemo(() => allClusters.slice(0, 3), [allClusters]);
  const suggestedFeatures = useMemo(() => decisionFeatures.slice(0, 2), [decisionFeatures]);
  const decisionLabel = deriveDecisionLabel(latestDecision?.status);
  const verdictLabel = deriveVerdictLabel(latestDecisionVerdict, latestDecision?.status);
  const verdictClassName = deriveVerdictClassName(latestDecisionVerdict);
  const topQuotes = topCluster?.supporting_quotes ?? [];
  const highSignalCount = useMemo(
    () => interviews.filter((i) => i.high_signal).length,
    [interviews],
  );

  async function handleDeleteInterview(interviewId: string) {
    setDeleteError(null);
    setDeleteLoadingId(interviewId);
    try {
      const res = await fetch(`/api/interviews/${interviewId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to delete interview.");
      }
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete interview.");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  const reduceMotion = useReducedMotion();
  const heroWords = PROJECT_HERO_HEADLINE.split(" ");
  const hw = heroWords.length;
  const clipStart = 0.1;
  const perWordDelay = 0.038;
  const clipDuration = 0.24;
  const headlineEnd = clipStart + (hw - 1) * perWordDelay + clipDuration;
  const supportingDelay = headlineEnd + 0.04;
  const buttonsDelay = supportingDelay + 0.1;
  const overviewBlockDelay = buttonsDelay + 0.05;
  const metricCount = 4;
  const queueTitleDelay = overviewBlockDelay + 0.16 + metricCount * 0.022;
  const libraryContentDelay = queueTitleDelay + 0.06;

  const overviewMetrics: OverviewMetric[] = [
    {
      label: "Interviews",
      value: project.interview_count,
      hint:
        project.interview_count < 3
          ? `${3 - project.interview_count} more to unlock analysis`
          : "Ready to analyze or keep capturing signal",
    },
    {
      label: "Verdict lens",
      value: verdictLabel,
      hint: `Decision: ${decisionLabel}`,
    },
    {
      label: "Problem clusters",
      value: allClusters.length,
      hint: topCluster ? "Top theme ranked by synthesis" : "Clusters appear after analysis",
    },
    {
      label: "Pipeline",
      value: formatPipelineLabel(project.status),
      hint: "Workspace lifecycle",
    },
  ];

  const readinessPct = Math.min(
    100,
    Math.max(
      22,
      project.interview_count >= 3
        ? 38 + Math.min(highSignalCount * 12, 32) + Math.min(allClusters.length * 5, 22)
        : 20 + project.interview_count * 22,
    ),
  );

  const overviewCaption = `${highSignalCount} high-signal · ${allClusters.length} cluster${allClusters.length !== 1 ? "s" : ""} · ${project.interview_count} interview${project.interview_count !== 1 ? "s" : ""}`;

  function scrollToLibrary() {
    document.getElementById("project-conversation-library")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const heroRails = reduceMotion ? (
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
          Workspace
        </span>
        <h2 className="krowe-display-m mt-4 max-w-3xl text-pretty text-foreground">
          Turn scattered transcripts into one decision{" "}
          <span className="text-primary">spine.</span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{PROJECT_HERO_SUBCOPY}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={scrollToLibrary}
            className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-4)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:-translate-y-px active:translate-y-px"
            style={{ background: "var(--gradient-primary)" }}
          >
            Jump to library
          </button>
          <Link
            href={`/interviews/${projectId}/script`}
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow-1)] transition-colors duration-[var(--duration-fast)] hover:border-primary hover:bg-surface-subtle"
          >
            Interview script
          </Link>
        </div>
      </div>
    </div>
  ) : (
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
          Workspace
        </motion.span>

        <h2 className="krowe-display-m mt-4 max-w-3xl text-pretty text-foreground">
          {heroWords.map((word, i) => {
            const isAccent = i === heroWords.length - 1;
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
          {PROJECT_HERO_SUBCOPY}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: buttonsDelay, duration: 0.24, ease: KROWE_EASE }}
          className="mt-6 flex flex-wrap items-center gap-3"
        >
          <button
            type="button"
            onClick={scrollToLibrary}
            className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-4)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:-translate-y-px active:translate-y-px"
            style={{ background: "var(--gradient-primary)" }}
          >
            Jump to library
          </button>
          <Link
            href={`/interviews/${projectId}/script`}
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow-1)] transition-colors duration-[var(--duration-fast)] hover:border-primary hover:bg-surface-subtle"
          >
            Interview script
          </Link>
        </motion.div>
      </div>
    </div>
  );

  const overviewRails = reduceMotion ? (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card shadow-[var(--shadow-1)]">
      <div className="border-b border-border/60 px-4 py-4 sm:px-5">
        <h3 className="text-sm font-semibold text-foreground">Overview</h3>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 lg:p-5">
        {overviewMetrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[var(--radius-lg)] border border-border/80 bg-card px-5 py-4 shadow-[var(--shadow-1)] transition-shadow duration-[var(--duration-fast)] hover:shadow-[var(--shadow-2)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{metric.label}</p>
            <p
              className={
                typeof metric.value === "number"
                  ? "mt-2 font-sans text-3xl font-semibold tabular-nums text-foreground"
                  : "mt-2 break-words font-sans text-lg font-semibold leading-snug text-foreground sm:text-xl"
              }
            >
              {metric.value}
            </p>
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
        <p className="text-xs text-muted-foreground">{overviewCaption}</p>
      </div>
    </section>
  ) : (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: overviewBlockDelay, duration: 0.28, ease: KROWE_EASE }}
      className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card shadow-[var(--shadow-1)]"
    >
      <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h3 className="text-sm font-semibold text-foreground">Overview</h3>
        <span className="truncate text-xs text-muted-foreground">{project.name}</span>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 lg:p-5">
        {overviewMetrics.map((metric, i) => (
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
            <p
              className={
                typeof metric.value === "number"
                  ? "mt-2 font-sans text-3xl font-semibold tabular-nums text-foreground"
                  : "mt-2 break-words font-sans text-lg font-semibold leading-snug text-foreground sm:text-xl"
              }
            >
              {metric.value}
            </p>
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
              delay: overviewBlockDelay + 0.14 + overviewMetrics.length * 0.034,
              duration: 0.45,
              ease: KROWE_EASE,
            }}
            style={{ background: "var(--gradient-primary)" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{overviewCaption}</p>
      </div>
    </motion.section>
  );

  const runwayRails = reduceMotion ? (
    <div className="noise-surface relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-gradient-to-br from-primary-soft/85 via-background to-card px-5 py-4 shadow-[var(--shadow-1)] sm:px-7 sm:py-5">
      <div
        className="pointer-events-none absolute -right-8 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--interview-brand) 22%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-background/80 shadow-[var(--shadow-1)]">
            <MessageSquareQuoteIcon className="h-5 w-5 text-primary" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Conversation runway
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-foreground">
              <span className="font-semibold text-primary">Voice-led discovery</span>
              <span className="text-muted-foreground">
                {" "}
                — every interview here feeds clusters, confidence, and the decision deck. Keep momentum: add voices, then
                run analysis when you hit three.
              </span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm">
          <SparklesIcon className="h-4 w-4 text-primary" aria-hidden />
          <span>
            <span className="font-semibold tabular-nums text-foreground">{project.interview_count}</span> in flight
            {project.interview_count < 3 ? (
              <span className="text-muted-foreground"> · {3 - project.interview_count} until analysis unlocks</span>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: queueTitleDelay, duration: 0.28, ease: KROWE_EASE }}
      className="noise-surface relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-gradient-to-br from-primary-soft/85 via-background to-card px-5 py-4 shadow-[var(--shadow-1)] sm:px-7 sm:py-5"
    >
      <div
        className="pointer-events-none absolute -right-8 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--interview-brand) 22%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-background/80 shadow-[var(--shadow-1)]">
            <MessageSquareQuoteIcon className="h-5 w-5 text-primary" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Conversation runway
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-foreground">
              <span className="font-semibold text-primary">Voice-led discovery</span>
              <span className="text-muted-foreground">
                {" "}
                — every interview here feeds clusters, confidence, and the decision deck. Keep momentum: add voices, then
                run analysis when you hit three.
              </span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm">
          <SparklesIcon className="h-4 w-4 text-primary" aria-hidden />
          <span>
            <span className="font-semibold tabular-nums text-foreground">{project.interview_count}</span> in flight
            {project.interview_count < 3 ? (
              <span className="text-muted-foreground"> · {3 - project.interview_count} until analysis unlocks</span>
            ) : null}
          </span>
        </div>
      </div>
    </motion.div>
  );

  const MainTag = reduceMotion ? "main" : motion.main;

  return (
    <section className="min-w-0">
      <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
        <InterviewsPageWidth className="space-y-8">
          {reduceMotion ? (
            <ContentHeader
              breadcrumbs={[
                { label: "Interviews", href: "/interviews" },
                { label: project.name },
              ]}
              title={project.name}
              description="Strategic synthesis for this workspace — transcripts, signal, and decision readiness in one place."
              actions={
                <>
                  <span className="hidden items-center sm:inline-flex">
                    <StatusBadge status={project.status} />
                  </span>
                  <KroweLinkButton href={`/interviews/${projectId}/business-profile`} variant="secondary">
                    Business profile
                  </KroweLinkButton>
                  <KroweLinkButton href={`/interviews/${projectId}/script`} variant="secondary">
                    Script
                  </KroweLinkButton>
                  <KroweLinkButton href={`/interviews/${projectId}/decision`} variant="secondary">
                    Decision
                  </KroweLinkButton>
                  <KroweLinkButton href={`/interviews/${projectId}/add`} variant="primary">
                    + Add interview
                  </KroweLinkButton>
                </>
              }
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, ease: KROWE_EASE }}
            >
              <ContentHeader
                breadcrumbs={[
                  { label: "Interviews", href: "/interviews" },
                  { label: project.name },
                ]}
                title={project.name}
                description="Strategic synthesis for this workspace — transcripts, signal, and decision readiness in one place."
                actions={
                  <>
                    <span className="hidden items-center sm:inline-flex">
                      <StatusBadge status={project.status} />
                    </span>
                    <KroweLinkButton href={`/interviews/${projectId}/business-profile`} variant="secondary">
                      Business profile
                    </KroweLinkButton>
                    <KroweLinkButton href={`/interviews/${projectId}/script`} variant="secondary">
                      Script
                    </KroweLinkButton>
                    <KroweLinkButton href={`/interviews/${projectId}/decision`} variant="secondary">
                      Decision
                    </KroweLinkButton>
                    <KroweLinkButton href={`/interviews/${projectId}/add`} variant="primary">
                      + Add interview
                    </KroweLinkButton>
                  </>
                }
              />
            </motion.div>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:hidden">
            <StatusBadge status={project.status} />
          </div>

          {heroRails}
          {overviewRails}
          {runwayRails}

          <MainTag
            {...(!reduceMotion
              ? {
                  initial: { opacity: 0, y: 12 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: libraryContentDelay, duration: 0.28, ease: KROWE_EASE },
                }
              : {})}
            className="space-y-8 pb-16"
          >
          <div
            id="project-conversation-library"
            className="flex flex-wrap items-center justify-between gap-3 scroll-mt-8"
          >
            <h2 className="krowe-display-m text-xl text-foreground sm:text-2xl">Conversation library</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <RunAnalysisButton
                projectId={projectId}
                interviewCount={project.interview_count}
                projectStatus={project.status}
              />
              <GranolaImportsButton />
              <KroweLinkButton href={`/interviews/${projectId}/add`} variant="secondary">
                Quick add
              </KroweLinkButton>
            </div>
          </div>

          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { delay: libraryContentDelay + 0.03, duration: 0.24, ease: KROWE_EASE }
            }
            className="flex flex-wrap items-center justify-between gap-5 rounded-[var(--radius-lg)] border border-border/80 bg-card p-5 shadow-[var(--shadow-1)]"
          >
            <div className="flex flex-wrap items-center gap-6 md:gap-10">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-widest">
                  Decision
                </span>
                <span className="text-base font-bold text-interview-brand">{decisionLabel}</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-widest">
                  Confidence
                </span>
                <span className="text-base font-bold">{confidencePct}%</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-widest">
                  Verdict
                </span>
                <span className={`text-base font-bold ${verdictClassName}`}>{verdictLabel}</span>
              </div>
            </div>
            <div className="hidden lg:block text-right">
              <p className="text-xs text-muted-foreground font-medium italic">
                Last analysis run {formatTimeAgo(latestDecision?.updated_at)}
              </p>
            </div>
          </motion.section>

          <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
            <div className="md:col-span-7 space-y-5">
              {deleteError && (
                <div className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger">
                  {deleteError}
                </div>
              )}
              {interviews.length === 0 ? (
                <div className="rounded-[var(--radius-lg)] border border-border/80 bg-card p-10 text-center text-muted-foreground shadow-[var(--shadow-1)]">
                  <p className="text-sm font-medium text-foreground">No interviews yet</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Add at least three conversations to unlock analysis — start from Granola or record manually.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <KroweLinkButton href={`/interviews/${projectId}/add`} variant="primary">
                      Add interview
                    </KroweLinkButton>
                    <KroweLinkButton href="/interviews/imports" variant="secondary">
                      Open imports
                    </KroweLinkButton>
                  </div>
                </div>
              ) : (
                interviews.map((interview, i) => {
                  const signalLabel = interview.signal_label;
                  const signalClass = signalBadgeClasses(signalLabel);
                  const quote =
                    topQuotes[i]?.verbatim_text ??
                    topQuotes[i]?.text ??
                    "No direct quote linked yet for this interview.";
                  const problemSnippet =
                    topCluster?.canonical_problem ?? "No clustered pain identified yet.";
                  return (
                    <motion.div
                      key={interview.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              delay: libraryContentDelay + 0.05 + i * 0.038,
                              duration: 0.22,
                              ease: KROWE_EASE,
                            }
                      }
                    >
                    <Link
                      href={`/interviews/${projectId}/${interview.id}`}
                      className="block rounded-[var(--radius-lg)] border border-border/80 bg-card p-5 shadow-[var(--shadow-1)] transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)]"
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex space-x-4 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                            {initialForName(interview.interviewee_name, i)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-foreground">
                              {interview.interviewee_name ?? `Interview #${i + 1}`}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium truncate">
                              {interview.interviewee_context ?? "No interview context provided"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`${signalClass} rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider`}
                          >
                            {signalLabel} Signal
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (deleteLoadingId) return;
                              const confirmed = window.confirm("Delete this interview? This cannot be undone.");
                              if (!confirmed) return;
                              void handleDeleteInterview(interview.id);
                            }}
                            disabled={deleteLoadingId === interview.id}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-danger/40 text-danger hover:bg-danger-soft disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Delete interview"
                            title="Delete interview"
                          >
                            <span className="material-symbols-outlined text-[16px] leading-none">
                              {deleteLoadingId === interview.id ? "hourglass_top" : "delete"}
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          Context:{" "}
                          {interview.interviewee_context ??
                            "Interview details available in the full transcript."}
                        </p>
                        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                          <div className="rounded-xl border border-border/50 bg-muted/35 p-4">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">
                              Key Problems
                            </span>
                            <ul className="space-y-2">
                              <li className="flex items-start text-xs text-foreground">
                                <span className="text-interview-brand mr-2">•</span> {problemSnippet}
                              </li>
                            </ul>
                          </div>
                          <div className="rounded-xl border border-border/50 bg-muted/35 p-4">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">
                              Direct Quote
                            </span>
                            <p className="text-xs italic text-muted-foreground leading-relaxed">
                              &ldquo;{quote}&rdquo;
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div className="md:col-span-3 space-y-5 self-start">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { delay: libraryContentDelay + 0.08, duration: 0.28, ease: KROWE_EASE }
                }
                className="rounded-[var(--radius-lg)] border border-live-insights-border bg-live-insights-bg p-5 text-live-insights-foreground shadow-[var(--shadow-1)]"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="serif-text text-base font-bold text-live-insights-foreground">Live Insights</h2>
                  <span className="flex h-2 w-2 rounded-full bg-interview-brand animate-pulse" />
                </div>
                <div className="space-y-6">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-live-insights-muted tracking-widest block mb-4">
                      Problem Clusters
                    </span>
                    <div className="space-y-3">
                      {rankedClusters.length > 0 ? (
                        rankedClusters.map((cluster, idx) => {
                          const bar = Math.min(100, Math.round(cluster.score * 100));
                          const active = idx === 0;
                          return (
                            <div key={cluster.id} className="flex items-center justify-between gap-3">
                              <div className="flex items-center min-w-0">
                                <span
                                  className={`w-5 text-[10px] font-bold ${active ? "text-interview-brand" : "text-live-insights-muted"}`}
                                >
                                  {String(idx + 1).padStart(2, "0")}
                                </span>
                                <span
                                  className={`text-xs truncate ${active ? "text-live-insights-foreground" : "text-live-insights-muted"}`}
                                  title={cluster.canonical_problem}
                                >
                                  {toLiveInsightsClusterTitle(cluster.canonical_problem)}
                                </span>
                              </div>
                              <div className="w-12 h-1 rounded-full overflow-hidden shrink-0 bg-live-insights-track">
                                <div
                                  className={`${active ? "bg-interview-brand" : "bg-live-insights-bar-inactive"} h-full`}
                                  style={{ width: `${bar}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-live-insights-muted">No clusters available yet.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase font-bold text-live-insights-muted tracking-widest block mb-4">
                      Emerging Patterns
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(rankedClusters.map((c) => c.category).filter(Boolean).slice(0, 3) as string[]).map(
                        (pattern, idx) => (
                          <span
                            key={`${pattern}-${idx}`}
                            className={`text-[10px] px-2 py-1 rounded-md border ${
                              idx === 0
                                ? "border-interview-brand/35 bg-interview-brand/20 text-interview-brand"
                                : "border-live-insights-border bg-live-insights-surface text-live-insights-muted"
                            }`}
                          >
                            {pattern}
                          </span>
                        )
                      )}
                      {rankedClusters.length === 0 && (
                        <span className="text-[10px] text-live-insights-muted">No patterns yet</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-live-insights-border bg-live-insights-surface p-3.5">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[11px] uppercase font-bold tracking-wide text-live-insights-muted">
                        Confidence
                      </span>
                      <span className="text-xl font-bold text-interview-brand">{confidencePct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-live-insights-track">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-interview-brand"
                        style={{ width: `${Math.min(100, Math.max(0, confidencePct))}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase font-bold text-live-insights-muted tracking-widest block mb-4">
                      Suggested Features
                    </span>
                    <ul className="space-y-3">
                      {suggestedFeatures.length > 0 ? (
                        suggestedFeatures.map((feature, idx) => (
                          <li
                            key={`${feature.name}-${idx}`}
                            className="flex items-start text-xs text-live-insights-foreground"
                          >
                            <span className="mr-2 text-interview-brand">•</span>
                            {feature.name}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-live-insights-muted">No suggested features yet.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          </MainTag>
        </InterviewsPageWidth>
      </div>
    </section>
  );
}
