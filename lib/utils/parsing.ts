/**
 * Parsing utilities
 * 
 * Safe parsing functions that handle errors gracefully.
 */

/**
 * Safely parse JSON string, returning null on error
 */
export function safeJson<T = any>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

/**
 * Safely convert string to number, returning null if invalid
 */
export function safeNumber(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
