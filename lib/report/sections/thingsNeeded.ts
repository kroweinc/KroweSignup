/**
 * Things You Need Section
 */

type ThingsNeededParams = {
  needs: Array<{ title: string; why: string }>;
  gaps: Array<{
    gap: string;
    impact: string;
    fixes: string[];
  }>;
};

export function buildThingsNeededSection(params: ThingsNeededParams): string {
  const { needs, gaps } = params;

  return [
    `## 🧰 Things You Need`,
    ...needs.map(n => `- **${n.title}** — ${n.why}`),
    ``,
    `## 🧩 Skill Gaps`,
    ...(gaps.length
      ? gaps.flatMap(g => [
        `### ${g.gap}`,
        `- **Impact:** ${g.impact}`,
        `- **Fix options:**`,
        ...g.fixes.map(x => `  - ${x}`),
        ``,
      ])
      : [`- None detected (based on current inputs).`, ``]),
  ].join("\n");
}
