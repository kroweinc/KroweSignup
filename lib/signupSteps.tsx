export type StepKey =
  | "idea"
  | "product_type"
  | "features"
  | "problem"
  | "target_customer"
  | "industry"
  | "competitors"
  | "alternatives"
  | "pricing_model"
  | "interview_count"
  | "interview_upload"
  | "startup_stage"

export const SIGNUP_STEPS: StepKey[] = [
  "idea",
  "product_type",
  "features",
  "problem",
  "target_customer",
  "industry",
  "competitors",
  "alternatives",
  "pricing_model",
  "interview_count",
  "interview_upload",
  "startup_stage",
]

/** Short labels for progress header / tooltips (kroweDesign Onboarding-style). */
export const SIGNUP_STEP_LABELS: Record<StepKey, string> = {
  idea: "Business idea",
  product_type: "Product type",
  features: "Features",
  problem: "Problem",
  target_customer: "Target customer",
  industry: "Industry",
  competitors: "Competitors",
  alternatives: "Alternatives",
  pricing_model: "Pricing",
  interview_count: "Interview count",
  interview_upload: "Interview upload",
  startup_stage: "Startup stage",
}

export function getSignupStepNumber(stepKey: StepKey): number {
  const idx = SIGNUP_STEPS.indexOf(stepKey)
  return idx === -1 ? 1 : idx + 1
}

export function getCompletedSignupSteps(current: StepKey): { step: number; name: string }[] {
  const idx = SIGNUP_STEPS.indexOf(current)
  if (idx <= 0) return []
  return SIGNUP_STEPS.slice(0, idx).map((k, i) => ({
    step: i + 1,
    name: SIGNUP_STEP_LABELS[k],
  }))
}

export function isValidStepKey(v: string): v is StepKey {
  return (SIGNUP_STEPS as string[]).includes(v)
}

/** Coerce API/DB step strings to a valid StepKey. */
export function normalizeStepKey(k: string): StepKey {
  if (isValidStepKey(k)) return k;
  return getFirstStepKey();
}

export function getFirstStepKey(): StepKey {
  return SIGNUP_STEPS[0]
}

export function getNextStepKey(current: StepKey): StepKey | null {
  const idx = SIGNUP_STEPS.indexOf(current)
  if (idx === -1) return null
  return SIGNUP_STEPS[idx + 1] ?? null
}

export function getPrevStepKey(current: StepKey): StepKey | null {
  const idx = SIGNUP_STEPS.indexOf(current)
  if (idx <= 0) return null
  return SIGNUP_STEPS[idx - 1] ?? null
}

export function getProgressPercent(current: StepKey): number {
  const idx = SIGNUP_STEPS.indexOf(current)
  if (idx === -1) return 0
  return Math.round(((idx + 1) / SIGNUP_STEPS.length) * 100)
}

export function getNextStepKeyForContext(
  current: StepKey,
  context: { interviewCount?: number }
): StepKey | null {
  if (current === "interview_count") {
    return (context.interviewCount ?? 0) > 0 ? "interview_upload" : "startup_stage";
  }
  return getNextStepKey(current);
}

export function getPrevStepKeyForContext(
  current: StepKey,
  context: { interviewCount?: number }
): StepKey | null {
  if (current === "startup_stage") {
    return (context.interviewCount ?? 0) > 0 ? "interview_upload" : "interview_count";
  }
  return getPrevStepKey(current);
}
