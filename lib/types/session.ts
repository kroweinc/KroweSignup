/**
 * Session-related types
 */

import { StepKey } from "../signupSteps";

/**
 * Session state for the signup flow
 */
export type SessionState = {
  sessionId: string | null;
  currentStepKey: StepKey;
  answersByStepKey: Record<string, string>;
  loading: boolean;
  error: string | null;
};
