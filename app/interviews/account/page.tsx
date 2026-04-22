import { redirect } from "next/navigation";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import InterviewsShell from "../_components/InterviewsShell";
import { KroweLinkButton } from "@/app/components/krowe/KroweLinkButton";
import { AccountPageClient, type AccountTab } from "./AccountPageClient";

export const dynamic = "force-dynamic";

type AccountPageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

const TABS = ["profile", "security", "billing"] as const;

function getActiveTab(tab: string | undefined): AccountTab {
  if (tab && TABS.includes(tab as AccountTab)) {
    return tab as AccountTab;
  }
  return "profile";
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const activeTab = getActiveTab(params.tab);
  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const fullName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";

  return (
    <InterviewsShell activeNav="account" skipEntrance>
      <AccountPageClient
        activeTab={activeTab}
        fullName={fullName}
        email={user.email ?? ""}
        headerActions={
          <>
            <KroweLinkButton href="/interviews" variant="secondary">
              Overview
            </KroweLinkButton>
            <KroweLinkButton href="/interviews/projects" variant="primary">
              All projects
            </KroweLinkButton>
          </>
        }
      />
    </InterviewsShell>
  );
}
