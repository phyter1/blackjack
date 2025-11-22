import type { GameRules, BettingSpread } from "./types";

/**
 * Default blackjack rules (common favorable rules)
 */
export const DEFAULT_RULES: GameRules = {
  decks: 6,
  dealerHitsSoft17: false, // Dealer stands on soft 17 (better for player)
  doubleAfterSplit: true,
  surrenderAllowed: true,
  blackjackPayout: 1.5, // 3:2 blackjack
};

/**
 * Conservative betting spread (1-4 units)
 */
export const CONSERVATIVE_SPREAD: BettingSpread = {
  minBet: 1,
  maxBet: 4,
  spreadByCount: {
    "-2": 1, // TC <= -2: 1 unit
    "-1": 1, // TC -1: 1 unit
    "0": 1, // TC 0: 1 unit
    "1": 2, // TC +1: 2 units
    "2": 3, // TC +2: 3 units
    "3": 4, // TC >= +3: 4 units
  },
};

/**
 * Aggressive betting spread (1-8 units)
 */
export const AGGRESSIVE_SPREAD: BettingSpread = {
  minBet: 1,
  maxBet: 8,
  spreadByCount: {
    "-2": 1, // TC <= -2: 1 unit
    "-1": 1, // TC -1: 1 unit
    "0": 1, // TC 0: 1 unit
    "1": 2, // TC +1: 2 units
    "2": 4, // TC +2: 4 units
    "3": 6, // TC +3: 6 units
    "4": 8, // TC >= +4: 8 units
  },
};
