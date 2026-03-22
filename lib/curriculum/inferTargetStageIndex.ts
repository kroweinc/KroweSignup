import type { StartupStageIndex } from "./stages";

/**
 * Infer a goal stage (1–6) from signup answers. Tune heuristics without changing prompts.
 * Default bias: Stage 3 (Signal Found) as a typical next milestone after intake.
 */
export function inferTargetStageIndex(
  inputs: Record<string, string | null>
): StartupStageIndex {
  const hours = parseInt(String(inputs.hours ?? "").trim(), 10);
  const team = parseInt(String(inputs.team_size ?? "").trim(), 10);
  const idea = (inputs.idea ?? "").trim();

  let n = 3;
  if (idea.length < 50) n = 2;
  else if (!Number.isFinite(hours) || hours < 6) n = 2;
  else if (Number.isFinite(team) && team >= 6) n = 5;
  else if (Number.isFinite(team) && team >= 3) n = 4;
  else if (Number.isFinite(hours) && hours >= 30) n = 4;

  return Math.min(6, Math.max(1, n)) as StartupStageIndex;
}
