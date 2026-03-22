export { CURRICULUM_JSON_VERSION } from "./constants";

export {
  STARTUP_STAGE_DEFINITIONS,
  STARTUP_STAGE_COUNT,
  getStageDefinition,
  type StartupStageDefinition,
  type StartupStageIndex,
} from "./stages";

export {
  curriculumPayloadSchema,
  curriculumStageBlockSchema,
  curriculumTaskSchema,
  parseCurriculumPayload,
  taskCategorySchema,
} from "./schema";

export {
  TASK_CATEGORY_IDS,
  TASK_CATEGORY_LABELS,
  type TaskCategoryId,
} from "./taskCategories";

export type {
  CurriculumPayloadV1,
  CurriculumStageBlockV1,
  CurriculumTaskV1,
} from "./types";

export {
  generateCurriculumForSession,
  type GenerateCurriculumOptions,
  type GenerateCurriculumResult,
} from "./generateCurriculumForSession";

export { inferTargetStageIndex } from "./inferTargetStageIndex";
