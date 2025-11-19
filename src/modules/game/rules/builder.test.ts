import { describe, expect, test } from "bun:test";
import { RuleSet } from "./builder";
import { COMMON_RULESETS } from "./presets";

describe("RuleSet Builder", () => {
  describe("constructor", () => {
    test("should initialize with default rules", () => {
      const rules = new RuleSet();
      const built = rules.build();
      expect(built).toBeDefined();
      expect(built.houseEdge).toBeDefined();
    });
  });

  describe("setDealerStand", () => {
    test("should set s17 rule", () => {
      const rules = new RuleSet().setDealerStand("s17").build();
      expect(rules.dealerStand.variant).toBe("s17");
    });

    test("should set h17 rule", () => {
      const rules = new RuleSet().setDealerStand("h17").build();
      expect(rules.dealerStand.variant).toBe("h17");
    });
  });

  describe("setDeckCount", () => {
    test("should set deck count to 6", () => {
      const rules = new RuleSet().setDeckCount(6).build();
      expect(rules.deckCount.count).toBe(6);
    });

    test("should set deck count to 1", () => {
      const rules = new RuleSet().setDeckCount(1).build();
      expect(rules.deckCount.count).toBe(1);
    });

    test("should set deck count to 8", () => {
      const rules = new RuleSet().setDeckCount(8).build();
      expect(rules.deckCount.count).toBe(8);
    });
  });

  describe("setBlackjackPayout", () => {
    test("should set 3:2 payout", () => {
      const rules = new RuleSet().setBlackjackPayout(3, 2).build();
      const payout = rules.blackjackPayout.function(100);
      expect(payout).toBe(150); // 100 * (3/2)
    });

    test("should set 6:5 payout", () => {
      const rules = new RuleSet().setBlackjackPayout(6, 5).build();
      const payout = rules.blackjackPayout.function(100);
      expect(payout).toBe(120); // 100 * (6/5)
    });

    test("should set 1:1 payout", () => {
      const rules = new RuleSet().setBlackjackPayout(1, 1).build();
      const payout = rules.blackjackPayout.function(100);
      expect(payout).toBe(100); // 100 * (1/1)
    });
  });

  describe("setSurrender", () => {
    test("should set late surrender", () => {
      const rules = new RuleSet().setSurrender("late").build();
      expect(rules.lateSurrender.allowed).toBe(true);
      expect(rules.earlySurrender.allowed).toBe(false);
    });

    test("should set early surrender", () => {
      const rules = new RuleSet().setSurrender("early").build();
      expect(rules.lateSurrender.allowed).toBe(true);
      expect(rules.earlySurrender.allowed).toBe(true);
    });

    test("should set no surrender", () => {
      const rules = new RuleSet().setSurrender("none").build();
      expect(rules.lateSurrender.allowed).toBe(false);
      expect(rules.earlySurrender.allowed).toBe(false);
    });
  });

  describe("setDoubleAfterSplit", () => {
    test("should allow double after split", () => {
      const rules = new RuleSet().setDoubleAfterSplit(true).build();
      expect(rules.doubleAfterSplit.allowed).toBe(true);
    });

    test("should disallow double after split", () => {
      const rules = new RuleSet().setDoubleAfterSplit(false).build();
      expect(rules.doubleAfterSplit.allowed).toBe(false);
    });
  });

  describe("setDoubleRestriction", () => {
    test("should set double on any", () => {
      const rules = new RuleSet().setDoubleRestriction("any").build();
      expect(rules.doubleOnTwo.allowed).toBe(true);
    });

    test("should set double on 9-11", () => {
      const rules = new RuleSet().setDoubleRestriction("9-11").build();
      expect(rules.doubleOnTwo.allowed).toBe(true);
      expect(rules.doubleOnTwo.range).toEqual([9, 11]);
    });

    test("should set double on 10-11", () => {
      const rules = new RuleSet().setDoubleRestriction("10-11").build();
      expect(rules.doubleOnTwo.allowed).toBe(true);
      expect(rules.doubleOnTwo.range).toEqual([10, 11]);
    });

    test("should set double on 11 only", () => {
      const rules = new RuleSet().setDoubleRestriction("11").build();
      expect(rules.doubleOnTwo.allowed).toBe(true);
      expect(rules.doubleOnTwo.range).toEqual([11, 11]);
    });
  });

  describe("fluent API chaining", () => {
    test("should chain multiple rule configurations", () => {
      const rules = new RuleSet()
        .setDealerStand("s17")
        .setDeckCount(6)
        .setBlackjackPayout(3, 2)
        .setSurrender("late")
        .setDoubleAfterSplit(true)
        .build();

      expect(rules.dealerStand.variant).toBe("s17");
      expect(rules.deckCount.count).toBe(6);
      expect(rules.lateSurrender.allowed).toBe(true);
      expect(rules.doubleAfterSplit.allowed).toBe(true);
    });

    test("should allow resetting and reconfiguring", () => {
      const rules = new RuleSet()
        .setDealerStand("h17")
        .reset()
        .setDealerStand("s17")
        .build();

      expect(rules.dealerStand.variant).toBe("s17");
    });
  });

  describe("build", () => {
    test("should calculate house edge", () => {
      const rules = new RuleSet()
        .setDealerStand("s17")
        .setDeckCount(6)
        .setBlackjackPayout(3, 2)
        .build();

      expect(rules.houseEdge).toBeDefined();
      expect(typeof rules.houseEdge).toBe("number");
    });

    test("should include all rule properties", () => {
      const rules = new RuleSet().build();

      expect(rules.dealerStand).toBeDefined();
      expect(rules.dealerPeek).toBeDefined();
      expect(rules.doubleAfterSplit).toBeDefined();
      expect(rules.doubleOnTwo).toBeDefined();
      expect(rules.resplitAces).toBeDefined();
      expect(rules.hitSplitAces).toBeDefined();
      expect(rules.maxSplit).toBeDefined();
      expect(rules.lateSurrender).toBeDefined();
      expect(rules.earlySurrender).toBeDefined();
      expect(rules.blackjackPayout).toBeDefined();
      expect(rules.deckCount).toBeDefined();
      expect(rules.blackjackTie).toBeDefined();
      expect(rules.charlie).toBeDefined();
      expect(rules.dealer22Push).toBeDefined();
      expect(rules.houseEdge).toBeDefined();
    });
  });

  describe("reset", () => {
    test("should reset to default rules", () => {
      const rules = new RuleSet()
        .setDealerStand("h17")
        .setDeckCount(8)
        .reset()
        .build();

      // Should have default values after reset
      const defaultRules = new RuleSet().build();
      expect(rules.dealerStand.variant).toBe(defaultRules.dealerStand.variant);
      expect(rules.deckCount.count).toBe(defaultRules.deckCount.count);
    });
  });
});

describe("COMMON_RULESETS", () => {
  test("Vegas Strip ruleset should be defined", () => {
    const rules = COMMON_RULESETS.vegasStrip().build();
    expect(rules.dealerStand.variant).toBe("s17");
    expect(rules.deckCount.count).toBe(4);
    expect(rules.doubleAfterSplit.allowed).toBe(true);
    expect(rules.lateSurrender.allowed).toBe(true);
  });

  test("Atlantic City ruleset should be defined", () => {
    const rules = COMMON_RULESETS.atlanticCity().build();
    expect(rules.dealerStand.variant).toBe("s17");
    expect(rules.deckCount.count).toBe(8);
    expect(rules.doubleAfterSplit.allowed).toBe(true);
    expect(rules.lateSurrender.allowed).toBe(true);
  });

  test("Downtown ruleset should be defined", () => {
    const rules = COMMON_RULESETS.downtown().build();
    expect(rules.dealerStand.variant).toBe("h17");
    expect(rules.deckCount.count).toBe(2);
  });

  test("Single Deck ruleset should be defined", () => {
    const rules = COMMON_RULESETS.singleDeck().build();
    expect(rules.deckCount.count).toBe(1);
    expect(rules.dealerStand.variant).toBe("h17");
    expect(rules.doubleAfterSplit.allowed).toBe(false);
  });

  test("Liberal ruleset should be defined", () => {
    const rules = COMMON_RULESETS.liberal().build();
    expect(rules.dealerStand.variant).toBe("s17");
    expect(rules.deckCount.count).toBe(4);
    expect(rules.doubleAfterSplit.allowed).toBe(true);
    expect(rules.lateSurrender.allowed).toBe(true);
    expect(rules.resplitAces.allowed).toBe(true);
  });

  test("Terrible 6:5 ruleset should be defined", () => {
    const rules = COMMON_RULESETS.terrible65().build();
    const payout = rules.blackjackPayout.function(100);
    expect(payout).toBe(120); // 6:5 payout
    expect(rules.dealerStand.variant).toBe("h17");
    expect(rules.deckCount.count).toBe(8);
  });
});
