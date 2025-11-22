import { beforeEach, describe, expect, test } from "bun:test";
import {
  calculateBaseHouseEdge,
  adjustForStrategyAccuracy,
  calculateCountAdvantage,
  calculateAverageTrueCount,
  calculateSessionEV,
  getVarianceInterpretation,
  formatEdge,
  formatMoney,
  calculateAdvantagePlayEV,
  getAdvantagePlayDescription,
  calculateHandEV,
  DEFAULT_RULES,
  CONSERVATIVE_SPREAD,
  AGGRESSIVE_SPREAD,
  type GameRules,
  type AdvantagePlayLevel,
} from "./ev-calculator";

describe("EV Calculator", () => {
  describe("calculateBaseHouseEdge", () => {
    test("should return -0.5% for default rules", () => {
      const edge = calculateBaseHouseEdge(DEFAULT_RULES);
      expect(edge).toBe(-0.5);
    });

    test("should improve edge for single deck", () => {
      const rules: GameRules = { ...DEFAULT_RULES, decks: 1 };
      const edge = calculateBaseHouseEdge(rules);
      expect(edge).toBe(-0.3); // -0.5 + 0.2
    });

    test("should improve edge for two decks", () => {
      const rules: GameRules = { ...DEFAULT_RULES, decks: 2 };
      const edge = calculateBaseHouseEdge(rules);
      expect(edge).toBe(-0.4); // -0.5 + 0.1
    });

    test("should worsen edge for eight decks", () => {
      const rules: GameRules = { ...DEFAULT_RULES, decks: 8 };
      const edge = calculateBaseHouseEdge(rules);
      expect(edge).toBe(-0.6); // -0.5 - 0.1
    });

    test("should worsen edge when dealer hits soft 17", () => {
      const rules: GameRules = { ...DEFAULT_RULES, dealerHitsSoft17: true };
      const edge = calculateBaseHouseEdge(rules);
      expect(edge).toBe(-0.7); // -0.5 - 0.2
    });

    test("should worsen edge without double after split", () => {
      const rules: GameRules = { ...DEFAULT_RULES, doubleAfterSplit: false };
      const edge = calculateBaseHouseEdge(rules);
      expect(edge).toBe(-0.65); // -0.5 - 0.15
    });

    test("should worsen edge without surrender", () => {
      const rules: GameRules = { ...DEFAULT_RULES, surrenderAllowed: false };
      const edge = calculateBaseHouseEdge(rules);
      expect(edge).toBe(-0.58); // -0.5 - 0.08
    });

    test("should significantly worsen edge for 6:5 blackjack", () => {
      const rules: GameRules = { ...DEFAULT_RULES, blackjackPayout: 1.2 };
      const edge = calculateBaseHouseEdge(rules);
      expect(edge).toBe(-1.9); // -0.5 - 1.4
    });

    test("should dramatically worsen edge for even money blackjack", () => {
      const rules: GameRules = { ...DEFAULT_RULES, blackjackPayout: 1 };
      const edge = calculateBaseHouseEdge(rules);
      expect(edge).toBe(-2.8); // -0.5 - 2.3
    });

    test("should handle combination of bad rules", () => {
      const rules: GameRules = {
        decks: 8,
        dealerHitsSoft17: true,
        doubleAfterSplit: false,
        surrenderAllowed: false,
        blackjackPayout: 1.2,
      };
      const edge = calculateBaseHouseEdge(rules);
      // -0.5 - 0.1 (8 decks) - 0.2 (h17) - 0.15 (no DAS) - 0.08 (no surrender) - 1.4 (6:5 BJ)
      expect(edge).toBeCloseTo(-2.43, 2);
    });

    test("should handle combination of good rules", () => {
      const rules: GameRules = {
        decks: 1,
        dealerHitsSoft17: false,
        doubleAfterSplit: true,
        surrenderAllowed: true,
        blackjackPayout: 1.5,
      };
      const edge = calculateBaseHouseEdge(rules);
      // -0.5 + 0.2 (single deck) = -0.3
      expect(edge).toBe(-0.3);
    });
  });

  describe("adjustForStrategyAccuracy", () => {
    test("should not adjust for perfect strategy", () => {
      const baseEdge = -0.5;
      const adjusted = adjustForStrategyAccuracy(baseEdge, 100);
      expect(adjusted).toBe(-0.5);
    });

    test("should worsen edge for 90% accuracy", () => {
      const baseEdge = -0.5;
      const adjusted = adjustForStrategyAccuracy(baseEdge, 90);
      // -0.5 - (100 - 90) * 0.03 = -0.5 - 0.3 = -0.8
      expect(adjusted).toBe(-0.8);
    });

    test("should worsen edge for 80% accuracy", () => {
      const baseEdge = -0.5;
      const adjusted = adjustForStrategyAccuracy(baseEdge, 80);
      // -0.5 - (100 - 80) * 0.03 = -0.5 - 0.6 = -1.1
      expect(adjusted).toBe(-1.1);
    });

    test("should significantly worsen edge for 50% accuracy", () => {
      const baseEdge = -0.5;
      const adjusted = adjustForStrategyAccuracy(baseEdge, 50);
      // -0.5 - (100 - 50) * 0.03 = -0.5 - 1.5 = -2.0
      expect(adjusted).toBe(-2.0);
    });

    test("should handle positive base edge (counting)", () => {
      const baseEdge = 1.0;
      const adjusted = adjustForStrategyAccuracy(baseEdge, 95);
      // 1.0 - (100 - 95) * 0.03 = 1.0 - 0.15 = 0.85
      expect(adjusted).toBe(0.85);
    });

    test("should handle zero accuracy (worst case)", () => {
      const baseEdge = -0.5;
      const adjusted = adjustForStrategyAccuracy(baseEdge, 0);
      // -0.5 - 100 * 0.03 = -3.5
      expect(adjusted).toBe(-3.5);
    });
  });

  describe("calculateCountAdvantage", () => {
    test("should return 0% for neutral count", () => {
      const advantage = calculateCountAdvantage(0);
      expect(advantage).toBe(0);
    });

    test("should return 0.5% for +1 true count", () => {
      const advantage = calculateCountAdvantage(1);
      expect(advantage).toBe(0.5);
    });

    test("should return 1% for +2 true count", () => {
      const advantage = calculateCountAdvantage(2);
      expect(advantage).toBe(1.0);
    });

    test("should return 2.5% for +5 true count", () => {
      const advantage = calculateCountAdvantage(5);
      expect(advantage).toBe(2.5);
    });

    test("should return -0.5% for -1 true count", () => {
      const advantage = calculateCountAdvantage(-1);
      expect(advantage).toBe(-0.5);
    });

    test("should return -2% for -4 true count", () => {
      const advantage = calculateCountAdvantage(-4);
      expect(advantage).toBe(-2.0);
    });

    test("should handle fractional counts", () => {
      const advantage = calculateCountAdvantage(2.5);
      expect(advantage).toBe(1.25);
    });
  });

  describe("calculateAverageTrueCount", () => {
    test("should return null for undefined data", () => {
      const avg = calculateAverageTrueCount(undefined);
      expect(avg).toBeNull();
    });

    test("should return null for empty string", () => {
      const avg = calculateAverageTrueCount("");
      expect(avg).toBeNull();
    });

    test("should return null for invalid JSON", () => {
      const avg = calculateAverageTrueCount("not json");
      expect(avg).toBeNull();
    });

    test("should return null for empty array", () => {
      const avg = calculateAverageTrueCount("[]");
      expect(avg).toBeNull();
    });

    test("should return null when no count snapshots present", () => {
      const data = JSON.stringify([{ action: "hit" }, { action: "stand" }]);
      const avg = calculateAverageTrueCount(data);
      expect(avg).toBeNull();
    });

    test("should calculate average of single count", () => {
      const data = JSON.stringify([{ countSnapshot: { trueCount: 2 } }]);
      const avg = calculateAverageTrueCount(data);
      expect(avg).toBe(2);
    });

    test("should calculate average of multiple counts", () => {
      const data = JSON.stringify([
        { countSnapshot: { trueCount: 1 } },
        { countSnapshot: { trueCount: 3 } },
        { countSnapshot: { trueCount: 2 } },
      ]);
      const avg = calculateAverageTrueCount(data);
      expect(avg).toBe(2); // (1 + 3 + 2) / 3
    });

    test("should ignore decisions without count snapshot", () => {
      const data = JSON.stringify([
        { countSnapshot: { trueCount: 2 } },
        { action: "hit" },
        { countSnapshot: { trueCount: 4 } },
      ]);
      const avg = calculateAverageTrueCount(data);
      expect(avg).toBe(3); // (2 + 4) / 2
    });

    test("should handle negative counts", () => {
      const data = JSON.stringify([
        { countSnapshot: { trueCount: -2 } },
        { countSnapshot: { trueCount: 1 } },
        { countSnapshot: { trueCount: -1 } },
      ]);
      const avg = calculateAverageTrueCount(data);
      expect(avg).toBeCloseTo(-0.67, 2); // (-2 + 1 - 1) / 3
    });

    test("should handle fractional counts", () => {
      const data = JSON.stringify([
        { countSnapshot: { trueCount: 1.5 } },
        { countSnapshot: { trueCount: 2.5 } },
      ]);
      const avg = calculateAverageTrueCount(data);
      expect(avg).toBe(2); // (1.5 + 2.5) / 2
    });
  });

  describe("calculateSessionEV", () => {
    test("should calculate basic session EV with default rules", () => {
      const result = calculateSessionEV({
        totalWagered: 1000,
        actualValue: -50,
      });

      expect(result.totalWagered).toBe(1000);
      expect(result.baseHouseEdge).toBe(-0.5);
      expect(result.adjustedHouseEdge).toBe(-0.5);
      expect(result.countAdvantage).toBe(0);
      expect(result.finalEdge).toBe(-0.5);
      expect(result.expectedValue).toBe(-5); // 1000 * -0.005
      expect(result.actualValue).toBe(-50);
      expect(result.variance).toBe(-45); // -50 - (-5)
    });

    test("should calculate EV with strategy accuracy penalty", () => {
      const result = calculateSessionEV({
        totalWagered: 1000,
        actualValue: -100,
        strategyAccuracy: 90,
      });

      expect(result.adjustedHouseEdge).toBe(-0.8); // -0.5 - 0.3
      expect(result.expectedValue).toBe(-8); // 1000 * -0.008
    });

    test("should calculate EV with card counting advantage", () => {
      const decisionsData = JSON.stringify([
        { countSnapshot: { trueCount: 2 } },
        { countSnapshot: { trueCount: 4 } },
      ]);

      const result = calculateSessionEV({
        totalWagered: 1000,
        actualValue: 50,
        decisionsData,
      });

      expect(result.countAdvantage).toBe(1.5); // (2 + 4) / 2 * 0.5
      expect(result.finalEdge).toBe(1.0); // -0.5 + 1.5
      expect(result.expectedValue).toBe(10); // 1000 * 0.01
      expect(result.variance).toBe(40); // 50 - 10
    });

    test("should handle winning session", () => {
      const result = calculateSessionEV({
        totalWagered: 1000,
        actualValue: 200,
      });

      expect(result.variance).toBe(205); // 200 - (-5)
    });

    test("should handle zero wagered", () => {
      const result = calculateSessionEV({
        totalWagered: 0,
        actualValue: 0,
      });

      expect(result.expectedValue).toBe(-0); // 0 * -0.005 = -0
      expect(result.varanceInBB).toBe(0);
    });

    test("should calculate variance in big bets", () => {
      const result = calculateSessionEV({
        totalWagered: 10000,
        actualValue: 500,
      });

      // Variance = 500 - (-50) = 550
      // BB = 10000 / 100 = 100
      // Variance in BB = 550 / 100 = 5.5
      expect(result.varanceInBB).toBe(5.5);
    });

    test("should handle custom rules", () => {
      const customRules: GameRules = {
        decks: 1,
        dealerHitsSoft17: false,
        doubleAfterSplit: true,
        surrenderAllowed: true,
        blackjackPayout: 1.5,
      };

      const result = calculateSessionEV({
        totalWagered: 1000,
        actualValue: -20,
        rules: customRules,
      });

      expect(result.baseHouseEdge).toBe(-0.3);
      expect(result.expectedValue).toBe(-3);
    });
  });

  describe("getVarianceInterpretation", () => {
    test("should return 'Expected' for low variance", () => {
      const result = getVarianceInterpretation(0.5);
      expect(result.label).toBe("Expected");
      expect(result.color).toBe("gray");
    });

    test("should return 'Lucky' for slightly positive variance", () => {
      const result = getVarianceInterpretation(1.5);
      expect(result.label).toBe("Lucky");
      expect(result.color).toBe("green");
    });

    test("should return 'Unlucky' for slightly negative variance", () => {
      const result = getVarianceInterpretation(-1.5);
      expect(result.label).toBe("Unlucky");
      expect(result.color).toBe("yellow");
    });

    test("should return 'Very Lucky' for moderate positive variance", () => {
      const result = getVarianceInterpretation(2.5);
      expect(result.label).toBe("Very Lucky");
      expect(result.color).toBe("green");
    });

    test("should return 'Very Unlucky' for moderate negative variance", () => {
      const result = getVarianceInterpretation(-2.5);
      expect(result.label).toBe("Very Unlucky");
      expect(result.color).toBe("red");
    });

    test("should return 'Extremely Lucky' for high positive variance", () => {
      const result = getVarianceInterpretation(4);
      expect(result.label).toBe("Extremely Lucky");
      expect(result.color).toBe("green");
    });

    test("should return 'Extremely Unlucky' for high negative variance", () => {
      const result = getVarianceInterpretation(-4);
      expect(result.label).toBe("Extremely Unlucky");
      expect(result.color).toBe("red");
    });

    test("should handle boundary at 1", () => {
      expect(getVarianceInterpretation(0.99).label).toBe("Expected");
      expect(getVarianceInterpretation(1.01).label).toBe("Lucky");
    });

    test("should handle boundary at 2", () => {
      expect(getVarianceInterpretation(1.99).label).toBe("Lucky");
      expect(getVarianceInterpretation(2.01).label).toBe("Very Lucky");
    });

    test("should handle boundary at 3", () => {
      expect(getVarianceInterpretation(2.99).label).toBe("Very Lucky");
      expect(getVarianceInterpretation(3.01).label).toBe("Extremely Lucky");
    });
  });

  describe("formatEdge", () => {
    test("should format positive edge with + sign", () => {
      expect(formatEdge(1.5)).toBe("+1.50%");
    });

    test("should format negative edge without extra sign", () => {
      expect(formatEdge(-0.5)).toBe("-0.50%");
    });

    test("should format zero", () => {
      expect(formatEdge(0)).toBe("0.00%"); // Zero doesn't get + sign
    });

    test("should round to 2 decimal places", () => {
      expect(formatEdge(1.234)).toBe("+1.23%");
      expect(formatEdge(-2.678)).toBe("-2.68%");
    });
  });

  describe("formatMoney", () => {
    test("should format positive value with + sign", () => {
      expect(formatMoney(100)).toBe("+$100.00");
    });

    test("should format negative value (uses absolute)", () => {
      expect(formatMoney(-50)).toBe("$50.00"); // Uses Math.abs
    });

    test("should format zero (no + sign)", () => {
      expect(formatMoney(0)).toBe("$0.00"); // Zero doesn't get + sign
    });

    test("should round to 2 decimal places", () => {
      expect(formatMoney(123.456)).toBe("+$123.46");
      expect(formatMoney(-99.994)).toBe("$99.99"); // Uses Math.abs
    });
  });

  describe("calculateAdvantagePlayEV", () => {
    test("should calculate house-edge level with typical player errors", () => {
      const result = calculateAdvantagePlayEV({
        totalWagered: 1000,
        actualValue: -50,
        level: "house-edge",
      });

      expect(result.adjustedHouseEdge).toBe(-3.5); // -0.5 - 3.0
      expect(result.countAdvantage).toBe(0);
      expect(result.finalEdge).toBe(-3.5);
      expect(result.expectedValue).toBe(-35);
    });

    test("should calculate basic-strategy level", () => {
      const result = calculateAdvantagePlayEV({
        totalWagered: 1000,
        actualValue: -10,
        level: "basic-strategy",
        strategyAccuracy: 95,
      });

      expect(result.adjustedHouseEdge).toBe(-0.65); // -0.5 - 0.15
      expect(result.countAdvantage).toBe(0);
    });

    test("should calculate card-counting-conservative without data", () => {
      const result = calculateAdvantagePlayEV({
        totalWagered: 1000,
        actualValue: 10,
        level: "card-counting-conservative",
      });

      expect(result.adjustedHouseEdge).toBe(0.65);
      expect(result.finalEdge).toBe(0.65);
      expect(result.expectedValue).toBeCloseTo(6.5, 1);
    });

    test("should calculate card-counting-aggressive without data", () => {
      const result = calculateAdvantagePlayEV({
        totalWagered: 1000,
        actualValue: 20,
        level: "card-counting-aggressive",
      });

      expect(result.adjustedHouseEdge).toBe(1.25);
      expect(result.finalEdge).toBe(1.25);
      expect(result.expectedValue).toBeCloseTo(12.5, 1);
    });

    test("should calculate perfect-play without data", () => {
      const result = calculateAdvantagePlayEV({
        totalWagered: 1000,
        actualValue: 50,
        level: "perfect-play",
      });

      expect(result.adjustedHouseEdge).toBe(3.0);
      expect(result.finalEdge).toBe(3.0);
      expect(result.expectedValue).toBe(30);
    });

    test("should use actual count data for conservative counting", () => {
      const decisionsData = JSON.stringify([
        { countSnapshot: { trueCount: 3 } },
        { countSnapshot: { trueCount: 5 } },
      ]);

      const result = calculateAdvantagePlayEV({
        totalWagered: 1000,
        actualValue: 20,
        level: "card-counting-conservative",
        decisionsData,
      });

      // Should use count data if it results in better edge
      expect(result.countAdvantage).toBeGreaterThanOrEqual(0);
    });

    test("should handle custom average bet size", () => {
      const result = calculateAdvantagePlayEV({
        totalWagered: 1000,
        actualValue: 50,
        level: "basic-strategy",
        averageBetSize: 25,
      });

      expect(result.varanceInBB).toBe((50 - -5) / 25);
    });
  });

  describe("getAdvantagePlayDescription", () => {
    test("should return description for house-edge", () => {
      const desc = getAdvantagePlayDescription("house-edge");
      expect(desc).toContain("recreational player");
      expect(desc).toContain("3%");
    });

    test("should return description for basic-strategy", () => {
      const desc = getAdvantagePlayDescription("basic-strategy");
      expect(desc).toContain("Perfect basic strategy");
      expect(desc).toContain("0.5%");
    });

    test("should return description for card-counting-conservative", () => {
      const desc = getAdvantagePlayDescription("card-counting-conservative");
      expect(desc).toContain("1-4 unit spread");
      expect(desc).toContain("0.65%");
    });

    test("should return description for card-counting-aggressive", () => {
      const desc = getAdvantagePlayDescription("card-counting-aggressive");
      expect(desc).toContain("1-8 unit spread");
      expect(desc).toContain("1.25%");
    });

    test("should return description for perfect-play", () => {
      const desc = getAdvantagePlayDescription("perfect-play");
      expect(desc).toContain("perfect information");
      expect(desc).toContain("3%");
    });
  });

  describe("calculateHandEV", () => {
    test("should calculate EV for basic hand with correct decision", () => {
      const result = calculateHandEV({
        betAmount: 100,
        actualValue: -100,
        isCorrectDecision: true,
      });

      expect(result.betAmount).toBe(100);
      expect(result.baseHouseEdge).toBe(-0.5);
      expect(result.countAdvantage).toBe(0);
      expect(result.finalEdge).toBe(-0.5);
      expect(result.expectedValue).toBe(-0.5); // 100 * -0.005
      expect(result.actualValue).toBe(-100);
      expect(result.variance).toBe(-99.5);
    });

    test("should penalize incorrect decision", () => {
      const result = calculateHandEV({
        betAmount: 100,
        actualValue: -100,
        isCorrectDecision: false,
      });

      expect(result.finalEdge).toBe(-2.5); // -0.5 - 2.0
      expect(result.expectedValue).toBe(-2.5);
    });

    test("should include count advantage", () => {
      const result = calculateHandEV({
        betAmount: 100,
        actualValue: 150,
        trueCount: 4,
      });

      expect(result.trueCount).toBe(4);
      expect(result.countAdvantage).toBe(2.0); // 4 * 0.5
      expect(result.finalEdge).toBe(1.5); // -0.5 + 2.0
      expect(result.expectedValue).toBe(1.5);
    });

    test("should handle negative true count", () => {
      const result = calculateHandEV({
        betAmount: 50,
        actualValue: -50,
        trueCount: -2,
      });

      expect(result.countAdvantage).toBe(-1.0);
      expect(result.finalEdge).toBe(-1.5); // -0.5 - 1.0
    });

    test("should handle winning hand", () => {
      const result = calculateHandEV({
        betAmount: 100,
        actualValue: 150, // Won $150 profit
        trueCount: 2,
      });

      expect(result.countAdvantage).toBe(1.0);
      expect(result.finalEdge).toBe(0.5);
      expect(result.expectedValue).toBe(0.5);
      expect(result.variance).toBe(149.5); // 150 - 0.5
    });

    test("should handle custom rules", () => {
      const customRules: GameRules = {
        decks: 1,
        dealerHitsSoft17: false,
        doubleAfterSplit: true,
        surrenderAllowed: true,
        blackjackPayout: 1.5,
      };

      const result = calculateHandEV({
        betAmount: 100,
        actualValue: 0,
        rules: customRules,
      });

      expect(result.baseHouseEdge).toBe(-0.3);
    });

    test("should handle blackjack win", () => {
      const result = calculateHandEV({
        betAmount: 100,
        actualValue: 150, // 3:2 blackjack payout
        trueCount: 0,
      });

      expect(result.actualValue).toBe(150);
      expect(result.variance).toBeGreaterThan(0);
    });

    test("should handle push", () => {
      const result = calculateHandEV({
        betAmount: 100,
        actualValue: 0,
      });

      expect(result.actualValue).toBe(0);
      expect(result.variance).toBeCloseTo(0.5, 1); // Slightly better than expected
    });
  });

  describe("betting spreads", () => {
    test("CONSERVATIVE_SPREAD should have correct structure", () => {
      expect(CONSERVATIVE_SPREAD.minBet).toBe(1);
      expect(CONSERVATIVE_SPREAD.maxBet).toBe(4);
      expect(CONSERVATIVE_SPREAD.spreadByCount["-2"]).toBe(1);
      expect(CONSERVATIVE_SPREAD.spreadByCount["3"]).toBe(4);
    });

    test("AGGRESSIVE_SPREAD should have correct structure", () => {
      expect(AGGRESSIVE_SPREAD.minBet).toBe(1);
      expect(AGGRESSIVE_SPREAD.maxBet).toBe(8);
      expect(AGGRESSIVE_SPREAD.spreadByCount["-2"]).toBe(1);
      expect(AGGRESSIVE_SPREAD.spreadByCount["4"]).toBe(8);
    });

    test("AGGRESSIVE_SPREAD should have larger max bet than CONSERVATIVE", () => {
      expect(AGGRESSIVE_SPREAD.maxBet).toBeGreaterThan(
        CONSERVATIVE_SPREAD.maxBet,
      );
    });
  });

  describe("edge cases", () => {
    test("should handle very large wagers", () => {
      const result = calculateSessionEV({
        totalWagered: 1000000,
        actualValue: 10000,
      });

      expect(result.expectedValue).toBe(-5000);
      expect(result.variance).toBe(15000);
    });

    test("should handle very small wagers", () => {
      const result = calculateSessionEV({
        totalWagered: 1,
        actualValue: 0,
      });

      expect(result.expectedValue).toBeCloseTo(-0.005, 3);
    });

    test("should handle extreme positive variance", () => {
      const result = getVarianceInterpretation(10);
      expect(result.label).toBe("Extremely Lucky");
    });

    test("should handle extreme negative variance", () => {
      const result = getVarianceInterpretation(-10);
      expect(result.label).toBe("Extremely Unlucky");
    });

    test("should handle malformed decisions data gracefully", () => {
      const result = calculateSessionEV({
        totalWagered: 1000,
        actualValue: 0,
        decisionsData: "{invalid json",
      });

      expect(result.countAdvantage).toBe(0);
    });
  });
});
