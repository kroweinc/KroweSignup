/**
 * Shared report generation pipeline
 *
 * This function encapsulates the full report generation flow:
 * 1. Load answers from signup_answers
 * 2. Map inputs to expected payload structure
 * 3. Run all LLM enrichment modules (competitors, MVP cost, market size)
 * 4. Build the final report
 * 5. Persist to signup_reports
 *
 * Used by both /api/signup/report/generate and /api/signup/report/refresh
 */

import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { buildInputsFromAnswers } from "./buildInputsFromAnswers";
import { mapSignupInputsToReportInputs } from "./mapSignupInputsToReportInputs";
import { buildReportFromPayload } from "./buildReport";
import { findCompetitorsViaWeb, type Competitor } from "./findCompetitors";
import { estimateMvpCostViaLLM, type MvpCostEstimate } from "./estimateMvpCost";
import { estimateMarketSizeLLM, type MarketSizeLLM } from "./marketsize";
import { computeThingsNeededLLM, type ThingsNeededResult } from "./thingsNeeded";

export type GenerateReportOptions = {
  /** Reason for generation - used for logging/debugging */
  reason?: "generate" | "refresh";
  /** Skip version/status checks (for refresh) */
  forceRegenerate?: boolean;
};

export type GenerateReportResult = {
  report: ReturnType<typeof buildReportFromPayload>;
  updatedAt: string;
  reportId?: string;
  /** Debug info about enrichment modules */
  enrichmentDebug?: {
    competitorCount: number;
    competitorError?: string;
    hasCostEstimate: boolean;
    hasMarketSize: boolean;
  };
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Generate a full report for a session, including all LLM enrichment.
 *
 * @param sessionId - The session ID to generate report for
 * @param opts - Options for generation
 * @returns The generated report and metadata
 */
export async function generateReportForSession(
  sessionId: string,
  opts: GenerateReportOptions = {}
): Promise<GenerateReportResult> {
  const { reason = "generate" } = opts;
  const supabase = createServerSupabaseClient();

  console.log(`[generateReportForSession] Starting (reason: ${reason}) for session: ${sessionId}`);

  // 1) Load answers from signup_answers
  const { data: answers, error: answersError } = await supabase
    .from("signup_answers")
    .select("step_key, final_answer")
    .eq("session_id", sessionId);

  if (answersError) {
    console.error("[generateReportForSession] Failed to load answers:", answersError);
    throw new Error(`Failed to load signup answers: ${answersError.message}`);
  }

  if (!answers || answers.length === 0) {
    throw new Error("No answers found for session");
  }

  // 2) Build and map inputs
  const rawInputs = buildInputsFromAnswers(answers);
  const mappedPayload = mapSignupInputsToReportInputs(rawInputs);

  // Extract key values for LLM calls
  const idea = rawInputs.idea ?? null;
  const industry = rawInputs.industry ?? null;
  const targetCustomer = rawInputs.target_customer ?? null;
  const problem = rawInputs.problem ?? null;
  const productType = rawInputs.product_type ?? null;
  const teamSize = rawInputs.team_size ? parseInt(rawInputs.team_size, 10) : null;
  const hoursPerWeek = rawInputs.hours ? parseInt(rawInputs.hours, 10) : null;

  console.log(`[generateReportForSession] Loaded ${answers.length} answers, idea: "${idea?.slice(0, 50)}..."`);

  // 3) Run LLM enrichment modules
  let competitors: Competitor[] = [];
  let competitorError: string | undefined;
  let costEstimate: MvpCostEstimate | null = null;
  let mvpCostEstimateError: string | undefined;
  let marketSize: MarketSizeLLM | null = null;
  let thingsNeeded: ThingsNeededResult | null = null;

  // 3) Run enrichment modules in parallel
  const competitorPromise = idea && industry
    ? (() => {
        console.log(`[generateReportForSession] Running competitor search...`);
        return findCompetitorsViaWeb({ idea, industry, targetCustomer });
      })()
    : (() => {
        console.log("[generateReportForSession] Skipping competitor search (missing idea or industry)");
        return Promise.resolve({ competitors: [] as Competitor[] });
      })();

  const mvpCostPromise = idea
    ? (() => {
        console.log(`[generateReportForSession] Running MVP cost estimation...`);
        return estimateMvpCostViaLLM({
          idea,
          industry,
          productType,
          targetCustomer,
          teamSize,
          hoursPerWeek,
        });
      })()
    : (() => {
        console.log("[generateReportForSession] Skipping MVP cost (missing idea)");
        return Promise.resolve(null);
      })();

  console.log(`[generateReportForSession] Running market size estimation...`);
  const marketSizePromise = estimateMarketSizeLLM({
    idea,
    problem,
    targetCustomer,
    industry,
    // Step 2: market size no longer waits on competitor lookup.
    competitors: [],
  });

  console.log(`[generateReportForSession] Running things needed generation...`);
  const thingsNeededPromise = computeThingsNeededLLM({
    idea,
    productType,
    targetCustomer,
    industry,
    problem,
    skillsRaw: rawInputs.skills ?? null,
    teamSize,
    hours: hoursPerWeek,
  });

  const [competitorResult, mvpCostResult, marketSizeResult, thingsNeededResult] =
    await Promise.allSettled([
      competitorPromise,
      mvpCostPromise,
      marketSizePromise,
      thingsNeededPromise,
    ]);

  if (competitorResult.status === "fulfilled") {
    competitors = competitorResult.value.competitors ?? [];
    console.log(`[generateReportForSession] Found ${competitors.length} competitors`);
  } else {
    competitorError = errorMessage(competitorResult.reason, "Competitor search failed");
    competitors = [];
    console.error("[generateReportForSession] Competitor search error:", competitorError);
  }

  if (mvpCostResult.status === "fulfilled") {
    costEstimate = mvpCostResult.value;
    if (costEstimate) {
      console.log(`[generateReportForSession] MVP cost estimate: $${costEstimate.cost_mid_usd}`);
    }
  } else {
    costEstimate = null;
    mvpCostEstimateError = errorMessage(mvpCostResult.reason, "Failed to estimate MVP cost");
    console.error("[generateReportForSession] MVP cost error:", mvpCostEstimateError);
  }

  if (marketSizeResult.status === "fulfilled") {
    marketSize = marketSizeResult.value;
    console.log(`[generateReportForSession] Market size confidence: ${marketSize?.confidence ?? "N/A"}`);
  } else {
    marketSize = null;
    console.error("[generateReportForSession] Market size error:", errorMessage(marketSizeResult.reason, "Market size failed"));
  }

  if (thingsNeededResult.status === "fulfilled") {
    thingsNeeded = thingsNeededResult.value;
    console.log(`[generateReportForSession] Things needed: ${thingsNeeded?.needs.length ?? 0} needs`);
  } else {
    thingsNeeded = null;
    console.error("[generateReportForSession] Things needed error:", errorMessage(thingsNeededResult.reason, "Things needed failed"));
  }

  // 4) Build the report
  console.log(`[generateReportForSession] Building report...`);
  const report = buildReportFromPayload(mappedPayload, {
    competitors,
    competitorError,
    costEstimate,
    mvpCostEstimateError,
    marketSize,
    thingsNeeded,
  });

  // 5) Persist to signup_reports (upsert)
  const updatedAt = new Date().toISOString();

  const { data: upserted, error: upsertError } = await supabase
    .from("signup_reports")
    .upsert(
      {
        session_id: sessionId,
        status: "ready",
        report,
        updated_at: updatedAt,
      },
      { onConflict: "session_id" }
    )
    .select("id")
    .single();

  if (upsertError) {
    console.error("[generateReportForSession] Failed to save report:", upsertError);
    throw new Error(`Failed to save report: ${upsertError.message}`);
  }

  console.log(`[generateReportForSession] Report saved successfully (reason: ${reason})`);

  // Debug log for enrichment verification
  const enrichmentDebug = {
    competitorCount: competitors.length,
    competitorError,
    hasCostEstimate: costEstimate !== null,
    hasMarketSize: marketSize !== null,
    hasThingsNeeded: thingsNeeded !== null,
  };
  console.log(`[generateReportForSession] Enrichment debug:`, enrichmentDebug);

  return {
    report,
    updatedAt,
    reportId: upserted?.id,
    enrichmentDebug,
  };
}
