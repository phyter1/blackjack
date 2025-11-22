import type { HandEVCalculation, GameRules } from "./types";
import { DEFAULT_RULES } from "./constants";
import { calculateBaseHouseEdge } from "./house-edge";
import { calculateCountAdvantage } from "./counting";

/**
 * Calculate expected value for a single hand
 */
export function calculateHandEV(params: {
  betAmount: number;
  actualValue: number; // profit/loss for this hand
  trueCount?: number;
  isCorrectDecision?: boolean;
  rules?: GameRules;
}): HandEVCalculation {
  const {
    betAmount,
    actualValue,
    trueCount = 0,
    isCorrectDecision = true,
    rules = DEFAULT_RULES,
  } = params;

  // Calculate base house edge
  const baseHouseEdge = calculateBaseHouseEdge(rules);

  // If decision was incorrect, add penalty
  // Assume incorrect decision adds ~2% to house edge (average mistake cost)
  const strategyPenalty = isCorrectDecision ? 0 : -2.0;

  // Calculate count advantage if available
  const countAdvantage = calculateCountAdvantage(trueCount);

  // Final edge (negative = house edge, positive = player edge)
  const finalEdge = baseHouseEdge + countAdvantage + strategyPenalty;

  // Expected value = bet × edge
  const expectedValue = betAmount * (finalEdge / 100);

  // Variance = actual - expected
  const variance = actualValue - expectedValue;

  return {
    betAmount,
    trueCount,
    countAdvantage,
    baseHouseEdge,
    finalEdge,
    expectedValue,
    actualValue,
    variance,
  };
}
