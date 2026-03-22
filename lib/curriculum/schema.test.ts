import { describe, it, expect } from "vitest";
import { parseCurriculumPayload } from "./schema";
import golden from "./fixtures/curriculum-v2-golden.json";

describe("parseCurriculumPayload", () => {
  it("accepts golden v2 fixture with task categories", () => {
    const r = parseCurriculumPayload(golden);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.curriculumVersion).toBe("2.0.0");
      expect(r.data.stages).toHaveLength(6);
      expect(r.data.stages[0].tasks[0].category).toBe("problem_research");
    }
  });
});
