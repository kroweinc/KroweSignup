import type { StartupStageIndex } from "./stages";
import type { TaskCategoryId } from "./taskCategories";
import { TASK_CATEGORY_IDS } from "./taskCategories";
import frameworkJson from "./krowe-task-framework.json";

type FrameworkCategory = {
  id: string;
  label: string;
  summary: string;
  activities: string[];
  successCriteria: string[];
  stageWeights: Record<string, number>;
};

type FrameworkFile = {
  frameworkVersion: string;
  categories: FrameworkCategory[];
};

const framework = frameworkJson as FrameworkFile;

function categoryById(id: TaskCategoryId): FrameworkCategory | undefined {
  return framework.categories.find((c) => c.id === id);
}

function weightForStage(cat: FrameworkCategory, stage: StartupStageIndex): number {
  const w = cat.stageWeights[String(stage)];
  return typeof w === "number" ? w : 0;
}

function concatAnswers(inputs: Record<string, string | null>): string {
  return Object.values(inputs)
    .filter((v): v is string => v != null && String(v).trim() !== "")
    .join(" ")
    .toLowerCase();
}

/**
 * Heuristic boosts so filtering reflects founder context (deterministic).
 */
function heuristicBoost(
  id: TaskCategoryId,
  inputs: Record<string, string | null>,
  targetStageIndex: StartupStageIndex
): number {
  let b = 0;
  const teamRaw = String(inputs.team_size ?? "").trim();
  const team = parseInt(teamRaw, 10);
  const idea = String(inputs.idea ?? "").trim();
  const blob = concatAnswers(inputs);

  if (id === "team_finding" && (teamRaw === "" || !Number.isFinite(team) || team <= 1)) {
    b += 2;
  }
  if (id === "problem_research" && idea.length < 80) {
    b += 1.5;
  }
  if (id === "competitor_research" && /compet|alternative|substitute|incumbent/.test(blob)) {
    b += 1;
  }
  if (id === "build_product" && /mvp|prototype|build|ship|product/.test(blob)) {
    b += 1;
  }
  if (id === "finance_funding" && /fund|raise|invest|revenue|pricing|bootstrap/.test(blob)) {
    b += 1.5;
  }
  if (id === "validate_product" && /user|retention|metric|kpi|feedback|interview/.test(blob)) {
    b += 1;
  }
  if (id === "market_gtm" && /marketing|channel|content|brand|launch/.test(blob)) {
    b += 1;
  }
  if (targetStageIndex >= 4) {
    if (id === "finance_funding" || id === "market_gtm") b += 1.5;
  }
  if (targetStageIndex <= 2) {
    if (id === "problem_research" || id === "audience_research") b += 1;
  }

  return b;
}

export type FilterTaskFrameworkOptions = {
  /** How many categories get full detail in the prompt (default 5). */
  deepCount?: number;
};

export type FilterTaskFrameworkResult = {
  deep: TaskCategoryId[];
  shallow: TaskCategoryId[];
  scores: Record<TaskCategoryId, number>;
};

/**
 * Partition categories into "deep" (full framework text) vs "shallow" (one line each).
 */
export function selectDeepAndShallowCategories(
  inputs: Record<string, string | null>,
  targetStageIndex: StartupStageIndex,
  opts: FilterTaskFrameworkOptions = {}
): FilterTaskFrameworkResult {
  const deepCount = Math.min(
    TASK_CATEGORY_IDS.length,
    Math.max(3, opts.deepCount ?? 5)
  );

  const scores = {} as Record<TaskCategoryId, number>;
  for (const id of TASK_CATEGORY_IDS) {
    const cat = categoryById(id);
    const base = cat ? weightForStage(cat, targetStageIndex) : 0;
    scores[id] = base + heuristicBoost(id, inputs, targetStageIndex);
  }

  const sorted = [...TASK_CATEGORY_IDS].sort((a, b) => {
    const d = scores[b] - scores[a];
    if (d !== 0) return d;
    return a.localeCompare(b);
  });

  const deep = sorted.slice(0, deepCount) as TaskCategoryId[];
  const shallow = sorted.slice(deepCount) as TaskCategoryId[];

  return { deep, shallow, scores };
}

function formatDeepCategory(id: TaskCategoryId): string {
  const cat = categoryById(id);
  if (!cat) return `- ${id}: (unknown category)`;
  const activities = cat.activities.map((a) => `    • ${a}`).join("\n");
  const success = cat.successCriteria.map((s) => `    • ${s}`).join("\n");
  return [
    `### ${cat.label} (id: ${id})`,
    cat.summary,
    `Activities:\n${activities}`,
    `Success criteria:\n${success}`,
  ].join("\n\n");
}

function formatShallowLine(id: TaskCategoryId): string {
  const cat = categoryById(id);
  if (!cat) return `- ${id}`;
  return `- **${cat.label}** (${id}): ${cat.summary}`;
}

/**
 * Renders hybrid framework text for the system prompt.
 */
export function formatFrameworkForPrompt(deep: TaskCategoryId[], shallow: TaskCategoryId[]): string {
  const deepBlock =
    deep.length === 0
      ? "(none)"
      : deep.map((id) => formatDeepCategory(id)).join("\n\n---\n\n");

  const shallowBlock =
    shallow.length === 0
      ? "(none — all categories expanded above)"
      : shallow.map((id) => formatShallowLine(id)).join("\n");

  return [
    "## Full detail (prioritize tasks using these categories when relevant)",
    deepBlock,
    "",
    "## Compact reference (other categories — still allow tasks in later stages; use one line per category)",
    shallowBlock,
  ].join("\n");
}
