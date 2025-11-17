import type { Card } from "../game/cards";

/**
 * Hi-Lo card counting value
 */
export function getHiLoValue(card: Card): number {
  const rank = card.rank;

  // Low cards (2-6): +1
  if (["2", "3", "4", "5", "6"].includes(rank)) {
    return 1;
  }

  // Neutral cards (7-9): 0
  if (["7", "8", "9"].includes(rank)) {
    return 0;
  }

  // High cards (10, J, Q, K, A): -1
  return -1;
}

/**
 * Count snapshot at a specific point in time
 */
export interface CountSnapshot {
  runningCount: number;
  trueCount: number;
  cardsRemaining: number;
  decksRemaining: number;
  timestamp: string;
}

/**
 * Player's count guess for practice mode
 */
export interface CountGuess {
  playerRunningCount: number;
  playerTrueCount?: number;
  actualRunningCount: number;
  actualTrueCount: number;
  isRunningCountCorrect: boolean;
  isTrueCountCorrect: boolean;
  timestamp: string;
}

/**
 * Counting proficiency level
 */
export type CountingProficiency = "beginner" | "running_count" | "true_count";

/**
 * Hi-Lo Card Counter
 * Tracks running count, true count, and player accuracy
 */
export class HiLoCounter {
  private runningCount: number = 0;
  private totalDecks: number;
  private cardsDealt: number = 0;
  private guesses: CountGuess[] = [];
  private isPracticeMode: boolean;

  constructor(totalDecks: number = 6, practiceMode: boolean = false) {
    this.totalDecks = totalDecks;
    this.isPracticeMode = practiceMode;
  }

  /**
   * Update count when a card is dealt
   */
  addCard(card: Card): void {
    const value = getHiLoValue(card);
    this.runningCount += value;
    this.cardsDealt++;
  }

  /**
   * Add multiple cards at once
   */
  addCards(cards: Card[]): void {
    for (const card of cards) {
      this.addCard(card);
    }
  }

  /**
   * Get current running count
   */
  getRunningCount(): number {
    return this.runningCount;
  }

  /**
   * Calculate true count (running count / decks remaining)
   */
  getTrueCount(): number {
    const decksRemaining = this.getDecksRemaining();
    if (decksRemaining === 0) return 0;
    return Math.round(this.runningCount / decksRemaining);
  }

  /**
   * Get number of cards remaining in shoe
   */
  getCardsRemaining(): number {
    return this.totalDecks * 52 - this.cardsDealt;
  }

  /**
   * Get number of decks remaining
   */
  getDecksRemaining(): number {
    return Math.max(0.5, this.getCardsRemaining() / 52); // Minimum 0.5 decks
  }

  /**
   * Get current count snapshot
   */
  getSnapshot(): CountSnapshot {
    return {
      runningCount: this.getRunningCount(),
      trueCount: this.getTrueCount(),
      cardsRemaining: this.getCardsRemaining(),
      decksRemaining: this.getDecksRemaining(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Record a player's count guess (for practice mode)
   */
  recordGuess(
    playerRunningCount: number,
    playerTrueCount?: number,
  ): CountGuess {
    const actual = this.getSnapshot();

    const guess: CountGuess = {
      playerRunningCount,
      playerTrueCount,
      actualRunningCount: actual.runningCount,
      actualTrueCount: actual.trueCount,
      isRunningCountCorrect: playerRunningCount === actual.runningCount,
      isTrueCountCorrect:
        playerTrueCount !== undefined
          ? playerTrueCount === actual.trueCount
          : true, // Not checking true count if not provided
      timestamp: new Date().toISOString(),
    };

    this.guesses.push(guess);
    return guess;
  }

  /**
   * Get all recorded guesses
   */
  getGuesses(): CountGuess[] {
    return [...this.guesses];
  }

  /**
   * Calculate running count accuracy
   */
  getRunningCountAccuracy(): number {
    if (this.guesses.length === 0) return 0;
    const correct = this.guesses.filter((g) => g.isRunningCountCorrect).length;
    return (correct / this.guesses.length) * 100;
  }

  /**
   * Calculate true count accuracy
   */
  getTrueCountAccuracy(): number {
    const trueCountGuesses = this.guesses.filter(
      (g) => g.playerTrueCount !== undefined,
    );
    if (trueCountGuesses.length === 0) return 0;
    const correct = trueCountGuesses.filter((g) => g.isTrueCountCorrect).length;
    return (correct / trueCountGuesses.length) * 100;
  }

  /**
   * Get overall counting accuracy
   */
  getOverallAccuracy(): number {
    if (this.guesses.length === 0) return 0;

    let totalChecks = 0;
    let correctChecks = 0;

    for (const guess of this.guesses) {
      totalChecks++;
      if (guess.isRunningCountCorrect) correctChecks++;

      if (guess.playerTrueCount !== undefined) {
        totalChecks++;
        if (guess.isTrueCountCorrect) correctChecks++;
      }
    }

    return (correctChecks / totalChecks) * 100;
  }

  /**
   * Determine if player has achieved proficiency level
   */
  hasAchievedProficiency(
    level: CountingProficiency,
    minGuesses: number = 20,
  ): boolean {
    if (this.guesses.length < minGuesses) return false;

    switch (level) {
      case "beginner":
        return true;
      case "running_count":
        return this.getRunningCountAccuracy() >= 85;
      case "true_count":
        return (
          this.getRunningCountAccuracy() >= 90 &&
          this.getTrueCountAccuracy() >= 85
        );
      default:
        return false;
    }
  }

  /**
   * Reset the counter for a new shoe
   */
  reset(): void {
    this.runningCount = 0;
    this.cardsDealt = 0;
    // Keep guesses for accuracy tracking across shoes
  }

  /**
   * Reset everything including guess history
   */
  resetAll(): void {
    this.reset();
    this.guesses = [];
  }

  /**
   * Check if practice mode is enabled
   */
  isPracticing(): boolean {
    return this.isPracticeMode;
  }

  /**
   * Enable/disable practice mode
   */
  setPracticeMode(enabled: boolean): void {
    this.isPracticeMode = enabled;
  }
}

/**
 * Get recommendation based on true count
 */
export function getCountRecommendation(trueCount: number): {
  advantage: "player" | "dealer" | "neutral";
  suggestion: string;
  shouldIncreaseBet: boolean;
} {
  if (trueCount >= 3) {
    return {
      advantage: "player",
      suggestion: "High count! Consider increasing your bet 3-5x",
      shouldIncreaseBet: true,
    };
  } else if (trueCount >= 2) {
    return {
      advantage: "player",
      suggestion: "Favorable count. Consider increasing your bet 2-3x",
      shouldIncreaseBet: true,
    };
  } else if (trueCount >= 1) {
    return {
      advantage: "player",
      suggestion: "Slightly favorable. Consider increasing your bet",
      shouldIncreaseBet: true,
    };
  } else if (trueCount <= -2) {
    return {
      advantage: "dealer",
      suggestion: "Unfavorable count. Consider betting minimum or sitting out",
      shouldIncreaseBet: false,
    };
  } else if (trueCount <= -1) {
    return {
      advantage: "dealer",
      suggestion: "Slightly unfavorable. Keep bet at minimum",
      shouldIncreaseBet: false,
    };
  } else {
    return {
      advantage: "neutral",
      suggestion: "Neutral count. Standard bet sizing",
      shouldIncreaseBet: false,
    };
  }
}
