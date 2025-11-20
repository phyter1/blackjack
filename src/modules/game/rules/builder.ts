/**
 * RuleSet builder for creating custom blackjack rulesets
 *
 * Provides a fluent API for configuring blackjack rules with sensible defaults.
 * The builder pattern allows for easy creation of custom rulesets.
 */

import type { ActionType } from "../action";
import type { Card } from "../cards";
import type { Hand } from "../hand";
import { getRuleBasedActions } from "./action-validator";
import { DEFAULT_RULES } from "./defaults";
import { calculateHouseEdge } from "./house-edge";
import type { BlackjackRule, CompleteRuleSet } from "./types";
import {
  BET_UNIT_RULE,
  BLACKJACK_PAYOUT_RULE,
  BLACKJACK_TIE_RULE,
  TABLE_MAX_BET_RULE,
  TABLE_MIN_BET_RULE,
  type BetUnitRule,
  type BlackjackPayoutRule,
  type BlackjackTieRule,
  type TableMaxBetRule,
  type TableMinBetRule,
  betUnitRule,
  blackjackPayoutRule,
  CHARLIE_RULE,
  type CharlieRule,
  DAS_RULE,
  type DASRule,
  DEALER_22_PUSH_RULE,
  DEALER_PEEK_RULE,
  DEALER_STAND_RULE,
  DECK_COUNT_RULE,
  type Dealer22PushRule,
  type DealerPeekRule,
  type DealerStandRule,
  type DeckCountRule,
  DOUBLE_ON_TWO_RULE,
  type DoubleOnTwoRule,
  dasRule,
  dealerStandRule,
  deckCountRule,
  doubleOnTwoRule,
  EARLY_SURRENDER_RULE,
  type EarlySurrenderRule,
  earlySurrenderRule,
  HIT_SPLIT_ACE_RULE,
  type HitSplitAceRule,
  LATE_SURRENDER_RULE,
  type LateSurrenderRule,
  lateSurrenderRule,
  MAX_SPLIT_RULE,
  type MaxSplitRule,
  RSA_RULE,
  type RSARule,
  tableMaxBetRule,
  tableMinBetRule,
} from "./types";

/**
 * Builder class for creating custom blackjack rulesets
 *
 * Starts with DEFAULT_RULES and allows fluent modification.
 * Call build() to get the final CompleteRuleSet with house edge calculation.
 *
 * @example
 * ```typescript
 * const rules = new RuleSet()
 *   .setDealerStand("s17")
 *   .setDeckCount(6)
 *   .setBlackjackPayout(3, 2)
 *   .setSurrender("late")
 *   .build();
 * ```
 */
export class RuleSet {
  private rules: Map<string, BlackjackRule>;

  constructor() {
    // Initialize with default rules
    this.rules = new Map(Object.entries(DEFAULT_RULES));
  }

  /**
   * Override a specific rule
   */
  setRule(rule: BlackjackRule): this {
    this.rules.set(rule.type, rule);
    return this;
  }

  /**
   * Set dealer stand rule (s17 or h17)
   */
  setDealerStand(variant: "h17" | "s17"): this {
    return this.setRule(dealerStandRule(variant));
  }

  /**
   * Set number of decks in the shoe
   */
  setDeckCount(count: number): this {
    return this.setRule(deckCountRule(count));
  }

  /**
   * Set blackjack payout ratio
   *
   * @param numerator - Payout numerator (e.g., 3 for 3:2)
   * @param denominator - Payout denominator (e.g., 2 for 3:2)
   */
  setBlackjackPayout(numerator: number, denominator: number): this {
    return this.setRule(
      blackjackPayoutRule((bet) => bet * (numerator / denominator)),
    );
  }

  /**
   * Set surrender rule
   *
   * @param type - "none", "late", or "early"
   */
  setSurrender(type: "none" | "late" | "early"): this {
    this.setRule(lateSurrenderRule(type === "late" || type === "early"));
    this.setRule(earlySurrenderRule(type === "early"));
    return this;
  }

  /**
   * Set whether double after split is allowed
   */
  setDoubleAfterSplit(allowed: boolean): this {
    return this.setRule(dasRule(allowed));
  }

  /**
   * Set restrictions on doubling
   *
   * @param restriction - "any", "9-11", "10-11", or "11"
   */
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

  /**
   * Set table minimum bet
   *
   * @param amount - Minimum bet amount in dollars
   */
  setTableMinBet(amount: number): this {
    return this.setRule(tableMinBetRule(amount));
  }

  /**
   * Set table maximum bet
   *
   * @param amount - Maximum bet amount in dollars
   */
  setTableMaxBet(amount: number): this {
    return this.setRule(tableMaxBetRule(amount));
  }

  /**
   * Set bet unit/denomination
   *
   * @param unit - Minimum bet unit (bets must be multiples of this)
   */
  setBetUnit(unit: number): this {
    return this.setRule(betUnitRule(unit));
  }

  /**
   * Set table betting limits (min, max, and unit)
   *
   * @param min - Minimum bet amount
   * @param max - Maximum bet amount
   * @param unit - Bet unit (default: 1)
   */
  setTableLimits(min: number, max: number, unit = 1): this {
    this.setTableMinBet(min);
    this.setTableMaxBet(max);
    this.setBetUnit(unit);
    return this;
  }

  /**
   * Reset all rules to defaults
   */
  reset(): this {
    this.rules = new Map(Object.entries(DEFAULT_RULES));
    return this;
  }

  /**
   * Get a specific rule (useful for inspection)
   */
  getRule<T extends BlackjackRule>(ruleType: string): T | undefined {
    return this.rules.get(ruleType) as T;
  }

  /**
   * Build the complete ruleset with house edge calculation
   */
  build(): CompleteRuleSet {
    const houseEdge = calculateHouseEdge(this.rules);

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
      tableMinBet: this.rules.get(TABLE_MIN_BET_RULE) as TableMinBetRule,
      tableMaxBet: this.rules.get(TABLE_MAX_BET_RULE) as TableMaxBetRule,
      betUnit: this.rules.get(BET_UNIT_RULE) as BetUnitRule,
      houseEdge,
    };
  }

  /**
   * Get rule-based available actions for a hand
   *
   * @param hand - The hand to evaluate
   * @param dealerUpCard - Dealer's visible card (optional)
   * @param splitCount - Number of times already split (default 0)
   * @returns Array of valid action types
   */
  getRuleBasedActions(
    hand: Hand,
    dealerUpCard?: Card,
    splitCount = 0,
  ): ActionType[] {
    return getRuleBasedActions(this.rules, hand, dealerUpCard, splitCount);
  }

  /**
   * Create a description of the ruleset
   */
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
}
