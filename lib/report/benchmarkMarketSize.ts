import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { buildInputsFromAnswers } from "./buildInputsFromAnswers";
import { estimateMarketSizeLLMWithMetrics, type MarketSizeTimings } from "./marketsize";

type BenchmarkSummary = {
  sessionId: string;
  runs: number;
  v1: {
    avg_total_market_size_ms: number;
    avg_prompt_build_ms: number;
    avg_llm_request_ms: number;
    avg_parse_ms: number;
  };
};

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, current) => sum + current, 0) / values.length);
}

function summarizeTimings(timings: MarketSizeTimings[]): BenchmarkSummary["v1"] {
  return {
    avg_total_market_size_ms: avg(timings.map((t) => t.total_market_size_ms)),
    avg_prompt_build_ms: avg(timings.map((t) => t.prompt_build_ms)),
    avg_llm_request_ms: avg(timings.map((t) => t.llm_request_ms)),
    avg_parse_ms: avg(timings.map((t) => t.parse_ms)),
  };
}

/**
 * Dev-only benchmark helper. Do not call automatically in production routes.
 */
export async function benchmarkMarketSize(
  sessionId: string,
  runs = 3
): Promise<BenchmarkSummary> {
  const safeRuns = Number.isFinite(runs) && runs > 0 ? Math.floor(runs) : 3;
  const supabase = createServerSupabaseClient();

  const { data: answers, error } = await supabase
    .from("signup_answers")
    .select("step_key, final_answer")
    .eq("session_id", sessionId);

  if (error) {
    throw new Error(`Failed to load signup answers for benchmark: ${error.message}`);
  }

  if (!answers || answers.length === 0) {
    throw new Error("No answers found for benchmark session");
  }

  const rawInputs = buildInputsFromAnswers(answers);
  const v1Input = {
    idea: rawInputs.idea ?? null,
    problem: rawInputs.problem ?? null,
    targetCustomer: rawInputs.target_customer ?? null,
    industry: rawInputs.industry ?? null,
    competitors: [],
  };

  const v1Timings: MarketSizeTimings[] = [];
  for (let i = 0; i < safeRuns; i += 1) {
    const v1 = await estimateMarketSizeLLMWithMetrics(v1Input);
    v1Timings.push(v1.timings);
  }

  const summary: BenchmarkSummary = {
    sessionId,
    runs: safeRuns,
    v1: summarizeTimings(v1Timings),
  };

  console.log("[marketSize][benchmark] runs=" + safeRuns + " sessionId=" + sessionId);
  console.log("[marketSize][benchmark] v1_avg_total_market_size_ms=" + summary.v1.avg_total_market_size_ms);
  console.log("[marketSize][benchmark] v1_avg_prompt_build_ms=" + summary.v1.avg_prompt_build_ms);
  console.log("[marketSize][benchmark] v1_avg_llm_request_ms=" + summary.v1.avg_llm_request_ms);
  console.log("[marketSize][benchmark] v1_avg_parse_ms=" + summary.v1.avg_parse_ms);

  return summary;
}
