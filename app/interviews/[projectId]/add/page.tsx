import InterviewsShell from "@/app/interviews/_components/InterviewsShell";
import LogoutButton from "@/app/interviews/LogoutButton";
import AddInterviewForm from "./AddInterviewForm";

export default async function AddInterviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <InterviewsShell
      projectId={projectId}
      activeNav="addInterview"
      topbarTitle="Add interview"
      topbarActions={<LogoutButton />}
    >
      <AddInterviewForm projectId={projectId} />
    </InterviewsShell>
  );
}
