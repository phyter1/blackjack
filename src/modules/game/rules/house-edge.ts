/**
 * House edge calculation for blackjack rulesets
 *
 * Calculates the theoretical house edge based on rule variations.
 * Uses a baseline approach with adjustments for each rule deviation.
 */

import type { BlackjackRule } from "./types";
import {
  BLACKJACK_PAYOUT_RULE,
  BLACKJACK_TIE_RULE,
  type BlackjackPayoutRule,
  type BlackjackTieRule,
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
  EARLY_SURRENDER_RULE,
  type EarlySurrenderRule,
  HIT_SPLIT_ACE_RULE,
  type HitSplitAceRule,
  LATE_SURRENDER_RULE,
  type LateSurrenderRule,
  MAX_SPLIT_RULE,
  type MaxSplitRule,
  RSA_RULE,
  type RSARule,
} from "./types";

/**
 * Calculate house edge percentage based on ruleset
 *
 * Uses a baseline of 0.41% (6 deck, S17, DAS, no surrender) and adjusts
 * for rule variations. All adjustments are approximate values based on
 * mathematical analysis of optimal basic strategy play.
 *
 * @param rules - Map of rules to evaluate
 * @returns House edge as a percentage (e.g., 0.29 = 0.29%)
 */
export function calculateHouseEdge(rules: Map<string, BlackjackRule>): number {
  // Start with baseline for default rules (6 deck, S17, DAS, no surrender)
  let edge = 0.41;

  // Deck adjustments from 6-deck baseline
  const deckRule = rules.get(DECK_COUNT_RULE) as DeckCountRule;
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
  const dealerStand = rules.get(DEALER_STAND_RULE) as DealerStandRule;
  if (dealerStand?.variant === "h17") {
    edge += 0.22;
  }

  const dealerPeek = rules.get(DEALER_PEEK_RULE) as DealerPeekRule;
  if (dealerPeek && !dealerPeek.allowed) {
    edge += 0.11;
  }

  // Double rules
  const das = rules.get(DAS_RULE) as DASRule;
  if (das && !das.allowed) {
    edge += 0.14;
  }

  const doubleTwo = rules.get(DOUBLE_ON_TWO_RULE) as DoubleOnTwoRule;
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
  const rsa = rules.get(RSA_RULE) as RSARule;
  if (rsa?.allowed) {
    edge -= 0.08;
  }

  const hitSplitAces = rules.get(HIT_SPLIT_ACE_RULE) as HitSplitAceRule;
  if (hitSplitAces?.allowed) {
    edge -= 0.19;
  }

  const maxSplit = rules.get(MAX_SPLIT_RULE) as MaxSplitRule;
  if (maxSplit) {
    if (maxSplit.times === 1)
      edge += 0.03; // Only one split allowed
    else if (maxSplit.times === 2) edge += 0.01; // Two splits (3 hands)
    // 3 splits (4 hands) is baseline
  }

  // Surrender rules
  const lateSurrender = rules.get(LATE_SURRENDER_RULE) as LateSurrenderRule;
  const earlySurrender = rules.get(EARLY_SURRENDER_RULE) as EarlySurrenderRule;
  if (earlySurrender?.allowed) {
    edge -= 0.62;
  } else if (lateSurrender?.allowed) {
    edge -= 0.08;
  }

  // Payout rules
  const blackjackPayout = rules.get(
    BLACKJACK_PAYOUT_RULE,
  ) as BlackjackPayoutRule;
  if (blackjackPayout) {
    const payout = blackjackPayout.function(100);
    if (Math.abs(payout - 120) < 0.01) {
      // 6:5
      edge += 1.39;
    } else if (Math.abs(payout - 100) < 0.01) {
      // 1:1 (even money)
      edge += 2.27;
    }
    // 3:2 (150) is baseline
  }

  // Special rules
  const charlie = rules.get(CHARLIE_RULE) as CharlieRule;
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

  const dealer22 = rules.get(DEALER_22_PUSH_RULE) as Dealer22PushRule;
  if (dealer22?.enabled) {
    edge += 6.91;
  }

  const blackjackTie = rules.get(BLACKJACK_TIE_RULE) as BlackjackTieRule;
  if (blackjackTie?.outcome === "win") {
    edge -= 0.32;
  } else if (blackjackTie?.outcome === "lose") {
    edge += 0.32;
  }
  // 'push' is baseline

  return Math.max(0, edge);
}
