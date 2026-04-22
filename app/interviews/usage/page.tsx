import Link from "next/link";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import InterviewsShell from "../_components/InterviewsShell";
import { InterviewsPageWidth } from "../_components/InterviewsPageWidth";
import { ContentHeader } from "@/app/components/krowe/ContentHeader";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import { UsagePageClient, type UsageProjectRow } from "./UsagePageClient";

type Range = "24h" | "7d" | "30d";

function parseRange(raw?: string): Range {
  if (raw === "7d" || raw === "30d") return raw;
  return "24h";
}

function rangeToSince(range: Range): string {
  const now = Date.now();
  const hours = range === "24h" ? 24 : range === "7d" ? 24 * 7 : 24 * 30;
  return new Date(now - hours * 60 * 60 * 1000).toISOString();
}

const RANGE_LABELS: Record<Range, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

const VELOCITY = {
  high: { label: "High velocity", className: "border-success/30 bg-success-soft text-success" },
  moderate: { label: "Moderate", className: "border-warning/30 bg-warning-soft text-warning" },
  low: { label: "Low velocity", className: "border-border bg-surface-subtle text-muted-foreground" },
  none: { label: "No signal", className: "border-danger/30 bg-danger-soft text-danger" },
} as const;

function velocityKey(pct: number): keyof typeof VELOCITY {
  if (pct >= 40) return "high";
  if (pct >= 15) return "moderate";
  if (pct > 0) return "low";
  return "none";
}

function rangeChipClass(active: boolean): string {
  return active
    ? "rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
    : "rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground";
}

export const dynamic = "force-dynamic";

export default async function UsagePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const resolved = await searchParams;
  const range = parseRange(resolved.range);
  const since = rangeToSince(range);

  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <InterviewsShell activeNav="usage">
        <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
          <InterviewsPageWidth className="space-y-8">
            <ContentHeader
              breadcrumbs={[
                { label: "Interviews", href: "/interviews" },
                { label: "Usage" },
              ]}
              title="Usage"
              description="Rolling workspace analytics for interviews, decisions, and activity in the time range you pick."
              actions={
                <>
                  <KroweLinkButton href="/auth/signin" variant="secondary">
                    Sign in
                  </KroweLinkButton>
                  <KroweLinkButton href="/" variant="primary">
                    Return home
                  </KroweLinkButton>
                </>
              }
            />
            <section className="rounded-[var(--radius-lg)] border border-border/80 bg-card px-5 py-8 shadow-[var(--shadow-1)]">
              <h2 className="text-base font-semibold text-foreground">Session required</h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Sign in to view usage metrics. If you were signed in, your session may have expired.
              </p>
              <p className="mt-4 text-sm">
                <Link href="/auth/signin" className="font-semibold text-primary underline-offset-2 hover:underline">
                  Go to sign in
                </Link>
              </p>
            </section>
          </InterviewsPageWidth>
        </div>
      </InterviewsShell>
    );
  }

  const { data: projects } = await supabase
    .from("interview_projects")
    .select("id, name, status, interview_count")
    .eq("user_id", user.id)
    .is("archived_at", null);

  const projectIds = (projects ?? []).map((p) => p.id);

  const [interviewsRes, decisionsRes, logsRes] = await Promise.all([
    projectIds.length
      ? supabase
          .from("interviews")
          .select("id", { count: "exact", head: true })
          .in("project_id", projectIds)
          .gte("created_at", since)
      : Promise.resolve({ count: 0 }),
    projectIds.length
      ? supabase
          .from("decision_outputs")
          .select("id", { count: "exact", head: true })
          .in("project_id", projectIds)
          .eq("status", "ready")
          .gte("updated_at", since)
      : Promise.resolve({ count: 0 }),
    supabase
      .from("dashboard_activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since),
  ]);

  const totalProjects = projects?.length ?? 0;
  const activeProjects = projects?.filter((p) => p.status === "collecting" || p.status === "processing").length ?? 0;
  const readyProjects = projects?.filter((p) => p.status === "ready").length ?? 0;
  const totalInterviews = projects?.reduce((s, p) => s + p.interview_count, 0) ?? 0;
  const inRange = interviewsRes.count ?? 0;
  const decisionsInRange = decisionsRes.count ?? 0;
  const activityInRange = logsRes.count ?? 0;
  const coveragePct = totalInterviews > 0 ? Math.round((inRange / totalInterviews) * 100) : 0;
  const vKey = velocityKey(coveragePct);
  const velocity = VELOCITY[vKey];

  const sortedProjects = [...(projects ?? [])].sort((a, b) => b.interview_count - a.interview_count);
  const maxCount = Math.max(1, sortedProjects[0]?.interview_count ?? 1);

  const allProjects = (projects ?? []) as UsageProjectRow[];

  const headerActions = (
    <>
      <div className="flex flex-wrap items-center gap-1 rounded-full border border-border/80 bg-surface-subtle p-1">
        {(["24h", "7d", "30d"] as Range[]).map((r) => (
          <Link key={r} href={`/interviews/usage?range=${r}`} className={rangeChipClass(r === range)}>
            {r}
          </Link>
        ))}
      </div>
      <KroweLinkButton href="/interviews/logs" variant="secondary">
        Activity logs
      </KroweLinkButton>
      <KroweLinkButton href="/interviews" variant="secondary">
        Back to Home
      </KroweLinkButton>
    </>
  );

  return (
    <InterviewsShell activeNav="usage" skipEntrance>
      <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
        <UsagePageClient
          range={range}
          rangeDescription={RANGE_LABELS[range].toLowerCase()}
          headerActions={headerActions}
          totalProjects={totalProjects}
          activeProjects={activeProjects}
          readyProjects={readyProjects}
          totalInterviews={totalInterviews}
          inRange={inRange}
          decisionsInRange={decisionsInRange}
          activityInRange={activityInRange}
          coveragePct={coveragePct}
          velocity={velocity}
          allProjects={allProjects}
          sortedProjects={sortedProjects as UsageProjectRow[]}
          maxCount={maxCount}
        />
      </div>
    </InterviewsShell>
  );
}
