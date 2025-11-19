/**
 * Type definitions for blackjack game rules
 *
 * This module contains all rule type definitions including:
 * - Individual rule types (dealer stand, peek, double, split, etc.)
 * - Factory functions for creating rule instances
 * - Union type for all possible rules
 */

// Dealer Stand Rule
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

// Dealer Peek Rule
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

// Double After Split Rule
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

// Double On Two Cards Rule
export const DOUBLE_ON_TWO_RULE = "double_on_two" as const;
export type DoubleOnTwoRule = {
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

// Resplit Aces Rule
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

// Hit Split Aces Rule
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

// Max Split Rule
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

// Late Surrender Rule
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

// Early Surrender Rule
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

// Blackjack Payout Rule
export const BLACKJACK_PAYOUT_RULE = "blackjack_payout" as const;
export type BlackjackPayoutRule = {
  type: typeof BLACKJACK_PAYOUT_RULE;
  function: (bet: number) => number;
};
export const blackjackPayoutRule = (fn: (bet: number) => number) => {
  return {
    type: BLACKJACK_PAYOUT_RULE,
    function: fn,
  };
};

// Deck Count Rule
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

// Blackjack Tie Rule
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

// Charlie Rule
export const CHARLIE_RULE = "charlie" as const;
export type CharlieRule = {
  type: typeof CHARLIE_RULE;
  cards: number | null; // null means no charlie rule
};
export const charlieRule = (cards: number | null) => ({
  type: CHARLIE_RULE,
  cards,
});

// Dealer 22 Push Rule
export const DEALER_22_PUSH_RULE = "dealer_22_push" as const;
export type Dealer22PushRule = {
  type: typeof DEALER_22_PUSH_RULE;
  enabled: boolean;
};
export const dealer22PushRule = (enabled: boolean) => ({
  type: DEALER_22_PUSH_RULE,
  enabled,
});

/**
 * Union type for all possible blackjack rules
 */
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

/**
 * Complete ruleset type containing all rules and house edge calculation
 */
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
