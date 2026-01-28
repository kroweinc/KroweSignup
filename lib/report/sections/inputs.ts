/**
 * Inputs Snapshot Section
 * 
 * Displays the user's input data in the report.
 */

type InputsParams = {
  idea: string | null;
  productType: string | null;
  targetCustomer: string | null;
  industry: string | null;
  age: number | null;
  teamSize: number | null;
  hours: number | null;
  hoursLabel: string | null;
  problem: string | null;
  flags: string[];
};

export function buildInputsSection(params: InputsParams): string {
  const { idea, productType, targetCustomer, industry, age, teamSize, hours, hoursLabel, problem, flags } = params;

  return [
    `## 📌 Inputs Snapshot`,
    `- **Startup Idea:** ${idea ?? "⚠ Missing Data"}`,
    `- **Product Type:** ${productType ?? "⚠ Missing Data"}`,
    `- **Target Customer:** ${targetCustomer ?? "⚠ Missing Data"}`,
    `- **Industry Selected:** ${industry ?? "⚠ Missing Data"}`,
    ``,
    `### Founder Profile`,
    `- **Age:** ${age ?? "⚠ Missing Data"}`,
    `- **Team Size:** ${teamSize ?? "⚠ Missing Data"}`,
    `- **Weekly Commitment:** ${hours ?? "⚠ Missing Data"} hrs/week → **${hoursLabel ?? "⚠ Missing Data"}**`,
    `- **Problem:** ${problem ?? "⚠ Missing Data"}`,
    ``,
    `### ⚠ Flags`,
    ...(flags.length ? flags.map((f) => `- ${f}`) : [`- None`]),
    ``,
  ].join("\n");
}
