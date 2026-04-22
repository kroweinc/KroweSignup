"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic2Icon, SparklesIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ContentHeader } from "@/app/components/krowe/ContentHeader";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import { KroweButton } from "@/app/components/krowe/KroweButton";
import { KROWE_EASE } from "@/lib/motion/kroweEase";
import { getDashboardPageEntranceTiming } from "@/lib/motion/dashboardPageEntrance";
import { InterviewsPageWidth } from "@/app/interviews/_components/InterviewsPageWidth";

const MIN_TRANSCRIPT_CHARS = 100;

const HERO_HEADLINE = "Paste once, structure with the workspace.";
const HERO_SUBCOPY =
  "Rough notes work when there is enough speaker context. After submit, processing attaches this row to synthesis and decisions.";

type Props = {
  projectId: string;
  projectName: string;
};

const transcriptHintId = "add-interview-transcript-hint";
const transcriptErrorId = "add-interview-transcript-error";

export default function AddInterviewForm({ projectId, projectName }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const charCount = transcript.trim().length;
  const hasValidTranscript = charCount >= MIN_TRANSCRIPT_CHARS;

  async function handleContinue() {
    setError(null);
    if (!hasValidTranscript) {
      setError(`Transcript must be at least ${MIN_TRANSCRIPT_CHARS} characters.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/interviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          rawText: transcript.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to submit interview.");
      }
      router.push(`/interviews/${projectId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const words = HERO_HEADLINE.split(" ");
  const { clipStart, perWordDelay, clipDuration, supportingDelay, buttonsDelay, overviewBlockDelay } =
    getDashboardPageEntranceTiming(words.length);
  const transcriptSectionDelay = overviewBlockDelay + 0.08;

  const scrollToTranscript = () => {
    document.getElementById("add-interview-transcript")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const headerEl = (
    <ContentHeader
      breadcrumbs={[
        { label: "Interviews", href: "/interviews" },
        { label: projectName, href: `/interviews/${projectId}` },
        { label: "Add interview" },
      ]}
      title="Add an interview"
      description="Paste a transcript to ingest another conversation into this workspace. Krowe structures it alongside existing interviews for synthesis and decisions."
      actions={
        <>
          <KroweLinkButton href={`/interviews/${projectId}`} variant="secondary">
            Workspace
          </KroweLinkButton>
          <KroweLinkButton href="/interviews/imports" variant="secondary">
            Imports
          </KroweLinkButton>
        </>
      }
    />
  );

  const ingestionCallout = (
    <div className="noise-surface relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-gradient-to-r from-primary-soft/90 via-background to-card px-5 py-4 shadow-[var(--shadow-1)] sm:px-7">
      <div className="relative z-[2] flex flex-wrap items-center gap-3">
        <Mic2Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <p className="text-sm font-medium text-foreground">
          <span className="text-primary">Ingestion lane</span>
          <span className="text-muted-foreground">
            {" "}
            — One transcript → one interview row. After submit, you land back on the workspace while processing
            catches up.
          </span>
        </p>
      </div>
    </div>
  );

  const transcriptSection = (
    <section
      className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card shadow-[var(--shadow-1)]"
      aria-labelledby="add-interview-transcript-heading"
    >
      <div className="border-b border-border/60 bg-surface-subtle px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="add-interview-transcript-heading" className="text-sm font-semibold text-foreground">
            Transcript
          </h2>
          <span
            className={`text-xs font-semibold tabular-nums ${
              hasValidTranscript ? "text-success" : "text-muted-foreground"
            }`}
            aria-live="polite"
            aria-atomic="true"
          >
            {charCount} / {MIN_TRANSCRIPT_CHARS} minimum
          </span>
        </div>
        <p id={transcriptHintId} className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Paste the full conversation. Rough notes work if they include enough speaker context.
        </p>
      </div>
      <div className="p-4 sm:p-5">
        <textarea
          id="add-interview-transcript"
          name="transcript"
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste the full interview transcript here…"
          aria-required="true"
          aria-invalid={error ? "true" : "false"}
          aria-labelledby="add-interview-transcript-heading"
          aria-describedby={[transcriptHintId, error ? transcriptErrorId : null].filter(Boolean).join(" ") || undefined}
          className="min-h-[280px] w-full resize-y rounded-xl border border-border/80 bg-background p-4 text-sm leading-relaxed text-foreground outline-none transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
        />
        {error ? (
          <p id={transcriptErrorId} role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-surface-subtle px-4 py-3 sm:px-5">
        <KroweButton type="button" variant="ghost" size="sm" onClick={() => router.push(`/interviews/${projectId}`)}>
          Skip for now
        </KroweButton>
        <KroweButton
          type="button"
          variant="primary"
          size="sm"
          disabled={!hasValidTranscript}
          loading={loading}
          onClick={() => void handleContinue()}
        >
          Continue to workspace
        </KroweButton>
      </div>
    </section>
  );

  if (reduceMotion) {
    return (
      <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
        <InterviewsPageWidth className="space-y-8 pb-8">
          {headerEl}
          {ingestionCallout}
          {transcriptSection}
        </InterviewsPageWidth>
      </div>
    );
  }

  return (
    <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
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
              Transcript intake
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
                onClick={scrollToTranscript}
                className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-4)] transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:-translate-y-px active:translate-y-px"
                style={{ background: "var(--gradient-primary)" }}
              >
                Jump to transcript
              </button>
              <KroweLinkButton href="/interviews/imports" variant="secondary">
                Imports
              </KroweLinkButton>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: overviewBlockDelay, duration: 0.26, ease: KROWE_EASE }}
        >
          {ingestionCallout}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: transcriptSectionDelay, duration: 0.28, ease: KROWE_EASE }}
        >
          {transcriptSection}
        </motion.div>
      </InterviewsPageWidth>
    </div>
  );
}
