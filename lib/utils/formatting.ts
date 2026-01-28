/**
 * Formatting utilities
 * 
 * Functions for formatting numbers, currency, and other values for display.
 */

/**
 * Format number as USD currency with abbreviations (K, M, B, T)
 */
export function fmtUSD(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${n}`;
}
