/**
 * Validation rules and patterns
 * 
 * Centralized validation rules, patterns, and requirements.
 * This makes it easy to modify validation rules without touching validation logic.
 */

/**
 * Required phrases for idea validation
 * The idea must contain all of these phrases (with spaces)
 */
export const IDEA_REQUIRED_PHRASES = [
  " is a ",
  " that ",
  " by ",
] as const;

/**
 * Required phrases for target customer validation
 * The target customer description must contain all of these phrases
 */
export const TARGET_CUSTOMER_REQUIRED_PHRASES = [
  "our target customer is",
  "currently",
  "cares about",
  "looking for",
] as const;

/**
 * Phrases that indicate a problem description reads like a solution
 * If these appear without problem indicators, it's likely a solution description
 */
export const PROBLEM_SOLUTION_INDICATORS = [
  "we help",
  "we provide",
  "we build",
] as const;

/**
 * Phrases that indicate a problem description (not a solution)
 * If these appear, it's likely describing a problem
 */
export const PROBLEM_INDICATORS = [
  "struggle",
  "pain",
  "difficult",
] as const;

/**
 * Allowed product type values
 * The product type must contain one of these keywords
 */
export const PRODUCT_TYPE_ALLOWED = [
  "web",
  "mobile",
  "both",
  "other",
] as const;

/**
 * Forbidden words/phrases in target customer
 */
export const TARGET_CUSTOMER_FORBIDDEN = [
  "everyone",
] as const;
