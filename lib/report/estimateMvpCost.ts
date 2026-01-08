import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export type MvpCostEstimate = {
  cost_low_usd: number;
  cost_high_usd: number;
  cost_mid_usd: number;
  cost_efficiency_score_0_1: number; // higher = cheaper/easier to build
  confidence_0_1: number;
  assumptions: string[];
  key_cost_drivers: string[];
  recommended_mvp_scope: string;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export async function estimateMvpCostViaLLM(args: {
  idea: string;
  industry?: string | null;
  productType?: string | null;
  targetCustomer?: string | null;
  teamSize?: number | null;
  hoursPerWeek?: number | null;
}): Promise<MvpCostEstimate> {
  const prompt = `
You are estimating MVP build cost for a FIRST VERSION of a startup.

Inputs:
- Idea: ${args.idea}
- Industry: ${args.industry ?? "unknown"}
- Product type: ${args.productType ?? "unknown"} (web/mobile/both/other)
- Target customer: ${args.targetCustomer ?? "unknown"}
- Team size: ${args.teamSize ?? "unknown"}
- Hours per week: ${args.hoursPerWeek ?? "unknown"}

Rules:
- Assume an MVP: smallest scope that can validate the core value.
- Assume typical indie founder constraints (use managed services, no custom infra unless required).
- Return a realistic USD range for a 4–8 week MVP.
- Also return cost_efficiency_score_0_1 where:
  - 1.0 = very cheap / fast to build (simple web app, low integrations)
  - 0.0 = very expensive / slow (hardware, regulated, complex integrations, marketplace w/ liquidity)
`;

  const resp = await client.responses.create({
    model: "gpt-5-mini",
    input: prompt,
    // ✅ Structured Outputs in Responses API uses text.format :contentReference[oaicite:1]{index=1}
    text: {
      format: {
        type: "json_schema",
        name: "mvp_cost_estimate",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            cost_low_usd: { type: "number" },
            cost_high_usd: { type: "number" },
            cost_mid_usd: { type: "number" },
            cost_efficiency_score_0_1: { type: "number" },
            confidence_0_1: { type: "number" },
            assumptions: { type: "array", items: { type: "string" } },
            key_cost_drivers: { type: "array", items: { type: "string" } },
            recommended_mvp_scope: { type: "string" },
          },
          required: [
            "cost_low_usd",
            "cost_high_usd",
            "cost_mid_usd",
            "cost_efficiency_score_0_1",
            "confidence_0_1",
            "assumptions",
            "key_cost_drivers",
            "recommended_mvp_scope",
          ],
        },
      },
    },
  });

  // With strict schema, output_text will be valid JSON for this schema.
  const parsed = JSON.parse(resp.output_text);

  // sanitize
  return {
    ...parsed,
    cost_efficiency_score_0_1: clamp01(parsed.cost_efficiency_score_0_1),
    confidence_0_1: clamp01(parsed.confidence_0_1),
  };
}
