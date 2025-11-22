import type { GameRules } from "./types";
import { DEFAULT_RULES } from "./constants";

/**
 * Calculate base house edge percentage based on game rules
 * Returns negative percentage (e.g., -0.5 means 0.5% house edge)
 */
export function calculateBaseHouseEdge(
  rules: GameRules = DEFAULT_RULES,
): number {
  // Start with base edge for perfect basic strategy
  let houseEdge = -0.5; // -0.5% with perfect basic strategy and good rules

  // Adjust for number of decks
  if (rules.decks === 1) {
    houseEdge += 0.2; // Single deck is better for player
  } else if (rules.decks === 2) {
    houseEdge += 0.1;
  } else if (rules.decks === 8) {
    houseEdge -= 0.1;
  }

  // Dealer hits soft 17 (bad for player)
  if (rules.dealerHitsSoft17) {
    houseEdge -= 0.2;
  }

  // Double after split allowed (good for player)
  if (!rules.doubleAfterSplit) {
    houseEdge -= 0.15;
  }

  // Surrender allowed (good for player)
  if (!rules.surrenderAllowed) {
    houseEdge -= 0.08;
  }

  // Blackjack payout
  if (rules.blackjackPayout === 1.2) {
    // 6:5 blackjack (terrible for player)
    houseEdge -= 1.4;
  } else if (rules.blackjackPayout === 1) {
    // Even money blackjack (worst)
    houseEdge -= 2.3;
  }

  return houseEdge;
}

/**
 * Adjust house edge based on strategy accuracy
 * Perfect strategy = 0% adjustment
 * Poor strategy = additional house edge
 */
export function adjustForStrategyAccuracy(
  baseHouseEdge: number,
  accuracyPercentage: number,
): number {
  // Each 1% below perfect strategy adds approximately 0.03% to house edge
  const accuracyPenalty = (100 - accuracyPercentage) * 0.03;
  return baseHouseEdge - accuracyPenalty;
}
