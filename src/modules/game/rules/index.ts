/**
 * Blackjack rules module
 *
 * This module provides a comprehensive ruleset system for blackjack games.
 * It includes:
 * - Type definitions for all rule types
 * - Default ruleset configuration
 * - Builder pattern for creating custom rulesets
 * - House edge calculation
 * - Action validation based on rules
 * - Common preset rulesets
 *
 * @example
 * ```typescript
 * // Use a preset
 * const rules = COMMON_RULESETS.vegasStrip().build();
 *
 * // Create custom ruleset
 * const customRules = new RuleSet()
 *   .setDealerStand("s17")
 *   .setDeckCount(6)
 *   .setBlackjackPayout(3, 2)
 *   .setSurrender("late")
 *   .build();
 *
 * console.log(customRules.houseEdge); // e.g., 0.29%
 * ```
 */

export { getRuleBasedActions } from "./action-validator";
// Export bet validation utilities
export {
  getBettingLimits,
  isValidBet,
  validateBet,
  type BetValidationResult,
} from "./bet-validator";
// Export builder class
export { RuleSet } from "./builder";
// Export default rules
export { DEFAULT_RULES } from "./defaults";
// Export utility functions
export { calculateHouseEdge } from "./house-edge";
// Export preset configurations
export { COMMON_RULESETS } from "./presets";
// Export types
export type {
  BetUnitRule,
  BlackjackPayoutRule,
  BlackjackRule,
  BlackjackTieRule,
  CharlieRule,
  CompleteRuleSet,
  DASRule,
  Dealer22PushRule,
  DealerPeekRule,
  DealerStandRule,
  DeckCountRule,
  DoubleOnTwoRule,
  EarlySurrenderRule,
  HitSplitAceRule,
  LateSurrenderRule,
  MaxSplitRule,
  RSARule,
  TableMaxBetRule,
  TableMinBetRule,
} from "./types";
// Export rule constants for external use
// Export factory functions for creating rules
export {
  BET_UNIT_RULE,
  BLACKJACK_PAYOUT_RULE,
  BLACKJACK_TIE_RULE,
  TABLE_MAX_BET_RULE,
  TABLE_MIN_BET_RULE,
  betUnitRule,
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
  tableMaxBetRule,
  tableMinBetRule,
} from "./types";
