/**
 * Game rules configuration for house edge calculation
 */
export interface GameRules {
  decks: number;
  dealerHitsSoft17: boolean;
  doubleAfterSplit: boolean;
  surrenderAllowed: boolean;
  blackjackPayout: number; // 1.5 for 3:2, 1.2 for 6:5
}

/**
 * Session EV calculation result
 */
export interface EVCalculation {
  totalWagered: number;
  baseHouseEdge: number;
  adjustedHouseEdge: number;
  countAdvantage: number;
  finalEdge: number;
  expectedValue: number;
  actualValue: number;
  variance: number;
  varanceInBB: number; // Variance in big bets (for statistical significance)
}

/**
 * Advantage play levels
 */
export type AdvantagePlayLevel =
  | "house-edge" // Raw house edge with no player skill
  | "basic-strategy" // Perfect basic strategy
  | "card-counting-conservative" // Basic + Hi-Lo with 1-4 spread
  | "card-counting-aggressive" // Basic + Hi-Lo with 1-8 or 1-12 spread
  | "perfect-play"; // Theoretical maximum advantage

/**
 * Betting spread configuration for card counting
 */
export interface BettingSpread {
  minBet: number;
  maxBet: number;
  spreadByCount: Record<number, number>; // True count -> bet multiplier
}

/**
 * Hand-level EV calculation
 */
export interface HandEVCalculation {
  betAmount: number;
  trueCount: number;
  countAdvantage: number;
  baseHouseEdge: number;
  finalEdge: number;
  expectedValue: number;
  actualValue: number;
  variance: number;
}
