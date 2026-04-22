"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { SignupSplitShell } from "@/app/signup/_components/SignupSplitShell";
import { SignupAnalyzeLoading } from "@/app/components/shell/SignupAnalyzeLoading";
import { KroweButton } from "@/app/components/krowe/KroweButton";
import { KroweInput } from "@/app/components/krowe/KroweInput";

export default function UrlOnboardingStartClient() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [loadingSession, setLoadingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/signup/session/start", { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to start session");

        if (!cancelled) {
          setSessionId(json.sessionId);
          setLoadingSession(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to start session");
          setLoadingSession(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sessionId || !url.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/signup/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, url: url.trim() }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to analyze this URL");

      router.push(`/signup/url/review?sessionId=${encodeURIComponent(sessionId)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze this URL");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingSession) {
    return (
      <SignupAnalyzeLoading
        title="Preparing your session."
        subtitle="We're creating a secure workspace for this URL import."
        messages={["Starting your session…", "Allocating workspace…", "Almost there…"]}
      />
    );
  }

  if (error && !sessionId) {
    return (
      <SignupSplitShell editorialTitle="Couldn’t start import." editorialSubtitle="Try again from signup, or continue manually.">
        <div className="rounded-[var(--radius-md)] border border-danger/40 bg-danger-soft p-5">
          <p className="text-sm font-medium text-danger">{error}</p>
          <Link href="/signup" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            Back to signup
          </Link>
        </div>
      </SignupSplitShell>
    );
  }

  if (submitting) {
    return (
      <SignupAnalyzeLoading
        title="Analyzing your website."
        subtitle="We’re reading public pages and structuring answers you can edit next."
        messages={["Fetching your site…", "Extracting product signals…", "Preparing your review…"]}
      />
    );
  }

  return (
    <SignupSplitShell
      editorialTitle="Paste your website URL."
      editorialSubtitle="We'll analyze your site and prefill onboarding. You'll review and edit everything before generating your report."
    >
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="serif-text text-xl font-semibold text-foreground sm:text-2xl">Skip the questionnaire</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Add your marketing or product URL. We&apos;ll pull what we can into structured fields.
        </p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <KroweInput
            type="url"
            name="websiteUrl"
            label="Website URL"
            placeholder="https://yourcompany.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            state={error ? "error" : "default"}
            helperText={error ?? undefined}
            required
          />

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <KroweButton
              type="submit"
              variant="primary"
              disabled={!sessionId}
              style={{ borderRadius: "var(--radius-md)" }}
            >
              Analyze my business
            </KroweButton>

            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] px-3 text-sm font-medium text-muted-foreground transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:bg-surface-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Fill in manually instead
            </Link>
          </div>
        </form>
      </motion.div>
    </SignupSplitShell>
  );
}
