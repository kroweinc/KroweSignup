/**
 * Shared timing for dashboard-style entrances (clip-path headline + staggered blocks).
 * Aligns with kroweDesign animation docs — use with `KROWE_EASE` from `@/lib/motion/kroweEase`.
 */

export function getDashboardPageEntranceTiming(headlineWordCount: number) {
  const clipStart = 0.1;
  const perWordDelay = 0.038;
  const clipDuration = 0.24;
  const headlineEnd = clipStart + (headlineWordCount - 1) * perWordDelay + clipDuration;
  const supportingDelay = headlineEnd + 0.04;
  const buttonsDelay = supportingDelay + 0.1;
  const overviewBlockDelay = buttonsDelay + 0.05;
  return { clipStart, perWordDelay, clipDuration, supportingDelay, buttonsDelay, overviewBlockDelay };
}

/** Delay for a section title / list after the overview-style block (matches interviews dashboard pages). */
export function dashboardQueueTitleDelay(overviewBlockDelay: number, metricOrTileCount: number) {
  return overviewBlockDelay + 0.16 + metricOrTileCount * 0.022;
}
