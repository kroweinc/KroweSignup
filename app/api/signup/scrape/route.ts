import { NextResponse } from "next/server";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import {
  scrapeAndPersistOnboardingFromUrl,
  writeUrlOnboardingDraftToSession,
} from "@/lib/signup/scrapeOnboarding";
import {
  normalizeUrlOnboardingDraft,
  type UrlOnboardingDraft,
} from "@/lib/signup/urlOnboarding";

type ScrapeBody = {
  sessionId?: string;
  url?: string;
};

type SaveDraftBody = {
  sessionId?: string;
  draft?: Partial<UrlOnboardingDraft> | Record<string, unknown>;
};

function parseJsonValue<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function buildDraftFromAnswerRows(
  rows: Array<{ step_key: string; raw_answer: string | null; final_answer: string | null }>
): UrlOnboardingDraft {
  const byKey: Record<string, string> = {};
  for (const row of rows) {
    const preferred = row.final_answer ?? row.raw_answer;
    byKey[row.step_key] = preferred ?? "";
  }

  return normalizeUrlOnboardingDraft({
    idea: byKey.idea ?? "",
    product_type: byKey.product_type ?? "",
    features: parseJsonValue<string[]>(byKey.features, []),
    problem: byKey.problem ?? "",
    target_customer: byKey.target_customer ?? "",
    industry: parseJsonValue<{ industry: string | null; other: string } | string>(
      byKey.industry,
      { industry: null, other: "" }
    ),
    competitors: parseJsonValue<string[]>(byKey.competitors, []),
    alternatives: parseJsonValue<string[]>(byKey.alternatives, []),
    pricing_model: parseJsonValue<{ pricingModels: string[]; estimatedPrice: string | null }>(
      byKey.pricing_model,
      { pricingModels: [], estimatedPrice: null }
    ),
    interview_count: byKey.interview_count ?? "0",
    startup_stage: byKey.startup_stage ?? "idea",
  });
}

async function requireSessionOwner(sessionId: string) {
  const supabase = await createInterviewAuthClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  const { data: session, error: sessionError } = await supabase
    .from("signup_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (sessionError) {
    return { ok: false as const, status: 500, error: sessionError.message };
  }

  if (!session) {
    return { ok: false as const, status: 404, error: "Session not found" };
  }

  return { ok: true as const, supabase };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = (searchParams.get("sessionId") ?? "").trim();
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const access = await requireSessionOwner(sessionId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const { data, error } = await access.supabase
    .from("signup_answers")
    .select("step_key, raw_answer, final_answer")
    .eq("session_id", sessionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const draft = buildDraftFromAnswerRows(data ?? []);
  return NextResponse.json({ ok: true, draft });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ScrapeBody;
  const sessionId = (body.sessionId ?? "").trim();
  const url = (body.url ?? "").trim();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const access = await requireSessionOwner(sessionId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const result = await scrapeAndPersistOnboardingFromUrl(sessionId, url);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    draft: result.draft,
    sourceUrl: result.sourceUrl,
    sourceUpdatedAt: result.sourceUpdatedAt,
  });
}

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => ({}))) as SaveDraftBody;
  const sessionId = (body.sessionId ?? "").trim();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  if (!body.draft || typeof body.draft !== "object") {
    return NextResponse.json({ error: "Missing draft" }, { status: 400 });
  }

  const access = await requireSessionOwner(sessionId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const normalizedDraft = normalizeUrlOnboardingDraft(body.draft);
  const result = await writeUrlOnboardingDraftToSession(
    sessionId,
    normalizedDraft,
    "user_edited"
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    draft: result.draft,
    sourceUrl: result.sourceUrl || null,
    sourceUpdatedAt: result.sourceUpdatedAt,
  });
}
