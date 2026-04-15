import { NextResponse } from "next/server";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import { scrapeAndPersistOnboardingFromUrl } from "@/lib/signup/scrapeOnboarding";
import { getFirstStepKey } from "@/lib/signupSteps";

type PatchBody = {
  url?: string;
};

type ProjectSessionResolution =
  | { ok: true; sessionId: string }
  | { ok: false; status: number; error: string };

function validateHttpUrl(input: string): string | null {
  try {
    const parsed = new URL(input.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

async function resolveOrCreateSignupSessionForProject(
  supabase: Awaited<ReturnType<typeof createInterviewAuthClient>>,
  projectId: string,
  userId: string,
  existingSessionId: string | null
): Promise<ProjectSessionResolution> {
  const normalizedExisting = (existingSessionId ?? "").trim();
  if (normalizedExisting) {
    return { ok: true, sessionId: normalizedExisting };
  }

  const existingSessionRes = await supabase
    .from("signup_sessions")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingSessionRes.error) {
    return { ok: false, status: 500, error: existingSessionRes.error.message };
  }

  let sessionId = (existingSessionRes.data?.id ?? "").trim();

  if (!sessionId) {
    const createSessionRes = await supabase
      .from("signup_sessions")
      .insert({
        status: "in_progress",
        current_step_key: getFirstStepKey(),
        user_id: userId,
      })
      .select("id")
      .single();

    if (createSessionRes.error || !createSessionRes.data) {
      return {
        ok: false,
        status: 500,
        error: createSessionRes.error?.message ?? "Failed to create signup session",
      };
    }

    sessionId = createSessionRes.data.id;
  }

  const linkProjectRes = await supabase
    .from("interview_projects")
    .update({ session_id: sessionId })
    .eq("id", projectId)
    .eq("user_id", userId);

  if (linkProjectRes.error) {
    return { ok: false, status: 500, error: linkProjectRes.error.message };
  }

  return { ok: true, sessionId };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectRes = await supabase
    .from("interview_projects")
    .select("id, session_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectRes.error || !projectRes.data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = (await req.json()) as PatchBody;
  const urlInput = (body.url ?? "").trim();
  if (!urlInput) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const sourceUrl = validateHttpUrl(urlInput);
  if (!sourceUrl) {
    return NextResponse.json({ error: "Invalid URL. Use a valid http/https address." }, { status: 400 });
  }

  const sessionResolution = await resolveOrCreateSignupSessionForProject(
    supabase,
    projectId,
    user.id,
    projectRes.data.session_id
  );
  if (!sessionResolution.ok) {
    return NextResponse.json({ error: sessionResolution.error }, { status: sessionResolution.status });
  }
  const sessionId = sessionResolution.sessionId;

  const scrapeResult = await scrapeAndPersistOnboardingFromUrl(sessionId, sourceUrl, "user_edited");
  if (!scrapeResult.ok) {
    return NextResponse.json({ error: scrapeResult.error }, { status: scrapeResult.status });
  }

  const completedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("interview_projects")
    .update({
      onboarding_mode: "webscraper",
      onboarding_completed_at: completedAt,
      updated_at: completedAt,
    })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    onboarding: {
      mode: "webscraper",
      completedAt,
      sourceUrl: scrapeResult.sourceUrl,
      sourceUpdatedAt: scrapeResult.sourceUpdatedAt,
    },
  });
}
