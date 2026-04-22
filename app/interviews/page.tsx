import { redirect } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import InterviewsShell from "./_components/InterviewsShell";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import type { DashboardProject } from "./projects/types";
import {
  InterviewsOverviewPageClient,
  type InterviewOverviewProjectRow,
} from "./_components/InterviewsOverviewPageClient";

export const dynamic = "force-dynamic";

type Project = DashboardProject;

type MetricItem = {
  label: string;
  value: string;
  hint: string;
};

/**
 * Top card pill derived from pipeline status only (no per-project "signal" column yet).
 */
function projectTierPill(project: Project): { label: string; className: string } {
  switch (project.status) {
    case "ready":
      return {
        label: "High Signal",
        className: "border-success/25 bg-success-soft text-success",
      };
    case "processing":
      return {
        label: "In Progress",
        className: "border-warning/25 bg-warning-soft text-warning",
      };
    case "failed":
      return {
        label: "Needs attention",
        className: "border-danger/35 bg-danger-soft text-danger",
      };
    case "collecting":
    default:
      return {
        label: "Collecting",
        className: "border-primary/25 bg-primary-soft text-primary",
      };
  }
}

function getLastUpdatedLabel(projects: Project[]): string {
  if (!projects.length) return "No updates yet";

  const latest = projects[0];
  const now = Date.now();
  const updatedMs = new Date(latest.created_at).getTime();
  const diffHours = Math.max(1, Math.floor((now - updatedMs) / (1000 * 60 * 60)));

  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default async function InterviewsPage() {
  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("interview_projects")
    .select("id, name, status, interview_count, created_at, updated_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as Project[];
  const hasProject = projects.length > 0;

  if (!hasProject) redirect("/interviews/new");

  const totalInterviews = projects.reduce((sum, project) => sum + project.interview_count, 0);
  const activeProjects = projects.filter(
    (project) => project.status === "collecting" || project.status === "processing",
  ).length;
  const readyProjects = projects.filter((project) => project.status === "ready").length;

  const metrics: MetricItem[] = [
    {
      label: "Projects",
      value: projects.length.toString(),
      hint: `${activeProjects} active`,
    },
    {
      label: "Interviews",
      value: totalInterviews.toString(),
      hint: "Across all projects",
    },
    {
      label: "Ready decisions",
      value: readyProjects.toString(),
      hint: "Ready to review",
    },
    {
      label: "Last updated",
      value: getLastUpdatedLabel(projects),
      hint: "Latest project activity",
    },
  ];

  const readinessPct = Math.max(10, Math.round((readyProjects / projects.length) * 100));

  const projectsForClient: InterviewOverviewProjectRow[] = projects.map((project) => {
    const tier = projectTierPill(project);
    return {
      id: project.id,
      name: project.name,
      status: project.status,
      interview_count: project.interview_count,
      created_at: project.created_at,
      tierLabel: tier.label,
      tierClassName: tier.className,
    };
  });

  return (
    <InterviewsShell activeNav="intel" skipEntrance>
      <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
        <InterviewsOverviewPageClient
          headerActions={
            <>
              <KroweLinkButton href="/interviews/projects" variant="secondary">
                All projects
              </KroweLinkButton>
              <KroweLinkButton href="/interviews/new" variant="primary">
                <PlusIcon size={18} aria-hidden />
                New project
              </KroweLinkButton>
            </>
          }
          metrics={metrics}
          readinessPct={readinessPct}
          readyProjects={readyProjects}
          projectCount={projects.length}
          projects={projectsForClient}
        />
      </div>
    </InterviewsShell>
  );
}
