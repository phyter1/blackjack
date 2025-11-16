import {
  ACTION_DOUBLE,
  ACTION_HIT,
  ACTION_SPLIT,
  ACTION_STAND,
  ACTION_SURRENDER,
  type ActionType,
} from "./action";
import type { Card } from "./cards";
import type { Hand } from "./hand";

export const DEALER_STAND_RULE = "dealer_stand" as const;
export type DealerStandRule = {
  type: typeof DEALER_STAND_RULE;
  variant: "s17" | "h17";
};
export const dealerStandRule = (variant: "s17" | "h17") => {
  return {
    type: DEALER_STAND_RULE,
    variant,
  };
};

export const DEALER_PEEK_RULE = "dealer_peek" as const;
export type DealerPeekRule = {
  type: typeof DEALER_PEEK_RULE;
  allowed: boolean;
};
export const dealerPeekRule = (allowed: boolean) => {
  return {
    type: DEALER_PEEK_RULE,
    allowed,
  };
};

export const DAS_RULE = "double_after_split" as const;
export type DASRule = {
  type: typeof DAS_RULE;
  allowed: boolean;
};
export const dasRule = (allowed: boolean) => {
  return {
    type: DAS_RULE,
    allowed,
  };
};

export const DOUBLE_ON_TWO_RULE = "double_on_two" as const;
export type DoubleOnTwoRule = { // Fixed typo
  type: typeof DOUBLE_ON_TWO_RULE;
  allowed: boolean;
  range?: [number, number];
};
export const doubleOnTwoRule = (allowed: boolean, range?: [number, number]) => {
  return {
    type: DOUBLE_ON_TWO_RULE,
    allowed,
    range,
  };
};

export const RSA_RULE = "resplit_aces" as const;
export type RSARule = {
  type: typeof RSA_RULE;
  allowed: boolean;
};
export const rsaRule = (allowed: boolean) => {
  return {
    type: RSA_RULE,
    allowed,
  };
};

export const HIT_SPLIT_ACE_RULE = "hit_split_aces" as const;
export type HitSplitAceRule = {
  type: typeof HIT_SPLIT_ACE_RULE;
  allowed: boolean;
};
export const hitSplitAceRule = (allowed: boolean) => {
  return {
    type: HIT_SPLIT_ACE_RULE,
    allowed,
  };
};

export const MAX_SPLIT_RULE = "max_split" as const;
export type MaxSplitRule = {
  type: typeof MAX_SPLIT_RULE;
  times: number;
};
export const maxSplitRule = (times: number) => {
  return {
    type: MAX_SPLIT_RULE,
    times,
  };
};

export const LATE_SURRENDER_RULE = "late_surrender" as const;
export type LateSurrenderRule = {
  type: typeof LATE_SURRENDER_RULE;
  allowed: boolean;
};
export const lateSurrenderRule = (allowed: boolean) => {
  return {
    type: LATE_SURRENDER_RULE,
    allowed,
  };
};

export const EARLY_SURRENDER_RULE = "early_surrender" as const;
export type EarlySurrenderRule = {
  type: typeof EARLY_SURRENDER_RULE;
  allowed: boolean;
};
export const earlySurrenderRule = (allowed: boolean) => {
  return {
    type: EARLY_SURRENDER_RULE,
    allowed,
  };
};

export const BLACKJACK_PAYOUT_RULE = "blackjack_payout" as const;
export type BlackjackPayoutRule = {
  type: typeof BLACKJACK_PAYOUT_RULE;
  function: (bet: number) => number;
};
export const blackjackPayoutRule = (
  fn: (bet: number) => number,
) => {
  return {
    type: BLACKJACK_PAYOUT_RULE,
    function: fn,
  };
};

export const DECK_COUNT_RULE = "deck_count" as const;
export type DeckCountRule = {
  type: typeof DECK_COUNT_RULE;
  count: number;
};
export const deckCountRule = (count: number) => {
  return {
    type: DECK_COUNT_RULE,
    count,
  };
};

export const BLACKJACK_TIE_RULE = "blackjack_tie" as const;
export type BlackjackTieRule = {
  type: typeof BLACKJACK_TIE_RULE;
  outcome: "win" | "push" | "lose";
};
export const blackjackTieRule = (outcome: "win" | "push" | "lose") => {
  return {
    type: BLACKJACK_TIE_RULE,
    outcome,
  };
};

export const CHARLIE_RULE = "charlie" as const;
export type CharlieRule = {
  type: typeof CHARLIE_RULE;
  cards: number | null; // null means no charlie rule
};
export const charlieRule = (cards: number | null) => ({
  type: CHARLIE_RULE,
  cards,
});

export const DEALER_22_PUSH_RULE = "dealer_22_push" as const;
export type Dealer22PushRule = {
  type: typeof DEALER_22_PUSH_RULE;
  enabled: boolean;
};
export const dealer22PushRule = (enabled: boolean) => ({
  type: DEALER_22_PUSH_RULE,
  enabled,
});

// Union type for all rules
export type BlackjackRule =
  | DealerStandRule
  | DealerPeekRule
  | DASRule
  | DoubleOnTwoRule
  | RSARule
  | HitSplitAceRule
  | MaxSplitRule
  | LateSurrenderRule
  | EarlySurrenderRule
  | BlackjackPayoutRule
  | DeckCountRule
  | BlackjackTieRule
  | CharlieRule
  | Dealer22PushRule;
// Default rules - most common/standard casino rules
export const DEFAULT_RULES: Record<string, BlackjackRule> = {
  [DEALER_STAND_RULE]: dealerStandRule("s17"),
  [DEALER_PEEK_RULE]: dealerPeekRule(true),
  [DAS_RULE]: dasRule(true),
  [DOUBLE_ON_TWO_RULE]: doubleOnTwoRule(true), // no restrictions
  [RSA_RULE]: rsaRule(false),
  [HIT_SPLIT_ACE_RULE]: hitSplitAceRule(false),
  [MAX_SPLIT_RULE]: maxSplitRule(3), // split to 4 hands total
  [LATE_SURRENDER_RULE]: lateSurrenderRule(false),
  [EARLY_SURRENDER_RULE]: earlySurrenderRule(false),
  [BLACKJACK_PAYOUT_RULE]: blackjackPayoutRule((bet) => bet * 1.5), // 3:2
  [DECK_COUNT_RULE]: deckCountRule(6),
  [BLACKJACK_TIE_RULE]: blackjackTieRule("push"),
  [CHARLIE_RULE]: charlieRule(null), // no charlie rule
  [DEALER_22_PUSH_RULE]: dealer22PushRule(false),
};

// Complete RuleSet type that guarantees all rules are present
export type CompleteRuleSet = {
  dealerStand: DealerStandRule;
  dealerPeek: DealerPeekRule;
  doubleAfterSplit: DASRule;
  doubleOnTwo: DoubleOnTwoRule;
  resplitAces: RSARule;
  hitSplitAces: HitSplitAceRule;
  maxSplit: MaxSplitRule;
  lateSurrender: LateSurrenderRule;
  earlySurrender: EarlySurrenderRule;
  blackjackPayout: BlackjackPayoutRule;
  deckCount: DeckCountRule;
  blackjackTie: BlackjackTieRule;
  charlie: CharlieRule;
  dealer22Push: Dealer22PushRule;
  houseEdge: number;
};

// Improved builder with defaults
export class RuleSet {
  private rules: Map<string, BlackjackRule>;

  constructor() {
    // Initialize with default rules
    this.rules = new Map(Object.entries(DEFAULT_RULES));
  }

  // Method to override a specific rule
  setRule(rule: BlackjackRule): this {
    this.rules.set(rule.type, rule);
    return this;
  }

  // Convenience methods for common rule modifications
  setDealerStand(variant: "h17" | "s17"): this {
    return this.setRule(dealerStandRule(variant));
  }

  setDeckCount(count: number): this {
    return this.setRule(deckCountRule(count));
  }

  setBlackjackPayout(numerator: number, denominator: number): this {
    return this.setRule(
      blackjackPayoutRule((bet) => bet * (numerator / denominator)),
    );
  }

  setSurrender(type: "none" | "late" | "early"): this {
    this.setRule(lateSurrenderRule(type === "late" || type === "early"));
    this.setRule(earlySurrenderRule(type === "early"));
    return this;
  }

  setDoubleAfterSplit(allowed: boolean): this {
    return this.setRule(dasRule(allowed));
  }

  setDoubleRestriction(restriction: "any" | "9-11" | "10-11" | "11"): this {
    switch (restriction) {
      case "any":
        return this.setRule(doubleOnTwoRule(true));
      case "9-11":
        return this.setRule(doubleOnTwoRule(true, [9, 11]));
      case "10-11":
        return this.setRule(doubleOnTwoRule(true, [10, 11]));
      case "11":
        return this.setRule(doubleOnTwoRule(true, [11, 11]));
    }
  }

  // Reset to defaults
  reset(): this {
    this.rules = new Map(Object.entries(DEFAULT_RULES));
    return this;
  }

  // Get a specific rule (useful for inspection)
  getRule<T extends BlackjackRule>(ruleType: string): T | undefined {
    return this.rules.get(ruleType) as T;
  }

  build(): CompleteRuleSet {
    const houseEdge = this.calculateHouseEdge();

    return {
      dealerStand: this.rules.get(DEALER_STAND_RULE) as DealerStandRule,
      dealerPeek: this.rules.get(DEALER_PEEK_RULE) as DealerPeekRule,
      doubleAfterSplit: this.rules.get(DAS_RULE) as DASRule,
      doubleOnTwo: this.rules.get(DOUBLE_ON_TWO_RULE) as DoubleOnTwoRule,
      resplitAces: this.rules.get(RSA_RULE) as RSARule,
      hitSplitAces: this.rules.get(HIT_SPLIT_ACE_RULE) as HitSplitAceRule,
      maxSplit: this.rules.get(MAX_SPLIT_RULE) as MaxSplitRule,
      lateSurrender: this.rules.get(LATE_SURRENDER_RULE) as LateSurrenderRule,
      earlySurrender: this.rules.get(
        EARLY_SURRENDER_RULE,
      ) as EarlySurrenderRule,
      blackjackPayout: this.rules.get(
        BLACKJACK_PAYOUT_RULE,
      ) as BlackjackPayoutRule,
      deckCount: this.rules.get(DECK_COUNT_RULE) as DeckCountRule,
      blackjackTie: this.rules.get(BLACKJACK_TIE_RULE) as BlackjackTieRule,
      charlie: this.rules.get(CHARLIE_RULE) as CharlieRule,
      dealer22Push: this.rules.get(DEALER_22_PUSH_RULE) as Dealer22PushRule,
      houseEdge,
    };
  }

  private calculateHouseEdge(): number {
    // Start with baseline for default rules (6 deck, S17, DAS, no surrender)
    let edge = 0.41;

    // Deck adjustments from 6-deck baseline
    const deckRule = this.rules.get(DECK_COUNT_RULE) as DeckCountRule;
    if (deckRule) {
      switch (deckRule.count) {
        case 1:
          edge -= 0.46;
          break;
        case 2:
          edge -= 0.17;
          break;
        case 4:
          edge -= 0.04;
          break;
        case 6:
          break; // baseline
        case 8:
          edge += 0.02;
          break;
      }
    }

    // Dealer rules
    const dealerStand = this.rules.get(DEALER_STAND_RULE) as DealerStandRule;
    if (dealerStand?.variant === "h17") {
      edge += 0.22;
    }

    const dealerPeek = this.rules.get(DEALER_PEEK_RULE) as DealerPeekRule;
    if (dealerPeek && !dealerPeek.allowed) {
      edge += 0.11;
    }

    // Double rules
    const das = this.rules.get(DAS_RULE) as DASRule;
    if (das && !das.allowed) {
      edge += 0.14;
    }

    const doubleTwo = this.rules.get(DOUBLE_ON_TWO_RULE) as DoubleOnTwoRule;
    if (doubleTwo && !doubleTwo.allowed) {
      edge += 0.56; // No doubling at all
    } else if (doubleTwo?.range) {
      const [min, max] = doubleTwo.range;
      if (min === 11 && max === 11) {
        edge += 0.45; // Only on 11
      } else if (min === 10 && max === 11) {
        edge += 0.09; // Only on 10-11
      } else if (min === 9 && max === 11) {
        edge += 0.01; // Only on 9-11
      }
    }

    // Split rules
    const rsa = this.rules.get(RSA_RULE) as RSARule;
    if (rsa?.allowed) {
      edge -= 0.08;
    }

    const hitSplitAces = this.rules.get(HIT_SPLIT_ACE_RULE) as HitSplitAceRule;
    if (hitSplitAces?.allowed) {
      edge -= 0.19;
    }

    const maxSplit = this.rules.get(MAX_SPLIT_RULE) as MaxSplitRule;
    if (maxSplit) {
      if (maxSplit.times === 1) edge += 0.03; // Only one split allowed
      else if (maxSplit.times === 2) edge += 0.01; // Two splits (3 hands)
      // 3 splits (4 hands) is baseline
    }

    // Surrender rules
    const lateSurrender = this.rules.get(
      LATE_SURRENDER_RULE,
    ) as LateSurrenderRule;
    const earlySurrender = this.rules.get(
      EARLY_SURRENDER_RULE,
    ) as EarlySurrenderRule;
    if (earlySurrender?.allowed) {
      edge -= 0.62;
    } else if (lateSurrender?.allowed) {
      edge -= 0.08;
    }

    // Payout rules
    const blackjackPayout = this.rules.get(
      BLACKJACK_PAYOUT_RULE,
    ) as BlackjackPayoutRule;
    if (blackjackPayout) {
      const payout = blackjackPayout.function(100);
      if (Math.abs(payout - 120) < 0.01) { // 6:5
        edge += 1.39;
      } else if (Math.abs(payout - 100) < 0.01) { // 1:1 (even money)
        edge += 2.27;
      }
      // 3:2 (150) is baseline
    }

    // Special rules
    const charlie = this.rules.get(CHARLIE_RULE) as CharlieRule;
    if (charlie?.cards) {
      switch (charlie.cards) {
        case 5:
          edge -= 1.46;
          break;
        case 6:
          edge -= 0.16;
          break;
        case 7:
          edge -= 0.01;
          break;
      }
    }

    const dealer22 = this.rules.get(DEALER_22_PUSH_RULE) as Dealer22PushRule;
    if (dealer22?.enabled) {
      edge += 6.91;
    }

    const blackjackTie = this.rules.get(BLACKJACK_TIE_RULE) as BlackjackTieRule;
    if (blackjackTie?.outcome === "win") {
      edge -= 0.32;
    } else if (blackjackTie?.outcome === "lose") {
      edge += 0.32;
    }
    // 'push' is baseline

    return Math.max(0, edge);
  }

  // Helper to create a description of the ruleset
  describe(): string {
    const rules: string[] = [];

    const dealerStand = this.rules.get(DEALER_STAND_RULE) as DealerStandRule;
    rules.push(dealerStand.variant.toUpperCase());

    const deckCount = this.rules.get(DECK_COUNT_RULE) as DeckCountRule;
    rules.push(`${deckCount.count} deck${deckCount.count > 1 ? "s" : ""}`);

    const das = this.rules.get(DAS_RULE) as DASRule;
    rules.push(das.allowed ? "DAS" : "No DAS");

    const lateSurrender = this.rules.get(
      LATE_SURRENDER_RULE,
    ) as LateSurrenderRule;
    const earlySurrender = this.rules.get(
      EARLY_SURRENDER_RULE,
    ) as EarlySurrenderRule;
    if (earlySurrender.allowed) {
      rules.push("ES");
    } else if (lateSurrender.allowed) {
      rules.push("LS");
    }

    const blackjackPayout = this.rules.get(
      BLACKJACK_PAYOUT_RULE,
    ) as BlackjackPayoutRule;
    const payout = blackjackPayout.function(100);
    if (Math.abs(payout - 120) < 0.01) {
      rules.push("BJ 6:5");
    } else if (Math.abs(payout - 150) < 0.01) {
      rules.push("BJ 3:2");
    }

    return rules.join(", ");
  }

  // In the RuleSet class, update the getRuleBasedActions method:

  getRuleBasedActions(
    hand: Hand,
    dealerUpCard?: Card,
    splitCount: number = 0,
  ): ActionType[] {
    const actions: ActionType[] = [];
    const handValue = hand.handValue;
    const cards = hand.cards;
    const isFirstTwoCards = cards.length === 2;

    // If hand is busted or blackjack, no actions available
    if (hand.state === "busted" || hand.state === "blackjack") {
      return actions;
    }

    // If hand value is 21, only stand is available
    if (handValue === 21) {
      actions.push(ACTION_STAND);
      return actions;
    }

    // HIT - Always available unless at 21 or special split ace rules
    if (hand.isSplitAce) {
      const hitSplitAces = this.getRule<HitSplitAceRule>(HIT_SPLIT_ACE_RULE);
      if (hitSplitAces?.allowed) {
        actions.push(ACTION_HIT);
      }
      // Split aces usually only get one card, so if we can't hit, only stand
      if (!actions.includes(ACTION_HIT) && cards.length > 2) {
        actions.push(ACTION_STAND);
        return actions; // No other actions after hitting split aces
      }
    } else {
      actions.push(ACTION_HIT);
    }

    // STAND - Always available
    actions.push(ACTION_STAND);

    // Only first two cards can have these special actions
    if (!isFirstTwoCards) {
      return actions;
    }

    // DOUBLE - Check various restrictions
    if (this.canDouble(hand, handValue)) {
      actions.push(ACTION_DOUBLE);
    }

    // SPLIT - Check if cards match and haven't exceeded max splits
    if (this.canSplit(hand, cards, splitCount)) {
      actions.push(ACTION_SPLIT);
    }

    // SURRENDER - Check if allowed and only on non-split hands
    if (this.canSurrender(hand, dealerUpCard)) {
      actions.push(ACTION_SURRENDER);
    }

    return actions;
  }

  private canDouble(hand: Hand, handValue: number): boolean {
    // Can't double on split aces (typically)
    if (hand.isSplitAce) {
      return false;
    }

    const doubleOnTwo = this.getRule<DoubleOnTwoRule>(DOUBLE_ON_TWO_RULE);

    // Check if doubling is allowed at all
    if (!doubleOnTwo?.allowed) {
      return false;
    }

    // Check if it's a split hand and DAS is allowed
    if (hand.isSplit) {
      const das = this.getRule<DASRule>(DAS_RULE);
      if (!das?.allowed) {
        return false;
      }
    }

    // Check hand value restrictions
    if (doubleOnTwo.range) {
      const [min, max] = doubleOnTwo.range;
      // For soft hands, we need to check both soft and hard values
      const cards = hand.cards;
      const hasSoftAce = cards.some((c) => c.rank === "A") && handValue <= 21;

      if (hasSoftAce) {
        // Soft hands can be doubled if either the soft or hard value is in range
        const hardValue = handValue - 10; // Convert soft ace to hard
        return (handValue >= min && handValue <= max) ||
          (hardValue >= min && hardValue <= max);
      } else {
        // Hard hands must be in range
        return handValue >= min && handValue <= max;
      }
    }

    // No restrictions, doubling is allowed
    return true;
  }

  private canSplit(hand: Hand, cards: Card[], splitCount: number): boolean {
    // Must have exactly 2 cards
    if (cards.length !== 2) {
      return false;
    }

    // Cards must match in rank
    if (cards[0].rank !== cards[1].rank) {
      return false;
    }

    // Check max splits
    const maxSplit = this.getRule<MaxSplitRule>(MAX_SPLIT_RULE);
    if (maxSplit && splitCount >= maxSplit.times) {
      return false;
    }

    // Special handling for aces
    if (cards[0].rank === "A") {
      // Can't split aces if this hand is already from split aces
      if (hand.isSplitAce) {
        return false;
      }

      // Check if resplitting aces is allowed (for subsequent splits)
      if (splitCount > 0) {
        const rsa = this.getRule<RSARule>(RSA_RULE);
        if (!rsa?.allowed) {
          return false;
        }
      }
    }

    return true;
  }

  private canSurrender(hand: Hand, dealerUpCard?: Card): boolean {
    // Can't surrender on split hands (standard rule)
    if (hand.isSplit) {
      return false;
    }

    // Must be first two cards
    if (hand.cards.length !== 2) {
      return false;
    }

    // Check if any surrender is allowed
    const earlySurrender = this.getRule<EarlySurrenderRule>(
      EARLY_SURRENDER_RULE,
    );
    const lateSurrender = this.getRule<LateSurrenderRule>(LATE_SURRENDER_RULE);

    if (earlySurrender?.allowed) {
      return true; // Early surrender is always available on first two cards
    }

    if (lateSurrender?.allowed) {
      // Late surrender might have restrictions based on dealer up card
      // Typically not allowed against dealer ace (if dealer has blackjack)
      // But this would require knowing if dealer checked for blackjack
      // For now, we'll allow it - the game logic should handle this
      return true;
    }

    return false;
  }
}

// Preset configurations using the builder
export const COMMON_RULESETS = {
  // Liberal Vegas Strip rules
  liberal: () =>
    new RuleSet()
      .setDealerStand("s17")
      .setDeckCount(4)
      .setSurrender("late")
      .setRule(rsaRule(true)),

  // Standard Vegas Strip
  vegasStrip: () =>
    new RuleSet()
      .setDealerStand("s17")
      .setDeckCount(4)
      .setSurrender("late"),

  // Atlantic City
  atlanticCity: () =>
    new RuleSet()
      .setDealerStand("s17")
      .setDeckCount(8)
      .setSurrender("late"),

  // Downtown Vegas
  downtown: () =>
    new RuleSet()
      .setDealerStand("h17")
      .setDeckCount(2),

  // Single deck
  singleDeck: () =>
    new RuleSet()
      .setDealerStand("h17")
      .setDeckCount(1)
      .setDoubleRestriction("10-11")
      .setDoubleAfterSplit(false),

  // Terrible 6:5 game
  terrible65: () =>
    new RuleSet()
      .setDealerStand("h17")
      .setDeckCount(8)
      .setBlackjackPayout(6, 5)
      .setSurrender("none"),
};
