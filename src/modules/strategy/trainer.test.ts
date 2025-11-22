import { beforeEach, describe, expect, test } from "bun:test";
import { TrainerMode, type TrainerDifficulty } from "./trainer";
import type { Card } from "../game/cards";
import { ACTION_HIT, ACTION_STAND, ACTION_DOUBLE, ACTION_SPLIT } from "../game/action";

// Create a minimal mock Game object
function createMockGame() {
  return {
    getSessionId: () => "test-session-123",
  } as any;
}

describe("TrainerMode", () => {
  let trainer: TrainerMode;
  let mockGame: any;

  beforeEach(() => {
    mockGame = createMockGame();
    trainer = new TrainerMode(mockGame, "beginner", 5000);
  });

  describe("initialization", () => {
    test("should start inactive", () => {
      expect(trainer.isTrainerActive()).toBe(false);
    });

    test("should initialize with beginner difficulty", () => {
      expect(trainer.getDifficulty()).toBe("beginner");
    });

    test("should initialize with practice balance", () => {
      expect(trainer.getPracticeBalance()).toBe(5000);
    });

    test("should accept custom difficulty", () => {
      const expertTrainer = new TrainerMode(mockGame, "expert");
      expect(expertTrainer.getDifficulty()).toBe("expert");
    });

    test("should use default practice balance if not specified", () => {
      const defaultTrainer = new TrainerMode(mockGame);
      expect(defaultTrainer.getPracticeBalance()).toBe(10000);
    });
  });

  describe("activate/deactivate", () => {
    test("should activate trainer mode", () => {
      trainer.activate();
      expect(trainer.isTrainerActive()).toBe(true);
    });

    test("should deactivate trainer mode", () => {
      trainer.activate();
      trainer.deactivate();
      expect(trainer.isTrainerActive()).toBe(false);
    });

    test("should handle multiple activations", () => {
      trainer.activate();
      trainer.activate();
      expect(trainer.isTrainerActive()).toBe(true);
    });
  });

  describe("difficulty management", () => {
    test("should set difficulty level", () => {
      trainer.setDifficulty("expert");
      expect(trainer.getDifficulty()).toBe("expert");
    });

    test("should change difficulty during session", () => {
      trainer.setDifficulty("beginner");
      expect(trainer.getDifficulty()).toBe("beginner");

      trainer.setDifficulty("true_count");
      expect(trainer.getDifficulty()).toBe("true_count");
    });

    test("should show hints only on beginner", () => {
      trainer.setDifficulty("beginner");
      expect(trainer.shouldShowHints()).toBe(true);

      trainer.setDifficulty("expert");
      expect(trainer.shouldShowHints()).toBe(false);
    });

    test("should track counting on running_count, true_count, and expert", () => {
      trainer.setDifficulty("beginner");
      expect(trainer.shouldTrackCounting()).toBe(false);

      trainer.setDifficulty("running_count");
      expect(trainer.shouldTrackCounting()).toBe(true);

      trainer.setDifficulty("true_count");
      expect(trainer.shouldTrackCounting()).toBe(true);

      trainer.setDifficulty("expert");
      expect(trainer.shouldTrackCounting()).toBe(true);
    });
  });

  describe("practice balance", () => {
    test("should get current practice balance", () => {
      expect(trainer.getPracticeBalance()).toBe(5000);
    });

    test("should adjust balance upward on win", () => {
      trainer.adjustPracticeBalance(100);
      expect(trainer.getPracticeBalance()).toBe(5100);
    });

    test("should adjust balance downward on loss", () => {
      trainer.adjustPracticeBalance(-100);
      expect(trainer.getPracticeBalance()).toBe(4900);
    });

    test("should allow multiple adjustments", () => {
      trainer.adjustPracticeBalance(200);
      trainer.adjustPracticeBalance(-50);
      trainer.adjustPracticeBalance(150);
      expect(trainer.getPracticeBalance()).toBe(5300);
    });

    test("should allow balance to go negative", () => {
      trainer.adjustPracticeBalance(-6000);
      expect(trainer.getPracticeBalance()).toBe(-1000);
    });
  });

  describe("reset", () => {
    test("should reset practice balance to initial", () => {
      trainer.adjustPracticeBalance(500);
      expect(trainer.getPracticeBalance()).toBe(5500);

      trainer.reset();
      expect(trainer.getPracticeBalance()).toBe(5000);
    });

    test("should clear decision tracker", () => {
      trainer.activate();

      // Make a decision
      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
        16,
        { rank: "7", suit: "♦" },
        false,
        false,
        false,
        ACTION_HIT,
        "hand-1",
        "round-1",
        100,
      );

      trainer.reset();

      const stats = trainer.getStats();
      expect(stats.totalDecisions).toBe(0);
    });

    test("should clear current feedback", () => {
      trainer.activate();

      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
        16,
        { rank: "7", suit: "♦" },
        false,
        false,
        false,
        ACTION_HIT,
        "hand-1",
        "round-1",
        100,
      );

      expect(trainer.getCurrentActionFeedback()).not.toBeNull();

      trainer.reset();
      expect(trainer.getCurrentActionFeedback()).toBeNull();
    });
  });

  describe("processCardsDealt", () => {
    test("should process cards when active", () => {
      trainer.activate();
      const cards: Card[] = [
        { rank: "10", suit: "♠" },
        { rank: "K", suit: "♥" },
      ];

      trainer.processCardsDealt(cards);

      const snapshot = trainer.getCountSnapshot();
      expect(snapshot.runningCount).toBe(-2); // Two high cards
    });

    test("should not process cards when inactive", () => {
      const cards: Card[] = [
        { rank: "10", suit: "♠" },
        { rank: "K", suit: "♥" },
      ];

      trainer.processCardsDealt(cards);

      const snapshot = trainer.getCountSnapshot();
      expect(snapshot.runningCount).toBe(0); // Not tracked when inactive
    });
  });

  describe("getOptimalAction", () => {
    test("should return optimal action for hard 16 vs 7", () => {
      const optimal = trainer.getOptimalAction(
        [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
        16,
        { rank: "7", suit: "♦" },
        false,
        false,
        false,
      );

      expect(optimal.action).toBe(ACTION_HIT);
      expect(optimal.reason).toContain("16");
    });

    test("should return optimal action for hard 20", () => {
      const optimal = trainer.getOptimalAction(
        [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
        20,
        { rank: "6", suit: "♦" },
        false,
        false,
        false,
      );

      expect(optimal.action).toBe(ACTION_STAND);
    });

    test("should recommend split for pairs when available", () => {
      const optimal = trainer.getOptimalAction(
        [{ rank: "8", suit: "♠" }, { rank: "8", suit: "♥" }],
        16,
        { rank: "6", suit: "♦" },
        false,
        true, // canSplit
        false,
      );

      expect(optimal.action).toBe(ACTION_SPLIT);
    });
  });

  describe("evaluateAction", () => {
    test("should return success feedback for correct action", () => {
      trainer.activate();

      const feedback = trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
        20,
        { rank: "6", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND,
        "hand-1",
        "round-1",
        100,
      );

      expect(feedback.wasCorrect).toBe(true);
      expect(feedback.severity).toBe("success");
      expect(feedback.explanation).toContain("Correct");
    });

    test("should return error feedback for incorrect action", () => {
      trainer.activate();

      const feedback = trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
        16,
        { rank: "7", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND, // Should hit
        "hand-1",
        "round-1",
        100,
      );

      expect(feedback.wasCorrect).toBe(false);
      expect(feedback.severity).toBe("error");
      expect(feedback.explanation).toContain("Incorrect");
      expect(feedback.optimalAction).toBe(ACTION_HIT);
    });

    test("should store feedback as current feedback", () => {
      trainer.activate();

      const feedback = trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
        20,
        { rank: "6", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND,
        "hand-1",
        "round-1",
        100,
      );

      expect(trainer.getCurrentActionFeedback()).toEqual(feedback);
    });

    test("should record decision in tracker", () => {
      trainer.activate();

      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
        20,
        { rank: "6", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND,
        "hand-1",
        "round-1",
        100,
      );

      const stats = trainer.getStats();
      expect(stats.totalDecisions).toBe(1);
      expect(stats.correctDecisions).toBe(1);
    });

    test("should include count snapshot for counting difficulties", () => {
      trainer.setDifficulty("running_count");
      trainer.activate();

      // Process some cards first
      trainer.processCardsDealt([
        { rank: "2", suit: "♠" },
        { rank: "3", suit: "♥" },
      ]);

      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
        20,
        { rank: "6", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND,
        "hand-1",
        "round-1",
        100,
      );

      const data = trainer.exportPerformanceData();
      expect(data.decisions[0].countSnapshot).toBeDefined();
    });
  });

  describe("submitCountGuess", () => {
    beforeEach(() => {
      trainer.activate();
      // Set up a known count
      trainer.processCardsDealt([
        { rank: "2", suit: "♠" },
        { rank: "3", suit: "♥" },
        { rank: "10", suit: "♦" },
      ]); // Running count: +2 - 1 = +1
    });

    test("should return success for correct running count", () => {
      trainer.setDifficulty("running_count");

      const feedback = trainer.submitCountGuess(1);

      expect(feedback.wasCorrect).toBe(true);
      expect(feedback.severity).toBe("success");
      expect(feedback.runningCountDiff).toBe(0);
    });

    test("should return error for incorrect running count", () => {
      trainer.setDifficulty("running_count");

      const feedback = trainer.submitCountGuess(5); // Wrong

      expect(feedback.wasCorrect).toBe(false);
      expect(feedback.severity).toBe("error");
      expect(feedback.runningCountDiff).toBe(4);
      expect(feedback.message).toContain("Off by 4");
    });

    test("should return warning for slightly off running count", () => {
      trainer.setDifficulty("running_count");

      const feedback = trainer.submitCountGuess(2); // Off by 1

      expect(feedback.wasCorrect).toBe(false);
      expect(feedback.severity).toBe("warning");
      expect(feedback.runningCountDiff).toBe(1);
    });

    test("should validate both counts in true_count mode", () => {
      trainer.setDifficulty("true_count");
      const snapshot = trainer.getCountSnapshot();

      const feedback = trainer.submitCountGuess(
        snapshot.runningCount,
        snapshot.trueCount,
      );

      expect(feedback.wasCorrect).toBe(true);
      expect(feedback.message).toContain("Both");
    });

    test("should handle partially correct in true_count mode", () => {
      trainer.setDifficulty("true_count");
      const snapshot = trainer.getCountSnapshot();

      const feedback = trainer.submitCountGuess(
        snapshot.runningCount,
        snapshot.trueCount + 2, // Wrong true count
      );

      expect(feedback.wasCorrect).toBe(false);
      expect(feedback.severity).toBe("warning");
      expect(feedback.message).toContain("Running count correct");
    });

    test("should store count feedback as current", () => {
      trainer.setDifficulty("running_count");

      const feedback = trainer.submitCountGuess(1);

      expect(trainer.getCurrentCountFeedback()).toEqual(feedback);
    });
  });

  describe("clearCurrentFeedback", () => {
    test("should clear action feedback", () => {
      trainer.activate();

      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
        20,
        { rank: "6", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND,
        "hand-1",
        "round-1",
        100,
      );

      expect(trainer.getCurrentActionFeedback()).not.toBeNull();

      trainer.clearCurrentFeedback();

      expect(trainer.getCurrentActionFeedback()).toBeNull();
    });

    test("should clear count feedback", () => {
      trainer.activate();
      trainer.setDifficulty("running_count");

      trainer.processCardsDealt([{ rank: "2", suit: "♠" }]);
      trainer.submitCountGuess(1);

      expect(trainer.getCurrentCountFeedback()).not.toBeNull();

      trainer.clearCurrentFeedback();

      expect(trainer.getCurrentCountFeedback()).toBeNull();
    });
  });

  describe("getStats", () => {
    test("should return zero stats initially", () => {
      const stats = trainer.getStats();

      expect(stats.totalDecisions).toBe(0);
      expect(stats.correctDecisions).toBe(0);
      expect(stats.strategyAccuracy).toBe(0);
      expect(stats.totalCountGuesses).toBe(0);
    });

    test("should calculate strategy accuracy", () => {
      trainer.activate();

      // 2 correct, 1 incorrect
      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
        20,
        { rank: "6", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND, // Correct
        "hand-1",
        "round-1",
        100,
      );

      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
        16,
        { rank: "7", suit: "♦" },
        false,
        false,
        false,
        ACTION_HIT, // Correct
        "hand-2",
        "round-1",
        100,
      );

      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
        16,
        { rank: "7", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND, // Incorrect
        "hand-3",
        "round-1",
        100,
      );

      const stats = trainer.getStats();
      expect(stats.totalDecisions).toBe(3);
      expect(stats.correctDecisions).toBe(2);
      expect(stats.strategyAccuracy).toBeCloseTo(66.67, 1);
    });

    test("should calculate counting stats", () => {
      trainer.activate();
      trainer.setDifficulty("running_count");

      trainer.processCardsDealt([{ rank: "2", suit: "♠" }]);
      trainer.submitCountGuess(1); // Correct

      trainer.processCardsDealt([{ rank: "10", suit: "♥" }]);
      trainer.submitCountGuess(5); // Incorrect

      const stats = trainer.getStats();
      expect(stats.totalCountGuesses).toBe(2);
      expect(stats.correctRunningCounts).toBe(1);
    });

    test("should calculate accuracy by hand type", () => {
      trainer.activate();

      // Hard hand
      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
        16,
        { rank: "7", suit: "♦" },
        false,
        false,
        false,
        ACTION_HIT,
        "hand-1",
        "round-1",
        100,
      );

      // Soft hand
      trainer.evaluateAction(
        [{ rank: "A", suit: "♠" }, { rank: "7", suit: "♥" }],
        18,
        { rank: "6", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND,
        "hand-2",
        "round-1",
        100,
      );

      const stats = trainer.getStats();
      expect(stats.hardHandAccuracy).toBe(100);
      expect(stats.softHandAccuracy).toBe(100);
    });

    test("should calculate recent accuracy", () => {
      trainer.activate();

      // Make 12 decisions (last 10 will be used)
      for (let i = 0; i < 12; i++) {
        trainer.evaluateAction(
          [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
          20,
          { rank: "6", suit: "♦" },
          false,
          false,
          false,
          i < 10 ? ACTION_STAND : ACTION_HIT, // Last 2 wrong
          `hand-${i}`,
          "round-1",
          100,
        );
      }

      const stats = trainer.getStats();
      // Last 10: 8 correct, 2 incorrect = 80%
      expect(stats.recentAccuracy).toBe(80);
    });
  });

  describe("getMistakes", () => {
    test("should return empty array with no mistakes", () => {
      trainer.activate();

      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
        20,
        { rank: "6", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND,
        "hand-1",
        "round-1",
        100,
      );

      expect(trainer.getMistakes()).toHaveLength(0);
    });

    test("should return only incorrect decisions", () => {
      trainer.activate();

      // Correct
      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
        20,
        { rank: "6", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND,
        "hand-1",
        "round-1",
        100,
      );

      // Incorrect
      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
        16,
        { rank: "7", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND,
        "hand-2",
        "round-1",
        100,
      );

      const mistakes = trainer.getMistakes();
      expect(mistakes).toHaveLength(1);
      expect(mistakes[0].handId).toBe("hand-2");
    });
  });

  describe("updateHandOutcome", () => {
    test("should update decision with outcome", () => {
      trainer.activate();

      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
        20,
        { rank: "6", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND,
        "hand-1",
        "round-1",
        100,
      );

      trainer.updateHandOutcome("hand-1", "win", 200, 100);

      const data = trainer.exportPerformanceData();
      expect(data.decisions[0].outcome).toBe("win");
      expect(data.decisions[0].payout).toBe(200);
      expect(data.decisions[0].profit).toBe(100);
    });

    test("should adjust practice balance by profit", () => {
      const initialBalance = trainer.getPracticeBalance();

      trainer.updateHandOutcome("hand-1", "win", 200, 100);

      expect(trainer.getPracticeBalance()).toBe(initialBalance + 100);
    });

    test("should handle loss", () => {
      const initialBalance = trainer.getPracticeBalance();

      trainer.updateHandOutcome("hand-1", "loss", 0, -100);

      expect(trainer.getPracticeBalance()).toBe(initialBalance - 100);
    });
  });

  describe("resetCountForNewShoe", () => {
    test("should reset counter to zero", () => {
      trainer.activate();

      trainer.processCardsDealt([
        { rank: "2", suit: "♠" },
        { rank: "3", suit: "♥" },
      ]);

      const beforeReset = trainer.getCountSnapshot();
      expect(beforeReset.runningCount).not.toBe(0);

      trainer.resetCountForNewShoe();

      const afterReset = trainer.getCountSnapshot();
      expect(afterReset.runningCount).toBe(0);
    });
  });

  describe("exportPerformanceData", () => {
    test("should export stats, decisions, and mistakes", () => {
      trainer.activate();

      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "6", suit: "♥" }],
        16,
        { rank: "7", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND, // Wrong
        "hand-1",
        "round-1",
        100,
      );

      const data = trainer.exportPerformanceData();

      expect(data.stats).toBeDefined();
      expect(data.decisions).toHaveLength(1);
      expect(data.mistakes).toHaveLength(1);
    });

    test("should export empty data for new session", () => {
      const data = trainer.exportPerformanceData();

      expect(data.stats.totalDecisions).toBe(0);
      expect(data.decisions).toHaveLength(0);
      expect(data.mistakes).toHaveLength(0);
    });
  });

  describe("integration scenarios", () => {
    test("should track complete training session", () => {
      trainer.activate();
      trainer.setDifficulty("true_count");

      // Process initial cards
      trainer.processCardsDealt([
        { rank: "2", suit: "♠" },
        { rank: "3", suit: "♥" },
      ]);

      // Make a decision
      trainer.evaluateAction(
        [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
        20,
        { rank: "6", suit: "♦" },
        false,
        false,
        false,
        ACTION_STAND,
        "hand-1",
        "round-1",
        100,
      );

      // Submit count guess
      const snapshot = trainer.getCountSnapshot();
      trainer.submitCountGuess(snapshot.runningCount, snapshot.trueCount);

      // Update outcome
      trainer.updateHandOutcome("hand-1", "win", 200, 100);

      // Verify session data
      const data = trainer.exportPerformanceData();
      expect(data.stats.totalDecisions).toBe(1);
      expect(data.stats.totalCountGuesses).toBe(1);
      expect(data.decisions[0].outcome).toBe("win");
      expect(trainer.getPracticeBalance()).toBe(5100);
    });

    test("should handle reset mid-session", () => {
      trainer.activate();

      // Make some decisions
      for (let i = 0; i < 5; i++) {
        trainer.evaluateAction(
          [{ rank: "10", suit: "♠" }, { rank: "10", suit: "♥" }],
          20,
          { rank: "6", suit: "♦" },
          false,
          false,
          false,
          ACTION_STAND,
          `hand-${i}`,
          "round-1",
          100,
        );
      }

      // Adjust balance
      trainer.adjustPracticeBalance(-1000);

      // Reset
      trainer.reset();

      // Verify everything is reset
      const stats = trainer.getStats();
      expect(stats.totalDecisions).toBe(0);
      expect(trainer.getPracticeBalance()).toBe(5000);
      expect(trainer.getCurrentActionFeedback()).toBeNull();
    });
  });
});
