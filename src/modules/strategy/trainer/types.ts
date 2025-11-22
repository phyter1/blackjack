import type { ActionType } from "../../game/action";
import type { PlayerDecision } from "../decision-tracker";

/**
 * Difficulty levels for trainer mode
 */
export type TrainerDifficulty =
  | "beginner" // Shows hints, basic feedback
  | "running_count" // Practice running count only
  | "true_count" // Practice both running and true count
  | "expert"; // No hints, full challenge

/**
 * Feedback on a player's action
 */
export interface ActionFeedback {
  wasCorrect: boolean;
  playerAction: ActionType;
  optimalAction: ActionType;
  optimalReason: string;
  explanation: string;
  severity: "success" | "warning" | "error";
}

/**
 * Feedback on a count guess
 */
export interface CountFeedback {
  wasCorrect: boolean;
  playerRunningCount: number;
  actualRunningCount: number;
  runningCountDiff: number;
  playerTrueCount?: number;
  actualTrueCount?: number;
  trueCountDiff?: number;
  message: string;
  severity: "success" | "warning" | "error";
}

/**
 * Overall performance statistics
 */
export interface TrainerStats {
  // Strategy stats
  totalDecisions: number;
  correctDecisions: number;
  strategyAccuracy: number;
  grade: string;

  // Counting stats (if applicable)
  totalCountGuesses: number;
  correctRunningCounts: number;
  runningCountAccuracy: number;
  correctTrueCounts: number;
  trueCountAccuracy: number;

  // By hand type
  hardHandAccuracy: number;
  softHandAccuracy: number;
  pairAccuracy: number;

  // Recent performance (last 10 decisions)
  recentAccuracy: number;
}

/**
 * Exported performance data
 */
export interface PerformanceData {
  stats: TrainerStats;
  decisions: PlayerDecision[];
  mistakes: PlayerDecision[];
}
