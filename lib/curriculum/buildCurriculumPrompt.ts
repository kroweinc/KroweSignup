import { STARTUP_STAGE_DEFINITIONS } from "./stages";
import { STAGE_SUMMARY_GUIDANCE } from "./stageNarratives";
import type { StartupStageIndex } from "./stages";
import { TASK_CATEGORY_IDS } from "./taskCategories";

export function buildCurriculumSystemPrompt(params: {
  filteredFrameworkBlock: string;
}): string {
  const { filteredFrameworkBlock } = params;

  const stageLines = STARTUP_STAGE_DEFINITIONS.map((s) => {
    const g = STAGE_SUMMARY_GUIDANCE[s.stageIndex];
    return `Stage ${s.stageIndex} — ${s.title}: intent=${s.intent}. Summary guidance: ${g}`;
  }).join("\n");

  const categoryIdsList = TASK_CATEGORY_IDS.join(", ");

  return `
You are an expert startup coach. Build a personalized multi-stage curriculum as JSON.

Roadmap stages (exactly 6, in order):
${stageLines}

Task categories (closed set — every task MUST set "category" to one of these ids):
${categoryIdsList}

${filteredFrameworkBlock}

Per-stage emphasis (use this so each stage block feels distinct; still output all 6 stages):
${buildStageCategoryEmphasisLines()}

Output rules:
- Return ONLY valid JSON (no markdown fences, no commentary).
- Top-level keys must be exactly: "stages" (array of 6 objects).
- Each stage object must have: "stageIndex" (1-6), "title" (use the titles above), "summary" (2-5 sentences tailored to this founder), "tasks" (array).
- Each task MUST have: "id" (unique across ALL stages, e.g. s1-t1, s2-t3), "title", "description" (actionable), "category" (one of the ids listed above).
- Aim for roughly 8-15 tasks per stage when relevant; if a stage is largely complete for this founder, fewer tasks are OK but still cover the stage intent.
- Spread tasks across categories as appropriate for that stage; do not invent categories outside the closed set.
- Tie tasks to the founder's signup data when possible (quote specifics, avoid generic filler).
- Heavier detail and more tasks near the founder's current emphasis stage (given in the user message).
- Optional per task: "order", "estimatedHours", "tags" (string array).
- Do not invent funding amounts or named investors; stay practical and honest.
`.trim();
}

function buildStageCategoryEmphasisLines(): string {
  return [
    "Stage 1: problem_research, audience_research, team_finding.",
    "Stage 2: build_product, validate_product, competitor_research.",
    "Stage 3: validate_product, audience_research, build_product.",
    "Stage 4: finance_funding, validate_product, team_finding.",
    "Stage 5: market_gtm, finance_funding, validate_product.",
    "Stage 6: market_gtm, finance_funding, competitor_research.",
  ].join("\n");
}

export function buildCurriculumUserPrompt(params: {
  inputs: Record<string, string | null>;
  targetStageIndex: StartupStageIndex;
}): string {
  const { inputs, targetStageIndex } = params;
  const lines = Object.entries(inputs)
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${String(v).trim()}`);

  return `
Founder signup data (key: value):
${lines.join("\n")}

Primary emphasis stage (targetStageIndex): ${targetStageIndex} — put more concrete tasks and depth in stages near this index, while still producing meaningful tasks for all 6 stages.

Return JSON: { "stages": [ ... 6 stage objects in order stageIndex 1..6 ... ] }
`.trim();
}
