import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import { notFound } from "next/navigation";
import { DecisionPageClient } from "./DecisionPageClient";
import InterviewsShell from "@/app/interviews/_components/InterviewsShell";
import { InterviewsPageWidth } from "@/app/interviews/_components/InterviewsPageWidth";
import { ContentHeader } from "@/app/components/krowe/ContentHeader";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import type { ProblemCluster, FeatureSpec, DecisionOutput, MetaCluster } from "@/lib/interviews/types";
import { computeInterviewSignal } from "@/lib/interviews/interviewSignal";
import type { AnalysisResponse, AnalysisResult, AnalysisContext, SignalStrengthMetrics } from "@/lib/analysis/hypothesisVsReality";
import {
  fetchSignupAnswersForSession,
  buildAnalysisAnswerHelpers,
  STEP_KEYS_SCRIPT,
} from "@/lib/interviews/founderContextFromSignup";

export const dynamic = "force-dynamic";

type ClusterWithId = ProblemCluster & { id: string };
type DecisionWithId = Omit<DecisionOutput, "project_id"> & { id: string; updated_at: string };

function isMissingAnalysisResultColumnError(message: string): boolean {
  return message.includes("analysis_result");
}

const priorityOrder: Record<FeatureSpec["priority"], number> = {
  "must-have": 0,
  "should-have": 1,
  "nice-to-have": 2,
};

export default async function DecisionPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createInterviewAuthClient();

  const [projectRes, decisionResWithAnalysis, clustersRes, interviewsRes] = await Promise.all([
    supabase
      .from("interview_projects")
      .select("id, name, session_id, user_id, created_at")
      .eq("id", projectId)
      .single(),
    supabase
      .from("decision_outputs")
      .select(
        "id, selected_cluster_id, reasoning, feature_specs, user_flows, edge_cases, success_metrics, confidence_score, meta_clusters, status, updated_at, created_at, analysis_result"
      )
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false })
      .limit(1),
    supabase
      .from("problem_clusters")
      .select(
        "id, canonical_problem, frequency, avg_intensity, consistency_score, score, supporting_quotes, member_problem_ids, category"
      )
      .eq("project_id", projectId)
      .order("score", { ascending: false }),
    supabase
      .from("interviews")
      .select("id, created_at, raw_text, status")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true }),
  ]);

  if (projectRes.error || !projectRes.data) notFound();

  let decisionRes = decisionResWithAnalysis;
  if (
    decisionResWithAnalysis.error &&
    isMissingAnalysisResultColumnError(decisionResWithAnalysis.error.message)
  ) {
    decisionRes = (await supabase
      .from("decision_outputs")
      .select(
        "id, selected_cluster_id, reasoning, feature_specs, user_flows, edge_cases, success_metrics, confidence_score, meta_clusters, status, updated_at, created_at"
      )
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false })
      .limit(1)) as unknown as typeof decisionResWithAnalysis;
  }

  const project = projectRes.data;
  const sessionId = (projectRes.data as unknown as { session_id?: string | null }).session_id ?? null;
  const decisionRows = (decisionRes.data ?? []) as Array<
    DecisionWithId & { analysis_result?: AnalysisResult | null }
  >;
  const decision: DecisionWithId | null = decisionRows[0] ?? null;
  const persistedAnalysis: AnalysisResult | null = decisionRows[0]?.analysis_result ?? null;
  const allClusters = (clustersRes.data ?? []) as ClusterWithId[];
  const interviews = (interviewsRes.data ?? []) as Array<{
    id: string;
    created_at: string;
    raw_text: string | null;
    status: "pending" | "structured" | "failed";
  }>;
  const interviewIds = interviews.map((i) => i.id);
  const interviewsSortedIds = interviewIds;
  // Fetch extracted_problems to compute high-signal count
  const extractedProblemsRes = interviewIds.length
    ? await supabase
        .from("extracted_problems")
        .select("interview_id, intensity_score, confidence")
        .in("interview_id", interviewIds)
    : { data: [] };
  const extractedProblems = (extractedProblemsRes.data ?? []) as Array<{
    interview_id: string;
    intensity_score: number | null;
    confidence: number | null;
  }>;
  const problemsByInterviewId = new Map<string, Array<{ intensity_score: number | null; confidence: number | null }>>();
  for (const row of extractedProblems) {
    const existing = problemsByInterviewId.get(row.interview_id) ?? [];
    existing.push({ intensity_score: row.intensity_score, confidence: row.confidence });
    problemsByInterviewId.set(row.interview_id, existing);
  }

  const highSignalCount = interviews.filter(
    (iv) => computeInterviewSignal(problemsByInterviewId.get(iv.id) ?? []).high_signal
  ).length;

  const durationMinutes = interviews
    .filter((iv) => iv.raw_text && iv.raw_text.trim().length > 0)
    .map((iv) => Math.max(1, Math.round(iv.raw_text!.trim().split(/\s+/).length / 150)));
  const avgMinutes = durationMinutes.length > 0
    ? Math.round(durationMinutes.reduce((s, m) => s + m, 0) / durationMinutes.length)
    : 0;
  const minMinutes = durationMinutes.length > 0 ? Math.min(...durationMinutes) : null;
  const maxMinutes = durationMinutes.length > 0 ? Math.max(...durationMinutes) : null;

  const firstInterview = interviews[0];
  const synthesisDays =
    firstInterview && decision
      ? Math.max(1, Math.round(
          (new Date(decision.updated_at).getTime() - new Date(firstInterview.created_at).getTime()) / 86400000
        ))
      : null;

  const topCluster = decision?.selected_cluster_id
    ? allClusters.find((c) => c.id === decision.selected_cluster_id) ?? null
    : allClusters[0] ?? null;

  if (!decision || decision.status !== "ready") {
    const title =
      decision?.status === "insufficient_data"
        ? "Insufficient data"
        : decision?.status === "processing"
          ? "Analysis in progress"
          : "No decision yet";
    const description =
      decision?.status === "insufficient_data"
        ? "Add more high-signal interviews, then rerun analysis from the workspace. Krowe needs enough evidence to stand behind a verdict."
        : "Run analysis from the workspace when you have at least three interviews. The decision report unlocks here once the pipeline finishes.";

    return (
      <InterviewsShell activeNav="decision" projectId={projectId}>
        <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
          <InterviewsPageWidth className="space-y-8">
            <ContentHeader
              breadcrumbs={[
                { label: "Interviews", href: "/interviews" },
                { label: project.name, href: `/interviews/${projectId}` },
                { label: "Decision" },
              ]}
              title={title}
              description={description}
              actions={
                <>
                  <KroweLinkButton href={`/interviews/${projectId}/add`} variant="secondary">
                    Add interview
                  </KroweLinkButton>
                  <KroweLinkButton href={`/interviews/${projectId}`} variant="primary">
                    Back to workspace
                  </KroweLinkButton>
                </>
              }
            />

            <div className="noise-surface relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-gradient-to-br from-primary-soft/80 via-background to-card p-6 shadow-[var(--shadow-1)] sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.18]"
                style={{
                  backgroundImage: "var(--blueprint-grid)",
                  backgroundSize: "var(--blueprint-grid-size)",
                }}
              />
              <div className="relative z-[1] max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Decision hold</p>
                <p className="krowe-display-m mt-2 text-foreground">
                  The report lives on the <span className="text-primary">other side</span> of enough signal.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  When status flips to ready, this route becomes your verdict surface—confidence ring, build list, and
                  hypothesis vs. reality in one scroll.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <KroweLinkButton href={`/interviews/${projectId}`} variant="secondary">
                    Open workspace
                  </KroweLinkButton>
                  {(decision?.status === "insufficient_data" || !decision) && (
                    <KroweLinkButton href={`/interviews/${projectId}/business-profile`} variant="secondary">
                      Business profile
                    </KroweLinkButton>
                  )}
                </div>
              </div>
            </div>
          </InterviewsPageWidth>
        </div>
      </InterviewsShell>
    );
  }

  const metaClusters = (decision.meta_clusters as MetaCluster[] | null) ?? [];
  const featureSpecs = (decision.feature_specs as FeatureSpec[] | null) ?? [];

  const sortedFeatures = [...featureSpecs].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
  const confidencePct = Math.round((decision.confidence_score ?? 0) * 100);

  const byTheNumbers = {
    interviewCount: interviews.length,
    highSignalCount,
    avgMinutes,
    minMinutes,
    maxMinutes,
    themeCount: metaClusters.length,
    dominantThemeCount: metaClusters.filter((m) => m.score >= 0.5).length,
    confidencePct,
  };

  // Build synthesis timeline events from available timestamps
  const projectCreatedAt =
    (project as unknown as { created_at?: string | null }).created_at ?? interviews[0]?.created_at ?? null;

  type TimelineEvent = { at: string; label: string };
  const timelineEvents: TimelineEvent[] = [];
  const n = interviews.length;
  if (projectCreatedAt) {
    timelineEvents.push({
      at: projectCreatedAt,
      label: n > 0 ? `Project created · 1 interview` : "Project created",
    });
  }
  if (metaClusters.length >= 1 && interviews[2]) {
    timelineEvents.push({ at: interviews[2].created_at, label: "3 interviews · first theme emerges" });
  }
  if (highSignalCount >= 5 && interviews[5]) {
    timelineEvents.push({ at: interviews[5].created_at, label: "6 interviews · signal threshold passed" });
  }
  if (confidencePct >= 65 && interviews[8]) {
    timelineEvents.push({ at: interviews[8].created_at, label: "9 interviews · hypotheses confirmed" });
  }
  if (n > 0) {
    const lastAt = interviews[n - 1].created_at;
    const alreadyHave = timelineEvents.some((e) => e.at === lastAt && e.label.includes("analysis run"));
    if (!alreadyHave) {
      timelineEvents.push({ at: lastAt, label: `${n} interview${n === 1 ? "" : "s"} · analysis run` });
    }
  }
  timelineEvents.push({ at: decision.created_at, label: "Decision Report generated" });
  timelineEvents.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  // Build full AnalysisResponse (with context + signalMetrics) server-side so the client
  // can render the Hypothesis vs Reality section immediately without a background API fetch.
  let fullAnalysis: AnalysisResponse | null = null;
  if (persistedAnalysis && sessionId) {
    const signupRows = await fetchSignupAnswersForSession(supabase, sessionId, STEP_KEYS_SCRIPT);
    const { getAnswer, featuresArray } = buildAnalysisAnswerHelpers(signupRows);

    const topQuotesSlim = (topCluster?.supporting_quotes ?? [])
      .slice(0, 2)
      .map((q: { text: string; interview_id: string }) => ({ text: q.text, interview_id: q.interview_id }));

    const featureSpecsSlim = featureSpecs.map((f) => ({
      name: f.name,
      description: f.description,
      priority: f.priority,
    }));

    const context: AnalysisContext = {
      founderProblem: getAnswer("problem"),
      founderCustomer: getAnswer("target_customer"),
      founderFeatures: featuresArray,
      topProblem: topCluster?.canonical_problem ?? "",
      topQuotes: topQuotesSlim,
      customerInsight: persistedAnalysis.breakdown.customerAlignment.reasoning,
      featureSpecs: featureSpecsSlim,
    };

    const allQuotes: Array<{ interview_id?: string }> = topCluster?.supporting_quotes ?? [];
    const uniqueIntervieweeSet = new Set(allQuotes.map((q) => q.interview_id).filter(Boolean));
    const signalMetrics: SignalStrengthMetrics | null = topCluster
      ? {
          interviewCount: interviews.length,
          uniqueInterviewees: uniqueIntervieweeSet.size,
          consistencyScore: topCluster.consistency_score ?? 0,
          avgIntensity: topCluster.avg_intensity ?? 0,
          frequency: topCluster.frequency ?? 0,
          clusterScore: topCluster.score ?? 0,
        }
      : null;

    fullAnalysis = { ...persistedAnalysis, context, signalMetrics };
  }

  return (
    <InterviewsShell activeNav="decision" projectId={projectId} noPadding skipEntrance>
      <DecisionPageClient
        projectId={projectId}
        project={project}
        decision={decision}
        topCluster={topCluster}
        allClusters={allClusters}
        metaClusters={metaClusters}
        byTheNumbers={byTheNumbers}
        sortedFeatures={sortedFeatures}
        confidencePct={confidencePct}
        interviewsSortedIds={interviewsSortedIds}
        persistedAnalysis={fullAnalysis}
        synthesisDays={synthesisDays}
        timelineEvents={timelineEvents}
      />
    </InterviewsShell>
  );
}
