import { beforeEach, describe, expect, test } from "bun:test";
import { RuleSet } from "./builder";
import { validateBet, isValidBet, getBettingLimits } from "./bet-validator";
import type { CompleteRuleSet } from "./types";

describe("BetValidator", () => {
  let standardRules: CompleteRuleSet;

  beforeEach(() => {
    standardRules = new RuleSet()
      .setDealerStand("s17")
      .setTableLimits(5, 1000, 5)
      .build();
  });

  describe("validateBet", () => {
    test("should accept valid bet within range", () => {
      const result = validateBet(100, standardRules);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test("should accept minimum bet", () => {
      const result = validateBet(5, standardRules);
      expect(result.valid).toBe(true);
    });

    test("should accept maximum bet", () => {
      const result = validateBet(1000, standardRules);
      expect(result.valid).toBe(true);
    });

    test("should reject bet below minimum", () => {
      const result = validateBet(4, standardRules);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("below table minimum");
      expect(result.error).toContain("$4");
      expect(result.error).toContain("$5");
    });

    test("should reject bet above maximum", () => {
      const result = validateBet(1001, standardRules);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds table maximum");
      expect(result.error).toContain("$1001");
      expect(result.error).toContain("$1000");
    });

    test("should reject zero bet", () => {
      const result = validateBet(0, standardRules);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("greater than zero");
      expect(result.error).toContain("$0");
    });

    test("should reject negative bet", () => {
      const result = validateBet(-10, standardRules);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("greater than zero");
    });

    test("should accept bet that is multiple of unit", () => {
      const result = validateBet(25, standardRules);
      expect(result.valid).toBe(true);
    });

    test("should reject bet that is not multiple of unit", () => {
      const result = validateBet(23, standardRules);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("multiple of $5");
      expect(result.error).toContain("$23");
    });

    test("should handle fractional unit (e.g., $0.25)", () => {
      const quarterRules = new RuleSet()
        .setTableLimits(0.25, 1000, 0.25)
        .build();

      const validResult = validateBet(5.25, quarterRules);
      expect(validResult.valid).toBe(true);

      const invalidResult = validateBet(5.3, quarterRules);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain("multiple of $0.25");
    });

    test("should accept any bet when unit is 1", () => {
      const anyUnitRules = new RuleSet().setTableLimits(5, 1000, 1).build();

      expect(validateBet(17, anyUnitRules).valid).toBe(true);
      expect(validateBet(99, anyUnitRules).valid).toBe(true);
      expect(validateBet(537, anyUnitRules).valid).toBe(true);
    });

    test("should handle no unit restriction (unit = 0)", () => {
      const noUnitRules = new RuleSet().setTableLimits(5, 1000, 0).build();

      expect(validateBet(5.37, noUnitRules).valid).toBe(true);
      expect(validateBet(99.99, noUnitRules).valid).toBe(true);
    });

    test("should handle edge case: minimum equals maximum", () => {
      const fixedBetRules = new RuleSet().setTableLimits(100, 100, 100).build();

      expect(validateBet(100, fixedBetRules).valid).toBe(true);
      expect(validateBet(99, fixedBetRules).valid).toBe(false);
      expect(validateBet(101, fixedBetRules).valid).toBe(false);
    });

    test("should validate large bets correctly", () => {
      const highRollerRules = new RuleSet()
        .setTableLimits(1000, 100000, 1000)
        .build();

      expect(validateBet(50000, highRollerRules).valid).toBe(true);
      expect(validateBet(50500, highRollerRules).valid).toBe(false);
      expect(validateBet(100000, highRollerRules).valid).toBe(true);
      expect(validateBet(100001, highRollerRules).valid).toBe(false);
    });

    test("should validate penny bets correctly", () => {
      const pennyRules = new RuleSet().setTableLimits(0.01, 10, 0.01).build();

      expect(validateBet(0.01, pennyRules).valid).toBe(true);
      expect(validateBet(5.47, pennyRules).valid).toBe(true);
      expect(validateBet(0.005, pennyRules).valid).toBe(false);
    });
  });

  describe("isValidBet", () => {
    test("should return true for valid bet", () => {
      expect(isValidBet(100, standardRules)).toBe(true);
    });

    test("should return false for invalid bet (below minimum)", () => {
      expect(isValidBet(3, standardRules)).toBe(false);
    });

    test("should return false for invalid bet (above maximum)", () => {
      expect(isValidBet(2000, standardRules)).toBe(false);
    });

    test("should return false for invalid bet (not multiple of unit)", () => {
      expect(isValidBet(23, standardRules)).toBe(false);
    });

    test("should return false for zero bet", () => {
      expect(isValidBet(0, standardRules)).toBe(false);
    });
  });

  describe("getBettingLimits", () => {
    test("should return correct limits", () => {
      const limits = getBettingLimits(standardRules);
      expect(limits.min).toBe(5);
      expect(limits.max).toBe(1000);
      expect(limits.unit).toBe(5);
    });

    test("should return limits for different table", () => {
      const vipRules = new RuleSet().setTableLimits(100, 50000, 25).build();

      const limits = getBettingLimits(vipRules);
      expect(limits.min).toBe(100);
      expect(limits.max).toBe(50000);
      expect(limits.unit).toBe(25);
    });

    test("should return limits even with unit of 1", () => {
      const flexibleRules = new RuleSet().setTableLimits(10, 5000, 1).build();

      const limits = getBettingLimits(flexibleRules);
      expect(limits.min).toBe(10);
      expect(limits.max).toBe(5000);
      expect(limits.unit).toBe(1);
    });
  });

  describe("Floating point precision", () => {
    test("should handle floating point comparison correctly for valid bets", () => {
      const rules = new RuleSet().setTableLimits(0.01, 100, 0.01).build();

      // These should work despite floating point arithmetic
      expect(validateBet(0.03, rules).valid).toBe(true);
      expect(validateBet(1.11, rules).valid).toBe(true);
      expect(validateBet(99.99, rules).valid).toBe(true);
    });

    test("should use tolerance for floating point errors", () => {
      const rules = new RuleSet().setTableLimits(0.01, 100, 0.1).build();

      // Test cases that might have floating point issues
      expect(validateBet(1.2, rules).valid).toBe(true);
      expect(validateBet(5.4, rules).valid).toBe(true);
      expect(validateBet(10.1, rules).valid).toBe(true);
    });
  });

  describe("Edge cases and boundary conditions", () => {
    test("should handle very small minimum bet", () => {
      const microRules = new RuleSet().setTableLimits(0.001, 10, 0.001).build();

      expect(validateBet(0.001, microRules).valid).toBe(true);
      expect(validateBet(0.0005, microRules).valid).toBe(false);
    });

    test("should handle very large maximum bet", () => {
      const whaleRules = new RuleSet()
        .setTableLimits(10000, 10000000, 10000)
        .build();

      expect(validateBet(10000000, whaleRules).valid).toBe(true);
      expect(validateBet(10000001, whaleRules).valid).toBe(false);
    });

    test("should validate boundary values precisely", () => {
      expect(validateBet(5.0, standardRules).valid).toBe(true);
      expect(validateBet(4.99, standardRules).valid).toBe(false);
      expect(validateBet(1000.0, standardRules).valid).toBe(true);
      expect(validateBet(1000.01, standardRules).valid).toBe(false);
    });
  });
});
