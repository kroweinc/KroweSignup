import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import { notFound } from "next/navigation";
import InterviewsShell from "@/app/interviews/_components/InterviewsShell";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import { InterviewScriptTab } from "../InterviewScriptTab";
import { InterviewScriptPageClient } from "../InterviewScriptPageClient";

export const dynamic = "force-dynamic";

export default async function InterviewScriptPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createInterviewAuthClient();

  const { data: project, error } = await supabase
    .from("interview_projects")
    .select("id, name")
    .eq("id", projectId)
    .single();

  if (error || !project) notFound();

  return (
    <InterviewsShell activeNav="script" projectId={projectId} skipEntrance>
      <div className="krowe-blueprint-canvas -mx-3 -mt-3 flex min-h-[calc(100vh-6rem)] flex-col rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
        <InterviewScriptPageClient
          breadcrumbs={[
            { label: "Interviews", href: "/interviews" },
            { label: project.name, href: `/interviews/${projectId}` },
            { label: "Script" },
          ]}
          title="Interview script"
          description="Founder console for your discovery spine — reorder probes, search the canvas, and export when the runbook feels ready."
          projectName={project.name}
          headerActions={
            <>
              <KroweLinkButton href={`/interviews/${projectId}`} variant="secondary">
                Workspace
              </KroweLinkButton>
              <KroweLinkButton href={`/interviews/${projectId}/decision`} variant="secondary">
                Decision
              </KroweLinkButton>
            </>
          }
        >
          <InterviewScriptTab projectId={projectId} projectName={project.name} />
        </InterviewScriptPageClient>
      </div>
    </InterviewsShell>
  );
}
