import { redirect } from "next/navigation";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import { getPostLoginDestination } from "@/lib/authPostLoginDestination";
import { AuthSignInClient } from "./AuthSignInClient";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error, redirectTo } = await searchParams;
  if (user) {
    const destination = await getPostLoginDestination(supabase, user.id, redirectTo);
    redirect(destination);
  }
  return <AuthSignInClient redirectTo={redirectTo} oauthError={error} />;
}
