import Link from "next/link";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import InterviewsShell from "../_components/InterviewsShell";
import { InterviewsPageWidth } from "../_components/InterviewsPageWidth";
import { ContentHeader } from "@/app/components/krowe/ContentHeader";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import FeedbackForm from "./FeedbackForm";
import { FeedbackPageClient } from "./FeedbackPageClient";

export const dynamic = "force-dynamic";

type ProjectOption = {
  id: string;
  name: string;
};

export default async function FeedbackPage() {
  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <InterviewsShell activeNav="feedback" noPadding>
        <div className="krowe-blueprint-canvas min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:px-4">
          <InterviewsPageWidth className="space-y-8">
            <ContentHeader
              breadcrumbs={[
                { label: "Interviews", href: "/interviews" },
                { label: "Feedback" },
              ]}
              title="Feedback"
              description="Share high-signal product feedback after you sign in."
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
                Sign in to submit feedback tied to your workspace. If you were signed in, your session may have
                expired.
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
    .from("interview_projects")
    .select("id, name")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <InterviewsShell activeNav="feedback" noPadding>
        <div className="krowe-blueprint-canvas min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:px-4">
          <InterviewsPageWidth className="space-y-8">
            <ContentHeader
              breadcrumbs={[
                { label: "Interviews", href: "/interviews" },
                { label: "Feedback" },
              ]}
              title="Feedback"
              description="We could not load your project list for this form."
              actions={
                <KroweLinkButton href="/interviews" variant="secondary">
                  Back to Home
                </KroweLinkButton>
              }
            />
            <div className="rounded-[var(--radius-lg)] border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger shadow-[var(--shadow-1)]">
              Could not load project context for feedback. Please refresh and try again.
              {error.message ? <span className="mt-1 block opacity-90">{error.message}</span> : null}
            </div>
          </InterviewsPageWidth>
        </div>
      </InterviewsShell>
    );
  }

  const projects = (data ?? []) as ProjectOption[];
  const n = projects.length;

  const statCards = [
    { label: "Workspaces", value: n, hint: n ? "Projects you can attach context to" : "Create a project first" },
    { label: "Categories", value: 6, hint: "Bug through Other" },
    { label: "Form pillars", value: 4, hint: "Rating, narrative, frequency, recommend" },
    { label: "Rating scale", value: "1–5", hint: "Overall experience" },
  ];

  const readinessPct = Math.min(100, Math.max(18, 36 + n * 10));
  const queueCaption =
    n > 0
      ? `${n} workspace${n !== 1 ? "s" : ""} available for optional project context.`
      : "Add a project to tie feedback to a specific workspace.";

  const headerActions = (
    <>
      <KroweLinkButton href="/interviews/usage?range=24h" variant="secondary">
        Usage
      </KroweLinkButton>
      <KroweLinkButton href="/interviews/logs" variant="secondary">
        Activity logs
      </KroweLinkButton>
      <KroweLinkButton href="/interviews" variant="secondary">
        Back to Home
      </KroweLinkButton>
    </>
  );

  return (
    <InterviewsShell activeNav="feedback" noPadding skipEntrance>
      <div className="krowe-blueprint-canvas min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:px-4">
        <FeedbackPageClient
          breadcrumbs={[
            { label: "Interviews", href: "/interviews" },
            { label: "Feedback" },
          ]}
          title="Help us sharpen Krowe"
          description="Give precise, high-signal feedback. We save every submission to a dedicated feedback table and route instant notifications to the team."
          headerActions={headerActions}
          statCards={statCards}
          readinessPct={readinessPct}
          queueCaption={queueCaption}
        >
          <FeedbackForm projects={projects} orchestrateFields />
        </FeedbackPageClient>
      </div>
    </InterviewsShell>
  );
}
