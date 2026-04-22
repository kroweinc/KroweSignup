"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignupAnalyzeLoading } from "@/app/components/shell/SignupAnalyzeLoading";
import { SignupSplitShell } from "@/app/signup/_components/SignupSplitShell";
import Link from "next/link";

function SignupCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing sessionId. Please restart signup.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/signup/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to complete signup");

        if (!cancelled) router.replace("/interviews");
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Something went wrong";
        if (!cancelled) setError(message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  if (!error) {
    return (
      <SignupAnalyzeLoading
        title="Completing signup."
        subtitle="We're finalizing your workspace and redirecting you to interviews."
        messages={["Saving session…", "Opening your workspace…", "Redirecting…"]}
        spiralSize={300}
      />
    );
  }

  return (
    <SignupSplitShell
      editorialTitle="Signup didn’t finish."
      editorialSubtitle="You can retry from onboarding or return to interviews."
    >
      <div className="rounded-[var(--radius-md)] border border-border bg-card p-6 text-center shadow-sm">
        <h2 className="serif-text text-lg font-semibold text-foreground">There was a problem</h2>
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Back to signup
          </Link>
          <Link
            href="/interviews"
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Go to interviews
          </Link>
        </div>
      </div>
    </SignupSplitShell>
  );
}

export default function SignupCompletePage() {
  return (
    <Suspense
      fallback={
        <SignupAnalyzeLoading
          title="Loading."
          subtitle="Preparing completion."
          messages={["Loading…"]}
          spiralSize={280}
        />
      }
    >
      <SignupCompleteContent />
    </Suspense>
  );
}
