/**
 * Report generation types
 */

import type { Competitor } from "../report/findCompetitors";
import type { MvpCostEstimate } from "../report/estimateMvpCost";
import type { MarketSizeLLM } from "../report/marketsize";
import { StepKey } from "../signupSteps";

/**
 * Payload structure from signup_responses table
 */
export type SignupPayload = Record<string, { final?: string } | any>;

/**
 * Report data structure
 */
export type ReportData = {
  inputsSnapshot: any;
  flags: string[];
  timeToMvp: any;
  competitors?: Competitor[];
  costEstimate?: MvpCostEstimate | null;
  competitorError?: string;
  mvpCostEstimate?: MvpCostEstimate | null;
  mvpCostEstimateError?: string;
  marketSize?: MarketSizeLLM | null;
  competitorDebug?: {
    got?: number;
    error?: string;
    idea?: string | null;
    industry?: string | null;
    targetCustomer?: string | null;
    rawText?: string;
  };
};
