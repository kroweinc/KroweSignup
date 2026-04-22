import { redirect } from "next/navigation";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import InterviewsShell from "../_components/InterviewsShell";
import NewProjectPageClient from "./NewProjectPageClient";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  if (!isAdmin) {
    const { data: existing } = await supabase
      .from("interview_projects")
      .select("id")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .limit(1)
      .maybeSingle();

    if (existing) redirect(`/interviews/${existing.id}`);
  }

  return (
    <InterviewsShell activeNav="projects" skipEntrance>
      <div className="krowe-blueprint-canvas -mx-3 -mt-3 min-h-[calc(100vh-6rem)] rounded-none px-3 pb-10 pt-3 sm:-mx-4 sm:px-4">
        <NewProjectPageClient isAdmin={isAdmin} />
      </div>
    </InterviewsShell>
  );
}
