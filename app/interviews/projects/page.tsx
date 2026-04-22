import { PlusIcon } from "lucide-react";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import type { DashboardProject } from "./ProjectsManagerClient";
import InterviewsShell from "../_components/InterviewsShell";
import { ProjectsPageClient } from "./ProjectsPageClient";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  const { data, error } = await supabase
    .from("interview_projects")
    .select("id, name, status, interview_count, created_at, updated_at")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <InterviewsShell activeNav="projects">
        <div>
          <div className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger">
            Failed to load projects: {error.message}
          </div>
        </div>
      </InterviewsShell>
    );
  }

  const projects = (data ?? []) as DashboardProject[];
  const readyProjects = projects.filter((project) => project.status === "ready").length;
  const readinessPct =
    projects.length === 0 ? 0 : Math.max(10, Math.round((readyProjects / projects.length) * 100));

  const statCards = [
    {
      label: "Active projects",
      value: projects.length,
      hint: "Not archived",
    },
    {
      label: "Total interviews",
      value: projects.reduce((sum, project) => sum + project.interview_count, 0),
      hint: "Across active projects",
    },
    {
      label: "Ready projects",
      value: projects.filter((project) => project.status === "ready").length,
      hint: "Decision outputs available",
    },
    {
      label: "In progress",
      value: projects.filter(
        (project) => project.status === "collecting" || project.status === "processing",
      ).length,
      hint: "Collecting or processing",
    },
  ];

  return (
    <InterviewsShell activeNav="projects" skipEntrance>
      <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
        <ProjectsPageClient
          breadcrumbs={[
            { label: "Interviews", href: "/interviews" },
            { label: "Projects" },
          ]}
          title="Projects"
          description="Manage interview workspaces, rename active projects, and archive completed ones."
          headerActions={
            <>
              <KroweLinkButton href="/interviews" variant="secondary">
                Back to Home
              </KroweLinkButton>
              {(isAdmin || projects.length === 0) && (
                <KroweLinkButton href="/interviews/new" variant="primary">
                  <PlusIcon size={18} aria-hidden />
                  New Project
                </KroweLinkButton>
              )}
            </>
          }
          statCards={statCards}
          readinessPct={readinessPct}
          readyProjects={readyProjects}
          projectCount={projects.length}
          initialProjects={projects}
          isAdmin={isAdmin}
        />
      </div>
    </InterviewsShell>
  );
}
