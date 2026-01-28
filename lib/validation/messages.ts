/**
 * Validation error messages
 * 
 * Centralized error messages for validation failures.
 * This makes it easy to update messages without touching validation logic.
 */

import { VALIDATION_ERROR_CODES } from "@/lib/constants";

export const VALIDATION_MESSAGES = {
  // Generic messages
  REQUIRED: "Please enter an answer before continuing.",
  
  // Age validation
  AGE_NUMBER: "Age must be a number (in years).",
  AGE_RANGE: (min: number, max: number) => 
    `Please enter a realistic age (${min}–${max}).`,
  
  // Hours validation
  HOURS_NUMBER: "Hours must be a number.",
  HOURS_RANGE: (min: number, max: number) => 
    `Enter weekly hours between ${min} and ${max}.`,
  HOURS_BURNOUT_WARNING: "This weekly commitment may be hard to sustain. Burnout risk is high.",
  
  // Idea validation
  IDEA_FORMAT: 'Use this structure: "[Startup Name] is a [what it is] that [what it does] by [how it works]."',
  IDEA_TOO_SHORT: "Make it more specific (at least ~1 sentence).",
  
  // Problem validation
  PROBLEM_NOT_SOLUTION: 'Rephrase as the customer pain: "Customers struggle to…" / "It\'s hard for customers to…"',
  PROBLEM_TOO_SHORT: "Describe the pain more clearly (1–2 sentences).",
  
  // Target customer validation
  TARGET_CUSTOMER_FORMAT: "Use the target customer structure (include: age range, type of person, currently…, cares about…, looking for…).",
  TARGET_CUSTOMER_TOO_BROAD: '"Everyone" is too broad. Niche down.',
  
  // Product type validation
  PRODUCT_TYPE_CHOICE: "Answer should be: web, mobile, both, or other.",
  
  // Team size validation
  TEAM_SIZE_NUMBER: "Team size must be a number.",
  TEAM_SIZE_RANGE: (min: number, max: number) => 
    `Enter team size between ${min} and ${max} unles its truly over ${max}.`,
} as const;
