import Link from "next/link";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import InterviewsShell from "../_components/InterviewsShell";
import { InterviewsPageWidth } from "../_components/InterviewsPageWidth";
import { ContentHeader } from "@/app/components/krowe/ContentHeader";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import { LogsSurfaceClient } from "./LogsSurfaceClient";

type ActivityLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  project_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <InterviewsShell activeNav="logs">
        <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
          <InterviewsPageWidth className="space-y-8">
            <ContentHeader
              breadcrumbs={[
                { label: "Interviews", href: "/interviews" },
                { label: "Logs" },
              ]}
              title="Activity logs"
              description="Audit project-level actions and system events from your interview workspace."
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
                Sign in to load activity from your workspace. If you were signed in, your session may have expired.
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

  const { data, error } = await supabase
    .from("dashboard_activity_logs")
    .select("id, action, entity_type, entity_id, project_id, metadata, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const logs = (data ?? []) as ActivityLog[];

  return (
    <InterviewsShell activeNav="logs" skipEntrance>
      <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
        <InterviewsPageWidth className="space-y-8">
          <ContentHeader
            breadcrumbs={[
              { label: "Interviews", href: "/interviews" },
              { label: "Logs" },
            ]}
            title="Activity logs"
            description="Audit project-level actions and system events from your interview workspace."
            actions={
              <>
                <KroweLinkButton href="/interviews/usage?range=24h" variant="secondary">
                  Usage
                </KroweLinkButton>
                <KroweLinkButton href="/interviews" variant="secondary">
                  Back to Home
                </KroweLinkButton>
              </>
            }
          />

          <LogsSurfaceClient logs={logs} errorMessage={error?.message ?? null} />
        </InterviewsPageWidth>
      </div>
    </InterviewsShell>
  );
}
