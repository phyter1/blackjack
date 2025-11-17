import type { Game } from "../game/game";
import type { Round } from "../game/round";
import type { ActionType } from "../game/action";
import type { Card } from "../game/cards";
import { HiLoCounter, type CountSnapshot } from "./hi-lo-counter";
import { DecisionTracker, type PlayerDecision } from "./decision-tracker";
import {
  getBasicStrategyDecision,
  type BasicStrategyDecision,
} from "./basic-strategy";

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
 * Trainer Mode - Practice counting and perfect basic strategy
 *
 * This class wraps the game and provides real-time feedback on:
 * - Whether player actions match basic strategy
 * - Whether card count guesses are correct
 * - Overall performance statistics
 *
 * Practice mode uses virtual balance and doesn't affect real bankroll.
 */
export class TrainerMode {
  private game: Game;
  private counter: HiLoCounter;
  private decisionTracker: DecisionTracker;
  private difficulty: TrainerDifficulty;
  private isActive: boolean = false;
  private practiceBalance: number;
  private initialBalance: number;
  private currentHandFeedback: ActionFeedback | null = null;
  private currentCountFeedback: CountFeedback | null = null;

  constructor(
    game: Game,
    difficulty: TrainerDifficulty = "beginner",
    practiceBalance: number = 10000,
  ) {
    this.game = game;
    this.difficulty = difficulty;
    this.practiceBalance = practiceBalance;
    this.initialBalance = practiceBalance;
    this.counter = new HiLoCounter(6, true); // 6 decks, practice mode
    this.decisionTracker = new DecisionTracker(game.getSessionId());
  }

  /**
   * Activate trainer mode
   */
  activate(): void {
    this.isActive = true;
    this.counter.setPracticeMode(true);
  }

  /**
   * Deactivate trainer mode
   */
  deactivate(): void {
    this.isActive = false;
    this.counter.setPracticeMode(false);
  }

  /**
   * Check if trainer mode is active
   */
  isTrainerActive(): boolean {
    return this.isActive;
  }

  /**
   * Get current difficulty level
   */
  getDifficulty(): TrainerDifficulty {
    return this.difficulty;
  }

  /**
   * Set difficulty level
   */
  setDifficulty(difficulty: TrainerDifficulty): void {
    this.difficulty = difficulty;
  }

  /**
   * Get practice balance (virtual money for training)
   */
  getPracticeBalance(): number {
    return this.practiceBalance;
  }

  /**
   * Adjust practice balance (after wins/losses)
   */
  adjustPracticeBalance(amount: number): void {
    this.practiceBalance += amount;
  }

  /**
   * Reset practice session
   */
  reset(): void {
    this.counter.resetAll();
    this.decisionTracker.clear();
    this.practiceBalance = this.initialBalance;
    this.currentHandFeedback = null;
    this.currentCountFeedback = null;
  }

  /**
   * Process cards dealt (for counting)
   */
  processCardsDealt(cards: Card[]): void {
    if (!this.isActive) return;
    this.counter.addCards(cards);
  }

  /**
   * Get the optimal action for current situation
   */
  getOptimalAction(
    playerCards: Card[],
    playerHandValue: number,
    dealerUpCard: Card,
    canDouble: boolean,
    canSplit: boolean,
    canSurrender: boolean,
  ): BasicStrategyDecision {
    return getBasicStrategyDecision(
      playerCards,
      playerHandValue,
      dealerUpCard,
      canDouble,
      canSplit,
      canSurrender,
    );
  }

  /**
   * Evaluate a player's action against basic strategy
   */
  evaluateAction(
    playerCards: Card[],
    playerHandValue: number,
    dealerUpCard: Card,
    canDouble: boolean,
    canSplit: boolean,
    canSurrender: boolean,
    playerAction: ActionType,
    handId: string,
    roundId: string,
    betAmount: number,
  ): ActionFeedback {
    const optimal = this.getOptimalAction(
      playerCards,
      playerHandValue,
      dealerUpCard,
      canDouble,
      canSplit,
      canSurrender,
    );

    const wasCorrect = playerAction === optimal.action;

    // Record decision in tracker
    const countSnapshot =
      this.difficulty === "running_count" || this.difficulty === "true_count"
        ? this.counter.getSnapshot()
        : undefined;

    this.decisionTracker.recordDecision(
      playerCards,
      playerHandValue,
      dealerUpCard,
      handId,
      roundId,
      canDouble,
      canSplit,
      canSurrender,
      playerAction,
      optimal,
      betAmount,
      countSnapshot,
    );

    let explanation: string;
    let severity: "success" | "warning" | "error";

    if (wasCorrect) {
      explanation = `Correct! ${optimal.reason}`;
      severity = "success";
    } else {
      explanation = `Incorrect. You chose ${playerAction}, but optimal play is ${optimal.action}. ${optimal.reason}`;
      severity = "error";
    }

    const feedback: ActionFeedback = {
      wasCorrect,
      playerAction,
      optimalAction: optimal.action,
      optimalReason: optimal.reason,
      explanation,
      severity,
    };

    this.currentHandFeedback = feedback;
    return feedback;
  }

  /**
   * Submit a count guess and get feedback
   */
  submitCountGuess(
    playerRunningCount: number,
    playerTrueCount?: number,
  ): CountFeedback {
    const actual = this.counter.getSnapshot();
    const guess = this.counter.recordGuess(playerRunningCount, playerTrueCount);

    const runningCountDiff = Math.abs(
      playerRunningCount - actual.runningCount,
    );
    const trueCountDiff =
      playerTrueCount !== undefined
        ? Math.abs(playerTrueCount - actual.trueCount)
        : undefined;

    let wasCorrect: boolean;
    let message: string;
    let severity: "success" | "warning" | "error";

    if (this.difficulty === "true_count") {
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

    const feedback: CountFeedback = {
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

    this.currentCountFeedback = feedback;
    return feedback;
  }

  /**
   * Get current action feedback (most recent)
   */
  getCurrentActionFeedback(): ActionFeedback | null {
    return this.currentHandFeedback;
  }

  /**
   * Get current count feedback (most recent)
   */
  getCurrentCountFeedback(): CountFeedback | null {
    return this.currentCountFeedback;
  }

  /**
   * Clear current feedback (e.g., when starting new hand)
   */
  clearCurrentFeedback(): void {
    this.currentHandFeedback = null;
    this.currentCountFeedback = null;
  }

  /**
   * Get comprehensive performance statistics
   */
  getStats(): TrainerStats {
    const analysis = this.decisionTracker.calculateAnalysis();
    const accuracyByType = this.decisionTracker.getAccuracyByType();
    const decisions = this.decisionTracker.getDecisions();

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
      totalCountGuesses: this.counter.getGuesses().length,
      correctRunningCounts: this.counter.getGuesses().filter((g) => g.isRunningCountCorrect).length,
      runningCountAccuracy: this.counter.getRunningCountAccuracy(),
      correctTrueCounts: this.counter.getGuesses().filter((g) => g.isTrueCountCorrect).length,
      trueCountAccuracy: this.counter.getTrueCountAccuracy(),

      // By hand type
      hardHandAccuracy: accuracyByType.hard,
      softHandAccuracy: accuracyByType.soft,
      pairAccuracy: accuracyByType.pair,

      // Recent performance
      recentAccuracy,
    };
  }

  /**
   * Get common mistakes for review
   */
  getMistakes(): PlayerDecision[] {
    return this.decisionTracker.getMistakes();
  }

  /**
   * Get current count snapshot (for display)
   */
  getCountSnapshot(): CountSnapshot {
    return this.counter.getSnapshot();
  }

  /**
   * Should show hints based on difficulty
   */
  shouldShowHints(): boolean {
    return this.difficulty === "beginner";
  }

  /**
   * Should track counting based on difficulty
   */
  shouldTrackCounting(): boolean {
    return (
      this.difficulty === "running_count" ||
      this.difficulty === "true_count" ||
      this.difficulty === "expert"
    );
  }

  /**
   * Reset counter for new shoe
   */
  resetCountForNewShoe(): void {
    this.counter.reset();
  }

  /**
   * Update hand outcome (called after settlement)
   */
  updateHandOutcome(
    handId: string,
    outcome: string,
    payout: number,
    profit: number,
  ): void {
    this.decisionTracker.updateHandOutcome(
      handId,
      outcome as any,
      payout,
      profit,
    );

    // Adjust practice balance
    this.adjustPracticeBalance(profit);
  }

  /**
   * Export performance data for analysis
   */
  exportPerformanceData(): {
    stats: TrainerStats;
    decisions: PlayerDecision[];
    mistakes: PlayerDecision[];
  } {
    return {
      stats: this.getStats(),
      decisions: this.decisionTracker.getDecisions(),
      mistakes: this.getMistakes(),
    };
  }
}
