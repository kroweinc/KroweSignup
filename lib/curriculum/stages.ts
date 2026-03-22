/**
 * Canonical six-stage startup journey (roadmap labels + one-line intent for prompts/UI).
 * Curriculum payloads should include one block per stage (see `curriculumPayloadSchema`).
 */

export type StartupStageIndex = 1 | 2 | 3 | 4 | 5 | 6;

export type StartupStageDefinition = {
  stageIndex: StartupStageIndex;
  /** Short display title without the leading "Stage N —" prefix */
  title: string;
  /** One-line intent for UI and LLM context */
  intent: string;
};

export const STARTUP_STAGE_DEFINITIONS: readonly StartupStageDefinition[] = [
  {
    stageIndex: 1,
    title: "The Spark",
    intent: "Sharpen hunch into a problem worth solving",
  },
  {
    stageIndex: 2,
    title: "Proof of Life",
    intent: "Tangible artifact; real humans touching it",
  },
  {
    stageIndex: 3,
    title: "Signal Found",
    intent: "Retention / undeniable pull",
  },
  {
    stageIndex: 4,
    title: "Ignition",
    intent: "First money, hires, processes",
  },
  {
    stageIndex: 5,
    title: "Full Throttle",
    intent: "Scale what works",
  },
  {
    stageIndex: 6,
    title: "Escape Velocity",
    intent: "Compounding growth, brand gravity",
  },
] as const;

export const STARTUP_STAGE_COUNT = STARTUP_STAGE_DEFINITIONS.length;

export function getStageDefinition(
  stageIndex: StartupStageIndex
): StartupStageDefinition {
  const def = STARTUP_STAGE_DEFINITIONS.find((s) => s.stageIndex === stageIndex);
  if (!def) throw new Error(`Invalid stageIndex: ${stageIndex}`);
  return def;
}
