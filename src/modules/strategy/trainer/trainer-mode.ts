import type { ActionType } from "../../game/action";
import type { Card } from "../../game/cards";
import type { Game } from "../../game/game";
import type { BasicStrategyDecision } from "../basic-strategy";
import { DecisionTracker, type PlayerDecision } from "../decision-tracker";
import { type CountSnapshot, HiLoCounter } from "../hi-lo-counter";
import {
  evaluateAction,
  getOptimalAction,
} from "./action-evaluator";
import { submitCountGuess } from "./count-evaluator";
import { getStats } from "./stats-calculator";
import type {
  ActionFeedback,
  CountFeedback,
  PerformanceData,
  TrainerDifficulty,
  TrainerStats,
} from "./types";

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
    return getOptimalAction(
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
    const feedback = evaluateAction(
      playerCards,
      playerHandValue,
      dealerUpCard,
      canDouble,
      canSplit,
      canSurrender,
      playerAction,
    );

    // Record decision in tracker
    const countSnapshot =
      this.difficulty === "running_count" || this.difficulty === "true_count"
        ? this.counter.getSnapshot()
        : undefined;

    const optimal = getOptimalAction(
      playerCards,
      playerHandValue,
      dealerUpCard,
      canDouble,
      canSplit,
      canSurrender,
    );

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
    const feedback = submitCountGuess(
      this.counter,
      this.difficulty,
      playerRunningCount,
      playerTrueCount,
    );

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
    return getStats(this.decisionTracker, this.counter);
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
  exportPerformanceData(): PerformanceData {
    return {
      stats: this.getStats(),
      decisions: this.decisionTracker.getDecisions(),
      mistakes: this.getMistakes(),
    };
  }
}
