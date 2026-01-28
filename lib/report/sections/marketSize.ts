/**
 * Market Size Section
 */

import type { MarketSizeLLM } from "../marketsize";
import { fmtUSD } from "../../utils/formatting";

type MarketSizeParams = {
  marketSize: MarketSizeLLM | null;
};

export function buildMarketSizeSection(params: MarketSizeParams): string {
  const { marketSize } = params;

  if (!marketSize) {
    return "";
  }

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return [
    `## 🌍 Market Size`,
    `- **Definition:** ${marketSize.market_definition}`,
    `- **TAM (Total Addressable):** ${fmt(marketSize.tam_usd_range.low)} - ${fmt(marketSize.tam_usd_range.high)} / year`,
    `- **SAM (Serviceable):** ${fmt(marketSize.sam_usd_range.low)} - ${fmt(marketSize.sam_usd_range.high)} / year`,
    `- **Wedge:** ${fmt(marketSize.wedge_sam_usd_range.low)} - ${fmt(marketSize.wedge_sam_usd_range.high)} / year`,
    `- **Notes:** ${marketSize.notes?.[0] || ""}`,
    ``,
  ].join("\n");
}
