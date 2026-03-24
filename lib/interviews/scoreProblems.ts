import type { ExtractedProblemWithEmbedding } from "./types";

export function scoreCluster(cluster: ExtractedProblemWithEmbedding[]): {
  frequency: number;
  avg_intensity: number;
  consistency_score: number;
  score: number;
} {
  const frequency = cluster.length;
  const avg_intensity =
    cluster.reduce((sum, p) => sum + p.intensity_score, 0) / frequency;

  const highConfidenceCount = cluster.filter((p) => p.confidence > 0.6).length;
  let consistency_score = highConfidenceCount / frequency;
  if (frequency < 3) {
    consistency_score *= 0.5;
  }

  const normalized_freq = Math.min(frequency / 10, 1.0);
  const normalized_intensity = avg_intensity / 5;
  const score =
    normalized_freq * 0.4 +
    normalized_intensity * 0.35 +
    consistency_score * 0.25;

  return { frequency, avg_intensity, consistency_score, score };
}
