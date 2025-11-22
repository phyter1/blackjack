import { beforeEach, describe, expect, test } from "bun:test";
import {
  ACTION_DOUBLE,
  ACTION_HIT,
  ACTION_SPLIT,
  ACTION_STAND,
  ACTION_SURRENDER,
} from "../action";
import type { Card } from "../cards";
import { RuleSet } from "./builder";
import { getRuleBasedActions } from "./action-validator";
import type { CompleteRuleSet } from "./types";
import {
  doubleOnTwoRule,
  hitSplitAceRule,
  maxSplitRule,
  rsaRule,
} from "./types";

// Test helper to create a mock hand object
function createMockHand(options: {
  cards: Card[];
  state?: "active" | "busted" | "blackjack" | "stood" | "surrendered";
  isSplit?: boolean;
  isSplitAce?: boolean;
}) {
  const cards = options.cards;
  let total = 0;
  let aces = 0;

  // Calculate hand value
  for (const card of cards) {
    if (card.rank === "A") {
      aces += 1;
      total += 11;
    } else if (["K", "Q", "J"].includes(card.rank)) {
      total += 10;
    } else {
      total += parseInt(card.rank, 10);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return {
    cards,
    handValue: total,
    state: options.state || "active",
    isSplit: options.isSplit || false,
    isSplitAce: options.isSplitAce || false,
  };
}

describe("ActionValidator", () => {
  let standardRules: RuleSet;

  beforeEach(() => {
    standardRules = new RuleSet()
      .setDealerStand("s17")
      .setBlackjackPayout(3, 2)
      .setDoubleRestriction("9-11")
      .setDoubleAfterSplit(true)
      .setRule(hitSplitAceRule(false))
      .setRule(rsaRule(false))
      .setRule(maxSplitRule(3))
      .setSurrender("late");
  });

  describe("getRuleBasedActions - Basic scenarios", () => {
    test("should return only stand for hand value of 21", () => {
      const hand = createMockHand({
        cards: [
          { rank: "K", suit: "♠" },
          { rank: "A", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).toEqual([ACTION_STAND]);
    });

    test("should return empty array for busted hand", () => {
      const hand = createMockHand({
        cards: [
          { rank: "K", suit: "♠" },
          { rank: "Q", suit: "♥" },
          { rank: "5", suit: "♦" },
        ],
        state: "busted",
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).toEqual([]);
    });

    test("should return empty array for blackjack hand", () => {
      const hand = createMockHand({
        cards: [
          { rank: "K", suit: "♠" },
          { rank: "A", suit: "♥" },
        ],
        state: "blackjack",
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).toEqual([]);
    });

    test("should return hit and stand for basic hand", () => {
      const hand = createMockHand({
        cards: [
          { rank: "7", suit: "♠" },
          { rank: "8", suit: "♥" },
          { rank: "3", suit: "♦" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).toContain(ACTION_HIT);
      expect(actions).toContain(ACTION_STAND);
      expect(actions).not.toContain(ACTION_DOUBLE);
      expect(actions).not.toContain(ACTION_SPLIT);
    });
  });

  describe("getRuleBasedActions - Double down", () => {
    test("should allow double on first two cards in range", () => {
      const hand = createMockHand({
        cards: [
          { rank: "5", suit: "♠" },
          { rank: "5", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).toContain(ACTION_DOUBLE);
    });

    test("should allow double on 11", () => {
      const hand = createMockHand({
        cards: [
          { rank: "6", suit: "♠" },
          { rank: "5", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).toContain(ACTION_DOUBLE);
    });

    test("should not allow double outside range", () => {
      const hand = createMockHand({
        cards: [
          { rank: "3", suit: "♠" },
          { rank: "4", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).not.toContain(ACTION_DOUBLE);
    });

    test("should not allow double after hitting", () => {
      const hand = createMockHand({
        cards: [
          { rank: "5", suit: "♠" },
          { rank: "4", suit: "♥" },
          { rank: "2", suit: "♦" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).not.toContain(ACTION_DOUBLE);
    });

    test("should allow double on soft hands in range", () => {
      const hand = createMockHand({
        cards: [
          { rank: "A", suit: "♠" },
          { rank: "8", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).toContain(ACTION_DOUBLE);
    });

    test("should allow double after split when DAS is enabled", () => {
      const hand = createMockHand({
        cards: [
          { rank: "5", suit: "♠" },
          { rank: "5", suit: "♥" },
        ],
        isSplit: true,
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).toContain(ACTION_DOUBLE);
    });

    test("should not allow double after split when DAS is disabled", () => {
      const noDasRules = new RuleSet()
        .setDealerStand("s17")
        .setDoubleRestriction("9-11")
        .setDoubleAfterSplit(false)
        ;

      const hand = createMockHand({
        cards: [
          { rank: "5", suit: "♠" },
          { rank: "5", suit: "♥" },
        ],
        isSplit: true,
      });

      const actions = noDasRules.getRuleBasedActions(hand as any);
      expect(actions).not.toContain(ACTION_DOUBLE);
    });

    test("should not allow double on split aces", () => {
      const hand = createMockHand({
        cards: [
          { rank: "A", suit: "♠" },
          { rank: "9", suit: "♥" },
        ],
        isSplitAce: true,
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).not.toContain(ACTION_DOUBLE);
    });

    test("should allow double when no range restriction", () => {
      const anyDoubleRules = new RuleSet()
        .setDealerStand("s17")
        .setDoubleRestriction("any")
        ;

      const hand = createMockHand({
        cards: [
          { rank: "3", suit: "♠" },
          { rank: "4", suit: "♥" },
        ],
      });

      const actions = anyDoubleRules.getRuleBasedActions(hand as any);
      expect(actions).toContain(ACTION_DOUBLE);
    });

    test("should not allow double when doubling is disabled", () => {
      const noDoubleRules = new RuleSet()
        .setDealerStand("s17")
        .setRule(doubleOnTwoRule(false))
        ;

      const hand = createMockHand({
        cards: [
          { rank: "5", suit: "♠" },
          { rank: "6", suit: "♥" },
        ],
      });

      const actions = noDoubleRules.getRuleBasedActions(hand as any);
      expect(actions).not.toContain(ACTION_DOUBLE);
    });
  });

  describe("getRuleBasedActions - Split", () => {
    test("should allow split on matching pair", () => {
      const hand = createMockHand({
        cards: [
          { rank: "8", suit: "♠" },
          { rank: "8", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).toContain(ACTION_SPLIT);
    });

    test("should not allow split on non-matching cards", () => {
      const hand = createMockHand({
        cards: [
          { rank: "8", suit: "♠" },
          { rank: "7", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).not.toContain(ACTION_SPLIT);
    });

    test("should not allow split after hitting", () => {
      const hand = createMockHand({
        cards: [
          { rank: "8", suit: "♠" },
          { rank: "8", suit: "♥" },
          { rank: "5", suit: "♦" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).not.toContain(ACTION_SPLIT);
    });

    test("should allow split on aces first time", () => {
      const hand = createMockHand({
        cards: [
          { rank: "A", suit: "♠" },
          { rank: "A", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any, undefined, 0);
      expect(actions).toContain(ACTION_SPLIT);
    });

    test("should not allow resplit aces when RSA disabled", () => {
      const hand = createMockHand({
        cards: [
          { rank: "A", suit: "♠" },
          { rank: "A", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any, undefined, 1);
      expect(actions).not.toContain(ACTION_SPLIT);
    });

    test("should allow resplit aces when RSA enabled", () => {
      const rsaRules = new RuleSet()
        .setDealerStand("s17")
        .setRule(rsaRule(true))
        .setRule(maxSplitRule(3))
        ;

      const hand = createMockHand({
        cards: [
          { rank: "A", suit: "♠" },
          { rank: "A", suit: "♥" },
        ],
      });

      const actions = rsaRules.getRuleBasedActions(hand as any, undefined, 1);
      expect(actions).toContain(ACTION_SPLIT);
    });

    test("should not allow split beyond max splits", () => {
      const hand = createMockHand({
        cards: [
          { rank: "8", suit: "♠" },
          { rank: "8", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any, undefined, 3);
      expect(actions).not.toContain(ACTION_SPLIT);
    });

    test("should not allow split from already split aces", () => {
      const hand = createMockHand({
        cards: [
          { rank: "A", suit: "♠" },
          { rank: "A", suit: "♥" },
        ],
        isSplitAce: true,
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).not.toContain(ACTION_SPLIT);
    });
  });

  describe("getRuleBasedActions - Surrender", () => {
    test("should allow surrender on first two cards with late surrender", () => {
      const hand = createMockHand({
        cards: [
          { rank: "10", suit: "♠" },
          { rank: "6", suit: "♥" },
        ],
      });

      const dealerUpCard: Card = { rank: "10", suit: "♦" };
      const actions = standardRules.getRuleBasedActions(hand as any, dealerUpCard);
      expect(actions).toContain(ACTION_SURRENDER);
    });

    test("should allow surrender with early surrender", () => {
      const earlyRules = new RuleSet()
        .setDealerStand("s17")
        .setSurrender("early")
        ;

      const hand = createMockHand({
        cards: [
          { rank: "10", suit: "♠" },
          { rank: "6", suit: "♥" },
        ],
      });

      const dealerUpCard: Card = { rank: "A", suit: "♦" };
      const actions = earlyRules.getRuleBasedActions(hand as any, dealerUpCard);
      expect(actions).toContain(ACTION_SURRENDER);
    });

    test("should not allow surrender after hitting", () => {
      const hand = createMockHand({
        cards: [
          { rank: "10", suit: "♠" },
          { rank: "6", suit: "♥" },
          { rank: "2", suit: "♦" },
        ],
      });

      const dealerUpCard: Card = { rank: "10", suit: "♣" };
      const actions = standardRules.getRuleBasedActions(hand as any, dealerUpCard);
      expect(actions).not.toContain(ACTION_SURRENDER);
    });

    test("should not allow surrender on split hands", () => {
      const hand = createMockHand({
        cards: [
          { rank: "10", suit: "♠" },
          { rank: "6", suit: "♥" },
        ],
        isSplit: true,
      });

      const dealerUpCard: Card = { rank: "10", suit: "♦" };
      const actions = standardRules.getRuleBasedActions(hand as any, dealerUpCard);
      expect(actions).not.toContain(ACTION_SURRENDER);
    });

    test("should not allow surrender when disabled", () => {
      const noSurrenderRules = new RuleSet()
        .setDealerStand("s17")
        .setSurrender("none")
        ;

      const hand = createMockHand({
        cards: [
          { rank: "10", suit: "♠" },
          { rank: "6", suit: "♥" },
        ],
      });

      const dealerUpCard: Card = { rank: "10", suit: "♦" };
      const actions = noSurrenderRules.getRuleBasedActions(hand as any, dealerUpCard);
      expect(actions).not.toContain(ACTION_SURRENDER);
    });
  });

  describe("getRuleBasedActions - Split aces special rules", () => {
    test("should not allow hit on split aces when hit split aces disabled", () => {
      const hand = createMockHand({
        cards: [
          { rank: "A", suit: "♠" },
          { rank: "9", suit: "♥" },
        ],
        isSplitAce: true,
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).not.toContain(ACTION_HIT);
      expect(actions).toContain(ACTION_STAND);
    });

    test("should allow hit on split aces when hit split aces enabled", () => {
      const hitSplitAcesRules = new RuleSet()
        .setDealerStand("s17")
        .setRule(hitSplitAceRule(true))
        ;

      const hand = createMockHand({
        cards: [
          { rank: "A", suit: "♠" },
          { rank: "9", suit: "♥" },
        ],
        isSplitAce: true,
      });

      const actions = hitSplitAcesRules.getRuleBasedActions(hand as any);
      expect(actions).toContain(ACTION_HIT);
      expect(actions).toContain(ACTION_STAND);
    });

    test("should allow hit and stand on split aces with multiple cards when hitting is enabled", () => {
      const hitSplitAcesRules = new RuleSet()
        .setDealerStand("s17")
        .setRule(hitSplitAceRule(true));

      const hand = createMockHand({
        cards: [
          { rank: "A", suit: "♠" },
          { rank: "5", suit: "♥" },
          { rank: "3", suit: "♦" },
        ],
        isSplitAce: true,
      });

      const actions = hitSplitAcesRules.getRuleBasedActions(hand as any);
      expect(actions).toContain(ACTION_HIT);
      expect(actions).toContain(ACTION_STAND);
    });
  });

  describe("getRuleBasedActions - Edge cases", () => {
    test("should handle hand with soft ace correctly", () => {
      const hand = createMockHand({
        cards: [
          { rank: "A", suit: "♠" },
          { rank: "5", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).toContain(ACTION_HIT);
      expect(actions).toContain(ACTION_STAND);
      expect(actions).not.toContain(ACTION_SPLIT);
    });

    test("should handle multiple face cards as split candidates", () => {
      const hand = createMockHand({
        cards: [
          { rank: "K", suit: "♠" },
          { rank: "K", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).toContain(ACTION_SPLIT);
      expect(actions).toContain(ACTION_STAND);
      expect(actions).not.toContain(ACTION_DOUBLE); // 20 is outside [9,11]
    });

    test("should handle low value pairs", () => {
      const hand = createMockHand({
        cards: [
          { rank: "2", suit: "♠" },
          { rank: "2", suit: "♥" },
        ],
      });

      const actions = standardRules.getRuleBasedActions(hand as any);
      expect(actions).toContain(ACTION_SPLIT);
      expect(actions).toContain(ACTION_HIT);
      expect(actions).toContain(ACTION_STAND);
      expect(actions).not.toContain(ACTION_DOUBLE); // 4 is outside [9,11]
    });
  });
});
