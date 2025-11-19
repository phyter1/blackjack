/**
 * Default rules configuration for blackjack
 *
 * This module defines the default ruleset used when no custom rules are specified.
 * These defaults represent the most common/standard casino rules.
 */

import type { BlackjackRule } from "./types";
import {
  BLACKJACK_PAYOUT_RULE,
  BLACKJACK_TIE_RULE,
  blackjackPayoutRule,
  blackjackTieRule,
  CHARLIE_RULE,
  charlieRule,
  DAS_RULE,
  DEALER_22_PUSH_RULE,
  DEALER_PEEK_RULE,
  DEALER_STAND_RULE,
  DECK_COUNT_RULE,
  DOUBLE_ON_TWO_RULE,
  dasRule,
  dealer22PushRule,
  dealerPeekRule,
  dealerStandRule,
  deckCountRule,
  doubleOnTwoRule,
  EARLY_SURRENDER_RULE,
  earlySurrenderRule,
  HIT_SPLIT_ACE_RULE,
  hitSplitAceRule,
  LATE_SURRENDER_RULE,
  lateSurrenderRule,
  MAX_SPLIT_RULE,
  maxSplitRule,
  RSA_RULE,
  rsaRule,
} from "./types";

/**
 * Default rules representing most common/standard casino rules:
 * - Dealer stands on soft 17
 * - Dealer peeks for blackjack
 * - Double after split allowed
 * - No restrictions on doubling
 * - Resplit aces not allowed
 * - Cannot hit split aces
 * - Maximum 3 splits (4 hands total)
 * - No surrender
 * - 3:2 blackjack payout
 * - 6 decks
 * - Blackjack tie pushes
 * - No charlie rule
 * - Dealer 22 does not push
 */
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
