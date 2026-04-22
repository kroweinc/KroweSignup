import { describe, expect, it } from "vitest";
import { filterAndSortPaletteRows, paletteGroupOrder, scorePaletteMatch, type PaletteRow } from "./platformSearchFilter";

const sample: PaletteRow[] = [
  {
    id: "nav:logs",
    group: "platform",
    label: "Logs",
    href: "/interviews/logs",
    icon: "inventory_2",
    keywords: ["history"],
  },
  {
    id: "nav:overview",
    group: "platform",
    label: "Overview",
    href: "/interviews",
    icon: "dashboard",
    keywords: ["home"],
  },
  {
    id: "nav:workspace-script",
    group: "workspace",
    label: "Interview Script",
    href: "/interviews/p1/script",
    icon: "description",
  },
  {
    id: "project:x",
    group: "projects",
    label: "Acme Co",
    subtitle: "ready",
    href: "/interviews/p1",
    icon: "workspaces",
    keywords: ["acme"],
  },
];

describe("paletteGroupOrder", () => {
  it("orders platform before workspace before projects", () => {
    expect(paletteGroupOrder("platform")).toBeLessThan(paletteGroupOrder("workspace"));
    expect(paletteGroupOrder("workspace")).toBeLessThan(paletteGroupOrder("projects"));
  });
});

describe("scorePaletteMatch", () => {
  it("returns 0 when query is non-empty and nothing matches", () => {
    expect(scorePaletteMatch("zzz", { label: "Logs", href: "/x", keywords: [] })).toBe(0);
  });

  it("boosts label prefix matches", () => {
    const logs = scorePaletteMatch("log", { label: "Logs", href: "/interviews/logs", keywords: [] });
    const weak = scorePaletteMatch("log", { label: "Feedback", href: "/interviews/feedback", keywords: [] });
    expect(logs).toBeGreaterThan(weak);
  });
});

describe("filterAndSortPaletteRows", () => {
  it("returns all rows sorted by group then label when query is empty", () => {
    const out = filterAndSortPaletteRows("", sample, 50);
    expect(out.map((r) => r.id)).toEqual([
      "nav:logs",
      "nav:overview",
      "nav:workspace-script",
      "project:x",
    ]);
  });

  it("filters by query and respects max", () => {
    const many: PaletteRow[] = Array.from({ length: 60 }, (_, i) => ({
      id: `project:${i}`,
      group: "projects" as const,
      label: `Project ${i}`,
      href: `/interviews/p${i}`,
      icon: "workspaces",
    }));
    const out = filterAndSortPaletteRows("Project", many, 50);
    expect(out.length).toBe(50);
  });
});
