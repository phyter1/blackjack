import { beforeEach, describe, expect, test } from "bun:test";
import {
  DecisionTracker,
  calculateGrade,
  getGradePoints,
  type PlayerDecision,
  type BasicStrategyDecision,
} from "./decision-tracker";
import type { Card } from "../game/cards";
import { ACTION_HIT, ACTION_STAND, ACTION_DOUBLE, ACTION_SPLIT, ACTION_SURRENDER } from "../game/action";

describe("Decision Tracker", () => {
  describe("calculateGrade", () => {
    test("should return A+ for 98%+ accuracy", () => {
      expect(calculateGrade(100)).toBe("A+");
      expect(calculateGrade(98)).toBe("A+");
    });

    test("should return A for 93-97% accuracy", () => {
      expect(calculateGrade(97)).toBe("A");
      expect(calculateGrade(93)).toBe("A");
    });

    test("should return A- for 90-92% accuracy", () => {
      expect(calculateGrade(92)).toBe("A-");
      expect(calculateGrade(90)).toBe("A-");
    });

    test("should return B+ for 87-89% accuracy", () => {
      expect(calculateGrade(89)).toBe("B+");
      expect(calculateGrade(87)).toBe("B+");
    });

    test("should return B for 83-86% accuracy", () => {
      expect(calculateGrade(86)).toBe("B");
      expect(calculateGrade(83)).toBe("B");
    });

    test("should return B- for 80-82% accuracy", () => {
      expect(calculateGrade(82)).toBe("B-");
      expect(calculateGrade(80)).toBe("B-");
    });

    test("should return C+ for 77-79% accuracy", () => {
      expect(calculateGrade(79)).toBe("C+");
      expect(calculateGrade(77)).toBe("C+");
    });

    test("should return C for 73-76% accuracy", () => {
      expect(calculateGrade(76)).toBe("C");
      expect(calculateGrade(73)).toBe("C");
    });

    test("should return C- for 70-72% accuracy", () => {
      expect(calculateGrade(72)).toBe("C-");
      expect(calculateGrade(70)).toBe("C-");
    });

    test("should return D+ for 67-69% accuracy", () => {
      expect(calculateGrade(69)).toBe("D+");
      expect(calculateGrade(67)).toBe("D+");
    });

    test("should return D for 60-66% accuracy", () => {
      expect(calculateGrade(66)).toBe("D");
      expect(calculateGrade(60)).toBe("D");
    });

    test("should return F for below 60% accuracy", () => {
      expect(calculateGrade(59)).toBe("F");
      expect(calculateGrade(0)).toBe("F");
    });

    test("should handle boundary values precisely", () => {
      expect(calculateGrade(97.9)).toBe("A");
      expect(calculateGrade(98.0)).toBe("A+");
      expect(calculateGrade(92.9)).toBe("A-");
      expect(calculateGrade(93.0)).toBe("A");
    });
  });

  describe("getGradePoints", () => {
    test("should return 4.0 for A+", () => {
      expect(getGradePoints("A+")).toBe(4.0);
    });

    test("should return 4.0 for A", () => {
      expect(getGradePoints("A")).toBe(4.0);
    });

    test("should return 3.7 for A-", () => {
      expect(getGradePoints("A-")).toBe(3.7);
    });

    test("should return 3.3 for B+", () => {
      expect(getGradePoints("B+")).toBe(3.3);
    });

    test("should return 3.0 for B", () => {
      expect(getGradePoints("B")).toBe(3.0);
    });

    test("should return 2.7 for B-", () => {
      expect(getGradePoints("B-")).toBe(2.7);
    });

    test("should return 2.3 for C+", () => {
      expect(getGradePoints("C+")).toBe(2.3);
    });

    test("should return 2.0 for C", () => {
      expect(getGradePoints("C")).toBe(2.0);
    });

    test("should return 1.7 for C-", () => {
      expect(getGradePoints("C-")).toBe(1.7);
    });

    test("should return 1.3 for D+", () => {
      expect(getGradePoints("D+")).toBe(1.3);
    });

    test("should return 1.0 for D", () => {
      expect(getGradePoints("D")).toBe(1.0);
    });

    test("should return 0.0 for F", () => {
      expect(getGradePoints("F")).toBe(0.0);
    });
  });

  describe("DecisionTracker", () => {
    let tracker: DecisionTracker;

    beforeEach(() => {
      tracker = new DecisionTracker("session-123");
    });

    describe("initialization", () => {
      test("should start with no decisions", () => {
        expect(tracker.getDecisions()).toEqual([]);
      });

      test("should return zero accuracy for empty session", () => {
        const analysis = tracker.calculateAnalysis();
        expect(analysis.totalDecisions).toBe(0);
        expect(analysis.correctDecisions).toBe(0);
        expect(analysis.accuracyPercentage).toBe(0);
      });
    });

    describe("recordDecision", () => {
      test("should record a correct decision", () => {
        const playerCards: Card[] = [
          { rank: "10", suit: "♠" },
          { rank: "6", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "7", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_HIT,
          reason: "Hit 16 vs dealer 7",
        };

        tracker.recordDecision(
          playerCards,
          16,
          dealerUpCard,
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_HIT,
          optimalDecision,
          100,
        );

        const decisions = tracker.getDecisions();
        expect(decisions).toHaveLength(1);
        expect(decisions[0].isCorrect).toBe(true);
        expect(decisions[0].playerHandValue).toBe(16);
        expect(decisions[0].actualAction).toBe(ACTION_HIT);
        expect(decisions[0].optimalAction).toBe(ACTION_HIT);
      });

      test("should record an incorrect decision", () => {
        const playerCards: Card[] = [
          { rank: "10", suit: "♠" },
          { rank: "6", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "7", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_HIT,
          reason: "Hit 16 vs dealer 7",
        };

        tracker.recordDecision(
          playerCards,
          16,
          dealerUpCard,
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND, // Wrong action
          optimalDecision,
          100,
        );

        const decisions = tracker.getDecisions();
        expect(decisions[0].isCorrect).toBe(false);
        expect(decisions[0].actualAction).toBe(ACTION_STAND);
        expect(decisions[0].optimalAction).toBe(ACTION_HIT);
      });

      test("should include timestamp", () => {
        const playerCards: Card[] = [
          { rank: "10", suit: "♠" },
          { rank: "10", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "6", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_STAND,
          reason: "Stand on 20",
        };

        tracker.recordDecision(
          playerCards,
          20,
          dealerUpCard,
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND,
          optimalDecision,
          100,
        );

        const decisions = tracker.getDecisions();
        expect(decisions[0].timestamp).toBeDefined();
        expect(typeof decisions[0].timestamp).toBe("string");
      });

      test("should record available actions", () => {
        const playerCards: Card[] = [
          { rank: "5", suit: "♠" },
          { rank: "5", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "6", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_SPLIT,
          reason: "Split 5s",
        };

        tracker.recordDecision(
          playerCards,
          10,
          dealerUpCard,
          "hand-1",
          "round-1",
          true, // canDouble
          true, // canSplit
          true, // canSurrender
          ACTION_SPLIT,
          optimalDecision,
          100,
        );

        const decisions = tracker.getDecisions();
        expect(decisions[0].canDouble).toBe(true);
        expect(decisions[0].canSplit).toBe(true);
        expect(decisions[0].canSurrender).toBe(true);
      });

      test("should record count snapshot if provided", () => {
        const playerCards: Card[] = [
          { rank: "10", suit: "♠" },
          { rank: "10", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "6", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_STAND,
          reason: "Stand on 20",
        };
        const countSnapshot = {
          runningCount: 8,
          trueCount: 4,
          decksRemaining: 2,
        };

        tracker.recordDecision(
          playerCards,
          20,
          dealerUpCard,
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND,
          optimalDecision,
          100,
          countSnapshot,
        );

        const decisions = tracker.getDecisions();
        expect(decisions[0].countSnapshot).toBeDefined();
        expect(decisions[0].countSnapshot?.trueCount).toBe(4);
      });

      test("should record bet amount", () => {
        const playerCards: Card[] = [
          { rank: "A", suit: "♠" },
          { rank: "8", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "6", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_DOUBLE,
          reason: "Double soft 19 vs 6",
        };

        tracker.recordDecision(
          playerCards,
          19,
          dealerUpCard,
          "hand-1",
          "round-1",
          true,
          false,
          false,
          ACTION_DOUBLE,
          optimalDecision,
          250,
        );

        const decisions = tracker.getDecisions();
        expect(decisions[0].betAmount).toBe(250);
      });
    });

    describe("updateHandOutcome", () => {
      beforeEach(() => {
        const playerCards: Card[] = [
          { rank: "10", suit: "♠" },
          { rank: "10", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "6", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_STAND,
          reason: "Stand on 20",
        };

        tracker.recordDecision(
          playerCards,
          20,
          dealerUpCard,
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND,
          optimalDecision,
          100,
        );
      });

      test("should update outcome for hand", () => {
        tracker.updateHandOutcome("hand-1", "win", 200, 100);

        const decisions = tracker.getDecisions();
        expect(decisions[0].outcome).toBe("win");
        expect(decisions[0].payout).toBe(200);
        expect(decisions[0].profit).toBe(100);
      });

      test("should not update already-updated outcome", () => {
        tracker.updateHandOutcome("hand-1", "win", 200, 100);
        tracker.updateHandOutcome("hand-1", "loss", 0, -100);

        const decisions = tracker.getDecisions();
        expect(decisions[0].outcome).toBe("win"); // First outcome preserved
      });

      test("should only update matching hand ID", () => {
        const playerCards: Card[] = [
          { rank: "A", suit: "♠" },
          { rank: "K", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "6", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_STAND,
          reason: "Stand on blackjack",
        };

        tracker.recordDecision(
          playerCards,
          21,
          dealerUpCard,
          "hand-2",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND,
          optimalDecision,
          100,
        );

        tracker.updateHandOutcome("hand-1", "win", 200, 100);

        const decisions = tracker.getDecisions();
        expect(decisions[0].outcome).toBe("win");
        expect(decisions[1].outcome).toBeUndefined();
      });
    });

    describe("calculateAnalysis", () => {
      test("should calculate 100% accuracy for all correct", () => {
        // Record 5 correct decisions
        for (let i = 0; i < 5; i++) {
          const playerCards: Card[] = [
            { rank: "10", suit: "♠" },
            { rank: "10", suit: "♥" },
          ];
          const dealerUpCard: Card = { rank: "6", suit: "♦" };
          const optimalDecision: BasicStrategyDecision = {
            action: ACTION_STAND,
            reason: "Stand on 20",
          };

          tracker.recordDecision(
            playerCards,
            20,
            dealerUpCard,
            `hand-${i}`,
            "round-1",
            false,
            false,
            false,
            ACTION_STAND,
            optimalDecision,
            100,
          );
        }

        const analysis = tracker.calculateAnalysis();
        expect(analysis.totalDecisions).toBe(5);
        expect(analysis.correctDecisions).toBe(5);
        expect(analysis.accuracyPercentage).toBe(100);
        expect(analysis.grade).toBe("A+");
        expect(analysis.gradePoints).toBe(4.0);
      });

      test("should calculate 80% accuracy for 4/5 correct", () => {
        // Record 4 correct, 1 incorrect
        for (let i = 0; i < 5; i++) {
          const playerCards: Card[] = [
            { rank: "10", suit: "♠" },
            { rank: "6", suit: "♥" },
          ];
          const dealerUpCard: Card = { rank: "7", suit: "♦" };
          const optimalDecision: BasicStrategyDecision = {
            action: ACTION_HIT,
            reason: "Hit 16 vs 7",
          };

          tracker.recordDecision(
            playerCards,
            16,
            dealerUpCard,
            `hand-${i}`,
            "round-1",
            false,
            false,
            false,
            i < 4 ? ACTION_HIT : ACTION_STAND, // Last one wrong
            optimalDecision,
            100,
          );
        }

        const analysis = tracker.calculateAnalysis();
        expect(analysis.totalDecisions).toBe(5);
        expect(analysis.correctDecisions).toBe(4);
        expect(analysis.accuracyPercentage).toBe(80);
        expect(analysis.grade).toBe("B-");
      });

      test("should detect count data presence", () => {
        const playerCards: Card[] = [
          { rank: "10", suit: "♠" },
          { rank: "10", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "6", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_STAND,
          reason: "Stand on 20",
        };

        tracker.recordDecision(
          playerCards,
          20,
          dealerUpCard,
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND,
          optimalDecision,
          100,
          { runningCount: 4, trueCount: 2, decksRemaining: 2 },
        );

        const analysis = tracker.calculateAnalysis();
        expect(analysis.hasCountData).toBe(true);
      });

      test("should return correct session ID", () => {
        const analysis = tracker.calculateAnalysis();
        expect(analysis.sessionId).toBe("session-123");
      });
    });

    describe("getMistakes", () => {
      test("should return empty array when no mistakes", () => {
        const playerCards: Card[] = [
          { rank: "10", suit: "♠" },
          { rank: "10", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "6", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_STAND,
          reason: "Stand on 20",
        };

        tracker.recordDecision(
          playerCards,
          20,
          dealerUpCard,
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND,
          optimalDecision,
          100,
        );

        expect(tracker.getMistakes()).toEqual([]);
      });

      test("should return only incorrect decisions", () => {
        // Add 2 correct, 1 incorrect
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_HIT,
          reason: "Hit 16",
        };

        tracker.recordDecision(
          [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
          16,
          { rank: "7", suit: "♦" },
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_HIT, // Correct
          optimalDecision,
          100,
        );

        tracker.recordDecision(
          [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
          16,
          { rank: "7", suit: "♦" },
          "hand-2",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND, // Incorrect
          optimalDecision,
          100,
        );

        tracker.recordDecision(
          [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
          16,
          { rank: "7", suit: "♦" },
          "hand-3",
          "round-1",
          false,
          false,
          false,
          ACTION_HIT, // Correct
          optimalDecision,
          100,
        );

        const mistakes = tracker.getMistakes();
        expect(mistakes).toHaveLength(1);
        expect(mistakes[0].handId).toBe("hand-2");
        expect(mistakes[0].isCorrect).toBe(false);
      });
    });

    describe("getAccuracyByType", () => {
      test("should categorize hard hands correctly", () => {
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_HIT,
          reason: "Hit hard 12",
        };

        tracker.recordDecision(
          [{ rank: "10", suit: "♠" }, { rank: "2", suit: "♥" }],
          12,
          { rank: "3", suit: "♦" },
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_HIT,
          optimalDecision,
          100,
        );

        const accuracy = tracker.getAccuracyByType();
        expect(accuracy.hard).toBe(100);
        expect(accuracy.soft).toBe(0);
        expect(accuracy.pair).toBe(0);
      });

      test("should categorize soft hands correctly", () => {
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_STAND,
          reason: "Stand soft 18",
        };

        tracker.recordDecision(
          [{ rank: "A", suit: "♠" }, { rank: "7", suit: "♥" }],
          18,
          { rank: "6", suit: "♦" },
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND,
          optimalDecision,
          100,
        );

        const accuracy = tracker.getAccuracyByType();
        expect(accuracy.soft).toBe(100);
        expect(accuracy.hard).toBe(0);
        expect(accuracy.pair).toBe(0);
      });

      test("should categorize pairs correctly", () => {
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_SPLIT,
          reason: "Split 8s",
        };

        tracker.recordDecision(
          [{ rank: "8", suit: "♠" }, { rank: "8", suit: "♥" }],
          16,
          { rank: "6", suit: "♦" },
          "hand-1",
          "round-1",
          false,
          true,
          false,
          ACTION_SPLIT,
          optimalDecision,
          100,
        );

        const accuracy = tracker.getAccuracyByType();
        expect(accuracy.pair).toBe(100);
        expect(accuracy.hard).toBe(0);
        expect(accuracy.soft).toBe(0);
      });

      test("should calculate accuracy separately for each type", () => {
        // Hard: 1 correct, 1 incorrect
        tracker.recordDecision(
          [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
          16,
          { rank: "7", suit: "♦" },
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_HIT,
          { action: ACTION_HIT, reason: "Hit 16" },
          100,
        );

        tracker.recordDecision(
          [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
          16,
          { rank: "7", suit: "♦" },
          "hand-2",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND,
          { action: ACTION_HIT, reason: "Hit 16" },
          100,
        );

        // Soft: 2 correct
        tracker.recordDecision(
          [{ rank: "A", suit: "♠" }, { rank: "7", suit: "♥" }],
          18,
          { rank: "6", suit: "♦" },
          "hand-3",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND,
          { action: ACTION_STAND, reason: "Stand soft 18" },
          100,
        );

        tracker.recordDecision(
          [{ rank: "A", suit: "♠" }, { rank: "6", suit: "♥" }],
          17,
          { rank: "3", suit: "♦" },
          "hand-4",
          "round-1",
          false,
          false,
          false,
          ACTION_HIT,
          { action: ACTION_HIT, reason: "Hit soft 17" },
          100,
        );

        // Pair: 1 incorrect
        tracker.recordDecision(
          [{ rank: "5", suit: "♠" }, { rank: "5", suit: "♥" }],
          10,
          { rank: "6", suit: "♦" },
          "hand-5",
          "round-1",
          true,
          true,
          false,
          ACTION_SPLIT,
          { action: ACTION_DOUBLE, reason: "Double 10" },
          100,
        );

        const accuracy = tracker.getAccuracyByType();
        expect(accuracy.hard).toBe(50); // 1/2
        expect(accuracy.soft).toBe(100); // 2/2
        expect(accuracy.pair).toBe(0); // 0/1
      });

      test("should return 0 for types with no decisions", () => {
        const accuracy = tracker.getAccuracyByType();
        expect(accuracy.hard).toBe(0);
        expect(accuracy.soft).toBe(0);
        expect(accuracy.pair).toBe(0);
      });
    });

    describe("clear", () => {
      test("should remove all decisions", () => {
        const playerCards: Card[] = [
          { rank: "10", suit: "♠" },
          { rank: "10", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "6", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_STAND,
          reason: "Stand on 20",
        };

        tracker.recordDecision(
          playerCards,
          20,
          dealerUpCard,
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND,
          optimalDecision,
          100,
        );

        expect(tracker.getDecisions()).toHaveLength(1);

        tracker.clear();

        expect(tracker.getDecisions()).toHaveLength(0);
      });

      test("should reset analysis after clear", () => {
        const playerCards: Card[] = [
          { rank: "10", suit: "♠" },
          { rank: "10", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "6", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_STAND,
          reason: "Stand on 20",
        };

        tracker.recordDecision(
          playerCards,
          20,
          dealerUpCard,
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND,
          optimalDecision,
          100,
        );

        tracker.clear();

        const analysis = tracker.calculateAnalysis();
        expect(analysis.totalDecisions).toBe(0);
        expect(analysis.accuracyPercentage).toBe(0);
      });
    });

    describe("edge cases", () => {
      test("should handle multiple decisions for same hand", () => {
        const playerCards: Card[] = [
          { rank: "5", suit: "♠" },
          { rank: "3", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "6", suit: "♦" };

        // First decision: hit
        tracker.recordDecision(
          playerCards,
          8,
          dealerUpCard,
          "hand-1",
          "round-1",
          true,
          false,
          false,
          ACTION_HIT,
          { action: ACTION_HIT, reason: "Hit 8" },
          100,
        );

        // Second decision after hit: now has 10
        tracker.recordDecision(
          [...playerCards, { rank: "2", suit: "♦" }],
          10,
          dealerUpCard,
          "hand-1",
          "round-1",
          true,
          false,
          false,
          ACTION_DOUBLE,
          { action: ACTION_DOUBLE, reason: "Double 10" },
          100,
        );

        expect(tracker.getDecisions()).toHaveLength(2);
      });

      test("should return defensive copy of decisions array", () => {
        const playerCards: Card[] = [
          { rank: "10", suit: "♠" },
          { rank: "10", suit: "♥" },
        ];
        const dealerUpCard: Card = { rank: "6", suit: "♦" };
        const optimalDecision: BasicStrategyDecision = {
          action: ACTION_STAND,
          reason: "Stand on 20",
        };

        tracker.recordDecision(
          playerCards,
          20,
          dealerUpCard,
          "hand-1",
          "round-1",
          false,
          false,
          false,
          ACTION_STAND,
          optimalDecision,
          100,
        );

        const decisions1 = tracker.getDecisions();
        const decisions2 = tracker.getDecisions();

        expect(decisions1).not.toBe(decisions2);
        expect(decisions1).toEqual(decisions2);
      });
    });
  });
});
