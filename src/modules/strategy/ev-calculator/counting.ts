/**
 * Calculate player advantage from card counting
 * Based on true count
 */
export function calculateCountAdvantage(averageTrueCount: number): number {
  // Each +1 true count gives approximately 0.5% player advantage
  return averageTrueCount * 0.5;
}

/**
 * Calculate average true count from count snapshots
 */
export function calculateAverageTrueCount(
  decisionsData?: string,
): number | null {
  if (!decisionsData) return null;

  try {
    const decisions = JSON.parse(decisionsData) as Array<{
      countSnapshot?: { trueCount: number };
    }>;

    const trueCounts = decisions
      .map((d) => d.countSnapshot?.trueCount)
      .filter((tc): tc is number => tc !== undefined);

    if (trueCounts.length === 0) return null;

    const sum = trueCounts.reduce((acc, tc) => acc + tc, 0);
    return sum / trueCounts.length;
  } catch {
    return null;
  }
}
