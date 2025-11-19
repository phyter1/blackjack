/**
 * Action validation based on ruleset
 *
 * Determines which actions are available for a given hand based on the
 * current ruleset, hand state, and game context.
 */

import {
  ACTION_DOUBLE,
  ACTION_HIT,
  ACTION_SPLIT,
  ACTION_STAND,
  ACTION_SURRENDER,
  type ActionType,
} from "../action";
import type { Card } from "../cards";
import type { Hand } from "../hand";
import type { BlackjackRule } from "./types";
import {
  DAS_RULE,
  type DASRule,
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
 * Get all valid actions for a hand based on current rules
 *
 * @param rules - Map of active rules
 * @param hand - The hand to evaluate
 * @param dealerUpCard - Dealer's visible card (optional)
 * @param splitCount - Number of times already split (default 0)
 * @returns Array of valid action types
 */
export function getRuleBasedActions(
  rules: Map<string, BlackjackRule>,
  hand: Hand,
  dealerUpCard?: Card,
  splitCount = 0,
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
    const hitSplitAces = rules.get(HIT_SPLIT_ACE_RULE) as HitSplitAceRule;
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
  if (canDouble(rules, hand, handValue)) {
    actions.push(ACTION_DOUBLE);
  }

  // SPLIT - Check if cards match and haven't exceeded max splits
  if (canSplit(rules, hand, cards, splitCount)) {
    actions.push(ACTION_SPLIT);
  }

  // SURRENDER - Check if allowed and only on non-split hands
  if (canSurrender(rules, hand, dealerUpCard)) {
    actions.push(ACTION_SURRENDER);
  }

  return actions;
}

/**
 * Check if doubling is allowed for the current hand
 *
 * @param rules - Map of active blackjack rules
 * @param hand - The hand to check for double down eligibility
 * @param handValue - Current value of the hand
 * @returns true if double down is allowed, false otherwise
 *
 * @internal
 */
function canDouble(
  rules: Map<string, BlackjackRule>,
  hand: Hand,
  handValue: number,
): boolean {
  // Can't double on split aces (typically)
  if (hand.isSplitAce) {
    return false;
  }

  const doubleOnTwo = rules.get(DOUBLE_ON_TWO_RULE) as DoubleOnTwoRule;

  // Check if doubling is allowed at all
  if (!doubleOnTwo?.allowed) {
    return false;
  }

  // Check if it's a split hand and DAS is allowed
  if (hand.isSplit) {
    const das = rules.get(DAS_RULE) as DASRule;
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
      return (
        (handValue >= min && handValue <= max) ||
        (hardValue >= min && hardValue <= max)
      );
    }
    // Hard hands must be in range
    return handValue >= min && handValue <= max;
  }

  // No restrictions, doubling is allowed
  return true;
}

/**
 * Check if splitting is allowed for the current hand
 *
 * @param rules - Map of active blackjack rules
 * @param hand - The hand to check for split eligibility
 * @param cards - Cards in the hand
 * @param splitCount - Number of times already split in this round
 * @returns true if split is allowed, false otherwise
 *
 * @internal
 */
function canSplit(
  rules: Map<string, BlackjackRule>,
  hand: Hand,
  cards: Card[],
  splitCount: number,
): boolean {
  // Must have exactly 2 cards
  if (cards.length !== 2) {
    return false;
  }

  // Cards must match in rank
  if (cards[0].rank !== cards[1].rank) {
    return false;
  }

  // Check max splits
  const maxSplit = rules.get(MAX_SPLIT_RULE) as MaxSplitRule;
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
      const rsa = rules.get(RSA_RULE) as RSARule;
      if (!rsa?.allowed) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check if surrender is allowed for the current hand
 *
 * @param rules - Map of active blackjack rules
 * @param hand - The hand to check for surrender eligibility
 * @param _dealerUpCard - Dealer's visible card (reserved for future use)
 * @returns true if surrender is allowed, false otherwise
 *
 * @internal
 */
function canSurrender(
  rules: Map<string, BlackjackRule>,
  hand: Hand,
  _dealerUpCard?: Card,
): boolean {
  // Can't surrender on split hands (standard rule)
  if (hand.isSplit) {
    return false;
  }

  // Must be first two cards
  if (hand.cards.length !== 2) {
    return false;
  }

  // Check if any surrender is allowed
  const earlySurrender = rules.get(EARLY_SURRENDER_RULE) as EarlySurrenderRule;
  const lateSurrender = rules.get(LATE_SURRENDER_RULE) as LateSurrenderRule;

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
