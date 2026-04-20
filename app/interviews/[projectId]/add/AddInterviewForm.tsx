"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MIN_TRANSCRIPT_CHARS = 100;

export default function AddInterviewForm({ projectId }: { projectId: string }) {
  const router = useRouter();

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

  return (
    <div className="relative min-h-[calc(100vh-8rem)] pb-24">
      <div className="mx-auto max-w-[620px] px-0 pt-1">
        <main>
          <section className="mb-5">
            <h1 className="serif-text mb-1.5 text-[24px] font-bold leading-[1.15] tracking-tight text-foreground sm:text-[26px]">
              Upload your <span className="text-primary">interviews</span>.
            </h1>
            <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
              Add your audio recordings or transcripts. Krowe will distill them into structured
              insights and decisions.
            </p>
          </section>

          <section className="mb-5">
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Paste Transcript
              </h3>
              <span
                className={`text-[11px] ${
                  hasValidTranscript ? "text-success" : "text-muted-foreground"
                }`}
              >
                {charCount} / {MIN_TRANSCRIPT_CHARS} chars minimum
              </span>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste the full interview transcript here..."
              className="min-h-[260px] w-full rounded-2xl border border-border/60 bg-card p-3.5 text-xs leading-relaxed text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              This is the active ingestion path right now. Once submitted, this creates one
              interview entry in your project.
            </p>
          </section>

          {error && <p className="mb-3 text-xs text-danger">{error}</p>}
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-border/40 bg-card/80 py-3 backdrop-blur-md md:left-[240px]">
        <div className="mx-auto flex max-w-[620px] items-center justify-between gap-3 px-4 sm:px-5">
          <button
            type="button"
            onClick={() => router.push(`/interviews/${projectId}`)}
            className="px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip for now
          </button>
          <button
            type="button"
            disabled={loading || !hasValidTranscript}
            onClick={handleContinue}
            className="rounded-full bg-gradient-to-br from-interview-brand to-interview-brand-end px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-md shadow-interview-brand/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Working…" : "Continue to Insights"}
          </button>
        </div>
      </footer>
    </div>
  );
}
