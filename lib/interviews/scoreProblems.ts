import type { ExtractedProblemWithEmbedding, SupportingQuote } from "./types";

export function scoreCluster(
  cluster: ExtractedProblemWithEmbedding[],
  totalInterviews: number,
  totalProblems: number
): {
  frequency: number;
  avg_intensity: number;
  consistency_score: number;
  score: number;
} {
  const frequency = cluster.length;
  const avg_intensity =
    cluster.reduce((sum, p) => sum + p.intensity_score, 0) / frequency;

  const uniqueInterviews = new Set(cluster.map((p) => p.interview_id));
  const consistency_score =
    totalInterviews > 0 ? uniqueInterviews.size / totalInterviews : 0;

  const normalized_freq = totalProblems > 0 ? frequency / totalProblems : 0;
  const normalized_intensity = avg_intensity / 5;
  const score =
    normalized_freq * 0.4 +
    consistency_score * 0.4 +
    normalized_intensity * 0.2;

  return { frequency, avg_intensity, consistency_score, score };
}

export function selectTopQuotes(
  candidates: Array<{
    text: string;
    interview_id: string;
    problem_id: string;
    intensity: number;
  }>,
  topN = 3
): SupportingQuote[] {
  const valid = candidates.filter((c) => c.text && c.text.length > 0);
  const scored = valid.map((c) => ({
    ...c,
    _score: c.intensity * 10 + (c.text.length >= 20 && c.text.length <= 300 ? 1 : 0),
  }));
  scored.sort((a, b) => b._score - a._score);

  const selected: typeof scored = [];
  const deferred: typeof scored = [];
  const seenInterviews = new Set<string>();

  for (const candidate of scored) {
    if (selected.length >= topN) break;
    if (seenInterviews.has(candidate.interview_id)) {
      deferred.push(candidate);
    } else {
      selected.push(candidate);
      seenInterviews.add(candidate.interview_id);
    }
  }

  let di = 0;
  while (selected.length < topN && di < deferred.length) {
    selected.push(deferred[di++]);
  }

  return selected.map(({ text, interview_id, problem_id }) => ({
    text,
    interview_id,
    problem_id,
  }));
}
