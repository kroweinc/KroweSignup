/**
 * String utilities
 * 
 * Functions for string manipulation and normalization.
 */

/**
 * Normalize answer text by collapsing whitespace and trimming
 * Silent cleanup - don't mention to user you did it
 */
export function normalizeAnswer(input: string): string {
  return (input ?? "")
    .replace(/\s+/g, " ")
    .trim();
}
