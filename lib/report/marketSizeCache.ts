/**
 * In-memory cache for market size v2 results, keyed by a deterministic key
 * built from industry, geography, target_customer, pricing_model, estimated_price.
 */

const cache = new Map<string, unknown>();

export type MarketSizeCacheKeyInput = {
  industry: string;
  geography: string;
  target_customer: string;
  pricing_model: string;
  estimated_price: number | null;
};

export function buildMarketSizeCacheKey(input: MarketSizeCacheKeyInput): string {
  const payload = {
    industry: input.industry,
    geography: input.geography,
    target_customer: input.target_customer,
    pricing_model: input.pricing_model,
    estimated_price: input.estimated_price,
  };
  return JSON.stringify(payload);
}

export function getMarketSizeCache(key: string): unknown {
  return cache.get(key) ?? null;
}

export function setMarketSizeCache(key: string, value: unknown): void {
  cache.set(key, value);
}
