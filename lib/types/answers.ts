/**
 * Answer submission and validation types
 */

import { StepKey } from "../signupSteps";
import { ValidationIssue } from "./validation";

/**
 * Response from submitAnswer API
 */
export type SubmitAnswerResponse = {
  validationStatus: "ok" | "needs_fix";
  nextStepKey: StepKey | null;
  issues: ValidationIssue[];
  failCount: number;
  canContinueWithWarning: boolean;
  aiSuggestion: string | null;
  aiReason: string | null;
};

/**
 * Response from confirmAnswer API
 */
export type ConfirmAnswerResponse = {
  ok: boolean;
  nextStepKey: StepKey | null;
};

/**
 * Final answer source types
 */
export type FinalAnswerSource = "original" | "ai_suggested" | "user_edited" | "override";

/**
 * Product type options
 */
export type ProductType = 'mobile' | 'web' | 'both' | 'other' | null;
