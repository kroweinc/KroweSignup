import Link from "next/link";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import { ProjectsManagerClient, type DashboardProject } from "./ProjectsManagerClient";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("interview_projects")
    .select("id, name, status, interview_count, created_at, updated_at")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-[1040px]">
          <div className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger">
            Failed to load projects: {error.message}
          </div>
        </div>
      </main>
    );
  }

  const projects = (data ?? []) as DashboardProject[];

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-[1040px] space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1">
              <Image src="/KroweIcon.png" alt="Krowe" width={14} height={14} className="rounded-[3px]" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Krowe platform
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Dashboard
            </p>
            <h1 className="serif-text mt-1 text-3xl font-semibold text-foreground">Projects</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/interviews"
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50"
            >
              Back to Home
            </Link>
            <Link
              href="/interviews/new"
              className="rounded-full bg-gradient-to-br from-interview-brand to-interview-brand-end px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              New Project
            </Link>
          </div>
        </div>
        <ProjectsManagerClient initialProjects={projects} />
      </div>
    </main>
  );
}
