/**
 * Time to MVP Section
 */

type TimeToMvpParams = {
  label: string;
  rationale: string;
};

export function buildTimeToMvpSection(params: TimeToMvpParams): string {
  const { label, rationale } = params;

  return [
    `## ⏱ Time to MVP`,
    `- **Estimate:** ${label}`,
    `- **Rationale:** ${rationale}`,
    ``,
  ].join("\n");
}
