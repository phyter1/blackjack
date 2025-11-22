import type { HiLoCounter } from "../hi-lo-counter";
import type { CountFeedback, TrainerDifficulty } from "./types";

/**
 * Submit a count guess and get feedback
 */
export function submitCountGuess(
  counter: HiLoCounter,
  difficulty: TrainerDifficulty,
  playerRunningCount: number,
  playerTrueCount?: number,
): CountFeedback {
  const actual = counter.getSnapshot();
  const guess = counter.recordGuess(playerRunningCount, playerTrueCount);

  const runningCountDiff = Math.abs(playerRunningCount - actual.runningCount);
  const trueCountDiff =
    playerTrueCount !== undefined
      ? Math.abs(playerTrueCount - actual.trueCount)
      : undefined;

  let wasCorrect: boolean;
  let message: string;
  let severity: "success" | "warning" | "error";

  if (difficulty === "true_count") {
    // Both must be correct
    wasCorrect = guess.isRunningCountCorrect && guess.isTrueCountCorrect;
    if (wasCorrect) {
      message = "Perfect! Both running count and true count are correct!";
      severity = "success";
    } else if (guess.isRunningCountCorrect) {
      message = `Running count correct, but true count is off by ${trueCountDiff}. Actual true count: ${actual.trueCount}`;
      severity = "warning";
    } else if (guess.isTrueCountCorrect) {
      message = `True count correct, but running count is off by ${runningCountDiff}. Actual running count: ${actual.runningCount}`;
      severity = "warning";
    } else {
      message = `Both counts incorrect. Running count: ${actual.runningCount} (off by ${runningCountDiff}), True count: ${actual.trueCount} (off by ${trueCountDiff})`;
      severity = "error";
    }
  } else {
    // Only running count matters
    wasCorrect = guess.isRunningCountCorrect;
    if (wasCorrect) {
      message = "Correct! Running count is accurate!";
      severity = "success";
    } else {
      message = `Off by ${runningCountDiff}. Actual running count: ${actual.runningCount}`;
      severity = runningCountDiff <= 1 ? "warning" : "error";
    }
  }

  return {
    wasCorrect,
    playerRunningCount,
    actualRunningCount: actual.runningCount,
    runningCountDiff,
    playerTrueCount,
    actualTrueCount: actual.trueCount,
    trueCountDiff,
    message,
    severity,
  };
}
