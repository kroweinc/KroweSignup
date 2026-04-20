import Link from "next/link";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import LogoutButton from "../LogoutButton";
import InterviewsShell from "../_components/InterviewsShell";
import DashboardPageHeader from "../_components/DashboardPageHeader";
import FeedbackForm from "./FeedbackForm";

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

  if (!user) return null;

  const { data, error } = await supabase
    .from("interview_projects")
    .select("id, name")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <InterviewsShell activeNav="feedback" topbarTitle="Krowe Dashboard" topbarActions={<LogoutButton />}>
        <div className="rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger">
          Could not load project context for feedback. Please refresh and try again.
        </div>
      </InterviewsShell>
    );
  }

  const projects = (data ?? []) as ProjectOption[];

  return (
    <InterviewsShell activeNav="feedback" topbarTitle="Krowe Dashboard" topbarActions={<LogoutButton />}>
      <div className="space-y-5">
        <DashboardPageHeader
          eyebrow="Feedback"
          title="Help us sharpen Krowe"
          description="Give precise, high-signal feedback. We save every submission to a dedicated feedback table and route instant notifications to the team."
          actions={
            <Link
              href="/interviews"
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50"
            >
              Back to Home
            </Link>
          }
        />

        <section className="overflow-hidden rounded-xl border border-border/60 bg-[radial-gradient(circle_at_20%_0%,color-mix(in_srgb,var(--interview-brand-tint)_55%,white)_0%,transparent_44%),linear-gradient(180deg,white,white)] px-4 py-4">
          <p className="text-xs text-muted-foreground">
            Your response powers product decisions. We ask a few focused questions now so your later
            requests can be triaged faster and with less back-and-forth.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-interview-brand-tint px-2.5 py-1 font-semibold text-interview-brand">
              Stored in `product_feedback`
            </span>
            <span className="rounded-full border border-border/60 bg-card px-2.5 py-1 font-semibold text-muted-foreground">
              Retool webhook notification
            </span>
            <span className="rounded-full border border-border/60 bg-card px-2.5 py-1 font-semibold text-muted-foreground">
              Team + submitter emails
            </span>
          </div>
        </section>

        <FeedbackForm projects={projects} />
      </div>
    </InterviewsShell>
  );
}
