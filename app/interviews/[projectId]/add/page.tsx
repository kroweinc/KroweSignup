import { notFound, redirect } from "next/navigation";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import InterviewsShell from "@/app/interviews/_components/InterviewsShell";
import AddInterviewForm from "./AddInterviewForm";

export const dynamic = "force-dynamic";

export default async function AddInterviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: project, error } = await supabase
    .from("interview_projects")
    .select("id, name")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !project) notFound();

  return (
    <InterviewsShell projectId={projectId} activeNav="addInterview" skipEntrance>
      <AddInterviewForm projectId={projectId} projectName={project.name} />
    </InterviewsShell>
  );
}
