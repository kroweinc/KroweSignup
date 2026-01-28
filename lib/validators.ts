import { StepKey } from "@/lib/signupSteps";
import { VALIDATION_THRESHOLDS, VALIDATION_ERROR_CODES } from "@/lib/constants";
import { VALIDATION_MESSAGES } from "./validation/messages";
import {
  IDEA_REQUIRED_PHRASES,
  TARGET_CUSTOMER_REQUIRED_PHRASES,
  PROBLEM_SOLUTION_INDICATORS,
  PROBLEM_INDICATORS,
  PRODUCT_TYPE_ALLOWED,
  TARGET_CUSTOMER_FORBIDDEN,
} from "./validation/rules";
import { normalizeAnswer } from "@/lib/utils/strings";
import type { ValidationIssue, ValidationResult } from "@/lib/types/validation";

// Re-export types for backward compatibility
export type { ValidationIssue, ValidationResult };

function needsFix(code: string, message: string): ValidationResult {
  return { status: "needs_fix", issues: [{ code, message, severity: "error" }] };
}

export function validateStep(stepKey: StepKey, raw: string): ValidationResult {
  const v = normalizeAnswer(raw);

  // basic required
  if (!v) return needsFix(VALIDATION_ERROR_CODES.REQUIRED, VALIDATION_MESSAGES.REQUIRED);

  switch (stepKey) {
    case "age": {
      const n = Number(v);
      if (!Number.isFinite(n)) return needsFix(VALIDATION_ERROR_CODES.NUMBER, VALIDATION_MESSAGES.AGE_NUMBER);
      if (n < VALIDATION_THRESHOLDS.AGE.MIN || n > VALIDATION_THRESHOLDS.AGE.MAX) {
        return needsFix(
          VALIDATION_ERROR_CODES.RANGE,
          VALIDATION_MESSAGES.AGE_RANGE(VALIDATION_THRESHOLDS.AGE.MIN, VALIDATION_THRESHOLDS.AGE.MAX)
        );
      }
      return { status: "ok", issues: [] };
    }

    case "hours": {
      const n = Number(v);
      if (!Number.isFinite(n)) return needsFix(VALIDATION_ERROR_CODES.NUMBER, VALIDATION_MESSAGES.HOURS_NUMBER);
      if (n < VALIDATION_THRESHOLDS.HOURS.MIN || n > VALIDATION_THRESHOLDS.HOURS.MAX) {
        return needsFix(
          VALIDATION_ERROR_CODES.RANGE,
          VALIDATION_MESSAGES.HOURS_RANGE(VALIDATION_THRESHOLDS.HOURS.MIN, VALIDATION_THRESHOLDS.HOURS.MAX)
        );
      }
      // Spec says warn for unrealistic, but allow continue :contentReference[oaicite:6]{index=6}
      if (n >= VALIDATION_THRESHOLDS.HOURS.BURNOUT_RISK_THRESHOLD) {
        return {
          status: "ok",
          issues: [
            {
              code: VALIDATION_ERROR_CODES.BURNOUT_RISK,
              message: VALIDATION_MESSAGES.HOURS_BURNOUT_WARNING,
              severity: "warning",
            },
          ],
        };
      }
      return { status: "ok", issues: [] };
    }

    case "idea": {
      // Must contain required phrases :contentReference[oaicite:7]{index=7}
      const lower = v.toLowerCase();
      const hasAllPhrases = IDEA_REQUIRED_PHRASES.every(phrase => lower.includes(phrase));
      if (!hasAllPhrases) {
        return needsFix(
          VALIDATION_ERROR_CODES.FORMAT,
          VALIDATION_MESSAGES.IDEA_FORMAT
        );
      }
      if (v.length < VALIDATION_THRESHOLDS.TEXT_LENGTH.IDEA_MIN) {
        return needsFix(VALIDATION_ERROR_CODES.TOO_SHORT, VALIDATION_MESSAGES.IDEA_TOO_SHORT);
      }
      return { status: "ok", issues: [] };
    }

    case "problem": {
      // Heuristic: if it reads like a solution, ask to rephrase as a problem :contentReference[oaicite:8]{index=8}
      const lower = v.toLowerCase();
      const hasSolutionIndicators = PROBLEM_SOLUTION_INDICATORS.some(phrase => lower.includes(phrase));
      const hasProblemIndicators = PROBLEM_INDICATORS.some(phrase => lower.includes(phrase));
      const looksLikeSolution = hasSolutionIndicators && !hasProblemIndicators;
      if (looksLikeSolution) {
        return needsFix(
          VALIDATION_ERROR_CODES.PROBLEM_NOT_SOLUTION,
          VALIDATION_MESSAGES.PROBLEM_NOT_SOLUTION
        );
      }
      if (v.length < VALIDATION_THRESHOLDS.TEXT_LENGTH.PROBLEM_MIN) {
        return needsFix(VALIDATION_ERROR_CODES.TOO_SHORT, VALIDATION_MESSAGES.PROBLEM_TOO_SHORT);
      }
      return { status: "ok", issues: [] };
    }

    case "target_customer": {
      // Must include key phrases from your required format :contentReference[oaicite:9]{index=9}
      const lower = v.toLowerCase();
      const missing = TARGET_CUSTOMER_REQUIRED_PHRASES.filter((p) => !lower.includes(p));
      if (missing.length) {
        return needsFix(
          VALIDATION_ERROR_CODES.FORMAT,
          VALIDATION_MESSAGES.TARGET_CUSTOMER_FORMAT
        );
      }
      if (TARGET_CUSTOMER_FORBIDDEN.some(word => lower.includes(word))) {
        return needsFix(VALIDATION_ERROR_CODES.TOO_BROAD, VALIDATION_MESSAGES.TARGET_CUSTOMER_TOO_BROAD);
      }
      return { status: "ok", issues: [] };
    }

    case "product_type": {
      const lower = v.toLowerCase();
      const ok = PRODUCT_TYPE_ALLOWED.some(type => lower.includes(type));
      if (!ok) return needsFix(VALIDATION_ERROR_CODES.CHOICE, VALIDATION_MESSAGES.PRODUCT_TYPE_CHOICE);
      return { status: "ok", issues: [] };
    }

    case "team_size": {
      const n = Number(v);
      if (!Number.isFinite(n)) return needsFix(VALIDATION_ERROR_CODES.NUMBER, VALIDATION_MESSAGES.TEAM_SIZE_NUMBER);
      if (n < VALIDATION_THRESHOLDS.TEAM_SIZE.MIN || n > VALIDATION_THRESHOLDS.TEAM_SIZE.MAX) {
        return needsFix(
          VALIDATION_ERROR_CODES.RANGE,
          VALIDATION_MESSAGES.TEAM_SIZE_RANGE(VALIDATION_THRESHOLDS.TEAM_SIZE.MIN, VALIDATION_THRESHOLDS.TEAM_SIZE.MAX)
        );
      }
      return { status: "ok", issues: [] };
    }

    // For now: light validation (we'll tighten later)
    case "industry":
    case "industry_experience":
    case "skills":
    default:
      return { status: "ok", issues: [] };
  }
}
