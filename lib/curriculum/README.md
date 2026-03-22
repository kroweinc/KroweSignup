# Curriculum generation

## Task framework (`krowe-task-framework.json`)

Structured playbook for **closed task categories**: activities, success criteria, and per-stage **weights** used by `filterTaskFramework.ts` to pick which categories get **full** vs **compact** text in the LLM prompt.

Edit the JSON when product changes; keep category `id` values aligned with `taskCategories.ts` and the Zod `taskCategorySchema`.

## Versioning

Bump `CURRICULUM_JSON_VERSION` in `constants.ts` when the **stored payload shape** changes (e.g. new required fields). The report generator skips regeneration when `signup_curricula.curriculum_version` already matches.

## Filtering

`selectDeepAndShallowCategories` scores each category using:

- Base score from `stageWeights` for the current `targetStageIndex`
- Small deterministic boosts from signup answers (team size, idea length, keyword hints)

`formatFrameworkForPrompt` turns **deep** (top N) and **shallow** (rest) into hybrid prompt text.
