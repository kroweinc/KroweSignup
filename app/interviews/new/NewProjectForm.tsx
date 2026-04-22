"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KroweButton } from "@/app/components/krowe/KroweButton";

const inputClassName =
  "w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20";

export default function NewProjectForm({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const nameLength = trimmedName.length;
  const titleQuality =
    nameLength === 0
      ? "Add a project title to continue."
      : nameLength < 8
        ? "Consider a slightly more descriptive title."
        : "Strong title. This is specific enough to track.";
  const titleQualityTone =
    nameLength === 0
      ? "text-muted-foreground"
      : nameLength < 8
        ? "text-[color-mix(in_srgb,var(--muted-foreground)_88%,transparent)]"
        : "text-primary";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!trimmedName) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/interviews/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, sessionId: sessionId.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create project");
        return;
      }
      router.push(`/interviews/${data.projectId}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Build brief</p>
        <h3 className="text-lg font-semibold leading-tight text-foreground sm:text-xl">Project details</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Give your research project a name
          {isAdmin ? " and optionally link it to a Krowe signup session" : ""}. This title anchors interviews,
          synthesis, and decision outputs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section
          className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card shadow-[var(--shadow-1)]"
          aria-labelledby="project-identity-heading"
        >
          <div className="border-b border-border/60 bg-surface-subtle px-4 py-3 sm:px-5">
            <h2 id="project-identity-heading" className="text-sm font-semibold text-foreground">
              Project identity
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This label appears across lists, decisions, and logs.
            </p>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="name">
                Project name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SaaS onboarding for independent consultants"
                maxLength={72}
                className={inputClassName}
              />
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <p className={`text-xs ${titleQualityTone}`}>{titleQuality}</p>
                <span className="text-[11px] tabular-nums text-muted-foreground">{nameLength}/72</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-surface-subtle/80 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Preview</p>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
                {trimmedName || "Untitled research project"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This will appear in project lists, decision outputs, and activity logs.
              </p>
            </div>
          </div>
        </section>

        {isAdmin ? (
          <section
            className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card shadow-[var(--shadow-1)]"
            aria-labelledby="context-bridge-heading"
          >
            <div className="border-b border-border/60 bg-surface-subtle px-4 py-3 sm:px-5">
              <h2 id="context-bridge-heading" className="text-sm font-semibold text-foreground">
                Context bridge
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Optional link to a Krowe session for richer downstream context.
              </p>
            </div>
            <div className="space-y-3 p-4 sm:p-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="sessionId">
                  Krowe session ID <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="sessionId"
                  name="sessionId"
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Link a Krowe session for additional AI context"
                  className={inputClassName}
                />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Linking a session can improve downstream spec generation by grounding insights in known business
                context.
              </p>
            </div>
          </section>
        ) : null}

        <section
          className="overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-card shadow-[var(--shadow-1)]"
          aria-labelledby="launch-heading"
        >
          <div className="border-b border-border/60 bg-surface-subtle px-4 py-3 sm:px-5">
            <h2 id="launch-heading" className="text-sm font-semibold text-foreground">
              Launch
            </h2>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <p className="text-sm leading-relaxed text-foreground">
              After creation, you will enter the project workspace and can begin adding interviews immediately.
            </p>
            {error ? (
              <div
                className="rounded-xl border border-danger/40 bg-danger-soft px-3 py-2.5 text-sm text-danger"
                role="alert"
              >
                {error}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <KroweButton type="submit" variant="primary" size="sm" loading={loading}>
                Create project
              </KroweButton>
              <KroweButton
                type="button"
                variant="secondary"
                size="sm"
                disabled={loading}
                onClick={() => {
                  setName("");
                  setSessionId("");
                  setError(null);
                }}
              >
                Reset draft
              </KroweButton>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
