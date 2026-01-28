/**
 * Validation types
 */

/**
 * A validation issue/error
 */
export type ValidationIssue = {
  code: string;
  message: string;
  severity?: "error" | "warning";
};

/**
 * Result of validation
 */
export type ValidationResult = {
  status: "ok" | "needs_fix";
  issues: ValidationIssue[];
};
