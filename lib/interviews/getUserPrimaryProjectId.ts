import { createInterviewAuthClient } from "@/lib/supabaseAuth";

export async function getUserPrimaryProjectId(): Promise<string | null> {
  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("interview_projects")
    .select("id")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}
