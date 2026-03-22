/**
 * Closed set of task category IDs (matches krowe-task-framework.json and Zod schema).
 * Keep in sync with KrowePlatform/krowe-dashboard/lib/curriculum/taskCategories.ts
 */
export const TASK_CATEGORY_IDS = [
  "team_finding",
  "problem_research",
  "audience_research",
  "competitor_research",
  "build_product",
  "finance_funding",
  "validate_product",
  "market_gtm",
] as const;

export type TaskCategoryId = (typeof TASK_CATEGORY_IDS)[number];

/** Short labels for UI badges */
export const TASK_CATEGORY_LABELS: Record<TaskCategoryId, string> = {
  team_finding: "Team",
  problem_research: "Problem",
  audience_research: "Audience",
  competitor_research: "Competitor",
  build_product: "Build",
  finance_funding: "Finance",
  validate_product: "Validate",
  market_gtm: "Market",
};
