"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SparklesIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { summaryToBullets } from "@/lib/interviews/formatSummary";
import { KROWE_EASE } from "@/lib/motion/kroweEase";
import { InterviewsPageWidth } from "@/app/interviews/_components/InterviewsPageWidth";

interface TopQuote {
  type: string;
  text: string;
  quote?: string;
  intensity?: number;
  displayQuote: string;
}

interface Segment {
  type: "pain" | "context" | "emotion" | "intensity";
  text: string;
  quote?: string;
  intensity?: number;
}

interface ExtractedProblem {
  problem_text: string;
  root_cause: string;
  customer_type: string;
  confidence: number;
  supporting_quote: string;
  intensity_score: number;
}

interface Interview {
  id: string;
  raw_text: string;
  status: string;
  created_at: string;
  structured_segments: unknown;
}

interface Props {
  interview: Interview;
  projectId: string;
  summary: string | null;
  topQuotes: TopQuote[];
  painCount: number;
  interviewNumber: number | null;
  structuredSegments: Segment[] | null;
  extractedProblems: ExtractedProblem[];
  intervieweeName: string | null;
  intervieweeContext: string | null;
  alternativesUsed: string[];
  currentMethods: string[];
}

function segmentBorder(type: string): string {
  switch (type) {
    case "pain":      return "border-l-2 border-danger/60";
    case "emotion":   return "border-l-2 border-warning/60";
    case "context":   return "border-l-2 border-primary/60";
    case "intensity": return "border-l-2 border-primary/60";
    default:          return "border-l-2 border-border";
  }
}

function segmentLabelColor(type: string): string {
  switch (type) {
    case "pain":      return "text-danger";
    case "emotion":   return "text-warning";
    case "context":   return "text-primary";
    case "intensity": return "text-primary";
    default:          return "text-muted-foreground";
  }
}

function confidenceBadge(score: number): { label: string; classes: string } {
  if (score >= 0.75) return { label: "High", classes: "bg-success-soft text-success" };
  if (score >= 0.5)  return { label: "Medium", classes: "bg-warning-soft text-warning" };
  return { label: "Low", classes: "bg-muted text-muted-foreground" };
}

function ProblemCard({ problem: p }: { problem: ExtractedProblem }) {
  const badge = confidenceBadge(p.confidence);
  return (
    <div className="bg-card p-4 rounded-xl border border-border/60 flex flex-col gap-3 shadow-sm hover:border-interview-brand/20 transition-colors">
      <div className="flex justify-between items-center">
        <div className="w-8 h-8 rounded-full bg-interview-brand/10 flex items-center justify-center text-interview-brand text-xs font-semibold">
          !
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.classes}`}>
          {Math.round(p.confidence * 100)}%
        </span>
      </div>
      <div>
        <h3 className="font-bold text-xs text-on-surface mb-1">{p.problem_text}</h3>
        {p.root_cause && (
          <p className="text-[10px] text-muted-foreground leading-tight">{p.root_cause}</p>
        )}
      </div>
      {p.supporting_quote && (
        <p className="text-[10px] italic text-foreground/70 border-l-2 border-border pl-2 mt-1">
          &ldquo;{p.supporting_quote}&rdquo;
        </p>
      )}
      <div className="text-[10px] text-muted-foreground">
        {p.customer_type || "Unspecified customer"}
      </div>
    </div>
  );
}

function extractIntervieweeName(rawText: string): string | null {
  const lines = rawText.split("\n").slice(0, 20);
  const patterns = [
    /^(?:interviewee|participant|name|subject)\s*:\s*(.+)/i,
  ];
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) return match[1].trim();
    }
  }
  return null;
}

type TranscriptTab = "raw" | "structured";

const DETAIL_HERO_HEADLINE = "Turn raw signal into decision-ready insight.";
const DETAIL_HERO_SUBCOPY =
  "Read the transcript, scan structured segments, and review AI summaries side-by-side. Pain quotes and extracted problems stay tied to this interview record.";

export default function InterviewDetailClient({
  interview,
  projectId,
  summary,
  topQuotes,
  painCount,
  interviewNumber,
  structuredSegments,
  extractedProblems,
  intervieweeName,
  intervieweeContext,
  alternativesUsed,
  currentMethods,
}: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const heroWords = DETAIL_HERO_HEADLINE.split(" ");
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
  const transcriptUiDelay = queueTitleDelay + 0.1;

  const segmentCount = structuredSegments?.length ?? 0;
  const overviewReadiness =
    interview.status === "structured"
      ? Math.min(100, Math.max(28, 40 + Math.min(painCount * 8, 36)))
      : Math.max(18, 28);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(interview.raw_text);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [transcriptTab, setTranscriptTab] = useState<TranscriptTab>("raw");
  const [segmentFilter, setSegmentFilter] = useState<"all" | "pain" | "emotion" | "context" | "intensity">("all");
  const [problemsOpen, setProblemsOpen] = useState(false);

  // Interviewee card state
  const [nameCardEditing, setNameCardEditing] = useState(false);
  const [nameInput, setNameInput] = useState(intervieweeName ?? "");
  const [contextInput, setContextInput] = useState(intervieweeContext ?? "");
  const [savedName, setSavedName] = useState(intervieweeName);
  const [savedContext, setSavedContext] = useState(intervieweeContext);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  function handleStartNameEdit() {
    // Auto-suggest from transcript if no saved name
    if (!savedName) {
      const extracted = extractIntervieweeName(interview.raw_text);
      if (extracted && !nameInput) setNameInput(extracted);
    }
    setNameCardEditing(true);
    setNameError(null);
  }

  async function handleNameSave() {
    setNameSaving(true);
    setNameError(null);
    try {
      const res = await fetch(`/api/interviews/${interview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intervieweeName: nameInput.trim() || null,
          intervieweeContext: contextInput.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setNameError(data.error ?? "Failed to save");
        return;
      }
      setSavedName(nameInput.trim() || null);
      setSavedContext(contextInput.trim() || null);
      setNameCardEditing(false);
    } catch {
      setNameError("Network error — please try again");
    } finally {
      setNameSaving(false);
    }
  }

  function handleNameCancel() {
    setNameInput(savedName ?? "");
    setContextInput(savedContext ?? "");
    setNameCardEditing(false);
    setNameError(null);
  }

  const charCount = editText.trim().length;
  const isValid = charCount >= 100;

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/interviews/${interview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: editText }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error ?? "Failed to save");
        return;
      }
      setEditText(editText.trim());
      setIsEditing(false);
      router.refresh();
    } catch {
      setSaveError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  const filteredSegments = segmentFilter === "all"
    ? structuredSegments
    : structuredSegments?.filter(s => s.type === segmentFilter);

  function handleCancel() {
    setEditText(interview.raw_text);
    setIsEditing(false);
    setSaveError(null);
  }

  const createdAtText = new Date(interview.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const scrollToTranscript = () => {
    document.getElementById("interview-transcript-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const overviewCaption =
    interview.status === "structured"
      ? `${painCount} pain signal${painCount !== 1 ? "s" : ""} · ${segmentCount} segment${segmentCount !== 1 ? "s" : ""} · ${extractedProblems.length} problem${extractedProblems.length !== 1 ? "s" : ""}`
      : "Run analysis to unlock structured segments, quotes, and extracted problems.";

  const heroRails = reduceMotion ? (
    <div className="border-b border-border/60 bg-card px-4 py-6 sm:px-6 lg:px-10">
      <InterviewsPageWidth cap={1400}>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold text-primary">
          <SparklesIcon size={14} aria-hidden />
          Interview record
        </span>
        <h2 className="krowe-display-m mt-3 max-w-3xl text-pretty text-foreground">
          Turn raw signal into <span className="text-primary">decision-ready insight.</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{DETAIL_HERO_SUBCOPY}</p>
        <button
          type="button"
          onClick={scrollToTranscript}
          className="mt-4 inline-flex rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-4)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          Jump to transcript
        </button>
      </InterviewsPageWidth>
    </div>
  ) : (
    <div className="border-b border-border/60 bg-gradient-to-br from-primary-soft/90 via-background to-card">
      <InterviewsPageWidth cap={1400} className="px-4 py-8 sm:px-6 lg:px-10">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.03, ease: KROWE_EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold text-primary shadow-[var(--shadow-1)]"
        >
          <SparklesIcon size={14} aria-hidden />
          Interview record
        </motion.span>
        <h2 className="krowe-display-m mt-3 max-w-3xl text-pretty text-foreground">
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
          className="mt-2 max-w-2xl text-sm text-muted-foreground"
        >
          {DETAIL_HERO_SUBCOPY}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: buttonsDelay, duration: 0.24, ease: KROWE_EASE }}
          className="mt-4"
        >
          <button
            type="button"
            onClick={scrollToTranscript}
            className="inline-flex rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-4)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:-translate-y-px active:translate-y-px"
            style={{ background: "var(--gradient-primary)" }}
          >
            Jump to transcript
          </button>
        </motion.div>
      </InterviewsPageWidth>
    </div>
  );

  const overviewRails = reduceMotion ? (
    <div className="border-b border-border/60 bg-surface-subtle px-4 py-4 sm:px-6 lg:px-10">
      <InterviewsPageWidth cap={1400} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pain signals</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{painCount}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Segments</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{segmentCount}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Problems</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{extractedProblems.length}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pipeline</p>
          <p className="mt-1 text-sm font-semibold capitalize text-foreground">{interview.status}</p>
        </div>
      </InterviewsPageWidth>
      <InterviewsPageWidth cap={1400} className="mt-3">
        <p className="text-xs text-muted-foreground">{overviewCaption}</p>
      </InterviewsPageWidth>
    </div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: overviewBlockDelay, duration: 0.28, ease: KROWE_EASE }}
      className="border-b border-border/60 bg-surface-subtle px-4 py-4 sm:px-6 lg:px-10"
    >
      <InterviewsPageWidth cap={1400} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            { label: "Pain signals", value: painCount },
            { label: "Segments", value: segmentCount },
            { label: "Problems", value: extractedProblems.length },
            { label: "Pipeline", value: interview.status },
          ] as const
        ).map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: overviewBlockDelay + 0.04 + i * 0.034,
              duration: 0.22,
              ease: KROWE_EASE,
            }}
            className="rounded-xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</p>
            {typeof card.value === "number" ? (
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{card.value}</p>
            ) : (
              <p className="mt-1 text-sm font-semibold capitalize text-foreground">{card.value}</p>
            )}
          </motion.div>
        ))}
      </InterviewsPageWidth>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: overviewBlockDelay + 0.2, duration: 0.24, ease: KROWE_EASE }}
        className="mt-3 w-full"
      >
        <InterviewsPageWidth cap={1400}>
        <div className="mb-2 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overviewReadiness}%` }}
            transition={{
              delay: overviewBlockDelay + 0.14 + metricCount * 0.034,
              duration: 0.45,
              ease: KROWE_EASE,
            }}
            style={{ background: "var(--gradient-primary)" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{overviewCaption}</p>
        </InterviewsPageWidth>
      </motion.div>
    </motion.div>
  );

  const MainTag = reduceMotion ? "main" : motion.main;

  return (
    <div className="min-w-0 bg-background text-on-surface">
      {heroRails}
      {overviewRails}
      <MainTag
        {...(!reduceMotion
          ? {
              initial: { opacity: 0, y: 12 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: queueTitleDelay, duration: 0.28, ease: KROWE_EASE },
            }
          : {})}
        className="flex min-h-[calc(100vh-5rem)] flex-col"
      >
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            <section
              id="interview-transcript-panel"
              className="flex-1 p-6 lg:p-10 overflow-y-auto no-scrollbar bg-card"
            >
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/interviews/${projectId}`}
                      className="inline-block text-sm text-muted-foreground hover:underline"
                    >
                      ← Back to project
                    </Link>
                    <span className="text-xs text-muted-foreground">·</span>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1">
                      <Image src="/KroweIcon.png" alt="Krowe" width={14} height={14} className="rounded-[3px]" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Krowe analysis
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-5">
                    <h1 className="text-3xl lg:text-4xl font-bold text-on-surface tracking-tight leading-[1.1]">
                      Transcription &amp; Raw Logs
                    </h1>
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setTranscriptTab("raw");
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        Edit transcript
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium bg-surface-container-low p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span>Interviewee:</span>
                      <span className="text-on-surface font-semibold">
                        {savedName ?? (interviewNumber ? `Interview #${interviewNumber}` : "Unknown")}
                      </span>
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-border/80" />
                    <div className="flex items-center gap-2">
                      <span>{createdAtText}</span>
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-border/80" />
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{interview.status}</span>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full h-[500px] border border-border rounded-xl p-6 bg-muted text-sm font-mono text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${isValid ? "text-muted-foreground" : "text-danger font-medium"}`}>
                        {charCount} characters{!isValid && " (minimum 100)"}
                      </span>
                      <div className="flex items-center gap-2">
                        {saveError && <span className="text-xs text-danger">{saveError}</span>}
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="text-xs px-3 py-1 rounded border border-border hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={!isValid || saving}
                          className="text-xs px-3 py-1 rounded bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                          {saving ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-base leading-relaxed text-on-surface-variant">
                    {interview.status === "structured" && structuredSegments && (
                      <div className="flex gap-1 mb-4 border-b border-border">
                        {(["raw", "structured"] as TranscriptTab[]).map((tab, idx) => {
                          const tabClass = `px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
                            transcriptTab === tab
                              ? "border-interview-brand text-interview-brand"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`;
                          const onTab = () => {
                            setTranscriptTab(tab);
                            if (tab === "raw") setSegmentFilter("all");
                          };
                          if (reduceMotion) {
                            return (
                              <button key={tab} type="button" onClick={onTab} className={tabClass}>
                                {tab}
                              </button>
                            );
                          }
                          return (
                            <motion.button
                              key={tab}
                              type="button"
                              onClick={onTab}
                              className={tabClass}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: transcriptUiDelay + idx * 0.05,
                                duration: 0.2,
                                ease: KROWE_EASE,
                              }}
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {tab}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {transcriptTab === "raw" && (
                      <div className="border border-border rounded-xl p-6 bg-card">
                        <pre className="text-sm whitespace-pre-wrap font-mono text-foreground leading-relaxed">
                          {editText}
                        </pre>
                      </div>
                    )}

                    {transcriptTab === "structured" && structuredSegments && (
                      <>
                        <div className="flex gap-1.5 flex-wrap mb-3">
                          {(["all", "pain", "emotion", "context", "intensity"] as const).map((f, idx) => {
                            const activeStyles: Record<typeof f, string> = {
                              all: "bg-muted text-foreground",
                              pain: "bg-danger-soft text-danger",
                              emotion: "bg-warning-soft text-warning",
                              context: "bg-primary-soft text-primary",
                              intensity: "bg-primary-soft text-primary",
                            };
                            const isActive = segmentFilter === f;
                            const pillClass = `px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                              isActive ? activeStyles[f] : "text-muted-foreground hover:text-foreground"
                            }`;
                            if (reduceMotion) {
                              return (
                                <button key={f} type="button" onClick={() => setSegmentFilter(f)} className={pillClass}>
                                  {f}
                                </button>
                              );
                            }
                            return (
                              <motion.button
                                key={f}
                                type="button"
                                onClick={() => setSegmentFilter(f)}
                                className={pillClass}
                                initial={{ opacity: 0, scale: 0.94 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                  delay: transcriptUiDelay + 0.12 + idx * 0.028,
                                  duration: 0.18,
                                  ease: KROWE_EASE,
                                }}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                {f}
                              </motion.button>
                            );
                          })}
                        </div>
                        <div className="border border-border rounded-xl p-6 bg-card">
                          <div className="text-sm font-mono text-foreground leading-relaxed space-y-4">
                            {(filteredSegments ?? []).map((seg, i) => (
                              <div key={i} className={`pl-3 ${segmentBorder(seg.type)}`}>
                                <span className={`text-[10px] font-semibold uppercase tracking-wide ${segmentLabelColor(seg.type)}`}>
                                  {seg.type}{seg.intensity && seg.intensity >= 4 ? " · high intensity" : ""}
                                </span>
                                <p className="mt-0.5 whitespace-pre-wrap">{seg.text}</p>
                                {seg.quote && seg.quote !== seg.text && (
                                  <p className="text-xs italic mt-1 opacity-70">&ldquo;{seg.quote}&rdquo;</p>
                                )}
                              </div>
                            ))}
                            {(filteredSegments ?? []).length === 0 && (
                              <p className="text-muted-foreground italic text-xs">No {segmentFilter} segments found.</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="w-full lg:w-[640px] bg-surface-subtle p-6 lg:p-10 overflow-y-auto no-scrollbar border-l border-border/60">
              <div className="space-y-10">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface mb-6">AI Summary</h2>
                  <div className="bg-card p-6 rounded-xl space-y-4 shadow-sm border border-border/60/50">
                    {nameCardEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            placeholder="Name"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <textarea
                            placeholder="Context (role, company, background…)"
                            value={contextInput}
                            onChange={(e) => setContextInput(e.target.value)}
                            rows={2}
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          {nameError && <span className="text-xs text-danger mr-auto">{nameError}</span>}
                          <button
                            onClick={handleNameCancel}
                            disabled={nameSaving}
                            className="text-xs px-3 py-1 rounded border border-border hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleNameSave}
                            disabled={nameSaving}
                            className="text-xs px-3 py-1 rounded bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40"
                          >
                            {nameSaving ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-surface-container-low p-3 rounded-lg border border-border/60">
                          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Founder Name</h4>
                          <p className="text-sm font-bold text-on-surface">
                            {savedName ?? "Not set"}
                          </p>
                        </div>
                        <div className="bg-surface-container-low p-3 rounded-lg border border-border/60">
                          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Founder Context</h4>
                          <p className="text-xs text-on-surface-variant leading-tight">
                            {savedContext ?? "No interviewee context added yet."}
                          </p>
                        </div>
                        <button
                          onClick={handleStartNameEdit}
                          className="col-span-2 text-xs px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors text-left"
                        >
                          Edit interviewee info
                        </button>
                      </div>
                    )}

                    {interview.status !== "structured" ? (
                      <p className="text-sm text-muted-foreground italic">
                        Analysis pending — run the pipeline to generate a summary.
                      </p>
                    ) : summary ? (
                      <ul className="space-y-3">
                        {summaryToBullets(summary).map((point, i) => (
                          <li key={i} className="flex gap-3 text-sm leading-relaxed">
                            <span className="text-interview-brand font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                        {painCount > 0 && (
                          <li className="text-xs text-muted-foreground">
                            {painCount} pain point{painCount !== 1 ? "s" : ""} identified.
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No summary available.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-on-surface mb-6">Strong Signals</h2>
                  <div className="bg-card/50 rounded-2xl border border-border/60 p-6 shadow-sm">
                    {interview.status !== "structured" || topQuotes.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        {interview.status !== "structured"
                          ? "Analysis pending — run the pipeline to extract quotes."
                          : "No strong quotes found in this interview."}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topQuotes.map((q, i) => (
                          <div key={i} className="bg-interview-brand/5 p-6 rounded-xl border border-interview-brand/10 shadow-sm flex flex-col justify-between min-h-[140px]">
                            <p className="italic text-on-surface text-base leading-relaxed mb-4">
                              &ldquo;{q.displayQuote}&rdquo;
                            </p>
                            <span className="text-[8px] font-black text-interview-brand uppercase tracking-widest">
                              {q.intensity && q.intensity >= 4 ? "High Intensity" : "Signal"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-on-surface mb-6">Extracted Problems</h2>
                  {interview.status !== "structured" || extractedProblems.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      {interview.status !== "structured"
                        ? "Analysis pending — run the pipeline to extract problems."
                        : "No problems extracted from this interview."}
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {extractedProblems.slice(0, 2).map((problem, i) => (
                          <ProblemCard key={i} problem={problem} />
                        ))}
                      </div>
                      {extractedProblems.length > 1 && (
                        <button
                          onClick={() => setProblemsOpen(true)}
                          className="mt-4 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          View all {extractedProblems.length} problems →
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-on-surface mb-6">Alternatives Found</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-card p-5 rounded-lg border border-border/60 shadow-sm flex flex-col">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Competitors Mentioned</h4>
                      {interview.status !== "structured" ? (
                        <p className="text-sm text-muted-foreground italic">
                          Analysis pending — run the pipeline to detect competitors mentioned.
                        </p>
                      ) : currentMethods.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          No competitors mentioned.
                        </p>
                      ) : (
                        <div className="space-y-3 flex-1">
                          {currentMethods.map((method, i) => (
                            <div key={i} className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-on-surface truncate">{method}</span>
                                <span className="text-[9px] font-black text-on-surface bg-surface-container px-1 py-0.5 rounded-sm">
                                  Mentioned
                                </span>
                              </div>
                              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-interview-brand/35 w-full" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-card p-5 rounded-lg border border-border/60 shadow-sm flex flex-col">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Manual Alternatives Used</h4>
                      {interview.status !== "structured" ? (
                        <p className="text-sm text-muted-foreground italic">
                          Analysis pending — run the pipeline to detect manual alternatives.
                        </p>
                      ) : alternativesUsed.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          No manual alternatives mentioned in this interview.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {alternativesUsed.map((mention, i) => (
                            <span key={i} className="px-2 py-1 bg-card border border-border/60 shadow-sm text-[10px] font-bold rounded text-on-surface">
                              {mention}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
      </MainTag>

      {problemsOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/40 z-40"
            onClick={() => setProblemsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-background border-l border-border z-50 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                All Extracted Problems ({extractedProblems.length})
              </h2>
              <button
                onClick={() => setProblemsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {extractedProblems.map((p, i) => (
                <ProblemCard key={i} problem={p} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
