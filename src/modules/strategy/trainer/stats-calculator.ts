import type { DecisionTracker } from "../decision-tracker";
import type { HiLoCounter } from "../hi-lo-counter";
import type { TrainerStats } from "./types";

/**
 * Get comprehensive performance statistics
 */
export function getStats(
  decisionTracker: DecisionTracker,
  counter: HiLoCounter,
): TrainerStats {
  const analysis = decisionTracker.calculateAnalysis();
  const accuracyByType = decisionTracker.getAccuracyByType();
  const decisions = decisionTracker.getDecisions();

  // Recent performance (last 10 decisions)
  const recentDecisions = decisions.slice(-10);
  const recentCorrect = recentDecisions.filter((d) => d.isCorrect).length;
  const recentAccuracy =
    recentDecisions.length > 0
      ? (recentCorrect / recentDecisions.length) * 100
      : 0;

  return {
    // Strategy stats
    totalDecisions: analysis.totalDecisions,
    correctDecisions: analysis.correctDecisions,
    strategyAccuracy: analysis.accuracyPercentage,
    grade: analysis.grade,

    // Counting stats
    totalCountGuesses: counter.getGuesses().length,
    correctRunningCounts: counter
      .getGuesses()
      .filter((g) => g.isRunningCountCorrect).length,
    runningCountAccuracy: counter.getRunningCountAccuracy(),
    correctTrueCounts: counter.getGuesses().filter((g) => g.isTrueCountCorrect)
      .length,
    trueCountAccuracy: counter.getTrueCountAccuracy(),

    // By hand type
    hardHandAccuracy: accuracyByType.hard,
    softHandAccuracy: accuracyByType.soft,
    pairAccuracy: accuracyByType.pair,

    // Recent performance
    recentAccuracy,
  };
}
