// Main Game Components
export { Game } from "./game";
export type { GameState, PlayerBet } from "./game";

export { Round } from "./round";
export type { PlayerRoundInfo, RoundState } from "./round";

export { Hand } from "./hand";
export { DealerHand } from "./dealer-hand";

export { PlayerManager } from "./player";
export type { Player } from "./player";

// Settlement
export {
  settleHand,
  settleRound,
  compareHands,
  determineOutcome,
  calculatePayout,
  calculateProfit,
} from "./settlement";
export type { HandOutcome, SettlementResult } from "./settlement";

// Rules & Configuration
export { RuleSet, COMMON_RULESETS } from "./rules";
export type {
  CompleteRuleSet,
  BlackjackRule,
  DealerStandRule,
  DealerPeekRule,
  DASRule,
  DoubleOnTwoRule,
  RSARule,
  HitSplitAceRule,
  MaxSplitRule,
  LateSurrenderRule,
  EarlySurrenderRule,
  BlackjackPayoutRule,
  DeckCountRule,
  BlackjackTieRule,
  CharlieRule,
  Dealer22PushRule,
} from "./rules";

// Actions
export {
  ACTION_HIT,
  ACTION_STAND,
  ACTION_DOUBLE,
  ACTION_SPLIT,
  ACTION_SURRENDER,
  hit,
  stand,
  double,
  split,
  surrender,
} from "./action";
export type {
  ActionType,
  Hit,
  Stand,
  Double,
  Split,
  Surrender,
} from "./action";

// Bank & Money Management
export { Bank, Escrow, House } from "./bank";

// Shoe & Cards
export { Shoe } from "./shoe";
export type { ShoeDeck } from "./shoe";

export { newDeck, SUITS, RANKS } from "./cards";
export type { Card, Stack, Deck } from "./cards";

// Shuffling
export {
  randomInterleaveLen,
  cutStackAtPenetration,
  riffleShuffleStack,
  overhandShuffleStack,
  shuffleShoe,
} from "./shuffle";

// Random utilities
export {
  randomInt,
  weightedRandomChoice,
  randomWeieghtedChunks,
} from "./random";

// Re-export newShoeStack for convenience
export { newShoeStack } from "./shoe";

// Test utilities
export {
  createTestDeck,
  parseTestScenario,
  createCard,
} from "./test-deck-builder";
