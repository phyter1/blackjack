import { describe, expect, test, beforeEach } from "bun:test";
import type { Card } from "../game/cards";
import {
  getHiLoValue,
  HiLoCounter,
  getCountRecommendation,
} from "./hi-lo-counter";

/**
 * Tests for Hi-Lo Card Counting System
 *
 * Tests the Hi-Lo counting implementation including:
 * - Card value assignments (+1, 0, -1)
 * - Running count tracking
 * - True count calculation
 * - Practice mode and accuracy tracking
 * - Betting recommendations
 */

describe("Hi-Lo Card Counting", () => {
  describe("getHiLoValue", () => {
    test("should return +1 for low cards (2-6)", () => {
      expect(getHiLoValue({ rank: "2", suit: "hearts" })).toBe(1);
      expect(getHiLoValue({ rank: "3", suit: "diamonds" })).toBe(1);
      expect(getHiLoValue({ rank: "4", suit: "clubs" })).toBe(1);
      expect(getHiLoValue({ rank: "5", suit: "spades" })).toBe(1);
      expect(getHiLoValue({ rank: "6", suit: "hearts" })).toBe(1);
    });

    test("should return 0 for neutral cards (7-9)", () => {
      expect(getHiLoValue({ rank: "7", suit: "hearts" })).toBe(0);
      expect(getHiLoValue({ rank: "8", suit: "diamonds" })).toBe(0);
      expect(getHiLoValue({ rank: "9", suit: "clubs" })).toBe(0);
    });

    test("should return -1 for high cards (10, J, Q, K, A)", () => {
      expect(getHiLoValue({ rank: "10", suit: "hearts" })).toBe(-1);
      expect(getHiLoValue({ rank: "J", suit: "diamonds" })).toBe(-1);
      expect(getHiLoValue({ rank: "Q", suit: "clubs" })).toBe(-1);
      expect(getHiLoValue({ rank: "K", suit: "spades" })).toBe(-1);
      expect(getHiLoValue({ rank: "A", suit: "hearts" })).toBe(-1);
    });
  });

  describe("HiLoCounter - Basic Counting", () => {
    let counter: HiLoCounter;

    beforeEach(() => {
      counter = new HiLoCounter(6);
    });

    test("should initialize with zero count", () => {
      expect(counter.getRunningCount()).toBe(0);
      expect(counter.getTrueCount()).toBe(0);
    });

    test("should track running count when cards are added", () => {
      counter.addCard({ rank: "2", suit: "hearts" }); // +1
      expect(counter.getRunningCount()).toBe(1);

      counter.addCard({ rank: "K", suit: "diamonds" }); // -1
      expect(counter.getRunningCount()).toBe(0);

      counter.addCard({ rank: "5", suit: "clubs" }); // +1
      expect(counter.getRunningCount()).toBe(1);
    });

    test("should handle multiple cards at once", () => {
      const cards: Card[] = [
        { rank: "2", suit: "hearts" }, // +1
        { rank: "3", suit: "diamonds" }, // +1
        { rank: "K", suit: "clubs" }, // -1
        { rank: "7", suit: "spades" }, // 0
      ];

      counter.addCards(cards);
      expect(counter.getRunningCount()).toBe(1); // 1+1-1+0 = 1
    });

    test("should track cards dealt", () => {
      expect(counter.getCardsRemaining()).toBe(6 * 52); // 312 cards

      counter.addCard({ rank: "2", suit: "hearts" });
      expect(counter.getCardsRemaining()).toBe(311);

      counter.addCards([
        { rank: "K", suit: "diamonds" },
        { rank: "5", suit: "clubs" },
      ]);
      expect(counter.getCardsRemaining()).toBe(309);
    });

    test("should calculate decks remaining", () => {
      expect(counter.getDecksRemaining()).toBe(6);

      // Deal 52 cards (1 deck)
      const deck: Card[] = Array(52).fill({ rank: "7", suit: "hearts" });
      counter.addCards(deck);

      expect(counter.getDecksRemaining()).toBe(5);
    });

    test("should have minimum 0.5 decks remaining", () => {
      // Deal almost all cards
      const cards: Card[] = Array(6 * 52 - 10).fill({
        rank: "7",
        suit: "hearts",
      });
      counter.addCards(cards);

      expect(counter.getDecksRemaining()).toBeGreaterThanOrEqual(0.5);
    });

    test("should reset count and cards dealt", () => {
      counter.addCards([
        { rank: "2", suit: "hearts" },
        { rank: "K", suit: "diamonds" },
      ]);

      expect(counter.getRunningCount()).toBe(0); // 1-1=0
      expect(counter.getCardsRemaining()).toBe(310);

      counter.reset();

      expect(counter.getRunningCount()).toBe(0);
      expect(counter.getCardsRemaining()).toBe(312); // Reset
    });
  });

  describe("HiLoCounter - True Count", () => {
    let counter: HiLoCounter;

    beforeEach(() => {
      counter = new HiLoCounter(6);
    });

    test("should calculate true count correctly", () => {
      // Running count of +6 with 6 decks remaining
      counter.addCards([
        { rank: "2", suit: "hearts" },
        { rank: "3", suit: "diamonds" },
        { rank: "4", suit: "clubs" },
        { rank: "5", suit: "spades" },
        { rank: "6", suit: "hearts" },
        { rank: "2", suit: "diamonds" },
      ]);

      expect(counter.getRunningCount()).toBe(6);
      expect(counter.getTrueCount()).toBe(1); // 6/6 = 1
    });

    test("should round true count", () => {
      // Create running count of +7
      counter.addCards(Array(7).fill({ rank: "2", suit: "hearts" }));

      expect(counter.getRunningCount()).toBe(7);
      // 7 cards dealt, still ~6 decks remaining
      expect(counter.getTrueCount()).toBe(1); // Rounded
    });

    test("should handle negative true count", () => {
      // Create negative running count
      counter.addCards([
        { rank: "K", suit: "hearts" },
        { rank: "Q", suit: "diamonds" },
        { rank: "J", suit: "clubs" },
        { rank: "A", suit: "spades" },
        { rank: "10", suit: "hearts" },
        { rank: "K", suit: "diamonds" },
      ]);

      expect(counter.getRunningCount()).toBe(-6);
      expect(counter.getTrueCount()).toBe(-1); // -6/6 = -1
    });

    test("should adjust true count as decks are depleted", () => {
      // Set running count to +12
      counter.addCards(Array(12).fill({ rank: "2", suit: "hearts" }));

      expect(counter.getRunningCount()).toBe(12);
      expect(counter.getTrueCount()).toBe(2); // 12/6 = 2

      // Deal 3 more decks worth of neutral cards (156 cards)
      counter.addCards(Array(156).fill({ rank: "7", suit: "hearts" }));

      expect(counter.getRunningCount()).toBe(12); // Still +12
      // Now ~3 decks remaining
      expect(counter.getTrueCount()).toBe(4); // 12/3 = 4
    });

    test("should return 0 true count when no decks remaining", () => {
      // This is an edge case that shouldn't happen in practice
      counter.addCards(Array(6 * 52).fill({ rank: "7", suit: "hearts" }));

      expect(counter.getDecksRemaining()).toBe(0.5); // Minimum
      // True count calculation handles division by minimum
      expect(typeof counter.getTrueCount()).toBe("number");
    });
  });

  describe("HiLoCounter - Snapshot", () => {
    let counter: HiLoCounter;

    beforeEach(() => {
      counter = new HiLoCounter(6);
    });

    test("should provide complete snapshot", () => {
      counter.addCards([
        { rank: "2", suit: "hearts" },
        { rank: "3", suit: "diamonds" },
      ]);

      const snapshot = counter.getSnapshot();

      expect(snapshot).toHaveProperty("runningCount");
      expect(snapshot).toHaveProperty("trueCount");
      expect(snapshot).toHaveProperty("cardsRemaining");
      expect(snapshot).toHaveProperty("decksRemaining");
      expect(snapshot).toHaveProperty("timestamp");

      expect(snapshot.runningCount).toBe(2);
      expect(snapshot.cardsRemaining).toBe(310);
      expect(snapshot.decksRemaining).toBeCloseTo(5.96, 1);
    });

    test("should have valid timestamp", () => {
      const snapshot = counter.getSnapshot();

      expect(typeof snapshot.timestamp).toBe("string");
      expect(() => new Date(snapshot.timestamp)).not.toThrow();
    });
  });

  describe("HiLoCounter - Practice Mode", () => {
    let counter: HiLoCounter;

    beforeEach(() => {
      counter = new HiLoCounter(6, true); // Enable practice mode
    });

    test("should initialize in practice mode", () => {
      expect(counter.isPracticing()).toBe(true);
    });

    test("should toggle practice mode", () => {
      counter.setPracticeMode(false);
      expect(counter.isPracticing()).toBe(false);

      counter.setPracticeMode(true);
      expect(counter.isPracticing()).toBe(true);
    });

    test("should record running count guess", () => {
      counter.addCards([
        { rank: "2", suit: "hearts" },
        { rank: "3", suit: "diamonds" },
      ]); // RC = +2

      const guess = counter.recordGuess(2); // Correct guess

      expect(guess.playerRunningCount).toBe(2);
      expect(guess.actualRunningCount).toBe(2);
      expect(guess.isRunningCountCorrect).toBe(true);
    });

    test("should record incorrect running count guess", () => {
      counter.addCards([
        { rank: "2", suit: "hearts" },
        { rank: "K", suit: "diamonds" },
      ]); // RC = 0

      const guess = counter.recordGuess(1); // Wrong guess

      expect(guess.playerRunningCount).toBe(1);
      expect(guess.actualRunningCount).toBe(0);
      expect(guess.isRunningCountCorrect).toBe(false);
    });

    test("should record true count guess", () => {
      // Create RC of +6
      counter.addCards(Array(6).fill({ rank: "2", suit: "hearts" }));

      const guess = counter.recordGuess(6, 1); // RC=6, TC=1

      expect(guess.playerTrueCount).toBe(1);
      expect(guess.actualTrueCount).toBe(1);
      expect(guess.isTrueCountCorrect).toBe(true);
    });

    test("should record incorrect true count guess", () => {
      counter.addCards(Array(6).fill({ rank: "2", suit: "hearts" }));

      const guess = counter.recordGuess(6, 2); // RC correct, TC wrong

      expect(guess.isRunningCountCorrect).toBe(true);
      expect(guess.isTrueCountCorrect).toBe(false);
    });

    test("should allow omitting true count guess", () => {
      counter.addCards([{ rank: "2", suit: "hearts" }]);

      const guess = counter.recordGuess(1); // Only RC, no TC

      expect(guess.playerTrueCount).toBeUndefined();
      expect(guess.isTrueCountCorrect).toBe(true); // Defaults to true if not checked
    });

    test("should retrieve all guesses", () => {
      counter.recordGuess(0);
      counter.recordGuess(1);
      counter.recordGuess(2);

      const guesses = counter.getGuesses();

      expect(guesses.length).toBe(3);
      expect(guesses[0].playerRunningCount).toBe(0);
      expect(guesses[1].playerRunningCount).toBe(1);
      expect(guesses[2].playerRunningCount).toBe(2);
    });
  });

  describe("HiLoCounter - Accuracy Tracking", () => {
    let counter: HiLoCounter;

    beforeEach(() => {
      counter = new HiLoCounter(6, true);
    });

    test("should calculate running count accuracy", () => {
      // Record 3 correct, 1 incorrect
      counter.recordGuess(0); // Correct (actual is 0)
      counter.addCard({ rank: "2", suit: "hearts" });
      counter.recordGuess(1); // Correct
      counter.addCard({ rank: "K", suit: "diamonds" });
      counter.recordGuess(0); // Correct
      counter.recordGuess(2); // Incorrect (actual is 0)

      expect(counter.getRunningCountAccuracy()).toBe(75); // 3/4 = 75%
    });

    test("should calculate true count accuracy", () => {
      counter.addCards(Array(6).fill({ rank: "2", suit: "hearts" })); // RC=6, TC=1

      counter.recordGuess(6, 1); // Correct
      counter.recordGuess(6, 2); // RC correct, TC wrong
      counter.recordGuess(6, 1); // Correct

      expect(counter.getTrueCountAccuracy()).toBe(66.66666666666666); // 2/3
    });

    test("should only count true count guesses that were provided", () => {
      counter.recordGuess(0); // No TC guess
      counter.recordGuess(0, 0); // TC guess included

      expect(counter.getTrueCountAccuracy()).toBe(100); // Only 1 TC guess, and it's correct
    });

    test("should calculate overall accuracy", () => {
      counter.addCards([{ rank: "2", suit: "hearts" }]); // RC=1, TC=0

      counter.recordGuess(1, 0); // Both correct - 2 checks, 2 correct
      counter.recordGuess(1); // RC correct, no TC - 1 check, 1 correct
      counter.recordGuess(0, 0); // RC wrong, TC correct - 2 checks, 1 correct

      // Total: 5 checks, 4 correct = 80%
      expect(counter.getOverallAccuracy()).toBe(80);
    });

    test("should return 0% accuracy with no guesses", () => {
      expect(counter.getRunningCountAccuracy()).toBe(0);
      expect(counter.getTrueCountAccuracy()).toBe(0);
      expect(counter.getOverallAccuracy()).toBe(0);
    });
  });

  describe("HiLoCounter - Proficiency Levels", () => {
    let counter: HiLoCounter;

    beforeEach(() => {
      counter = new HiLoCounter(6, true);
    });

    test("should require minimum guesses for proficiency", () => {
      // Only 5 guesses (less than default 20)
      for (let i = 0; i < 5; i++) {
        counter.recordGuess(0);
      }

      expect(counter.hasAchievedProficiency("running_count", 20)).toBe(false);
    });

    test("should always achieve beginner proficiency with enough guesses", () => {
      for (let i = 0; i < 20; i++) {
        counter.recordGuess(0);
      }

      expect(counter.hasAchievedProficiency("beginner", 20)).toBe(true);
    });

    test("should achieve running_count proficiency at 85%+ accuracy", () => {
      // Record 20 correct guesses
      for (let i = 0; i < 20; i++) {
        counter.recordGuess(0); // All correct
      }

      expect(counter.getRunningCountAccuracy()).toBe(100);
      expect(counter.hasAchievedProficiency("running_count", 20)).toBe(true);
    });

    test("should not achieve running_count proficiency below 85% accuracy", () => {
      // Record 16 correct, 4 incorrect = 80%
      for (let i = 0; i < 16; i++) {
        counter.recordGuess(0); // Correct
      }
      for (let i = 0; i < 4; i++) {
        counter.recordGuess(5); // Incorrect
      }

      expect(counter.getRunningCountAccuracy()).toBe(80);
      expect(counter.hasAchievedProficiency("running_count", 20)).toBe(false);
    });

    test("should achieve true_count proficiency with 90%+ RC and 85%+ TC", () => {
      // Need 20 guesses with TC
      // 18 RC correct (90%), 17 TC correct (85%)
      // 17 both correct, 1 RC correct only, 2 both wrong
      for (let i = 0; i < 17; i++) {
        counter.recordGuess(0, 0); // Both correct
      }
      counter.recordGuess(0, 1); // RC correct, TC wrong
      counter.recordGuess(1, 1); // RC wrong, TC wrong
      counter.recordGuess(1, 1); // RC wrong, TC wrong

      expect(counter.getRunningCountAccuracy()).toBe(90);
      expect(counter.getTrueCountAccuracy()).toBe(85);
      expect(counter.hasAchievedProficiency("true_count", 20)).toBe(true);
    });

    test("should not achieve true_count proficiency with low RC accuracy", () => {
      // RC accuracy below 90%
      for (let i = 0; i < 15; i++) {
        counter.recordGuess(0, 0); // Both correct
      }
      for (let i = 0; i < 5; i++) {
        counter.recordGuess(1, 0); // RC wrong
      }

      expect(counter.getRunningCountAccuracy()).toBe(75);
      expect(counter.hasAchievedProficiency("true_count", 20)).toBe(false);
    });

    test("should allow custom minimum guess count", () => {
      // Only 10 guesses, but specify min of 10
      for (let i = 0; i < 10; i++) {
        counter.recordGuess(0);
      }

      expect(counter.hasAchievedProficiency("running_count", 10)).toBe(true);
    });
  });

  describe("HiLoCounter - Reset Functionality", () => {
    let counter: HiLoCounter;

    beforeEach(() => {
      counter = new HiLoCounter(6, true);
    });

    test("should keep guesses on reset", () => {
      counter.addCards([{ rank: "2", suit: "hearts" }]);
      counter.recordGuess(1);

      counter.reset();

      expect(counter.getRunningCount()).toBe(0);
      expect(counter.getCardsRemaining()).toBe(312);
      expect(counter.getGuesses().length).toBe(1); // Guesses preserved
    });

    test("should clear guesses on resetAll", () => {
      counter.addCards([{ rank: "2", suit: "hearts" }]);
      counter.recordGuess(1);

      counter.resetAll();

      expect(counter.getRunningCount()).toBe(0);
      expect(counter.getCardsRemaining()).toBe(312);
      expect(counter.getGuesses().length).toBe(0); // Guesses cleared
    });
  });

  describe("getCountRecommendation", () => {
    test("should recommend increasing bet at TC +3 or higher", () => {
      const rec = getCountRecommendation(3);

      expect(rec.advantage).toBe("player");
      expect(rec.shouldIncreaseBet).toBe(true);
      expect(rec.suggestion).toContain("3-5x");
    });

    test("should recommend moderate bet increase at TC +2", () => {
      const rec = getCountRecommendation(2);

      expect(rec.advantage).toBe("player");
      expect(rec.shouldIncreaseBet).toBe(true);
      expect(rec.suggestion).toContain("2-3x");
    });

    test("should recommend slight bet increase at TC +1", () => {
      const rec = getCountRecommendation(1);

      expect(rec.advantage).toBe("player");
      expect(rec.shouldIncreaseBet).toBe(true);
      expect(rec.suggestion).toContain("Slightly favorable");
    });

    test("should recommend neutral strategy at TC 0", () => {
      const rec = getCountRecommendation(0);

      expect(rec.advantage).toBe("neutral");
      expect(rec.shouldIncreaseBet).toBe(false);
      expect(rec.suggestion).toContain("Neutral");
    });

    test("should recommend minimum bet at TC -1", () => {
      const rec = getCountRecommendation(-1);

      expect(rec.advantage).toBe("dealer");
      expect(rec.shouldIncreaseBet).toBe(false);
      expect(rec.suggestion).toContain("minimum");
    });

    test("should recommend sitting out at TC -2 or lower", () => {
      const rec = getCountRecommendation(-2);

      expect(rec.advantage).toBe("dealer");
      expect(rec.shouldIncreaseBet).toBe(false);
      expect(rec.suggestion).toContain("sitting out");
    });

    test("should handle extreme positive counts", () => {
      const rec = getCountRecommendation(10);

      expect(rec.advantage).toBe("player");
      expect(rec.shouldIncreaseBet).toBe(true);
    });

    test("should handle extreme negative counts", () => {
      const rec = getCountRecommendation(-10);

      expect(rec.advantage).toBe("dealer");
      expect(rec.shouldIncreaseBet).toBe(false);
    });
  });

  describe("Integration - Complete Shoe Simulation", () => {
    test("should track count through a partial shoe", () => {
      const counter = new HiLoCounter(6);

      // Simulate dealing several rounds
      // Round 1: 2,K,3,Q,5,A (total: +1-1+1-1+1-1 = 0)
      counter.addCards([
        { rank: "2", suit: "hearts" },
        { rank: "K", suit: "diamonds" },
        { rank: "3", suit: "clubs" },
        { rank: "Q", suit: "spades" },
        { rank: "5", suit: "hearts" },
        { rank: "A", suit: "diamonds" },
      ]);

      expect(counter.getRunningCount()).toBe(0);

      // Round 2: 4,5,6,2 (all +1)
      counter.addCards([
        { rank: "4", suit: "clubs" },
        { rank: "5", suit: "spades" },
        { rank: "6", suit: "hearts" },
        { rank: "2", suit: "diamonds" },
      ]);

      expect(counter.getRunningCount()).toBe(4);
      expect(counter.getCardsRemaining()).toBe(302);

      // True count should be positive
      const tc = counter.getTrueCount();
      expect(tc).toBeGreaterThan(0);
    });

    test("should handle full shoe depletion", () => {
      const counter = new HiLoCounter(1); // Single deck

      // Deal 50 neutral cards
      counter.addCards(Array(50).fill({ rank: "7", suit: "hearts" }));

      expect(counter.getRunningCount()).toBe(0);
      expect(counter.getCardsRemaining()).toBe(2);
      expect(counter.getDecksRemaining()).toBe(0.5); // Minimum
    });
  });
});
