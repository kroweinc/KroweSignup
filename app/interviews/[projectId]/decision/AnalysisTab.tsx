"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisResult } from "@/lib/analysis/hypothesisVsReality";

const DECISION_LABELS: Record<AnalysisResult["decision"], string> = {
  proceed: "Proceed",
  refine: "Refine",
  pivot: "Pivot",
  rethink: "Rethink",
};

const DECISION_COLORS: Record<AnalysisResult["decision"], string> = {
  proceed: "bg-green-100 text-green-800 border-green-200",
  refine: "bg-yellow-100 text-yellow-800 border-yellow-200",
  pivot: "bg-orange-100 text-orange-800 border-orange-200",
  rethink: "bg-red-100 text-red-800 border-red-200",
};

const DECISION_BAR_COLORS: Record<AnalysisResult["decision"], string> = {
  proceed: "bg-green-500",
  refine: "bg-yellow-500",
  pivot: "bg-orange-500",
  rethink: "bg-red-500",
};

const MATCH_STATUS_STYLES: Record<string, string> = {
  strong_match: "bg-green-100 text-green-700 border-green-200",
  partial_match: "bg-yellow-100 text-yellow-700 border-yellow-200",
  mismatch: "bg-red-100 text-red-700 border-red-200",
};

const MATCH_STATUS_LABELS: Record<string, string> = {
  strong_match: "Strong Match",
  partial_match: "Partial Match",
  mismatch: "Mismatch",
};

const ALIGNMENT_STATUS_STYLES: Record<string, string> = {
  aligned: "bg-green-100 text-green-700 border-green-200",
  partially_aligned: "bg-yellow-100 text-yellow-700 border-yellow-200",
  misaligned: "bg-red-100 text-red-700 border-red-200",
};

const ALIGNMENT_STATUS_LABELS: Record<string, string> = {
  aligned: "Aligned",
  partially_aligned: "Partially Aligned",
  misaligned: "Misaligned",
};

const INSIGHT_STRENGTH_STYLES: Record<string, string> = {
  weak: "bg-red-100 text-red-700 border-red-200",
  moderate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  strong: "bg-green-100 text-green-700 border-green-200",
};

function StatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

function SectionCard({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl p-5 bg-card space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {heading}
      </h3>
      {children}
    </div>
  );
}

export function AnalysisTab({ projectId }: { projectId: string }) {
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const requestIdRef = useRef(0);

  const fetchAnalysis = (opts?: { signal?: AbortSignal; requestId?: number }) => {
    const requestId = opts?.requestId ?? ++requestIdRef.current;
    setState("loading");
    fetch(`/api/interviews/analysis/${projectId}`, { signal: opts?.signal })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<AnalysisResult>;
      })
      .then((data) => {
        if (opts?.signal?.aborted) return;
        if (requestId !== requestIdRef.current) return;
        setResult(data);
        setState("ready");
      })
      .catch((err) => {
        if (opts?.signal?.aborted) return;
        if (requestId !== requestIdRef.current) return;
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
        setState("error");
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    fetchAnalysis({ signal: controller.signal, requestId });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Running analysis…</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm font-medium text-red-600">
          {errorMsg === "No onboarding data linked"
            ? "No onboarding data linked to this project."
            : "Analysis unavailable — an error occurred."}
        </p>
        <p className="text-xs text-muted-foreground">{errorMsg}</p>
        <button
          onClick={() => fetchAnalysis()}
          className="mt-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!result) return null;

  const confidencePct = Math.round(result.confidence * 100);
  const { breakdown } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Hypothesis vs Reality</h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI analysis comparing your original assumptions against real user interview data.
        </p>
      </div>

      {/* Decision + Confidence */}
      <div className="border border-border rounded-xl p-6 bg-card flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Verdict
          </span>
          <span
            className={`text-3xl font-bold px-4 py-2 rounded-xl border inline-block ${DECISION_COLORS[result.decision]}`}
          >
            {DECISION_LABELS[result.decision]}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Analysis Confidence
            </span>
            <span className="text-sm font-bold">{confidencePct}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${DECISION_BAR_COLORS[result.decision]}`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Problem Match */}
        <SectionCard heading="Problem Match">
          <StatusBadge
            label={MATCH_STATUS_LABELS[breakdown.problemMatch.status]}
            className={MATCH_STATUS_STYLES[breakdown.problemMatch.status]}
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {breakdown.problemMatch.reasoning}
          </p>
        </SectionCard>

        {/* Customer Alignment */}
        <SectionCard heading="Customer Alignment">
          <StatusBadge
            label={ALIGNMENT_STATUS_LABELS[breakdown.customerAlignment.status]}
            className={ALIGNMENT_STATUS_STYLES[breakdown.customerAlignment.status]}
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {breakdown.customerAlignment.reasoning}
          </p>
        </SectionCard>

        {/* Feature Relevance */}
        <SectionCard heading="Feature Relevance">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600 mb-2">
                Relevant
              </p>
              {breakdown.featureRelevance.relevant.length > 0 ? (
                <ul className="space-y-1">
                  {breakdown.featureRelevance.relevant.map((f, i) => (
                    <li key={i} className="text-xs text-foreground/80">
                      {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground/50">None</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-yellow-600 mb-2">
                Missing
              </p>
              {breakdown.featureRelevance.missing.length > 0 ? (
                <ul className="space-y-1">
                  {breakdown.featureRelevance.missing.map((f, i) => (
                    <li key={i} className="text-xs text-foreground/80">
                      {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground/50">None</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600 mb-2">
                Unnecessary
              </p>
              {breakdown.featureRelevance.unnecessary.length > 0 ? (
                <ul className="space-y-1">
                  {breakdown.featureRelevance.unnecessary.map((f, i) => (
                    <li key={i} className="text-xs text-foreground/80">
                      {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground/50">None</p>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Insight Strength */}
        <SectionCard heading="Interview Signal Strength">
          <StatusBadge
            label={
              breakdown.insightStrength.charAt(0).toUpperCase() +
              breakdown.insightStrength.slice(1)
            }
            className={INSIGHT_STRENGTH_STYLES[breakdown.insightStrength]}
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {breakdown.insightStrength === "strong" &&
              "The interviews produced clear, consistent signal with high evidence quality."}
            {breakdown.insightStrength === "moderate" &&
              "The interviews show some patterns but signal is mixed or limited in volume."}
            {breakdown.insightStrength === "weak" &&
              "Interview data is sparse or inconsistent — consider running more interviews."}
          </p>
        </SectionCard>
      </div>

      {/* Recommendations */}
      {result.recommendation.length > 0 && (
        <div className="border border-border rounded-xl p-6 bg-card space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendation.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-foreground/40" />
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
