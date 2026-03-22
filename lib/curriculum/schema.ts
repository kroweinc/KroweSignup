import { z } from "zod";
import { STARTUP_STAGE_COUNT } from "./stages";
import { TASK_CATEGORY_IDS } from "./taskCategories";

const [c0, c1, c2, c3, c4, c5, c6, c7] = TASK_CATEGORY_IDS;
export const taskCategorySchema = z.enum([c0, c1, c2, c3, c4, c5, c6, c7]);

export const curriculumTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  /** Closed-set category from krowe-task-framework (filtering + UI). */
  category: taskCategorySchema,
  order: z.number().int().optional(),
  estimatedHours: z.number().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
});

export const curriculumStageBlockSchema = z.object({
  stageIndex: z.number().int().min(1).max(6),
  title: z.string().min(1),
  summary: z.string(),
  tasks: z.array(curriculumTaskSchema),
});

/**
 * Full curriculum document (v2 adds required task `category`) stored in `signup_curricula.payload` when `status = ready`.
 */
export const curriculumPayloadSchema = z
  .object({
    curriculumVersion: z.string().min(1),
    sessionId: z.string().uuid(),
    targetStageIndex: z.number().int().min(1).max(6).optional(),
    /** ISO-8601 timestamp string */
    generatedAt: z.string().min(1),
    stages: z.array(curriculumStageBlockSchema),
  })
  .superRefine((val, ctx) => {
    if (val.stages.length !== STARTUP_STAGE_COUNT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `stages must have exactly ${STARTUP_STAGE_COUNT} entries`,
        path: ["stages"],
      });
      return;
    }
    const sorted = [...val.stages].sort((a, b) => a.stageIndex - b.stageIndex);
    for (let i = 0; i < STARTUP_STAGE_COUNT; i++) {
      const expected = i + 1;
      if (sorted[i].stageIndex !== expected) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `stages[${i}] must have stageIndex ${expected}`,
          path: ["stages", i, "stageIndex"],
        });
      }
    }
  });

export type CurriculumTaskV1 = z.infer<typeof curriculumTaskSchema>;
export type CurriculumStageBlockV1 = z.infer<typeof curriculumStageBlockSchema>;
export type CurriculumPayloadV1 = z.infer<typeof curriculumPayloadSchema>;

export function parseCurriculumPayload(data: unknown) {
  return curriculumPayloadSchema.safeParse(data);
}
