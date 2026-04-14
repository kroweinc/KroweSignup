import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { createInterviewAuthClient } from "@/lib/supabaseAuth";
import {
  getUrlOnboardingScrapeMaxChars,
  getUrlOnboardingScrapeTimeoutMs,
  isUrlOnboardingScrapeEnabled,
} from "@/lib/env";
import { extractOnboardingFromUrlContent } from "@/lib/signup/extractFromUrl";
import {
  mapExtractedModelOutputToDraft,
  normalizeUrlOnboardingDraft,
  serializeStepValue,
  URL_ONBOARDING_STEP_KEYS,
  type UrlOnboardingDraft,
} from "@/lib/signup/urlOnboarding";
import type { FinalAnswerSource } from "@/lib/types/answers";

type ScrapeBody = {
  sessionId?: string;
  url?: string;
};

type UpdateBody = {
  sessionId?: string;
  draft?: Partial<UrlOnboardingDraft>;
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function ensureAuthenticatedSessionOwner(sessionId: string): Promise<NextResponse | null> {
  const authClient = await createInterviewAuthClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: ownedSession } = await authClient
    .from("signup_sessions")
    .select("id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!ownedSession) {
    return NextResponse.json({ error: "Session not found or not owned by user" }, { status: 403 });
  }

  return null;
}

function validateHttpUrl(input: string): URL | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "KroweSignup/1.0",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function buildUpsertRows(
  sessionId: string,
  draft: UrlOnboardingDraft,
  finalSource: FinalAnswerSource
) {
  const now = new Date().toISOString();

  return URL_ONBOARDING_STEP_KEYS.map((stepKey) => {
    const serialized = serializeStepValue(stepKey, draft);
    return {
      session_id: sessionId,
      step_key: stepKey,
      raw_answer: serialized,
      final_answer: serialized,
      final_source: finalSource,
      confirmed_at: now,
    };
  });
}

async function writeDraftToSession(
  sessionId: string,
  draft: UrlOnboardingDraft,
  finalSource: FinalAnswerSource
): Promise<NextResponse | null> {
  const supabase = createServerSupabaseClient();
  const rows = buildUpsertRows(sessionId, draft, finalSource);

  const { error: upsertError } = await supabase
    .from("signup_answers")
    .upsert(rows, { onConflict: "session_id,step_key" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  const { error: sessionError } = await supabase
    .from("signup_sessions")
    .update({ current_step_key: "startup_stage" })
    .eq("id", sessionId);

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  return null;
}

export async function POST(req: Request) {
  if (!isUrlOnboardingScrapeEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await req.json()) as ScrapeBody;
  const sessionId = (body.sessionId ?? "").trim();
  const urlInput = (body.url ?? "").trim();

  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  if (!urlInput) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const parsedUrl = validateHttpUrl(urlInput);
  if (!parsedUrl) {
    return NextResponse.json({ error: "Invalid URL. Use a valid http/https address." }, { status: 400 });
  }

  const authError = await ensureAuthenticatedSessionOwner(sessionId);
  if (authError) return authError;

  const timeoutMs = getUrlOnboardingScrapeTimeoutMs();
  const maxChars = getUrlOnboardingScrapeMaxChars();
  const readerUrl = `https://r.jina.ai/${parsedUrl.toString()}`;

  let readerResponse: Response;
  try {
    readerResponse = await fetchWithTimeout(readerUrl, timeoutMs);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Could not reach that URL in time." }, { status: 408 });
    }
    return NextResponse.json({ error: "Failed to fetch website content" }, { status: 502 });
  }

  if (!readerResponse.ok) {
    return NextResponse.json({ error: "Could not fetch readable content from that URL" }, { status: 422 });
  }

  const pageContent = (await readerResponse.text()).trim();
  if (!pageContent) {
    return NextResponse.json({ error: "No readable content found at that URL" }, { status: 422 });
  }

  const boundedContent = pageContent.slice(0, maxChars);

  try {
    const extracted = await extractOnboardingFromUrlContent(boundedContent, parsedUrl.toString());
    const draft = mapExtractedModelOutputToDraft(extracted);

    const writeError = await writeDraftToSession(sessionId, draft, "ai_suggested");
    if (writeError) return writeError;

    return NextResponse.json({ ok: true, draft });
  } catch (error) {
    console.error("[signup/scrape] extraction failed:", error);
    return NextResponse.json(
      { error: "Failed to extract onboarding data from that website" },
      { status: 422 }
    );
  }
}

export async function GET(req: Request) {
  if (!isUrlOnboardingScrapeEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const sessionId = (url.searchParams.get("sessionId") ?? "").trim();
  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

  const authError = await ensureAuthenticatedSessionOwner(sessionId);
  if (authError) return authError;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("signup_answers")
    .select("step_key, raw_answer, final_answer")
    .eq("session_id", sessionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byKey: Record<string, string> = {};
  for (const row of data ?? []) {
    byKey[row.step_key] = (row.final_answer ?? row.raw_answer ?? "").toString();
  }

  const draft = normalizeUrlOnboardingDraft({
    idea: byKey.idea,
    product_type: byKey.product_type,
    features: parseJson<string[]>(byKey.features, []),
    problem: byKey.problem,
    target_customer: byKey.target_customer,
    industry: parseJson<{ industry: string | null; other: string }>(byKey.industry, {
      industry: null,
      other: "",
    }),
    competitors: parseJson<string[]>(byKey.competitors, []),
    alternatives: parseJson<string[]>(byKey.alternatives, []),
    pricing_model: parseJson<{ pricingModels: string[]; estimatedPrice: string | null }>(
      byKey.pricing_model,
      { pricingModels: [], estimatedPrice: null }
    ),
    interview_count: byKey.interview_count ?? "0",
    startup_stage: byKey.startup_stage,
  });

  return NextResponse.json({ ok: true, draft });
}

export async function PUT(req: Request) {
  if (!isUrlOnboardingScrapeEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await req.json()) as UpdateBody;
  const sessionId = (body.sessionId ?? "").trim();

  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  if (!body.draft || typeof body.draft !== "object") {
    return NextResponse.json({ error: "Missing draft" }, { status: 400 });
  }

  const authError = await ensureAuthenticatedSessionOwner(sessionId);
  if (authError) return authError;

  const draft = normalizeUrlOnboardingDraft(body.draft);
  const writeError = await writeDraftToSession(sessionId, draft, "user_edited");
  if (writeError) return writeError;

  return NextResponse.json({ ok: true, draft });
}
