import { describe, it, expect } from "vitest";
import { selectDeepAndShallowCategories } from "./filterTaskFramework";
import { TASK_CATEGORY_IDS } from "./taskCategories";

describe("selectDeepAndShallowCategories", () => {
  it("partitions all category ids into deep and shallow", () => {
    const r = selectDeepAndShallowCategories(
      { idea: "A repeatable testing idea for curriculum.", team_size: "2", hours: "12" },
      3
    );
    const merged = [...r.deep, ...r.shallow].sort();
    expect(merged).toEqual([...TASK_CATEGORY_IDS].sort());
  });

  it("is deterministic for the same inputs", () => {
    const inputs = { idea: "ab", team_size: "1", hours: "8" };
    const a = selectDeepAndShallowCategories(inputs, 2);
    const b = selectDeepAndShallowCategories(inputs, 2);
    expect(a.deep).toEqual(b.deep);
    expect(a.shallow).toEqual(b.shallow);
  });

  it("includes team_finding in deep when solo team", () => {
    const r = selectDeepAndShallowCategories(
      { idea: "Something new we are exploring in fintech.", team_size: "1" },
      2
    );
    expect(r.deep).toContain("team_finding");
  });

  it("respects custom deepCount", () => {
    const r = selectDeepAndShallowCategories({ idea: "x".repeat(100), team_size: "5" }, 4, {
      deepCount: 3,
    });
    expect(r.deep).toHaveLength(3);
    expect(r.shallow).toHaveLength(TASK_CATEGORY_IDS.length - 3);
  });
});
